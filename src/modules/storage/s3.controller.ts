import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { S3Service } from './s3.service';
import {
  GeneratePresignedUrlDto,
  FileUploadResponseDto,
  PresignedUrlResponseDto,
  FileType,
} from './dto/upload.dto';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('文件存储')
@Controller('storage')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /** ✅ 工具函数：项目根路径 */
  private rootPath(...segments: string[]): string {
    return path.join(process.cwd(), ...segments);
  }

  /** ✅ 测试接口 */
  @Get('test')
  async test(): Promise<{ message: string }> {
    return { message: '测试接口成功' };
  }

  /** ✅ 单接口：支持普通上传 + 分片上传 */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // ← 改用内存存储
    }),
  )
  @ApiOperation({ summary: '上传文件（支持分片）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传（支持分片）',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
        },
        hashId: { type: 'string', description: '分片上传唯一hash（可选）' },
        chunkIndex: { type: 'number', description: '当前分片索引（可选）' },
        totalChunks: { type: 'number', description: '总分片数（可选）' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '上传成功(普通或分片)',
    type: FileUploadResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<FileUploadResponseDto> {
    const { fileType, hashId, chunkIndex, totalChunks } = body;

    if (!file) throw new BadRequestException('未接收到文件');
    if (!fileType) throw new BadRequestException('请指定文件类型');

    // ============ 普通上传 ============
    if (!hashId) {
      const result = await this.s3Service.uploadFile(file, fileType);
      return result;
    }

    // ============ 分片上传 ============
    const total = parseInt(totalChunks);
    const current = parseInt(chunkIndex);

    if (isNaN(total) || isNaN(current)) {
      throw new BadRequestException('分片索引无效');
    }

    console.log(`📦 接收到分片 ${current + 1}/${total} | hashId=${hashId}`);
    console.log(`📂 文件大小: ${file.size} bytes`);

    // 手动保存分片到磁盘
    const chunkDir = this.rootPath('uploads', 'chunks', hashId);
    fs.mkdirSync(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk_${current}`);
    fs.writeFileSync(chunkPath, file.buffer);
    console.log(`✅ 分片已保存: ${chunkPath}`);

    // 统计已有分片
    const allChunks = fs.readdirSync(chunkDir);
    console.log(`🔍 当前分片数: ${allChunks.length}, 总分片数: ${total}`);

    // ============ 是否所有分片上传完毕 ============
    if (allChunks.length === total) {
      console.log(`🧩 ✅✅✅ 所有分片上传完毕，开始合并: ${hashId}`);

      try {
        // 直接在内存中合并
        const buffers: Buffer[] = [];

        const sortedChunks = allChunks.sort((a, b) => {
          const ai = parseInt(a.split('_')[1]);
          const bi = parseInt(b.split('_')[1]);
          return ai - bi;
        });

        console.log(`🔀 排序后的前5个分片:`, sortedChunks.slice(0, 5));

        sortedChunks.forEach((chunk) => {
          const chunkFilePath = path.join(chunkDir, chunk);
          const chunkData = fs.readFileSync(chunkFilePath);
          console.log(`📝 读取分片: ${chunk}, 大小: ${chunkData.length} bytes`);
          buffers.push(chunkData);
          fs.unlinkSync(chunkFilePath);
        });

        // 合并所有 buffer
        const mergedBuffer = Buffer.concat(buffers);
        console.log(`📦 合并后文件大小: ${mergedBuffer.length} bytes`);

        // 删除分片目录
        fs.rmSync(chunkDir, { recursive: true, force: true });
        console.log(`🗑️ 分片目录已删除: ${chunkDir}`);

        // 构造完整的文件对象
        const mergedFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: `${hashId}.mp4`,
          encoding: '7bit',
          mimetype: 'video/mp4',
          buffer: mergedBuffer,
          size: mergedBuffer.length,
          stream: null,
          destination: '',
          filename: `${hashId}.mp4`,
          path: '',
        };

        console.log(`☁️ 开始上传到 S3...`);
        const uploaded = await this.s3Service.uploadFile(mergedFile, fileType);
        console.log(`☁️ S3 上传结果:`, JSON.stringify(uploaded, null, 2));

        console.log(`🎉 分片合并并上传至 S3 成功: ${uploaded.url}`);

        return {
          key: uploaded.key,
          url: uploaded.url,
          uploadedAt: uploaded.uploadedAt,
        };
      } catch (error) {
        console.error(`❌❌❌ 合并或上传过程出错:`, error);
        throw error;
      }
    } else {
      console.log(`⏳ 等待更多分片... (${allChunks.length}/${total})`);
    }

    // ============ 非最后一个分片 ============
    return {
      key: '',
      url: null,
      uploadedAt: null,
    };
  }

  /** ✅ 生成预签名URL */
  @Post('presigned-url')
  @ApiOperation({ summary: '生成预签名上传URL' })
  async generatePresignedUrl(
    @Body() dto: GeneratePresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    return await this.s3Service.generatePresignedUploadUrl(
      dto.fileType,
      dto.fileName,
      dto.contentType,
    );
  }

  /** ✅ 删除文件 */
  @Delete(':key')
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(@Param('key') key: string): Promise<{ message: string }> {
    await this.s3Service.deleteFile(key);
    return { message: '文件删除成功' };
  }
}
