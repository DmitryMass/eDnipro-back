import {
  Controller,
  UseFilters,
  Post,
  Body,
  UploadedFile,
  Delete,
  Param,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ErrorFilter } from 'src/middleware/error.middleware';
import { ProjectService } from './project.service';
import type { TMessage } from 'src/types/types';
import { fileUploadInterceptor } from 'src/utils/fileUploadInterceptor';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseFilters(ErrorFilter)
@Controller('project')
@UseGuards(JwtAuthGuard)
@ApiTags('Projects routes')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create new project' })
  @ApiBearerAuth('Token')
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileUploadInterceptor)
  @UsePipes(new ValidationPipe())
  @Post('create-project')
  createProject(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<TMessage> {
    return this.projectService.createProject(
      createProjectDto,
      file,
      req?.user?.id,
    );
  }

  @ApiOperation({ summary: 'Delete the project' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({ description: 'Project has succesfully deleted' })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Error when deleting the project',
  })
  @Delete('/:projectId')
  deleteProject(@Param('projectId') projectId: string): Promise<any> {
    return this.projectService.deleteProject(projectId);
  }
}
