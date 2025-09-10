import { getCustomError } from '@/libs/error'
import KeyRingBase from '@/libs/keyring/keyring'
import { InternalOnMessageResponse } from '@/types/messenger'
import { EnkryptAccount, RPCRequestType } from '@enkryptcom/types'

const getPrivateKey = async (
  keyring: KeyRingBase,
  message: RPCRequestType,
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 2)
    return {
      error: getCustomError('background: invalid params for getting private key'),
    }
  const account = message.params[0] as EnkryptAccount
  const password = message.params[1] as string
  try {
    const privKey = await keyring.getPrivateKey(account, password)
    return {
      result: JSON.stringify(privKey),
    }
  } catch (e: any) {
    return {
      error: getCustomError(e.message),
    }
  }
}

export default getPrivateKey
