import { stripHexPrefix, bytesToHex, hexToBytes } from "web3-utils"

const bufferToHex = (buf: Buffer, nozerox = false): string => nozerox ? buf.toString("hex") : `0x${buf.toString('hex')}`
const hexToBuffer = (hex: string): Buffer => Buffer.from(stripHexPrefix(hex), "hex")

export {
    stripHexPrefix,
    bufferToHex,
    hexToBuffer,
    bytesToHex,
    hexToBytes
}