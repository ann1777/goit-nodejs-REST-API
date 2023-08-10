import nodemailer from 'nodemailer';
import 'dotenv/config';

const { UKR_NET_EMAIL, UKR_NET_PASSWD } = process.env;

const nodemailerConfig = {
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const email = {
  from: UKR_NET_EMAIL,
  to: 'gehogi2193@vreaa.com',
  subject: 'Test email',
  html: '<strong>Test email</strong>',
};

transport
  .sendMail(email)
  .then(console.log('Success send email'))
  .catch((error) => console.log(error.message));
