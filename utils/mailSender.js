// const nodemailer = require("nodemailer");
// require('dotenv').config()
// const mailSender = async (email, title, body) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host:process.env.MAIL_HOST,
//             port: 587,
//             secure: false,
//             auth:{
//                 user: process.env.MAIL_USER,
//                 pass: process.env.MAIL_PASS,
//             }
//         })

//         let info = await transporter.sendMail({
//             from: `"StudyNotion || CodeHelp" <${process.env.MAIL_USER}>`,
//             to: `${email}`,
//             subject: `${title}`,
//             html: `${body}`,
//         })
//         console.log(info);
//         return info;
//     } 
//     catch (error) {
//         console.log(error.message);
//     }
// }

// module.exports= mailSender;

const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // simpler and better for Gmail
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"StudyNotion || CodeHelp" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent : ", info.response);
    return info;
  } catch (error) {
    console.error(" Error sending email: ", error.message);
    throw error;
  }
};
module.exports= mailSender;

