// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { StorachaStorageService } from './storage.service';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly storachaService: StorachaStorageService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: '上传单个文件到IPFS', 
    description: '通过Storacha将单个文件上传到IPFS网络，返回CID和访问链接' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件（最大50MB）'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '文件上传成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            cid: { type: 'string', example: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' },
            filename: { type: 'string', example: 'example.jpg' },
            gatewayUrl: { type: 'string', example: 'https://gateway.pinata.cloud/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' },
            size: { type: 'number', example: 1024000 },
            uploadedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '文件上传失败或文件格式不支持' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    console.log(`Uploading file: ${file.originalname}, size: ${file.size} bytes`);

    const result = await this.storachaService.uploadToPinata(
      file.buffer,
      file.originalname
    );

    return {
      message: 'File uploaded successfully',
      data: result
    };
  }

  @Get('list')
  @ApiOperation({ 
    summary: '获取文件列表', 
    description: '获取已上传到IPFS的文件列表，支持分页' 
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量（默认10）' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '偏移量（默认0）' })
  @ApiResponse({ 
    status: 200, 
    description: '文件列表获取成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Files retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  cid: { type: 'string' },
                  filename: { type: 'string' },
                  size: { type: 'number' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                  gatewayUrl: { type: 'string' }
                }
              }
            },
            totalCount: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async listFiles(
    @Query('limit', new DefaultValuePipe(10)) limit: number,
    @Query('offset', new DefaultValuePipe(0)) offset: number,
  ) {
    const files = await this.storachaService.listFiles(limit, offset);
    return {
      message: 'Files retrieved successfully',
      data: files
    };
  }

  @Get('info/:file_id')
  @ApiOperation({ 
    summary: '获取文件信息', 
    description: '根据CID获取IPFS文件的详细信息' 
  })
  @ApiParam({ 
    name: 'cid', 
    description: 'IPFS内容标识符', 
    example: '01998a83-9fa6-78a0-84e4-333f34c1f033' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '文件信息获取成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File info retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            cid: { type: 'string' },
            filename: { type: 'string' },
            size: { type: 'number' },
            gatewayUrl: { type: 'string' },
            ipfsUrl: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
            pinStatus: { type: 'string', enum: ['pinned', 'unknown'] }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async getFileInfo(@Param('file_id') file_id: string) {
    const info = await this.storachaService.getFileInfo(file_id);
    return {
      message: 'success',
      data: info
    };
  }
 

  @Delete(':file_id')
  @ApiOperation({ 
    summary: '删除文件', 
    description: '从IPFS取消固定文件（删除）' 
  })
  @ApiParam({ 
    name: 'file_id', 
    description: 'IPFS文件id', 
    example: '01998a83-9fa6-78a0-84e4-333f34c1f033' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '文件删除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            file_id: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'CID格式错误' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async deleteFile(@Param('file_id') file_id: string) {
    const result = await this.storachaService.deleteFile(file_id);
    return {
      message: 'success',
    };
  }
}