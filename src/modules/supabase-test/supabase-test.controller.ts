import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupabaseTestService } from './supabase-test.service';
import { CreateSupabaseTestDto } from './dto/create-supabase-test.dto';
import { UpdateSupabaseTestDto } from './dto/update-supabase-test.dto';

@Controller('supabase-test')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SupabaseTestController {
  constructor(private readonly supabaseTestService: SupabaseTestService) {}

  @Post()
  create(@Body() dto: CreateSupabaseTestDto) {
    return this.supabaseTestService.create(dto);
  }

  @Get()
  findAll() {
    return this.supabaseTestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.supabaseTestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSupabaseTestDto,
  ) {
    return this.supabaseTestService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.supabaseTestService.remove(id);
  }
}
