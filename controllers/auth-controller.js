import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import bodyWrapper from "../decorators/bodyWrapper.js";
import HttpError from "../helpers/HTTPError.js";

const { JWT_SECRET_KEY } = process.env;

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const { error } = User.userSchema.validate(req.body);
    if (error) {
      throw new Error(409, `Помилка від Joi або іншої бібліотеки валідації`);
    }
    if (user) {
      throw new HttpError(
        409,
        `User with this email ${email} is already exist`
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    throw new HttpError(400, error.message);
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!user || !isPasswordCorrect) {
      throw HttpError(401, `Помилка від Joi або іншої бібліотеки валідації`);
    }
    const payload = { id: user._id };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "23h" });
    await User.findOneAndUpdate(email, { token });
    res
      .status(200)
      .json({ token }, { email: user.email, subscription: user.subscription });
  } catch (error) {
    throw new HttpError(400, error.message);
  }
};

const logout = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findOneAndUpdate(_id, { token: "" });
    res.status(204).json({ message: "SignOut success" });
  } catch (error) {
    throw new HttpError(400, error.message);
  }
};

export default {
  register: bodyWrapper(register),
  login: bodyWrapper(login),
  logout: bodyWrapper(logout),
};
