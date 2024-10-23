import { DynamicModule, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeORMTransaction } from './transaction';

const transactionProvider = {
  provide: 'TRANSACTION',
  useClass: TypeORMTransaction,
};

@Module({})
export class DatabaseModule {
  static forFeature(options: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: any[];
  }): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATA_SOURCE',
          useFactory: async () => {
            const dataSource = new DataSource({
              type: 'postgres',
              ...options,
              synchronize: true,
            });
            return dataSource.initialize();
          },
        },
        transactionProvider
      ],
      exports: ['DATA_SOURCE', 'TRANSACTION'],
    };
  }
}