import jest from 'jest';
import { Schema, Model } from 'mongoose';
import { handleSaveError, runValidateAtUpdate } from './hooks.js';
import { emailRegexp } from '../constants/user-constants.js';

import Joi from 'joi';
import { emailDateRegexp } from '../constants/contacts-constants.js';
const subOpts = ['starter', 'pro', 'business'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, 'Set password for user'],
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: {
      type: String,
    },
    avatarURL: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
    deleteMany: () => ({
      deleteMany: jest.fn(),
    }),
    findOne: () => ({
      findOne: jest.fn(),
    }),
    countDocuments: () => ({
      countDocuments: jest.fn(),
    }),
  },
  { versionKey: false, timestamps: true }
);

const registerSchema = Joi.object({
  subscription: Joi.string().valid(...subOpts),
  email: Joi.string().pattern(emailDateRegexp).required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailDateRegexp).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailDateRegexp).required(),
  password: Joi.string().min(6).required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subOpts)
    .required(),
});

userSchema.pre('findOneAndUpdate', runValidateAtUpdate);
userSchema.post('save', handleSaveError);
userSchema.post('findOneAndUpdate', handleSaveError);

const UserModel = new Model(
  'user',
  userSchema,
  registerSchema,
  emailSchema,
  loginSchema,
  updateSubscriptionSchema,
  'users'
);

export default UserModel;
