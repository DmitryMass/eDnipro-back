import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { File } from './general-schemas/file.schema';
import { ErrorFilter } from './middleware/error.middleware';

@UseFilters(ErrorFilter)
@Controller()
export class AppController {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  @ApiOperation({ summary: 'Download File' })
  @ApiOkResponse({
    status: 200,
    description: 'File has successfully loaded.',
  })
  @ApiConflictResponse({
    description: 'Error when loading file',
  })
  @ApiNotFoundResponse({
    description: 'File not found.',
  })
  // @UseGuards(JwtAuthGuard)
  @Get('download/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.fileModel.findById(fileId);

    if (!file || !fs.existsSync(file.file_path)) {
      throw new NotFoundException('File not found');
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${file.file_originalName}`,
    );
    res.setHeader(
      'Content-Type',
      file.file_contentType || 'application/octet-stream',
    );
    fs.createReadStream(file.file_path).pipe(res);
  }
}
