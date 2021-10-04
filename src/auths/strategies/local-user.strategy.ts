import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt-nodejs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@app/repositories/user.repository';
import { User } from '@app/documents/user.document';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: UserRepository) {
    super({
      usernameField: 'email',
      passwordField: 'password'
    });
  }

  /**
   * Validates a given email and password.
   *
   * @param {string} email
   * @param {string} password
   *
   * @returns {Promise<any>}
   */
  public async validate(email: string, password: string): Promise<any> {
    try {
      const user: User = await this.userRepository.findOneByEmail(email);
      if (
        user
      ) {
        if (bcrypt.compareSync(password, user.getPassword())) {
          return user;
        }
      }
    } catch (error) {
      console.error(error);
    }

    throw new UnauthorizedException(`Unauthorized user with email ${email}`);
  }
}
