import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpCode } from "../constants/user-constants.js";
import bodyWrapper from "../decorators/bodyWrapper.js";
import HttpError from "../helpers/HTTPError.js";

const { JWT_SECRET_KEY } = process.env;

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const { error } = User.userSchema.validate(req.body);
  if (error) {
    throw new Error(
      HttpCode.CONFLICT,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
  }
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: "error",
      code: HttpCode.CONFLICT,
      message: `Email ${email} is already in use`,
    });
  }
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });
    res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!user || !isPasswordCorrect) {
      throw HttpError(HttpCode.UNAUTHORIZED, `Email or password is wrong`);
    }
    const payload = { id: user._id };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "23h" });
    await User.findOneAndUpdate(user._id, { token });
    res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      date: {
        token,
        user: { email: user.email, subscription: user.subscription },
      },
    });
  } catch (error) {
    throw new HttpError(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
  }
  return res.status(HttpCode.UNAUTHORIZED).json({
    status: "error",
    code: HttpCode.UNAUTHORIZED,
    message: "Invalid credentials",
  });
};

const current = (req, res) => {
  const { email, subscription } = req.user;
  res.status(HttpCode.OK).json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { id } = req.user;

  const allowedSubscriptions = ["starter", "pro", "bussiness"];
  if (!allowedSubscriptions.includes(subscription)) {
    throw new HttpError(
      HttpError.BAD_REQUEST,
      "Invalid subscription value. Allowed values are 'starter', 'pro', 'business'."
    );
  }
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true }
  );
  res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    },
  });
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findOneAndUpdate(_id, { token: "" });
    res.status(HttpCode.NO_CONTENT, "No content");
  } catch (error) {
    throw new HttpError(HttpCode.UNAUTHORIZED, "Unauthorized");
  }
};

export default {
  register: bodyWrapper(register),
  login: bodyWrapper(login),
  logout: bodyWrapper(logout),
  current: bodyWrapper(current),
  updateSubscription: bodyWrapper(updateSubscription),
};
