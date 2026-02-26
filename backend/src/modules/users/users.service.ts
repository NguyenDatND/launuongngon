import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';

export { CreateStaffDto };

const BCRYPT_ROUNDS = 10;

export interface StaffResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createStaff(dto: CreateStaffDto, managerBranchId: string): Promise<StaffResponse> {
    if (dto.role === 'guest') {
      throw new BadRequestException({
        code: 'INVALID_ROLE',
        message: "Staff accounts cannot have role 'guest'.",
      });
    }
    if (dto.branchId !== managerBranchId) {
      throw new BadRequestException({
        code: 'FORBIDDEN',
        message: 'Cannot create staff for another branch',
      });
    }
    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) {
      throw new BadRequestException({
        code: 'BRANCH_NOT_FOUND',
        message: 'Branch not found',
      });
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: dto.role,
        branchId: dto.branchId,
        isActive: true,
      },
    });
    return this.toStaffResponse(user);
  }

  async listStaff(branchId: string): Promise<{ data: StaffResponse[]; meta: { total: number } }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { branchId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, branchId: true, isActive: true },
      }),
      this.prisma.user.count({ where: { branchId } }),
    ]);
    return {
      data: users.map((u) => this.toStaffResponse(u)),
      meta: { total },
    };
  }

  async updateIsActive(userId: string, isActive: boolean, managerBranchId: string): Promise<StaffResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    if (user.branchId !== managerBranchId) {
      throw new BadRequestException({ code: 'FORBIDDEN', message: 'Cannot update user from another branch' });
    }
    if (!isActive) {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    return this.toStaffResponse({ ...updated, isActive: updated.isActive });
  }

  private toStaffResponse(u: {
    id: string;
    email: string;
    name: string;
    role: string;
    branchId: string;
    isActive?: boolean;
  }): StaffResponse {
    const out: StaffResponse = { id: u.id, email: u.email, name: u.name, role: u.role, branchId: u.branchId };
    if (typeof u.isActive === 'boolean') out.isActive = u.isActive;
    return out;
  }
}
