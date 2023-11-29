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

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(File.name) private fileModel: Model<File>,
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
}
