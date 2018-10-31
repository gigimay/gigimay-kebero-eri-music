const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');//juice is used to inline our css 
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});
//y we don't use exports instade of const for generateHTML // well that's coz we don't need the generateHTML outside of this mail.js file
const generateHTML = (filename, options = {}) => {
  //impo thing when ever we renderfile we don't know were we r exactly n it's better to use `` (back ticks) to get the exact position of the file starting by __dirname "__dirname stands for current dirrectory where this file is running from" and follow all the way to the file like shown below
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
      from: `divinelight@gmail.com`,
      to: options.user.email,
      subject: options.subject,
      html,
      text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
}
