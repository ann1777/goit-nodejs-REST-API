import {
  listContacts,
  getContactById,
  removeContactById,
  addContact,
  updateContact,
} from "../models/contacts.js";

import HttpError from "../helpers/HTTPError.js";

export const getAllContacts = async (req, res) => {
  const result = await listContacts();
  return res.json(result);
};

export const getById = async (req, res) => {
  const { id } = req.params;
  const result = await getContactById(id);
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }
  res.json(result);
};

export const deleteById = async (req, res) => {
  const { id } = req.params;
  const result = await removeContactById(id);
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    message: "Delete success",
  });
};

export const add = async (req, res) => {
  const result = await addContact(req.body);
  res.status(201).json(result);
};

export const updateById = async (req, res) => {
  const { id } = req.params;
  const result = await updateContact(id, req.body);
  if (!result) {
    throw HttpError(404, `Movie with id=${id} not found`);
  }
  res.json(result);
};
