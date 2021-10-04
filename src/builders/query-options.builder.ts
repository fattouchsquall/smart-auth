import { ConditionExpression } from '@aws/dynamodb-expressions';
import { QueryOptions } from '@aws/dynamodb-data-mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryOptionsBuilder {
  private static DEFAULT_LIMIT = 10;

  private queryOptions: QueryOptions;
  private conditions: ConditionExpression[] = [];
  private startKey?: { [key: string]: any } = [];

  constructor() {
    this.queryOptions = {
      limit: QueryOptionsBuilder.DEFAULT_LIMIT
    };
  }

  /**
   * Adds Equality condition.
   *
   * @param {string} attribute
   * @param {boolean|string} value
   *
   * @returns {QueryOptionsBuilder}
   */
  public addEqualityConditions(
    attribute: string,
    value: boolean | string
  ): this {
    if (value) {
      const conditionExpression: ConditionExpression = {
        object: value,
        subject: attribute,
        type: 'Equals'
      };

      this.conditions.push(conditionExpression);
    }

    return this;
  }

  /**
   * Adds Inequality condition.
   *
   * @param {string} attribute
   * @param {boolean|string} value
   *
   * @returns {QueryOptionsBuilder}
   */
  public addInequalityConditions(
    attribute: string,
    value: boolean | string
  ): this {
    if (value) {
      const conditionExpression: ConditionExpression = {
        object: value,
        subject: attribute,
        type: 'NotEquals'
      };

      this.conditions.push(conditionExpression);
    }

    return this;
  }

  /**
   * Setter for index name.
   *
   * @param {string} indexName
   *
   * @returns {QueryOptionsBuilder}
   */
  public setIndexName(indexName: string): this {
    this.queryOptions.indexName = indexName;

    return this;
  }

  /**
   * Setter for limit.
   *
   * @param {number} limit
   *
   * @returns{QueryOptionsBuilder}
   */
  public setLimit(limit: number = QueryOptionsBuilder.DEFAULT_LIMIT): this {
    this.queryOptions.limit = limit;

    return this;
  }

  /**
   * Setter for scanIndexForward.
   *
   * @param {boolean} scanIndexForward
   *
   * @returns {QueryOptionsBuilder}
   */
  public setScanIndexForward(scanIndexForward: boolean = true): this {
    this.queryOptions.scanIndexForward = scanIndexForward;

    return this;
  }

  /**
   * Setter start key.
   *
   * @param {number} limit
   * @param {string} value
   *
   * @returns {QueryOptionsBuilder}
   */
  public addStartKeys(key: string, value: string): this {
    this.startKey[key] = value;
    this.queryOptions.startKey = this.startKey;

    return this;
  }

  /**
   * Setter start key.
   *
   * @param {object} startKey
   *
   * @returns {QueryOptionsBuilder}
   */
  public setStartKey(startKey: { [key: string]: any }): this {
    if (typeof startKey !== undefined) {
      this.queryOptions.startKey = startKey;
    }

    return this;
  }

  /**
   * Adds 'and' query.
   *
   * @returns {QueryOptionsBuilder}
   */
  public andWhere(): this {
    if (this.conditions.length >= 1) {
      this.queryOptions.filter = { type: 'And', conditions: this.conditions };
    }

    return this;
  }

  /**
   * Adds 'Or' query.
   *
   * @returns {QueryOptionsBuilder}
   */
  public orWhere(): this {
    if (this.conditions.length >= 1) {
      this.queryOptions.filter = { type: 'Or', conditions: this.conditions };
    }

    return this;
  }

  /**
   * Getter for QueryOptions.
   *
   * @returns {QueryOptionsBuilder}
   */
  public getQueryOptions(): QueryOptions {
    return this.queryOptions;
  }
}
