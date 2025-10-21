import { PartialType } from '@nestjs/mapped-types';
import { CreateSupabaseTestDto } from './create-supabase-test.dto';

export class UpdateSupabaseTestDto extends PartialType(CreateSupabaseTestDto) {}
