function toHexArray(u8: string) {
  return Array.from(
    Buffer.from(u8, 'base64'),
    byte => `0x${byte.toString(16).padStart(2, '0')}`,
  );
}

export const getSerializedCoin = (coin: string) => {
  if (Buffer.from(coin, 'base64').toString("hex") === "009de623b882b6319e8c0d783ac1c85f343150dea1c747547b1d977f425a7dca0b00006dfa8149a29e0441b51be3ffa012953b262d5e02a5890bdb61821eb0f4d5b2690100ba1e6a710bfeba9e4d186855940ca8ec4d11eea6f9cd5f20e7f4575622567368010052cc1d34baa13b24a8a4cdb337ec35623eab8ef6b2abc056d6b2d31ad28dfab595f2de7864657cc5ef7ee9b8a6ef3554f89e014012a6acde775b376ba84e35054096dfb2c9732b88839144d80aa92349d33eaa10dae5d0c2b76f1ee5106077a4fb18bb6120d9f403571855c75ea50e08a9198d7ec129e32295f870bbc9750f1ae0598e51001027000000000000") {
    console.log("ISCOINEXIST", Buffer.from(coin, 'base64').toString("hex"))
  }

  return toHexArray(coin);
};
