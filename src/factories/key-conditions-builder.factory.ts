import { KeyConditionsBuilder } from '@app/builders/key-condition.builder';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyConditionsBuilderFactory {
  /**
   * Returns a new instance of KeyConditionBuilder
   *
   * @returns QueryOptionsBuilder
   */
  public create(): KeyConditionsBuilder {
    return new KeyConditionsBuilder();
  }
}
