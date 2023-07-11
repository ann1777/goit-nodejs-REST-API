const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "./contacts.json");

const listContacts = async () => {
  const result = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(result);
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.filter((contact) => contact.id === contactId);
  return result[0];
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.filter((contact) => contact.id === contactId);
  await fs.writeFile(contactsPath, JSON.stringify(result, null, 2));
  return result;
};

const addContact = async (body) => {
  const contacts = await listContacts();
  contacts.push(body);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return body;
};

const updateContact = async (contactId, body) => {
  const outdatedContact = await getContactById(contactId);
  const updatedContact = {
    id: outdatedContact.id,
    name: body.name ? body.name : outdatedContact.name,
    email: body.email ? body.email : outdatedContact.email,
    phone: body.phone ? body.phone : outdatedContact.phone,
  };
  await removeContact(contactId);
  await addContact(updatedContact);
  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
