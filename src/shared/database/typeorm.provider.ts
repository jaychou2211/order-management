import { DataSource } from 'typeorm';

// docker run -d \
//   --name dogcat \
//   -e POSTGRES_PASSWORD=123456 \
//   -e POSTGRES_USER=pizza \
//   -e POSTGRES_DB=homequiz \
//   -p 5440:5432 \
//   postgres:latest

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE', // todo : avoid magic strings(另外抽至 constants.ts)
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'postgres',
                host: 'localhost',
                port: 5440,
                username: 'pizza',
                password: '123456',
                database: 'homequiz',
                entities: [
                    __dirname + '/../../**/*.model{.ts,.js}',
                ],
                synchronize: true
            });
            return dataSource.initialize();
        },
    },
];