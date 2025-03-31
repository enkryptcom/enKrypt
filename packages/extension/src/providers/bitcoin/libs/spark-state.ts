import PublicKeyRing from '@/libs/keyring/public-keyring';
import { loadWasm } from '@/libs/utils/wasm-loader';
import { SparkAccount } from '@/ui/action/types/account';
import { SignOptions } from '@enkryptcom/types';

export async function getSparkState(
  selectedAccount: SignOptions,
): Promise<SparkAccount | undefined> {
  // const [allAddresses, sparkBalance] = await Promise.all([
  //   callRPC<Record<number, string>>("getallsparkaddresses"),
  //   callRPC("getsparkbalance"),
  // ]);

  // return {
  //   defaultAddress: Object.values(allAddresses)?.at(-1) ?? "",
  //   allAddresses: Object.values(allAddresses),
  //   sparkBalance,
  // };
  const wasm = await loadWasm();

  if (!wasm) {
    console.log('Wasm not loaded');
    return;
  }

  const keyring = new PublicKeyRing();

  const { pk, nextIndex } = await keyring.getPrivateKey(selectedAccount);

  const uint8Array = new Uint8Array(pk.length / 2);

  for (let i = 0; i < pk.length; i += 2) {
    uint8Array[i / 2] = parseInt(pk[i] + pk[i + 1], 16);
  }

  const keyData = uint8Array.slice(1);
  const index = nextIndex;
  const diversifier = 1n;
  const is_test_network = 0;

  const keyDataPtr = wasm._malloc(keyData.length);
  wasm.HEAPU8.set(keyData, keyDataPtr);

  const spendKeyDataObj = wasm.ccall(
    'js_createSpendKeyData',
    'number',
    ['number', 'number'],
    [keyDataPtr, index],
  );

  if (spendKeyDataObj === 0) {
    console.error('Failed to create SpendKeyData');
    wasm._free(keyDataPtr);
    return;
  }

  const spendKeyObj = wasm.ccall(
    'js_createSpendKey',
    'number',
    ['number'],
    [spendKeyDataObj],
  );

  if (spendKeyObj === 0) {
    console.error('Failed to create SpendKey');
    wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    wasm._free(keyDataPtr);
    return;
  }

  const fullViewKeyObj = wasm.ccall(
    'js_createFullViewKey',
    'number',
    ['number'],
    [spendKeyObj],
  );

  if (fullViewKeyObj === 0) {
    console.error('Failed to create FullViewKey');
    wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
    wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    wasm._free(keyDataPtr);
    return;
  }

  const incomingViewKeyObj = wasm.ccall(
    'js_createIncomingViewKey',
    'number',
    ['number'],
    [fullViewKeyObj],
  );

  if (incomingViewKeyObj === 0) {
    console.error('Failed to create IncomingViewKey');
    wasm.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
    wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
    wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    wasm._free(keyDataPtr);
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
    wasm.ccall('js_freeSpendKeyData', null, ['number'], [spendKeyDataObj]);
    wasm._free(keyDataPtr);
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
      availableBalance: 1,
      fullBalance: 1,
      unconfirmedBalance: 1,
    },
  };
}
