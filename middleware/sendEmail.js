

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
// sgMail.setApiKey(process.env.SENDGRID_KEY);
module.exports = async(from,to,subject,message)=> {
  const msg = {
    to,
    from,
    subject,
    html: message
  };
  await sgMail.send(msg);
}