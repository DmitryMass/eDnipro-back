import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CloudinaryService } from 'src/cdn-cloudinary/cloudinary.service';
import { File } from 'src/general-schemas/file.schema';
import { Task } from 'src/task/schema/task.schema';
import { PaginationProjectResponse } from 'src/types/classTypesForSwagger';
import type { TMessage } from 'src/types/types';
import { User } from 'src/user/schema/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schema/project.schema';

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
        throw new NotFoundException('Creator (user) not found');
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
      throw new ConflictException(err.response.message as string);
    } finally {
      transactionSession.endSession();
    }
  }

  async deleteProject(projectId: string): Promise<TMessage> {
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

  async getTasksByProjectId(
    projectId: string,
    page: number = 1,
    limit: number = 6,
    sortBy: string = 'desc',
    filteredStatus: string = 'all',
  ): Promise<{ project: Project; tasks: Task[]; total: number }> {
    const skip = (page - 1) * limit;
    try {
      const project = await this.projectModel
        .findById(projectId)
        .select('-authorOfСreation')
        .populate('file');

      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (filteredStatus === 'all') {
        const tasks = await this.taskModel
          .find({ projectId })
          .populate('file')
          .populate('perfomingBy')
          .sort({ ['createdAt']: sortBy === 'desc' ? 'desc' : 'asc' })
          .skip(skip)
          .limit(limit);
        if (!tasks) {
          throw new NotFoundException('Tasks not found');
        }

        return {
          tasks,
          project,
          total: project.tasks.length,
        };
      }

      const tasks = await this.taskModel
        .find({ projectId, status: filteredStatus })
        .populate('file')
        .populate('perfomingBy')
        .sort({ ['createdAt']: sortBy === 'desc' ? 'desc' : 'asc' })
        .skip(skip)
        .limit(limit);
      if (!tasks) {
        throw new NotFoundException('Tasks not found');
      }

      return {
        tasks,
        project,
        total: project.tasks.length,
      };
    } catch (err) {
      throw new ConflictException(
        'Server error occured when getting or filtering tasks',
      );
    }
  }

  async getProjects(
    page: number,
    limit: number,
    sortBy: string = 'desc',
  ): Promise<PaginationProjectResponse> {
    const skip = (page - 1) * limit;
    try {
      const projectsLength = await this.projectModel.find();
      if (!projectsLength) {
        throw new NotFoundException('Projects not found');
      }

      const paginatedProjects = await this.projectModel
        .find()
        .populate('authorOfСreation')
        .populate('file')
        .sort({ ['createdAt']: sortBy === 'desc' ? 'desc' : 'asc' })
        .skip(skip)
        .limit(limit);

      return {
        itemsPerPage: paginatedProjects as any,
        total: projectsLength.length,
      };
    } catch (err) {
      throw new ConflictException(err?.response?.message);
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

  async updateProject(
    updateProjectDto: UpdateProjectDto,
    file: Express.Multer.File,
    projectId: string,
  ): Promise<Project> {
    const transactionSession = await this.connection.startSession();
    const filePaths = {
      oldPath: '',
      newPath: '',
    };
    try {
      transactionSession.startTransaction();
      const currentProject = await this.projectModel
        .findById(projectId)
        .populate('file')
        .session(transactionSession);

      if (!currentProject) {
        throw new NotFoundException('Project not found');
      }

      if (file) {
        const cloudinaryResult = await this.cloudinaryService.uploadImage(
          file.buffer,
        );
        filePaths.newPath = cloudinaryResult.public_id;
        const newFile = new this.fileModel({
          file_path: cloudinaryResult.public_id,
          file_contentType: file.mimetype,
          file_originalName: file.originalname,
        });
        await newFile.save({ session: transactionSession });

        if (currentProject.file) {
          filePaths.oldPath = currentProject.file.file_path;
          await this.fileModel
            .findByIdAndDelete(currentProject.file.id)
            .session(transactionSession);
        }

        const updatedProject = await this.projectModel
          .findByIdAndUpdate(
            projectId,
            {
              $set: { ...updateProjectDto, file: newFile },
            },
            { new: true },
          )
          .session(transactionSession);

        if (filePaths.oldPath) {
          await this.cloudinaryService.deleteImage(filePaths.oldPath);
        }

        await transactionSession.commitTransaction();
        return updatedProject;
      }

      const project = await this.projectModel
        .findByIdAndUpdate(
          projectId,
          {
            $set: { ...updateProjectDto },
          },
          { new: true },
        )
        .populate('file')
        .session(transactionSession);

      await transactionSession.commitTransaction();
      return project;
    } catch (err) {
      await transactionSession.abortTransaction();
      if (filePaths.newPath) {
        await this.cloudinaryService.deleteImage(filePaths.newPath);
      }
      throw new InternalServerErrorException(
        'Server error occured when updating the project',
      );
    } finally {
      transactionSession.endSession();
    }
  }
}
