import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
import { diskStorage } from 'multer';

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
      storage: diskStorage({
        destination: (req, file, cb) => {
          const hashId = req.body.hashId;
          const uploadDir = hashId
            ? path.join(process.cwd(), 'uploads', 'chunks', hashId)
            : path.join(process.cwd(), 'uploads', 'tmp');
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const { hashId, chunkIndex } = req.body;
          if (hashId && chunkIndex !== undefined) {
            cb(null, `chunk_${chunkIndex}`);
          } else {
            cb(null, `${Date.now()}_${file.originalname}`);
          }
        },
      }),
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
  console.log(fileType, hashId, chunkIndex, totalChunks, ')____info');

  if (!file) throw new BadRequestException('未接收到文件');
  if (!fileType) throw new BadRequestException('请指定文件类型');

  // ✅ 普通上传逻辑
  if (!hashId) {
    const result = await this.s3Service.uploadFile(file, fileType);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return result;
  }

  // ✅ 分片上传逻辑
  const chunkDir = this.rootPath('uploads', 'chunks', hashId);
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }

  const total = parseInt(totalChunks);
  const currentChunk = parseInt(chunkIndex);

  console.log(currentChunk, total, '__+++=======');
  const allChunks = fs.readdirSync(chunkDir);

  console.log(`📦 分片上传: ${currentChunk + 1}/${total} | hashId=${hashId}`);

  // ✅ 检查是否所有分片已上传
  if (allChunks.length >= total) {
    console.log(`🧩 检测到所有分片上传完毕，开始合并: ${hashId}`);
    const finalDir = this.rootPath('uploads', 'tmp');
    fs.mkdirSync(finalDir, { recursive: true });

    const finalFilePath = path.join(finalDir, `${hashId}.mp4`);
    const writeStream = fs.createWriteStream(finalFilePath);

    allChunks
      .sort((a, b) => {
        const ai = parseInt(a.split('_')[1] || '0', 10);
        const bi = parseInt(b.split('_')[1] || '0', 10);
        return ai - bi;
      })
      .forEach((chunk) => {
        const chunkPath = path.join(chunkDir, chunk);
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
        fs.unlinkSync(chunkPath);
      });

    writeStream.end();

    // 删除分片目录
    fs.rmSync(chunkDir, { recursive: true, force: true });

    // 等待流写入结束再上传 S3
    await new Promise<void>((resolve) =>
      writeStream.on('finish', () => resolve()),
    );

    // 上传合并后文件到 S3
    const uploaded = await this.s3Service.uploadFile(
      {
        ...file,
        path: finalFilePath,
        originalname: `${hashId}.mp4`,
      } as Express.Multer.File,
      fileType,
    );

    if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);

    console.log(`🎉 分片合并并上传至 S3 成功: ${uploaded.url}`);

    // ✅ 返回真实可用的 URL
    return {
      message: '所有分片上传并合并成功',
      url: uploaded.url,
    };
  }

  // ✅ 如果不是最后一个分片，只返回进度信息
  return {
    message: `分片 ${currentChunk + 1}/${total} 上传成功`,
    url: null,
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
