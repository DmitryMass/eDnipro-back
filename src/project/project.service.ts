import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Project } from './schema/project.schema';
import mongoose, { Model } from 'mongoose';
import type { PaginationResponse, TMessage } from 'src/types/types';
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

  async getProjects(
    page: number,
    limit: number,
    sortBy: string = 'asc',
  ): Promise<PaginationResponse<Project>> {
    const skip = (page - 1) * limit;
    try {
      const projectsLength = await this.projectModel.find();
      if (!projectsLength) {
        throw new NotFoundException('Projects not found');
      }

      const paginatedProjects = await this.projectModel
        .find()
        .sort({ ['createdAt']: sortBy === 'asc' ? 'asc' : 'desc' })
        .skip(skip)
        .limit(limit);

      return {
        itemsPerPage: paginatedProjects,
        total: projectsLength.length,
      };
    } catch (err) {
      throw new ConflictException('Error occured when getting projects');
    }
  }

  async getSearchedProjects(query: string): Promise<Project[]> {
    try {
      // Универсальный вариант поиска.
      // Выключает регистр, а так же можно расширить все категории по которым мы можем искать проекты, можно добавить description , author и так далее / строкой указываем параметры не нужные в запросе
      const projects = await this.projectModel.find(
        {
          $or: [{ title: { $regex: query, $options: 'i' } }],
        },
        '-tasks -authorOfСreation -file',
      );

      if (!projects) {
        throw new NotFoundException('Projects not found');
      }

      return projects;
    } catch (err) {
      throw new InternalServerErrorException(
        'Server error occured when searched projects',
      );
    }
  }
}
