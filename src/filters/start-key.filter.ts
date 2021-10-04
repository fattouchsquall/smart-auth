import { IsNotEmpty, IsString, IsDate, IsEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class StartKeyFilter {
  @IsNotEmpty({ groups: ['get'] })
  @IsString({ groups: ['get'] })
  @IsEmpty({ groups: ['get_sender_user_id'] })
  public readonly receiverUserId: string;

  @Type(() => Date)
  @IsNotEmpty({ groups: ['get'] })
  @IsDate({ groups: ['get'] })
  @IsEmpty({ groups: ['get_sender_user_id'] })
  public readonly createdAt: Date;

  @IsEmpty({ groups: ['get'] })
  @IsString({ groups: ['get_sender_user_id'] })
  @IsNotEmpty({ groups: ['get_sender_user_id'] })
  public readonly senderUserId: string;
}
