
export interface Transaction {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): Promise<void>;
  isReleased: boolean;
  getTrxConnection(): any;
}
