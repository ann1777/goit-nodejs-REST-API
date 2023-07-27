import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import bodyWrapper from "../decorators/bodyWrapper.js";
import HttpError from "../helpers/HTTPError.js";

const { JWT_SECRET_KEY } = process.env;

const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).validate(req.body);
    const { error } = User.userSchema.validate(req.body);
    if (error) {
      throw new Error(400, error.message);
    }
    if (user) {
      throw new HttpError(409, `Email ${email} is already in use`);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {}
};
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!user || !isPasswordCorrect) {
      throw HttpError(401, "Email or password is invalid");
    }
    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "23h" });

    res.json({
      token,
    });
  } catch (error) {}
};

export default {
  signup: bodyWrapper(signUp),
  signIn: bodyWrapper(signIn),
};
