import express from 'express';
import validateBody from '../../decorators/validateBody.js';
import userSchemas from '../../schemas/user-schemas.js';
import authController from '../../controllers/auth-controller.js';
import { checkJwt, upload } from '../../middlewares/index.js';

const authRouter = express.Router();

const userSignUpValidate = validateBody(userSchemas.userSignUpSchema);
const userSignInValidate = validateBody(userSchemas.userSignInSchema);
const userEmailValidate = validateBody(userSchemas.userEmailSchema);

authRouter.post(
  '/register',
  userSignUpValidate,
  authController.registrationController
);
authRouter.get('/verify/:verificationCode', authController.verifyUserEmail);
authRouter.post('/verify', userEmailValidate, authController.resendVerifyEmail);
authRouter.post('/login', userSignInValidate, authController.loginController);
authRouter.post('/logout', checkJwt, authController.logoutController);
authRouter.patch('/', checkJwt, authController.updateController);
authRouter.get('/current', checkJwt, authController.currentController);
authRouter.patch(
  '/avatars',
  checkJwt,
  upload.single('avatar'),
  authController.uploadAvatarController
);
authRouter.delete('/:id', checkJwt, authController.removeByIdController);
authRouter.delete('/', checkJwt, authController.removeAllController);

export default authRouter;
