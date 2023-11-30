import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { File } from 'src/general-schemas/file.schema';
import { Project } from 'src/project/schema/project.schema';
import { User } from 'src/user/schema/user.schema';
import { Task } from './schema/task.schema';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import type { TMessage } from 'src/types/types';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    file: Express.Multer.File,
  ): Promise<TMessage> {
    let fileId;
    const { description, title, projectId } = createTaskDto;
    const transactionSession = await this.connection.startSession();
    try {
      transactionSession.startTransaction();
      const project = await this.projectModel
        .findById(projectId)
        .session(transactionSession);
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (!file) {
        const newTask = new this.taskModel({
          title,
          description,
          projectId: project,
        });
        await newTask.save({ session: transactionSession });

        await this.projectModel
          .findByIdAndUpdate(projectId, {
            $push: { tasks: newTask },
          })
          .session(transactionSession);

        await transactionSession.commitTransaction();
        return { message: 'Task has successfully created' };
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

      const newTask = new this.taskModel({
        title,
        description,
        file: newFile,
        projectId: project,
      });

      await newTask.save({ session: transactionSession });

      await this.projectModel
        .findByIdAndUpdate(projectId, {
          $push: { tasks: newTask },
        })
        .session(transactionSession);

      await transactionSession.commitTransaction();
      return { message: 'Task has successfully created' };
    } catch (err) {
      await transactionSession.abortTransaction();
      if (fileId) {
        await this.cloudinaryService.deleteImage(fileId);
      }
      throw new InternalServerErrorException('Error when creating new project');
    } finally {
      transactionSession.endSession();
    }
  }

  async getTask(taskId: string): Promise<Task> {
    try {
      const task = await this.taskModel
        .findById(taskId)
        .populate('file')
        .populate('perfomingBy');
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      return task;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteTask(taskId: string): Promise<TMessage> {
    const transactionSession = await this.connection.startSession();
    try {
      transactionSession.startTransaction();

      const task = await this.taskModel
        .findById(taskId)
        .populate('file')
        .populate('projectId')
        .session(transactionSession);

      await this.projectModel
        .findByIdAndUpdate(task.projectId.id, {
          $pull: { tasks: task.id },
        })
        .session(transactionSession);

      if (task.file) {
        await this.fileModel
          .findByIdAndDelete(task.file.id)
          .session(transactionSession);
        await this.cloudinaryService.deleteImage(task.file.file_path);
      }

      await this.taskModel
        .findByIdAndDelete(taskId)
        .session(transactionSession);

      await transactionSession.commitTransaction();
      return { message: 'Task has successfully deleted' };
    } catch (err) {
      await transactionSession.abortTransaction();
      throw new InternalServerErrorException('Error when creating new project');
    } finally {
      transactionSession.endSession();
    }
  }
}
