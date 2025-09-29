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
  Query,
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

@ApiTags('文件存储')
@Controller('storage')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
  ) {}

  @Get('test')
  @ApiOperation({ summary: '测试接口' })
  @ApiResponse({ status: 200, description: '测试接口成功' })
  async test(): Promise<{ message: string }> {
    return { message: '测试接口成功' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
          description: '文件类型',
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '文件上传成功',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: '文件类型或大小不符合要求' })
  @ApiResponse({ status: 500, description: '文件上传失败' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: FileType,
  ): Promise<FileUploadResponseDto> {
    console.log(file, 'file');
    console.log(fileType, 'fileType');
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!fileType) {
      throw new BadRequestException('请指定文件类型');
    }

    return await this.s3Service.uploadFile(file, fileType);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  @ApiOperation({ summary: '批量上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '批量文件上传',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '要上传的文件列表',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
          description: '文件类型',
        },
      },
      required: ['files', 'fileType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '批量文件上传成功',
    type: [FileUploadResponseDto],
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('fileType') fileType: FileType,
  ): Promise<FileUploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!fileType) {
      throw new BadRequestException('请指定文件类型');
    }

    return await this.s3Service.uploadMultipleFiles(files, fileType);
  }

  // 先这个接口生成url，前端直接去连接 s3 上传
  @Post('presigned-url')
  @ApiOperation({ summary: '生成预签名上传URL' })
  @ApiBody({
    description: '生成预签名URL请求',
    type: GeneratePresignedUrlDto,
  })
  @ApiResponse({
    status: 200,
    description: '预签名URL生成成功',
    type: PresignedUrlResponseDto,
  })
  async generatePresignedUrl(
    @Body() generatePresignedUrlDto: GeneratePresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    return await this.s3Service.generatePresignedUploadUrl(
      generatePresignedUrlDto.fileType,
      generatePresignedUrlDto.fileName,
      generatePresignedUrlDto.contentType,
    );
  }

  @Delete(':key')
  @ApiOperation({ summary: '删除文件' })
  @ApiResponse({ status: 200, description: '文件删除成功' })
  @ApiResponse({ status: 500, description: '文件删除失败' })
  async deleteFile(@Param('key') key: string): Promise<{ message: string }> {
    await this.s3Service.deleteFile(key);
    return { message: '文件删除成功' };
  }
}
