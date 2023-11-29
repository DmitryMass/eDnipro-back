import { Controller, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ErrorFilter } from 'src/middleware/error.middleware';
import { ProjectService } from './project.service';

@UseFilters(ErrorFilter)
@ApiTags('Projects routes')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
}
