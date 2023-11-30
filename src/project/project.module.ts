import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './schema/project.schema';
import { Task, TaskSchema } from 'src/task/schema/task.schema';
import { ProjectService } from './project.service';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import { File, FileSchema } from 'src/general-schemas/file.schema';

@Module({
  imports: [
    PassportModule,
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
  controllers: [ProjectController],
  providers: [ProjectService, CloudinaryService],
  exports: [ProjectService],
})
export class ProjectModule {}
