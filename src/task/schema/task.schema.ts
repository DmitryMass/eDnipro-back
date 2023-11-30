import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import mongoose from 'mongoose';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';
import { BaseDocument } from 'src/utils/BaseDocument';
import { File } from 'src/general-schemas/file.schema';

export enum Status {
  isOpen = 'isopen',
  inProgress = 'inprogress',
  isClosed = 'isclosed',
}

@Schema({
  timestamps: true,
})
export class Task extends BaseDocument {
  @ApiProperty({
    example: 'model UserId',
    description: 'ID of the user who is performing the task.',
  })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  perfomingBy: User;

  @ApiProperty({
    example: 'model projectId',
    description: 'Project ID to which the task belongs',
  })
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  projectId: Project;

  @ApiProperty({
    example: 'Create User Authorization',
    description: 'Task title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'Create SignIn SignOut SignUp / Models / etc.',
    description: 'Description for current Task',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: 'OneOf: (isOpen/inProccess/isClosed)',
    description: 'Status of current task',
    type: Status,
  })
  @IsEnum(Status)
  @Prop({ default: Status.isOpen })
  status: Status;

  @ApiProperty({
    example: 'model File Id',
    description: 'ID of the file binded to this project.',
  })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'File' })
  file: File;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
