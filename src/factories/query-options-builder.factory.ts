import { QueryOptionsBuilder } from '@app/builders/query-options.builder';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryOptionsBuilderFactory {
  /**
   * Returns a new instance of QueryOptionBuilder
   *
   * @returns QueryOptionsBuilder
   */
  public create(): QueryOptionsBuilder {
    return new QueryOptionsBuilder();
  }
}
