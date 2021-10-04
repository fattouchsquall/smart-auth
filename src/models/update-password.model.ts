import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePassword {
  @IsNotEmpty()
  private currentPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  private newPassword: string;

  /**
   * Sets currentPassword.
   *
   * @param {string} currentPassword
   *
   * @returns {UpdatePassword}
   */
  public setCurrentPassword(currentPassword: string): this {
    this.currentPassword = currentPassword;

    return this;
  }

  /**
   * Gets email.
   *
   * @returns {string}
   */
  public getCurrentPassword(): string {
    return this.currentPassword;
  }

  /**
   * Sets newPassword.
   *
   * @param {string} newPassword
   *
   * @returns {UpdatePassword}
   */
  public setNewPassword(newPassword: string): this {
    this.newPassword = newPassword;

    return this;
  }

  /**
   * Gets newPassword.
   *
   * @returns {string}
   */
  public getNewPassword(): string {
    return this.newPassword;
  }
}
