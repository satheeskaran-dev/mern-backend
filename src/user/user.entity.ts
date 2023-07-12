import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  image: string;

  @Prop({ select: false })
  password: string;

  @Prop({ select: false })
  refreshId: string;

  @Prop({ select: false })
  activateToken: string = null;

  @Prop()
  active: boolean = true;
}

export const UserSchema = SchemaFactory.createForClass(User);
