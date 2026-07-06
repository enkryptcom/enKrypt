const isGeoRestricted = async (): Promise<boolean> => {
  return fetch('https://partners.mewapi.io/o/ipcomply/enkrypt')
    .then(async res => {
      if (res.ok) {
        const json = await res.json();
        return json.isRestricted;
      }
      return true;
    })
    .catch(() => true);
};

const walletCache: Record<string, boolean> = {};
const isWalletRestricted = async (walletAddress: string): Promise<boolean> => {
  if (walletCache[walletAddress] !== undefined)
    return walletCache[walletAddress];
  const result = await fetch(
    `https://partners.mewapi.io/o/walletscreen?address=${walletAddress}`,
  )
    .then(async res => {
      if (res.ok) {
        const { isRestricted } = await res.json();
        return isRestricted;
      }
      return false;
    })
    .catch(() => false);
  walletCache[walletAddress] = result;
  return result;
};

export { isGeoRestricted, isWalletRestricted };
