import PublicKeyRing from '@/libs/keyring/public-keyring';
import { loadWasm } from '@/libs/utils/wasm-loader';
import { SparkAccount } from '@/ui/action/types/account';
import { SignOptions } from '@enkryptcom/types';

export const getSpendKeyObj = async (
  wasm: WasmModule,
  selectedAccount: SignOptions,
) => {
  let keyDataPtr;
  let spendKeyObj;
  let spendKeyDataObj;
  try {
    const keyring = new PublicKeyRing();

    const { pk, nextIndex } = await keyring.getPrivateKey(selectedAccount);

    const uint8Array = new Uint8Array(pk.length / 2);

    for (let i = 0; i < pk.length; i += 2) {
      uint8Array[i / 2] = parseInt(pk[i] + pk[i + 1], 16);
    }

    const keyData = uint8Array.slice(1);
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
    return 0;
  }
  // } finally {
  //   wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
  //   wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
  //   wasm._free(keyDataPtr);
  // }
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
    console.log(error);

    return {incomingViewKeyObj: 0, fullViewKeyObj: 0};
  }
  // } finally {
  //   wasm.ccall(
  //     'js_freeIncomingViewKey',
  //     null,
  //     ['number'],
  //     [incomingViewKeyObj],
  //   );
  //   wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
  //   wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
  // }
};

export async function getSparkState(
  selectedAccount: SignOptions,
): Promise<SparkAccount | undefined> {
  const wasm = await loadWasm();

  if (!wasm) {
    console.log('Wasm not loaded');
    return;
  }

  const diversifier = 1n;
  const is_test_network = 0;

  const spendKeyObj = await getSpendKeyObj(wasm, selectedAccount);

  if (!spendKeyObj || spendKeyObj === 0) {
    return;
  }

  const incomingViewKey = await getIncomingViewKey(wasm, spendKeyObj);

  if (!incomingViewKey) {
    throw new Error('Failed to create IncomingViewKey');
  }

  const { incomingViewKeyObj } = incomingViewKey;

  if (incomingViewKeyObj === 0) {
    throw new Error('Failed to create IncomingViewKey');
  }

  const addressObj = wasm.ccall(
    'js_getAddress',
    'number',
    ['number', 'number'],
    [incomingViewKeyObj, diversifier],
  );

  if (addressObj === 0) {
    throw new Error('Failed to get Address');
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
      availableBalance: 1,
      fullBalance: 1,
      unconfirmedBalance: 1,
    },
  };
}
