import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Task } from 'src/task/schema/task.schema';
import { User } from 'src/user/schema/user.schema';
import { BaseDocument } from 'src/utils/BaseDocument';
import { File } from 'src/general-schemas/file.schema';

@Schema({
  timestamps: true,
})
export class Project extends BaseDocument {
  @ApiProperty({
    example: 'model UserId',
    description: 'ID of the user who created the project.',
  })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  authorOfСreation: User;

  @ApiProperty({
    example: 'eDocument',
    description: 'Name of project',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'Any long or short description of project',
    description: 'Description for current Task',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: '',
    description: 'Description for current Task',
  })
  @Prop({ required: true })
  imgPath: string;

  @ApiProperty({ description: 'Tasks of current project', type: [Task] })
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }])
  tasks: Task[];

  @ApiProperty({
    example: 'model File Id',
    description: 'ID of the file binded to this project.',
  })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'File' })
  file: File;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
