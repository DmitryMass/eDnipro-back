import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ example: 'One of: isopen, inprogress, isclosed' })
  @IsString()
  @Matches(/^(isopen|inprogress|isclosed)$/i, {
    message:
      'Invalid task status. Must be one of: isopen, inprogress, isclosed',
  })
  status: string;
}
