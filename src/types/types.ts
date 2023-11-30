import { ApiProperty } from '@nestjs/swagger';

export type TLogin = {
  id: string;
  firstName: string;
  lastName: string;
  userBackground: string;
  email: string;
  token: string;
};

export type TToken = {
  token: string;
};

export type TMessage = {
  message: string;
};

export class BaseDocumentResponse {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
