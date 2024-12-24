import axios from "axios";

const DEFAULT_TIMEOUT = 30000;

const RPC_URLS = {
  mainnet: "https://firo-rpc.publicnode.com/",
};

const axiosInstance = axios.create({
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  }
});

export async function callRPC<T = any>(
  method: string,
  params?: object
): Promise<T> {
  try {
    const response = await axiosInstance.post(
      RPC_URLS['mainnet'],
      {
        jsonrpc: "1.0",
        id: "js-client",
        method: method,
        params: params ?? [],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || response.data.result === undefined) {
      throw new Error('Invalid RPC response structure');
    }
    return response.data.result;
  } catch (error) {
    console.error("RPC Error:", error);
    throw error;
  }
}
