import {
  Body,
  Controller,
  Param,
  Patch,
  Request,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ErrorFilter } from 'src/middleware/error.middleware';
import { ChangeStatusDto } from 'src/task/dto/change-task-status.dto';
import { MessageResponse } from 'src/types/classTypesForSwagger';
import { TMessage } from 'src/types/types';
import { UserService } from './user.service';

@UseFilters(ErrorFilter)
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiTags('User routes')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Bind task to user' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Task binded Successfully',
    type: MessageResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiConflictResponse({
    description:
      'The task is already assigned to another user, please refresh the page',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Task | User not found' })
  @Patch('bind-task/:taskId')
  bindTaskToUser(
    @Request() req,
    @Param('taskId') taskId: string,
  ): Promise<TMessage> {
    return this.userService.bindTaskToUser(req.user.id, taskId);
  }

  @ApiOperation({
    summary: 'Unlink the user from the task or change the task status',
  })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Task status has successfully changed',
    type: MessageResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiBadRequestResponse({
    description:
      'Invalid task status. Must be one of: isopen, inprocess, isclosed',
  })
  @ApiConflictResponse({
    description:
      'This task is not assigned to you. You are not allowed to change its status.',
  })
  @UsePipes(new ValidationPipe())
  @Patch('change-task-status/:taskId')
  changeTaskStatus(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ): Promise<TMessage> {
    return this.userService.changeTaskStatus(
      req.user.id,
      taskId,
      changeStatusDto,
    );
  }
}
