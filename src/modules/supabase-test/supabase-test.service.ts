import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseTestRecord } from './entities/supabase-test.entity';
import { CreateSupabaseTestDto } from './dto/create-supabase-test.dto';
import { UpdateSupabaseTestDto } from './dto/update-supabase-test.dto';

@Injectable()
export class SupabaseTestService {
  constructor(
    @InjectRepository(SupabaseTestRecord)
    private readonly supabaseTestRepository: Repository<SupabaseTestRecord>,
  ) {}

  async create(
    dto: CreateSupabaseTestDto,
  ): Promise<SupabaseTestRecord> {
    const record = this.supabaseTestRepository.create(dto);
    return this.supabaseTestRepository.save(record);
  }

  async findAll(): Promise<SupabaseTestRecord[]> {
    return this.supabaseTestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupabaseTestRecord> {
    const record = await this.supabaseTestRepository.findOne({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`记录 ${id} 不存在`);
    }

    return record;
  }

  async update(
    id: string,
    dto: UpdateSupabaseTestDto,
  ): Promise<SupabaseTestRecord> {
    const toUpdate = await this.supabaseTestRepository.preload({
      id,
      ...dto,
    });

    if (!toUpdate) {
      throw new NotFoundException(`记录 ${id} 不存在`);
    }

    return this.supabaseTestRepository.save(toUpdate);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.supabaseTestRepository.remove(record);
  }
}
