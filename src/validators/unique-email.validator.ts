import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@app/repositories/user.repository';

@ValidatorConstraint({ name: 'isUniqueEmail', async: true })
@Injectable()
export class UniqueEmailValidator implements ValidatorConstraintInterface {
  protected userRepository: UserRepository;

  /**
   * @inheritdoc
   */
  public async validate(
    email: string,
    args: ValidationArguments
  ): Promise<boolean> {
    return (await this.userRepository.findOneByEmail(email)) ? false : true;
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
   * @return {UniqueEmailValidator}
   */
  public setRepository(userRepository: UserRepository): UniqueEmailValidator {
    this.userRepository = userRepository;

    return this;
  }
}
