export interface RequestOptions {
  url: string;
  post?: Record<string, any>;
  headers?: Record<string, any>;
  postProcess?: (data: any) => any;
}
export interface StoredData {
  timestamp: number;
  data: string;
}
