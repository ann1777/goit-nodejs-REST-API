import fs from 'fs/promises';
import path from 'path';

import Contact from '../models/contact.js';
import { HttpCode } from '../constants/user-constants.js';
import bodyWrapper from '../decorators/bodyWrapper.js';
import HttpError from '../helpers/HttpError.js';

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.find(
    { owner },
    '-createdAt -updatedAt'
  ).populate('owner', 'name email');
  res.json(result);
};

const getById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findById(id);
  if (!result) {
    throw HttpError(HttpCode.NOT_FOUND, `Contact with id=${id} not found`);
  }
  res.json(result);
};

const deleteById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findByIdAndRemove(id);
  if (!result) {
    throw HttpError(HttpCode.NOT_FOUND, `Contact with id=${id} not found`);
  }

  res.json({
    message: 'Contact delete success',
  });
};

const avatarsDir = path.resolve('public', 'avatars');

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const { path: oldPath, filename } = req.file;
  console.log(req.user, owner);
  const { error } = Contact.contactSchema.validate(req.body);
  if (error) {
    throw new Error(HttpCode.BAD_REQUEST, error.message);
  }
  const avatarName = `${owner}_${filename}`;
  const newPath = path.join(avatarsDir, avatarName);
  await fs.rename(oldPath, newPath);
  const avatar = path.join('avatars', avatarName);
  const result = await Contact.create({ ...req.body, avatar, owner });
  res.status(HttpCode.CREATED).json(result);
};

const updateById = async (req, res) => {
  const { error } = Contact.contactSchema.validate(req.body);
  if (error) {
    throw new Error(HttpCode.BAD_REQUEST, error.message);
  }
  const { id } = req.params;
  const result = await Contact.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(HttpCode.NOT_FOUND, `Contact with id=${id} not found`);
  }
  res.json(result);
};

const updateFavorite = async (req, res) => {
  const { error } = Contact.updateFavoriteSchema.validate(req.body);
  if (error) {
    throw new Error(HttpCode.BAD_REQUEST, 'The favorite field is missing');
  }
  const { id } = req.params;
  const result = await Contact.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(HttpCode.NOT_FOUND, `Contact with id=${id} not found`);
  }
};

export default {
  getAll: bodyWrapper(getAll),
  getById: bodyWrapper(getById),
  add: bodyWrapper(add),
  updateById: bodyWrapper(updateById),
  deleteById: bodyWrapper(deleteById),
  updateFavorite: bodyWrapper(updateFavorite),
};
