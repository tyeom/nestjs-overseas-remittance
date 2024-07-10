import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeormConfig } from './database/typeorm.config'
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { getEnvPath } from './helpers/env.helper';
import { QuoteModule } from './quote/quote.module';

const envFilePath: string = getEnvPath(`${__dirname}/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,  // typeorm 설정 클래스 
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize()
      }
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    QuoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
