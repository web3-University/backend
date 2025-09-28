import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库配置工厂函数
 * 从环境变量中读取数据库配置信息
 */
export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', '123456'),
  database: configService.get<string>('DB_DATABASE', 'w3college'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: false,
  autoLoadEntities: true,
});
