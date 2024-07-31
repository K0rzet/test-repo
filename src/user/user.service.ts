import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { telegramId, username, isBaned, isVerified, inviterRefCode, refCode } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (existingUser) {
      throw new BadRequestException('User with this telegramId already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        telegramId,
        username,
        isBaned: isBaned ?? false,
        isVerified: isVerified ?? false,
        inviterRefCode: inviterRefCode || null,
        refCode,
      },
    });

    return user;
  }

  async isUserVerified(userId: string): Promise<{ isUser: boolean }> {
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId }
    });

    return { isUser: user ? user.isVerified : false };
  }

  async verifyUser(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      return user;
    }

    const updatedUser = await this.prisma.user.update({
      where: { telegramId: userId },
      data: { isVerified: true }
    });

    // Логика по созданию задачи и обработке веб-запросов
    // await this.createTaskForUser(userId);
    // await this.processWebQuery(queryId);

    return updatedUser;
  }

  async getReferalsCount(refId: string): Promise<{ count: number }> {
    if (!refId) {
      throw new BadRequestException('ref_id is required');
    }

    // Подсчет количества пользователей с указанным refId в качестве inviterRefCode
    const count = await this.prisma.user.count({
      where: { inviterRefCode: refId }
    });

    return { count };
  }

  //query param
  async getUserData(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async getAllUsers(): Promise<any> {

    const users = await this.prisma.user.findMany();

    return users;
  }

  //url param
  async getUserById(userId: number): Promise<any> {

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    return user;
  }
  async getUserByTelegramId(telegramId: string): Promise<any> {

    const user = await this.prisma.user.findUnique({
      where: {
        telegramId: telegramId
      }
    });

    return user;
  }

  // Дополнительные методы для задачи и веб-запроса
  // private async createTaskForUser(userId: string) {
  //   // Логика по созданию задачи для пользователя
  // }

  // private async processWebQuery(queryId: string) {
  //   // Логика по обработке веб-запроса
  // }
}
