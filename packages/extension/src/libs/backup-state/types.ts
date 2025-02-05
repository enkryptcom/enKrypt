import { EnkryptAccount } from '@enkryptcom/types';

export enum StorageKeys {
  backupInfo = 'backup-info',
}

export interface IState {
  lastBackupTime: number;
  userId: string;
}

export interface BackupType {
  userId: string;
  payload: string;
  updatedAt: string;
}
export interface BackupResponseType {
  backups: BackupType[];
}

export interface BackupData {
  accounts: Omit<EnkryptAccount, 'address' | 'publicKey'>[];
  uuid: string;
}
