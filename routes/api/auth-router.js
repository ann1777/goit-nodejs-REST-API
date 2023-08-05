import express from "express";
import validateBody from "../../decorators/validateBody.js";
import userSchemas from "../../schemas/user-schemas.js";
import authController from "../../controllers/auth-controller.js";
import { checkJwt, upload } from "../../middlewares/index.js";

const authRouter = express.Router();

const userSignUpValidate = validateBody(userSchemas.userSignUpSchema);
const userSignInValidate = validateBody(userSchemas.userSignInSchema);

authRouter.post("/register", userSignUpValidate, authController.register);
authRouter.post("/login", userSignInValidate, authController.login);
authRouter.post("/logout", checkJwt, authController.logout);
authRouter.get("/", checkJwt, authController.getAll);
authRouter.get("/current", checkJwt, authController.current);
authRouter.patch("/", checkJwt, authController.updateSubscription);
authRouter.patch(
  "/avatars",
  checkJwt,
  upload.single("avatar"),
  authController.updateAvatar
);
authRouter.delete("/:id", checkJwt, authController.removeById);
authRouter.delete("/", checkJwt, authController.removeAll);

export default authRouter;
