import { Document, Model } from 'mongoose';
import Joi from 'joi';

declare module '../../models/user.js' {
  interface UserDocument extends Document {
    // Define your user document properties here
  }

  interface UserModel extends Model<UserDocument> {
    name?: string;
    email: string;
    password: string;
    subscription: string;
  }

  const User: UserModel;

  export const userSchema: (typeof User)['prototype'];
  export const registerSchema: Joi.ObjectSchema<any>;
  export const emailSchema: Joi.ObjectSchema<any>;
  export const loginSchema: Joi.ObjectSchema<any>;
  export const updateSubscriptionSchema: Joi.ObjectSchema<any>;

  export default User;
}
