import { blake3 as hashBlake3 } from '@noble/hashes/blake3'
import Hasher from './interfaces/hasher'

/**
 * Blake3 implementation of the Hasher interface.
 */
export default class Blake3 implements Hasher {
  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  hash(data: Uint8Array | string): Uint8Array {
    return hashBlake3(data)
  }
}
