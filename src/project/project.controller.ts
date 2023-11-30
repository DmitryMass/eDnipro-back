import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ErrorFilter } from 'src/middleware/error.middleware';
import {
  MessageResponse,
  PaginationProjectResponse,
  ProjectResponse,
  SearchedProjectsResponse,
} from 'src/types/classTypesForSwagger';
import type { TMessage } from 'src/types/types';
import { fileUploadInterceptor } from 'src/utils/fileUploadInterceptor';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';
import { Project } from './schema/project.schema';

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
  @ApiOkResponse({
    description: 'Project has succesfully created',
    type: MessageResponse,
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
  @ApiOkResponse({
    description: 'Project has succesfully deleted',
    type: MessageResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Error when deleting the project',
  })
  @Delete('/:projectId')
  deleteProject(@Param('projectId') projectId: string): Promise<TMessage> {
    return this.projectService.deleteProject(projectId);
  }

  @ApiOperation({ summary: 'Get project' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Project has succesfully got',
    type: ProjectResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({
    description: 'Error when the project',
  })
  @Get('/:projectId')
  getOneProject(@Param('projectId') projectId: string): Promise<Project> {
    return this.projectService.getOneProject(projectId);
  }

  @ApiOperation({ summary: 'Get projects' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Projects have succesfully got',
    type: PaginationProjectResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Projects not found' })
  @ApiConflictResponse({
    description: 'Error when getting the projects',
  })
  @Get()
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  getProjects(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortBy') sortBy: string,
  ): Promise<PaginationProjectResponse> {
    return this.projectService.getProjects(page, limit, sortBy);
  }

  @ApiOperation({ summary: 'Search projects by Title' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Projects have successfully searched',
    type: [SearchedProjectsResponse],
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have Token. User Unauthorized.',
  })
  @ApiNotFoundResponse({ description: 'Projects not found' })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred when searching proejcts.',
  })
  @Get('search/by')
  getSearchedProjects(@Query('q') query: string): Promise<Project[]> {
    return this.projectService.getSearchedProjects(query);
  }

  @ApiOperation({ summary: 'Update current project' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Project updated Successfully',
    type: ProjectResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have access token. User unauthorized.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileUploadInterceptor)
  @UsePipes(new ValidationPipe())
  @Put('update-project/:projectId')
  updateProject(
    @Body() updateProjectDto: UpdateProjectDto,
    @Param('projectId') projectId: string,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<Project> {
    return this.projectService.updateProject(updateProjectDto, file, projectId);
  }
}
