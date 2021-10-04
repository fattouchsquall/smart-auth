import { ConditionExpression } from '@aws/dynamodb-expressions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyConditionsBuilder {
  protected conditions: ConditionExpression[] = [];
  private keyCondition: ConditionExpression;

  /**
   * Adds Equality condition.
   *
   * @param {string} attribute
   * @param {any}    value
   *
   * @returns {KeyConditionsBuilder}
   */
  public addEqualityConditions(attribute: string, value: any): this {
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
   * Adds Greater Than condition.
   *
   * @param {string} attribute
   * @param {number} value
   *
   * @returns {KeyConditionsBuilder}
   */
  public addGreaterThanConditions(attribute: string, value: number): this {
    if (value) {
      const conditionExpression: ConditionExpression = {
        object: value,
        subject: attribute,
        type: 'GreaterThanOrEqualTo'
      };

      this.conditions.push(conditionExpression);
    }

    return this;
  }

  /**
   * Adds Lesser Than condition.
   *
   * @param {string} attribute
   * @param {number} value
   *
   * @returns {KeyConditionsBuilder}
   */
  public addLesserThanConditions(attribute: string, value: number): this {
    if (value) {
      const conditionExpression: ConditionExpression = {
        object: value,
        subject: attribute,
        type: 'LessThanOrEqualTo'
      };

      this.conditions.push(conditionExpression);
    }

    return this;
  }

  /**
   * Adds Between condition.
   *
   * @param {string} attribute
   * @param {number} minimumValue
   * @param {number} maximumValue
   *
   * @returns {KeyConditionsBuilder}
   */
  public addBetweenConditions(
    attribute: string,
    minimumValue: number,
    maximumValue: number
  ): this {
    if (minimumValue && maximumValue) {
      const conditionExpression: ConditionExpression = {
        lowerBound: minimumValue,
        upperBound: maximumValue,
        subject: attribute,
        type: 'Between'
      };

      this.conditions.push(conditionExpression);
    }

    return this;
  }

  /**
   * Adds Comparison condition.
   *
   * @param {string} attribute
   * @param {object} value
   *
   * @returns {QueryOptionsBuilder}
   */
  public addComparisonConditions(attribute: string, value: any): this {
    if (value) {
      if (value.lte && value.gte) {
        this.addBetweenConditions(attribute, value.gte, value.lte);
      } else if (value.lte) {
        this.addLesserThanConditions(attribute, value.lte);
      } else if (value.gte) {
        this.addGreaterThanConditions(attribute, value.gte);
      }
    }

    return this;
  }

  /**
   * Adds 'and' query.
   *
   * @returns {KeyConditionsBuilder}
   */
  public andWhere(): this {
    if (this.conditions.length >= 1) {
      this.keyCondition = { type: 'And', conditions: this.conditions };
    }

    return this;
  }

  /**
   * Getter for KeyConditions.
   *
   * @returns {ConditionExpression}
   */
  public getKeyConditionExpression(): ConditionExpression {
    return this.keyCondition;
  }
}
