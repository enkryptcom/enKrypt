import { stripHexPrefix, bytesToHex, hexToBytes } from "web3-utils"
import { encrypt, decrypt } from "./encrypt"
import MemoryStorage from "./memory-storage"

const bufferToHex = (buf: Buffer | Uint8Array, nozerox = false): string => nozerox ? Buffer.from(buf).toString("hex") : `0x${Buffer.from(buf).toString('hex')}`
const hexToBuffer = (hex: string): Buffer => Buffer.from(stripHexPrefix(hex), "hex")

export {
    stripHexPrefix,
    bufferToHex,
    hexToBuffer,
    bytesToHex,
    hexToBytes,
    encrypt,
    decrypt,
    MemoryStorage
}