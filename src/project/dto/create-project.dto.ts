import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'eDocument',
    description: 'Name of project',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Any long or short description of project',
    description: 'Description for current project',
  })
  @IsString()
  description: string;
}
