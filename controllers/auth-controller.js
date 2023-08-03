import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path, { dirname } from "path";
import fs from "fs/promises";
import gravatar from "gravatar";
import Jimp from "jimp";
import { fileURLToPath } from "url";
import { HttpCode } from "../constants/user-constants.js";
import bodyWrapper from "../decorators/bodyWrapper.js";
import HttpError from "../helpers/HTTPError.js";
const { JWT_SECRET_KEY } = process.env;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const { error } = User.userSchema.validate(req.body);
  if (error) {
    throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
  }
  if (user) {
    throw new Error(HttpCode.CONFLICT, `Email ${email} is already in use`);
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
  res.status(HttpCode.CREATED).json({
    status: "success",
    code: HttpCode.CREATED,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription,
    },
    password: hashPassword,
    avatarURL,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  const payload = { id: user._id };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "23h" });
  const result = await User.findOneAndUpdate(payload, { token });
  res.json({
    status: "success",
    code: HttpCode.OK,
    date: {
      token,
      user: { email: user.email, subscription: user.subscription },
    },
  });
  if (!result) {
    throw new HttpError(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
  }
};

const current = (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    status: "success",
    code: HttpCode.OK,
    date: {
      email,
      subscription,
    },
  });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findOneAndUpdate(_id, { token: "" });
  res.status(HttpCode.NO_CONTENT).json({ message: "SignOut success" });
};

const updateSubscription = async (res, req) => {
  const { error } = User.updateSubscriptionSchema.validate(req.body);
  if (error) {
    throw new Error(
      HttpCode.BAD_REQUEST,
      "Missing subscription field or set incorrectly"
    );
  }
  const { _id, email } = req.user;
  const { subscription } = req.body;
  const result = await User.findOneAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  if (!result) {
    throw Error(HttpCode.NOT_FOUND, `Contact with id=${_id} not found`);
  }
  res.json({ email, subscription });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const uploadPath = path.join(avatarsDir, filename);

  await Jimp.read(tempUpload).then((avatar) => {
    return avatar.resize(250, 250).write(tempUpload);
  });
  await fs.rename(tempUpload, uploadPath);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

export default {
  register: bodyWrapper(register),
  login: bodyWrapper(login),
  logout: bodyWrapper(logout),
  current: bodyWrapper(current),
  updateSubscription: bodyWrapper(updateSubscription),
  updateAvatar: bodyWrapper(updateAvatar),
};
