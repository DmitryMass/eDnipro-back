import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Project, ProjectSchema } from 'src/project/schema/project.schema';
import { Task, TaskSchema } from 'src/task/schema/task.schema';
import { File, FileSchema } from 'src/general-schemas/file.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: File.name, schema: FileSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '3d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
  exports: [UserService],
})
export class UserModule {}
