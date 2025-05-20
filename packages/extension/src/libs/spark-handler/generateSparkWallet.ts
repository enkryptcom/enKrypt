import PublicKeyRing from '@/libs/keyring/public-keyring';
import { SparkAccount } from '@/ui/action/types/account';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet.ts';
import { wasmInstance } from '@/libs/utils/wasm-loader.ts';

export const getSpendKeyObj = async (wasm: WasmModule) => {
  const wallet = new PublicFiroWallet();
  const seed = await wallet.getSecret();
  let keyDataPtr;
  let spendKeyObj;
  let spendKeyDataObj;
  try {
    const keyring = new PublicKeyRing();

    const { pk, nextIndex } = await keyring.getPrivateKey(seed);

    const keyData = Buffer.from(pk, 'hex');
    const index = nextIndex;

    keyDataPtr = wasm._malloc(keyData.length);
    wasm.HEAPU8.set(keyData, keyDataPtr);

    spendKeyDataObj = wasm.ccall(
      'js_createSpendKeyData',
      'number',
      ['number', 'number'],
      [keyDataPtr, index],
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
    wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    wasm._free(keyDataPtr);
    return 0;
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

    return { incomingViewKeyObj, fullViewKeyObj };
  } catch (error) {
    return { incomingViewKeyObj: 0, fullViewKeyObj: 0 };
  }
};

export async function getSparkState(): Promise<SparkAccount | undefined> {
  const wasm = await wasmInstance.getInstance();

  if (!wasm) {
    console.log('Wasm not loaded');
    return;
  }

  const diversifier = 1n;
  const is_test_network = 0;

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
    [incomingViewKeyObj, diversifier],
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

  return {
    defaultAddress: address_enc_main,
    sparkBalance: {
      availableBalance: '0',
    },
  };
}
