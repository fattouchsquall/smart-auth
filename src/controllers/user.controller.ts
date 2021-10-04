import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  Body,
  UsePipes,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  ClassSerializerInterceptor,
  SerializeOptions
} from '@nestjs/common';
import * as bcrypt from 'bcrypt-nodejs';
import { UserRepository } from '@app/repositories/user.repository';
import { LocalUserAuthGuard } from '@app/auths/guards/local-user-auth.guard';
import { User } from '@app/documents/user.document';
import { JwtService } from '@nestjs/jwt';
import { JwtConstant } from '@app/constants/jwt.constant';
import { UpdatePassword } from '@app/models/update-password.model';
import { JwtUserAuthGuard } from '@app/auths/guards/jwt-user-auth.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

  /**
   * Constructor.
   *
   * @param {UserRepository} userRepository
   * @param {JwtService} jwtService
   */
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Returns a user by its id.
   *
   * @param {string} id
   *
   * @returns {Promise<User>}
   */
  @Get(':id')
  @SerializeOptions({ groups: ['get'] })
  public async get(@Param('id') id: string): Promise<User> {
    const user: User = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User is not found by id: ${id}.`);
    }

    return user;
  }

  /**
   * Authenticates with email/password.
   *
   * @param {Request} request
   *
   * @returns {Promise<object>}
   */
  @UseGuards(LocalUserAuthGuard)
  @Post('login')
  @HttpCode(200)
  @SerializeOptions({ groups: ['get'] })
  public async postLogin(@Request() request): Promise<object> {
    if (!request.user) {
      throw new UnauthorizedException(`User is not authorized`);
    }

    const data: any = {
      tokenType: 'bearer',
      accessToken: this.jwtService.sign(
        {
          iss: 'https://smart.com',
          email: request.user.getEmail(),
          role: request.user.getRole(),
          sub: request.user.getId()
        },
        {
          expiresIn: JwtConstant.expiration
        }
      )
    };

    const decodeToken: any = this.jwtService.decode(data.accessToken);
    data.expiresIn = decodeToken.exp;

    return data;
  }

  /**
   * Creates a user.
   *
   * @param {User} user
   *
   * @returns {Promise<User>}
   */
  @Post()
  @HttpCode(201)
  @UsePipes(
    new ValidationPipe({
      transformOptions: { groups: ['create'] },
      transform: true,
      groups: ['create']
    })
  )
  @SerializeOptions({ groups: ['get'] })
  public async post(@Body() user: User): Promise<User> {
    try {
      user = await this.userRepository.createOrUpdate(
        user.setPassword(bcrypt.hashSync(user.getPassword()))
      );

      return user
        .setAccessToken(
          this.jwtService.sign(
            {
              iss: 'https://smart.com',
              email: user.getEmail(),
              role: user.getRole(),
              sub: user.getId()
            },
            {
              expiresIn: JwtConstant.expiration
            }
          )
        )
    } catch (error) {
      console.error(error);
    }

    throw new InternalServerErrorException(`Cannot create the user`);
  }

  /**
   * Updates password after verification of the current one.
   *
   * @param {string} id
   * @param {UpdatePassword} updatePassword
   *
   * @returns {Promise<User>}
   */
  @Post(':id/update-password')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtUserAuthGuard)
  @SerializeOptions({ groups: ['get'] })
  public async postUpdatePassword(
    @Param('id') id: string,
    @Body() updatePassword: UpdatePassword,
    @Request() request
  ): Promise<User> {
    if (request.user.id !== id) {
      throw new BadRequestException(`Operation not permitted.`);
    }

    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User is not found by id: ${id}.`);
    }

    if (
      bcrypt.compareSync(
        updatePassword.getCurrentPassword(),
        user.getPassword()
      )
    ) {
      const newPassword = bcrypt.hashSync(updatePassword.getNewPassword());

      if (
        bcrypt.compareSync(updatePassword.getCurrentPassword(), newPassword)
      ) {
        throw new BadRequestException(
          `The new password must be different from the current one.`
        );
      }

      return await this.userRepository.createOrUpdate(
        user.setPassword(newPassword).setUpdatedAt(new Date())
      );
    }

    throw new BadRequestException(`The current password is wrong.`);
  }

  /**
   * Authenticates a user using its JWT.
   *
   * @param {Request} request
   *
   * @returns {Promise<object>}
   */
  @UseGuards(JwtUserAuthGuard)
  @Post('/token-check')
  public async postTokenCheck(@Request() request): Promise<object> {
    return request.user;
  }
}
