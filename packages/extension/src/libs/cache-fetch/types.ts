export interface RequestOptions {
  url: string;
  post?: Record<string, any>;
  headers?: Record<string, any>;
}
export interface StoredData {
  timestamp: number;
  data: string;
}
