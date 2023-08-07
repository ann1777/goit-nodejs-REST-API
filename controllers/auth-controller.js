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

const getAll = async (req, res) => {
  const { _id: user } = req.body;
  const result = await User.find({ user }, "-createdAt -updatedAt").populate(
    "user",
    "name email"
  );
  res.json(result);
  console.log(result);
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
  const avatarURL = await moveAvatarToPublic(_id, tempUpload);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

const moveAvatarToPublic = async (id, tempAvatarPath) => {
  try {
    const temp = path.join(__dirname, "../temp");
    await fs.mkdir(temp, { recursive: true });

    const avatar = await Jimp.read(tempAvatarPath);
    avatar.resize(250, 250);

    const uniqueFilename = `${id}_${avatar.filename}`;
    const avatarPath = path.join(avatarsDir, uniqueFilename);

    await avatar.writeAsync(avatarPath);

    const avatarURL = `/avatars/${uniqueFilename}`;
    await User.findByIdAndUpdate(id, { avatarURL });

    await fs.unlink(tempAvatarPath);
    return avatarURL;
  } catch (error) {
    throw new Error("Failed moveAvatarToPublic");
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  const result = await User.findById(id);
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }
  res.json(result);
};

const removeById = async (id) => {
  try {
    const removedUser = await User.findByIdAndRemove(id);

    if (!removedUser) {
      throw new Error(`User with id=${id} not found.`);
    }

    console.log(`User with id=${id} has been removed from the database.`);
    return removedUser;
  } catch (error) {
    console.error("Error removing user by id:", error.message);
    throw new Error("Failed to remove user from the database.");
  }
};

const removeAll = async () => {
  try {
    // Use the User model to delete all documents from the users collection
    await User.deleteMany({});
    console.log("All users have been removed from the database.");
  } catch (error) {
    console.error("Error removing all users:", error.message);
    throw new Error("Failed to remove all users from the database.");
  }
};

export default {
  register: bodyWrapper(register),
  login: bodyWrapper(login),
  logout: bodyWrapper(logout),
  getById: bodyWrapper(getById),
  getAll: bodyWrapper(getAll),
  current: bodyWrapper(current),
  updateSubscription: bodyWrapper(updateSubscription),
  updateAvatar: bodyWrapper(updateAvatar),
  moveAvatarToPublic: bodyWrapper(moveAvatarToPublic),
  removeById: bodyWrapper(removeById),
  removeAll: bodyWrapper(removeAll),
};
