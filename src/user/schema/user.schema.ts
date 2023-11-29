import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import mongoose from 'mongoose';
import { Task } from 'src/task/schema/task.schema';
import { BaseDocument } from 'src/utils/BaseDocument';

@Schema({
  timestamps: true,
})
export class User extends BaseDocument {
  @ApiProperty({ example: 'John', description: 'User name' })
  @Prop({ default: '' })
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'User last name' })
  @Prop({ default: '' })
  @ApiProperty({
    example: 'jonhSmith12345@gmail.com',
    description: 'User email',
  })
  @Prop({ unique: true, required: true })
  email: string;

  @ApiProperty({ example: 'anyPassword12345', description: 'User password' })
  @Prop({ required: true })
  @Exclude()
  password: string;

  @ApiProperty({ example: '#color', description: 'Auto generated color' })
  @Prop({ default: '' })
  userBackground: string;

  @ApiProperty({ description: 'Tasks for current user', type: [Task] })
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }])
  tasks: Task[];
}
