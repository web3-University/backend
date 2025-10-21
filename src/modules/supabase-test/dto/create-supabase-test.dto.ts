import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupabaseTestDto {
  @IsString()
  @MaxLength(200, { message: 'title 长度不能超过 200 个字符' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'description 长度不能超过 1000 个字符' })
  description?: string;
}
