import express from "express";
import validateBody from "../../decorators/validateBody.js";
import userSchemas from "../../schemas/user-schemas.js";
import authController from "../../controllers/auth-controller.js";

const authRouter = express.Router();

const userSignUpValidate = validateBody(userSchemas.userSignUpSchema);

const userSignInValidate = validateBody(userSchemas.userSignInSchema);

authRouter.post("signup", userSignUpValidate, authController.signup);
authRouter.post("signIn", userSignInValidate, authController.signIn);

export default authRouter;
