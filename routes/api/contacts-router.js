import express from 'express';

import contactSchema from '../../schemas/contacts-schemas.js';

import contactsController from '../../controllers/contacts-controller.js';

import {
  isValidId,
  isEmptyBody,
  checkJwt,
  upload,
} from '../../middlewares/index.js';

import validateBody from '../../decorators/validateBody.js';

const contactAddValidate = validateBody(contactSchema.contactAddSchema);

const contactUpdateFavorite = validateBody(contactSchema.contactUpdateFavorite);

const contactsRouter = express.Router();

contactsRouter.use(checkJwt);

contactsRouter.get('/', contactsController.getAll);

contactsRouter.get('/:id', isValidId, contactsController.getById);

contactsRouter.post(
  '/register',
  upload.single('avatar'),
  isValidId,
  isEmptyBody,
  contactAddValidate,
  contactsController.add,
  (req, res) => {
    const { error } = contactSchema.contactAddSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  }
);

contactsRouter.put(
  '/:id',
  isValidId,
  isEmptyBody,
  contactAddValidate,
  contactsController.updateById
);

contactsRouter.patch(
  '/:id/favorite',
  isValidId,
  isEmptyBody,
  contactUpdateFavorite,
  contactsController.updateFavorite
);

contactsRouter.delete('/:id', isValidId, contactsController.deleteById);

export default contactsRouter;
