import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginUserPayload } from '../auth/auth.service';
import { UsersService, StaffResponse } from './users.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateIsActiveDto } from './dto/update-is-active.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create staff account (manager only, scoped to own branch)' })
  @ApiResponse({ status: 201, description: 'Staff created. Returns { data: { id, email, name, role, branchId } }.' })
  @ApiResponse({ status: 400, description: 'INVALID_ROLE or BRANCH_NOT_FOUND.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 403, description: 'Role is not manager.' })
  @ApiResponse({ status: 409, description: 'EMAIL_ALREADY_EXISTS.' })
  async create(@Body() dto: CreateStaffDto, @CurrentUser() user: LoginUserPayload): Promise<{ data: StaffResponse }> {
    const staff = await this.usersService.createStaff(dto, user.branchId);
    return { data: staff };
  }

  @Get()
  @ApiOperation({ summary: 'List staff in own branch (manager only)' })
  @ApiResponse({ status: 200, description: 'Returns { data: [...], meta: { total } }.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 403, description: 'Role is not manager.' })
  async list(@CurrentUser() user: LoginUserPayload): Promise<{ data: StaffResponse[]; meta: { total: number } }> {
    return this.usersService.listStaff(user.branchId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate / deactivate staff account (manager only)' })
  @ApiParam({ name: 'id', description: 'Staff user UUID' })
  @ApiResponse({ status: 200, description: 'Returns { data: { id, email, name, role, branchId, isActive } }.' })
  @ApiResponse({ status: 400, description: 'Cannot update user from another branch.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 403, description: 'Role is not manager.' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND — user does not exist.' })
  async updateIsActive(
    @Param('id') id: string,
    @Body() dto: UpdateIsActiveDto,
    @CurrentUser() user: LoginUserPayload,
  ): Promise<{ data: StaffResponse }> {
    const staff = await this.usersService.updateIsActive(id, dto.isActive, user.branchId);
    return { data: staff };
  }
}
