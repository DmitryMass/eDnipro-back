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
  Param,
  Get,
  Put,
  Delete,
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
import { Task } from './schema/task.schema';
import { UpdateTaskDto } from './dto/update-task.dto';

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

  // В проекте не используем (добавил по тз как crud)
  @ApiOperation({ summary: 'Get task by id' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOkResponse({
    description: 'Task has successfully got',
    type: TaskResponse,
  })
  @ApiBearerAuth('Token')
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @Get(':taskId')
  getTasks(@Param('taskId') taskId: string): Promise<Task> {
    return this.taskService.getTask(taskId);
  }

  @ApiOperation({ summary: 'Delete task by id' })
  @ApiOkResponse({
    description: 'Task has successfully deleted',
    type: MessageResponse,
  })
  @ApiBearerAuth('Token')
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Delete('delete/:taskId')
  deleteTask(@Param('taskId') taskId: string): Promise<TMessage> {
    return this.taskService.deleteTask(taskId);
  }

  @ApiOperation({ summary: 'Update current task' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Task updated Successfully',
    type: TaskResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileUploadInterceptor)
  @UsePipes(new ValidationPipe())
  @Put('update-task/:taskId')
  updateProject(
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('taskId') taskId: string,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<Task> {
    return this.taskService.updateTask(updateTaskDto, file, taskId);
  }
}
