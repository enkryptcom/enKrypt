export interface UnisatNFTType {
  inscriptionId: string;
  output: string;
  preview: string;
  inscriptionNumber: string;
  location: string;
}

export interface UnisatResponse {
  code: number;
  data: {
    list: UnisatNFTType[];
  };
}
