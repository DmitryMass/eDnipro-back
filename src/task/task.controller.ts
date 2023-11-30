import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ErrorFilter } from 'src/middleware/error.middleware';
import { fileUploadInterceptor } from 'src/utils/fileUploadInterceptor';
import type { TMessage } from './../types/types';
import { TaskService } from './task.service';

import { MessageResponse, TaskResponse } from 'src/types/classTypesForSwagger';
import { CreateTaskDto } from './dto/create-task.dto';

@UseFilters(ErrorFilter)
@Controller('task')
@UseGuards(JwtAuthGuard)
@ApiTags('Task routes')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Create the task' })
  @ApiInternalServerErrorResponse({
    description: 'Server error occured when creating the task',
  })
  @ApiOkResponse({
    description: 'Task successfully created',
    type: MessageResponse,
  })
  @ApiNotFoundResponse({ description: 'User or Project Not Found' })
  @ApiBearerAuth('Token')
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileUploadInterceptor)
  @UsePipes(new ValidationPipe())
  @Post('create-task')
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<TMessage> {
    return this.taskService.createTask(createTaskDto, file);
  }
}
