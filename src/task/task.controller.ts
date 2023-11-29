import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ErrorFilter } from 'src/middleware/error.middleware';
import { TaskService } from './task.service';

@UseFilters(ErrorFilter)
@Controller('task')
@UseGuards(JwtAuthGuard)
@ApiTags('Task routes')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
}
