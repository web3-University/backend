// src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { StorachaStorageService } from './storage.service';
import { UploadController } from './storage.controller';

@Module({
  providers: [StorachaStorageService],
  controllers: [UploadController],
  exports: [StorachaStorageService],
})
export class StorageModule {}