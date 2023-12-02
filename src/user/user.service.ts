import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ChangeStatusDto } from 'src/task/dto/change-task-status.dto';
import { Status, Task } from 'src/task/schema/task.schema';
import { TMessage } from 'src/types/types';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async bindTaskToUser(userId: string, taskId: string): Promise<TMessage> {
    try {
      // Возможно user не обязательно искать тк он приходит сверху через проверку джвт (его айди)
      // для оптимизации можно убрать, аналогично можно делать
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const task = await this.taskModel.findById(taskId);
      if (task.perfomingBy) {
        throw new ConflictException(
          'The task is already assigned to another user, please refresh the page',
        );
      }
      const updateTask = await this.taskModel.findByIdAndUpdate(taskId, {
        $set: { perfomingBy: user, status: Status.inProgress },
      });

      if (!updateTask) {
        throw new NotFoundException('Task not found');
      }

      return { message: 'Task has successfully binded to your profile' };
    } catch (err) {
      throw new ConflictException(err.response.message);
    }
  }

  async changeTaskStatus(
    userId: string,
    taskId: string,
    changeStatusDto: ChangeStatusDto,
  ): Promise<TMessage> {
    const transactionSession = await this.connection.startSession();
    try {
      transactionSession.startTransaction();
      const user = await this.userModel
        .findById(userId)
        .session(transactionSession); // 100% будет
      const task = await this.taskModel
        .findById(taskId)
        .session(transactionSession);

      if (!task.perfomingBy) {
        throw new ConflictException(
          'This task is not assigned to you. You are not allowed to change its status.',
        );
      }

      if (!user._id.equals(task.perfomingBy)) {
        throw new ConflictException('This task is not assigned to you.');
      }

      if (changeStatusDto.status === 'isopen') {
        await this.taskModel
          .findByIdAndUpdate(taskId, {
            $set: { status: changeStatusDto.status },
            $unset: { perfomingBy: 1 },
          })
          .session(transactionSession);
        await transactionSession.commitTransaction();
        return { message: 'Task status updated as "Open' };
      }

      await this.taskModel
        .findByIdAndUpdate(taskId, {
          $set: { status: changeStatusDto.status },
        })
        .session(transactionSession);

      await transactionSession.commitTransaction();
      return { message: `Task status updated as "${changeStatusDto.status}"` };
    } catch (err) {
      await transactionSession.abortTransaction();
      throw new ConflictException('Error when updating the task status');
    } finally {
      transactionSession.endSession();
    }
  }
}
