import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Project } from './schema/project.schema';
import mongoose, { Model } from 'mongoose';
import type { TMessage } from 'src/types/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from 'src/user/schema/user.schema';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import { File } from 'src/general-schemas/file.schema';
import { Task } from 'src/task/schema/task.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    file: Express.Multer.File,
    authorId: string,
  ): Promise<TMessage> {
    let fileId;
    const { description, title } = createProjectDto;
    const transactionSession = await this.connection.startSession();
    try {
      transactionSession.startTransaction();

      const user = await this.userModel
        .findById(authorId)
        .session(transactionSession);

      if (!user) {
        throw new NotFoundException('Creator(user) not found');
      }

      if (!file) {
        const newProject = new this.projectModel({
          title,
          description,
          authorOfСreation: user,
          tasks: [],
        });
        await newProject.save({ session: transactionSession });
        await transactionSession.commitTransaction();
        return { message: 'Project has successfully created' };
      }

      const cloudinaryResult = await this.cloudinaryService.uploadImage(
        file.buffer,
      );
      fileId = cloudinaryResult.public_id;

      const newFile = new this.fileModel({
        file_path: cloudinaryResult.public_id,
        file_contentType: file.mimetype,
        file_originalName: file.originalname,
      });
      await newFile.save({ session: transactionSession });

      const newProject = new this.projectModel({
        title,
        description,
        file: newFile,
        authorOfСreation: user,
        tasks: [],
      });
      await newProject.save({ session: transactionSession });
      await transactionSession.commitTransaction();

      return { message: 'Project has successfully created' };
    } catch (err) {
      await transactionSession.abortTransaction();
      if (fileId) {
        await this.cloudinaryService.deleteImage(fileId);
      }
      throw new ConflictException('Error when creating new project');
    } finally {
      transactionSession.endSession();
    }
  }

  async deleteProject(projectId: string): Promise<any> {
    const transactionSession = await this.connection.startSession();
    try {
      transactionSession.startTransaction();
      const filesToDelete = [];

      const project = await this.projectModel
        .findById(projectId)
        .populate({
          path: 'tasks',
          model: 'Task',
          populate: {
            path: 'file',
            model: 'File',
          },
        })
        .populate('file')
        .session(transactionSession);

      if (project.file) {
        filesToDelete.push(project.file.file_path);
        await this.fileModel
          .findByIdAndDelete(project.file.id)
          .session(transactionSession);
      }

      if (project.tasks && project.tasks.length) {
        for (const task of project.tasks) {
          filesToDelete.push(task.file.file_path);
          await Promise.all([
            this.fileModel
              .findByIdAndDelete(task.file.id)
              .session(transactionSession),
            this.taskModel
              .findByIdAndDelete(task.id)
              .session(transactionSession),
          ]);
        }
      }

      await this.projectModel
        .findByIdAndDelete(projectId)
        .session(transactionSession);

      // Выношу отдельно так как если будет ошибка ДО, мы не будет удалять файлы с CDN , а если удалят файлы сразу то можем в дальнейших операциях потерять файлы
      const deletePromises = filesToDelete.map((fileId) =>
        this.cloudinaryService.deleteImage(fileId),
      );
      await Promise.all(deletePromises);

      await transactionSession.commitTransaction();
      return { message: 'Project has successfully deleted' };
    } catch (err) {
      await transactionSession.abortTransaction();
      throw new ConflictException('Error when deleting the project');
    } finally {
      transactionSession.endSession();
    }
  }
}
