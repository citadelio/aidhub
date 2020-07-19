const nodemailer = require("nodemailer");
module.exports = async (from, to, subject, body) => {
 
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.Emailuser,
      pass: process.env.Emailpassword
    }
  });
 
  const payload = {
    from,
    to,
    subject,
    // text: "Hello world?", // plain text body
    html: body // html body
  }
  console.log("in Email")
  // send mail with defined transport object
  let info = await transporter.sendMail(payload);
  console.log(info)
  if (info.Error) {
    return false;
  } else if (info.accepted.length > 0) {
    return info;
  }
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey("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");
// // sgMail.setApiKey(process.env.SENDGRID_KEY);
// module.exports = async(from,to,subject,message)=> {
//   const msg = {
//     to,
//     from,
//     subject,
//     html: message
//   };
//   const resp = await sgMail.send(msg);
//   console.log(resp)
// }


// var mailgun = require('mailgun-js')({apiKey: process.env.mailgun_API_KEY, domain: process.env.mailgun_DOMAIN});
// module.exports = async(from,to,subject,message)=> {
// const data = {
//   from: 'Excited User <me@samples.mailgun.org>',
//   to: 'foo@example.com, bar@example.com',
//   subject: 'Hello',
//   text: 'Testing some Mailgun awesomeness!'
// };

// mailgun.messages().send(data, (error, body) => {
//   console.log(body);
// });
// }
