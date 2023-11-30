import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Create full cycle for AUTH',
    description: 'Title for task',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Any long or short description of task',
    description: 'Description for current Task',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'ad2adw23200adw2asd',
    description: 'Project ID',
  })
  @IsString()
  projectId: string;
}
