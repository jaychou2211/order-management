import { Module } from '@nestjs/common';
import { databaseProviders } from './typeorm.provider';
import { TypeORMTransaction } from './transaction';

const transactionProviders = {
  provide: 'TRANSACTION',
  useClass: TypeORMTransaction,
};

@Module({
  providers: [...databaseProviders, transactionProviders],
  exports: [...databaseProviders, transactionProviders],
})
export class DatabaseModule { }