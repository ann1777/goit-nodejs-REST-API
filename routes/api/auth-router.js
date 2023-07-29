import express from "express";
import validateBody from "../../decorators/validateBody.js";
import userSchemas from "../../schemas/user-schemas.js";
import authController from "../../controllers/auth-controller.js";
import checkJwt from "../../middlewares/checkJwt.js";

const authRouter = express.Router();

const userSignUpValidate = validateBody(userSchemas.userSignUpSchema);
const userSignInValidate = validateBody(userSchemas.userSignInSchema);

authRouter.post("register", userSignUpValidate, authController.register);
authRouter.post("/login", userSignInValidate, authController.login);
authRouter.get("/logout", checkJwt, authController.logout);

export default authRouter;
