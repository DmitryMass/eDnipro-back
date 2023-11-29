import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './schema/project.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProjectService {
  constructor(@InjectModel(Project.name) private userModel: Model<Project>) {}
}
