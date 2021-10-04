import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@app/repositories/user.repository';

@ValidatorConstraint({ name: 'isUniquePhone', async: true })
@Injectable()
export class UniqueUsernameValidator implements ValidatorConstraintInterface {
  protected userRepository: UserRepository;

  /**
   * @inheritdoc
   */
  public async validate(
    username: string,
    args: ValidationArguments
  ): Promise<boolean> {
    return (await this.userRepository.findOneByUsername(username)) ? false : true;
  }

  /**
   * @inheritdoc
   */
  public defaultMessage(args: ValidationArguments) {
    return `${args.property} must be unique`;
  }

  /**
   * Setter for userRepository.
   *
   * @param {UserRepository} userRepository
   *
   * @return {UniqueUsernameValidator}
   */
  public setRepository(userRepository: UserRepository): UniqueUsernameValidator {
    this.userRepository = userRepository;

    return this;
  }
}
