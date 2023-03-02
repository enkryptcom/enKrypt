export interface SelectedData {
  key: string;
  value: string;
  path: string;
}
export interface Data {
  [key: string]: string;
}

export enum ItemType {
  OBJECT,
  ARRAY,
  VALUE,
}

export type ValueTypes =
  | unknown
  | string
  | number
  | bigint
  | boolean
  | undefined;

export type ItemData = {
  key: string;
  type: ItemType;
  path: string;
  depth: number;
  length?: number;
  children?: ItemData[];
  value?: ValueTypes;
};
