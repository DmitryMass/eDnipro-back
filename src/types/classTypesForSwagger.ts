import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/task/schema/task.schema';

export class BaseDocumentResponse {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MessageResponse {
  @ApiProperty()
  message: string;
}

export class FileResponse extends BaseDocumentResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  file_originalName: string;

  @ApiProperty()
  file_contentType: string;
}

export class UserResponse extends BaseDocumentResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  userBackground: string;
}

export class TaskResponse extends BaseDocumentResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty({ type: UserResponse, required: false })
  perfomingBy: UserResponse;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    enum: Status,
  })
  status: Status;

  @ApiProperty({ type: FileResponse })
  file: FileResponse;

  @ApiProperty()
  projectId: string;
}

export class ProjectResponse extends BaseDocumentResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty({ type: UserResponse })
  authorOfСreation: UserResponse;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: TaskResponse, isArray: true })
  tasks: TaskResponse[];

  @ApiProperty({ type: FileResponse })
  file: FileResponse;
}

export class SearchedProjectsResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}

export class PaginationProjectResponse {
  @ApiProperty({ type: ProjectResponse, isArray: true })
  itemsPerPage: ProjectResponse[];
  @ApiProperty()
  total: number;
}
