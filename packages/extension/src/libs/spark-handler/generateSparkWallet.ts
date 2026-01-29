import PublicKeyRing from '@/libs/keyring/public-keyring';
import { SparkAccount } from '@/ui/action/types/account';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import { wasmInstance } from '@/libs/utils/wasm-loader';

export const getSpendKeyObj = async (wasm: WasmModule) => {
  const wallet = new PublicFiroWallet();
  const seed = await wallet.getSecret();
  let keyDataPtr;
  let spendKeyObj;
  let spendKeyDataObj;
  try {
    const keyring = new PublicKeyRing();

    const { pk } = await keyring.getPrivateKey(seed);

    const keyData = Buffer.from(pk, 'hex');

    keyDataPtr = wasm._malloc(keyData.length);
    wasm.HEAPU8.set(keyData, keyDataPtr);

    spendKeyDataObj = wasm.ccall(
      'js_createSpendKeyData',
      'number',
      ['number', 'number'],
      [keyDataPtr, 1],
    );

    if (spendKeyDataObj === 0) {
      throw new Error('Failed to create SpendKeyData');
    }

    spendKeyObj = wasm.ccall(
      'js_createSpendKey',
      'number',
      ['number'],
      [spendKeyDataObj],
    );

    if (spendKeyObj === 0) {
      throw new Error('Failed to create SpendKey');
    }

    return spendKeyObj;
  } catch (e) {
    console.log(e);
    return 0;
  } finally {
    if (spendKeyDataObj && spendKeyDataObj !== 0) {
      wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    }
    if (keyDataPtr && keyDataPtr !== 0) {
      wasm._free(keyDataPtr);
    }
  }
};

export const getIncomingViewKey = async (
  wasm: WasmModule,
  spendKeyObj: number,
): Promise<{ fullViewKeyObj: number; incomingViewKeyObj: number }> => {
  let fullViewKeyObj;
  let incomingViewKeyObj;
  try {
    fullViewKeyObj = wasm.ccall(
      'js_createFullViewKey',
      'number',
      ['number'],
      [spendKeyObj],
    );

    if (fullViewKeyObj === 0) {
      throw new Error('Failed to create FullViewKey');
    }

    incomingViewKeyObj = wasm.ccall(
      'js_createIncomingViewKey',
      'number',
      ['number'],
      [fullViewKeyObj],
    );

    if (incomingViewKeyObj === 0) {
      throw new Error('Failed to create IncomingViewKey');
    }

    return { incomingViewKeyObj, fullViewKeyObj };
  } catch {
    if (fullViewKeyObj && fullViewKeyObj !== 0) {
      wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
    }
    if (incomingViewKeyObj && incomingViewKeyObj !== 0) {
      wasm.ccall(
        'js_freeIncomingViewKey',
        null,
        ['number'],
        [incomingViewKeyObj],
      );
    }
    return { incomingViewKeyObj: 0, fullViewKeyObj: 0 };
  }
};

export async function getSparkState(
  diversifier = 1,
  isTestNetwork = false,
): Promise<Omit<SparkAccount, 'sparkBalance'> | undefined> {
  const wasm = await wasmInstance.getInstance();

  if (!wasm) {
    console.error('Wasm not loaded');
    return;
  }

  const is_test_network = isTestNetwork ? 1 : 0;

  const spendKeyObj = await getSpendKeyObj(wasm);

  const { incomingViewKeyObj, fullViewKeyObj } = await getIncomingViewKey(
    wasm,
    spendKeyObj,
  );

  if (fullViewKeyObj === 0) {
    console.error('Failed to create FullViewKey');
    wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
    return;
  }

  if (incomingViewKeyObj === 0) {
    console.error('Failed to create IncomingViewKey');
    wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
    wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
    return;
  }

  const addressObj = wasm.ccall(
    'js_getAddress',
    'number',
    ['number', 'number'],
    [incomingViewKeyObj, BigInt(diversifier)],
  );

  if (addressObj === 0) {
    console.error('Failed to get Address');
    wasm.ccall(
      'js_freeIncomingViewKey',
      null,
      ['number'],
      [incomingViewKeyObj],
    );
    wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
    wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
    return;
  }

  const address_enc_main = wasm.ccall(
    'js_encodeAddress',
    'string',
    ['number', 'number'],
    [addressObj, is_test_network],
  );

  wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
  wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
  wasm.ccall('js_freeIncomingViewKey', null, ['number'], [incomingViewKeyObj]);
  wasm.ccall('js_freeAddress', null, ['number'], [addressObj]);

  return {
    defaultAddress: address_enc_main,
  };
}
