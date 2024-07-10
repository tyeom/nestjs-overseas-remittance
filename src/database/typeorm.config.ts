import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
    @Inject(ConfigService)
    private readonly config: ConfigService;

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            url: '',
            host: this.config.get<string>('DB_HOST'),
            port: this.config.get<number>('DB_PORT'),
            username: this.config.get<string>('DB_USER'),
            password: this.config.get<string>('DB_PASSWORD'),
            database: this.config.get<string>('DB_DATABASE'),
            synchronize: true,  // never use TRUE in production!
            dropSchema: false,
            keepConnectionAlive: true,
            logging: true,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],  // 엔티티 클래스 경로
            extra: {
                max: 100
            }
        } as TypeOrmModuleOptions
    }
}