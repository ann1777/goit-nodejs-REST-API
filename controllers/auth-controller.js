import User from "../models/user.js";

import bodyWrapper from "../decorators/bodyWrapper.js";
import HttpError from "../helpers/HTTPError.js";

const signUp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).validate(req.body);
    const { error } = User.userSchema.validate(req.body);
    if (error) {
      throw new Error(400, error.message);
    }
    if (user) {
      throw new HttpError(409, `Email ${email} is already in use`);
    }
    const newUser = await User.create(req.body);

    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {}
};
const signIn = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {}
};

export default {
  signup: bodyWrapper(signUp),
  signIn: bodyWrapper(signIn),
};
