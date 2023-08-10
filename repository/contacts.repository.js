const Contacts = require('../model/contactModel');

const listContacts = async (userId, query) => {
  const {
    sortBy,
    sortByDesc,
    filter,
    favorite = null,
    limit = 5,
    offset = 0,
  } = query;
  const searchOptions = { owner: userId };
  if (favorite !== null) {
    searchOptions.favorite = favorite;
  }
  const results = await Contacts.paginate(searchOptions, {
    limit,
    offset,
    sort: {
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: 1 } : {}),
    },
    select: filter ? filter.split('|').join(' ') : '',
    populate: {
      path: 'owner',
      select: 'name email gender createdAt updatedAt',
    },
  });
  const { docs: contacts } = results;
  delete results.docs;
  return { ...results, contacts };
};

const getContactById = async (contactId, userId) => {
  const result = await Contacts.findOne({
    _id: contactId,
    owner: userId,
  }).populate({
    path: 'owner',
    select: 'name email gender createdAt updatedAt',
  });
  return result;
};

const removeContact = async (contactId, userId) => {
  const result = await Contacts.findOneAndRemove({
    _id: contactId,
    owner: userId,
  });
  return result;
};

const addContact = async (body) => {
  const result = await Contacts.create(body);
  return result;
};

const updateContact = async (contactId, body, userId) => {
  const result = await Contacts.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true }
  );
  return result;
};

export default {
  Contacts,
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
