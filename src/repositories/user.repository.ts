import { Injectable } from '@nestjs/common';
import { DataMapper as DynamoDBDataMapper } from '@aws/dynamodb-data-mapper';
import { User } from '@app/documents/user.document';
import { QueryOptionsBuilder } from '@app/builders/query-options.builder';
import { QueryOptionsBuilderFactory } from '@app/factories/query-options-builder.factory';
import { QueryInterface } from '@app/filters/query.interface';

@Injectable()
export class UserRepository {
  constructor(
    private dynamoDBDataMapper: DynamoDBDataMapper,
    private queryOptionsBuilderFactory: QueryOptionsBuilderFactory
  ) {}

  /**
   * Returns a user by its id.
   *
   * @param {string} id
   *
   * @returns {Promise<User>}
   */
  public async findOneById(id: string): Promise<User> {
    try {
      return await this.dynamoDBDataMapper.get(new User().setId(id));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Returns a user by its email
   *
   * @param {string} email
   *
   * @returns {Promise<User>}
   */
  public async findOneByEmail(email: string): Promise<User> {
    try {
      const queryOptionsBuilder: QueryOptionsBuilder = this.queryOptionsBuilderFactory
        .create()
        .setIndexName('EmailIndex');

      for await (const item of this.dynamoDBDataMapper.query(
        User,
        { email },
        queryOptionsBuilder.getQueryOptions()
      )) {
        return item;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Returns a user by its username
   *
   * @param {string} username
   *
   * @returns {Promise<User>}
   */
  public async findOneByUsername(username: string): Promise<User> {
    try {
      const queryOptionsBuilder: QueryOptionsBuilder = this.queryOptionsBuilderFactory
        .create()
        .setIndexName('UsernameIndex');

      for await (const item of this.dynamoDBDataMapper.query(
        User,
        { username },
        queryOptionsBuilder.getQueryOptions()
      )) {
        return item;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Creates/updates an entry of user in db.
   *
   * @param {User} user
   * &
   * @returns {Promise<User>}
   */
  public async createOrUpdate(user: User): Promise<User> {
    return await this.dynamoDBDataMapper.put(user);
  }

  /**
   * Deletes an entry from db.
   *
   * @param {User} user
   *
   * @returns {Promise<boolean>}
   */
  public async delete(user: User): Promise<boolean> {
    try {
      await this.dynamoDBDataMapper.delete(
        new User().setEmail(user.getEmail())
      );
      return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }
}
