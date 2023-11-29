import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { Project, ProjectSchema } from 'src/project/schema/project.schema';
import { Task, TaskSchema } from './schema/task.schema';
import { File, FileSchema } from 'src/general-schemas/file.schema';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

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
  controllers: [TaskController],
  providers: [TaskService, CloudinaryService],
  exports: [TaskService],
})
export class TaskModule {}
