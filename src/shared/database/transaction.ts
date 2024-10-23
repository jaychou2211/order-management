import { Inject, Injectable, Scope } from "@nestjs/common";
import { Transaction } from "./transaction.interface";
import { DataSource, QueryRunner } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class TypeORMTransaction implements Transaction {
  private queryRunner: QueryRunner;

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  async start(): Promise<void> {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    await this.queryRunner.release();
  }

  get isReleased(): boolean {
    return this.queryRunner.isReleased;
  }

  getTrxConnection() {
    return this.queryRunner;
  }
}