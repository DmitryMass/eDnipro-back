import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDocument } from 'src/utils/BaseDocument';

@Schema({
  timestamps: true,
})
export class File extends BaseDocument {
  @ApiProperty({ example: 'some/filepath', description: 'File Path' })
  @Prop({ required: true })
  file_path: string;

  @ApiProperty({ example: 'Original name', description: 'Original file name' })
  @Prop({ required: true })
  file_originalName: string;

  @ApiProperty({ example: '255Mb', description: 'File size' })
  @Prop({ required: true })
  file_size: number;

  @ApiProperty({ example: 'Content-type', description: 'File content-type' })
  @Prop({ required: true })
  file_contentType: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
