import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseTestService } from './supabase-test.service';
import { SupabaseTestController } from './supabase-test.controller';
import { SupabaseTestRecord } from './entities/supabase-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupabaseTestRecord])],
  controllers: [SupabaseTestController],
  providers: [SupabaseTestService],
  exports: [SupabaseTestService],
})
export class SupabaseTestModule {}
