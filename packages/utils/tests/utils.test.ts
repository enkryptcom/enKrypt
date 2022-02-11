import { stripHexPrefix, bufferToHex, hexToBuffer } from "../src"

describe("Utility functions", () => {
    test('stripping 0x from string', () => {
        expect(stripHexPrefix("0xabcdef123456789")).toBe("abcdef123456789");
    });
    test('Buffer to Hex', () => {
        const buf = Buffer.from("123456", "hex")
        expect(bufferToHex(buf)).toBe("0x123456");
        expect(bufferToHex(buf, true)).toBe("123456");
    });
    test('Hex to buffer', () => {
        const buf = Buffer.from("123456", "hex")
        expect(hexToBuffer("0x123456")).toStrictEqual(buf);
        expect(hexToBuffer("123456")).toStrictEqual(buf);
    });
})