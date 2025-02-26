import { EnkryptAccount } from '@enkryptcom/types';

export enum StorageKeys {
  backupInfo = 'backup-info',
}

export interface IState {
  lastBackupTime: number;
  userId: string;
  enabled: boolean;
}

export interface ListBackupType {
  userId: string;
  updatedAt: string;
}

export interface BackupType extends ListBackupType {
  payload: string;
}

export interface BackupResponseType {
  backup: BackupType;
}

export type BackupAccountType = Omit<
  EnkryptAccount,
  'address' | 'publicKey' | 'isHardware' | 'HWOptions'
>;

export interface BackupData {
  accounts: BackupAccountType[];
  uuid: string;
}
