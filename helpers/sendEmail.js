import nodemailer from 'nodemailer';
import 'dotenv/config';

const { UKR_NET_EMAIL, UKR_NET_PASSWD, PORT, SECURE } = process.env;

const nodemailerConfig = {
  host: 'smtp.ukr.net',
  port: PORT,
  secure: SECURE,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWD,
  },
  logger: false,
  debug: false,
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: UKR_NET_EMAIL };
  return transport.sendMail(email);
};

export default sendEmail;
