import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DynamoDB } from 'aws-sdk';
import { DataMapper as DynamoDBDataMapper } from '@aws/dynamodb-data-mapper';
import { UserRepository } from './repositories/user.repository';
import { QueryOptionsBuilder } from './builders/query-options.builder';
import { QueryOptionsBuilderFactory } from './factories/query-options-builder.factory';
import { JwtUserStrategy } from './auths/strategies/jwt-user.strategy';
import { JwtConstant } from './constants/jwt.constant';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/user.controller';
import { LocalUserStrategy } from './auths/strategies/local-user.strategy';
import { UniqueEmailValidator } from './validators/unique-email.validator';
import { getFromContainer } from 'class-validator';
import { KeyConditionsBuilder } from './builders/key-condition.builder';
import { KeyConditionsBuilderFactory } from './factories/key-conditions-builder.factory';
import { UniqueUsernameValidator } from './validators/unique-username.validator';

console.log(process.env.URL_DATABASE);
@Module({
  imports: ['sam-local', 'local'].includes(process.env.NODE_ENV)
    ? [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`
        }),
        JwtModule.register({
          secret: JwtConstant.secret
        }),
        PassportModule,
        HttpModule
      ]
    : [
        JwtModule.register({
          secret: JwtConstant.secret
        }),
        PassportModule,
        HttpModule
      ],
  controllers: [
    UserController,
  ],
  providers: [
    UserRepository,
    QueryOptionsBuilder,
    QueryOptionsBuilderFactory,
    KeyConditionsBuilder,
    KeyConditionsBuilderFactory,
    JwtUserStrategy,
    LocalUserStrategy,
    {
      provide: DynamoDBDataMapper,
      useValue: new DynamoDBDataMapper({
        client: new DynamoDB({
          region: process.env.AWS_REGION,
          endpoint: process.env.URL_DATABASE
        })
      })
    }
  ]
})
export class AppModule {
  constructor(
    private userRepository: UserRepository
  ) {
    const uniqueEmailValidator = getFromContainer(UniqueEmailValidator);
    uniqueEmailValidator.setRepository(this.userRepository);

    const uniquePhoneValidator = getFromContainer(UniqueUsernameValidator);
    uniquePhoneValidator.setRepository(this.userRepository);
  }
}
