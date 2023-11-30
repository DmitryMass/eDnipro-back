import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Create authorization for project',
    description: 'Name of task',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Any long or short description of project',
    description: 'Description for current Task',
  })
  @IsString()
  description: string;
}
