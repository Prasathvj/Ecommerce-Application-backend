const nodemailer = require('nodemailer')

const sendEmail = async options => {

     // Send the password reset link to the user's email
     const transporter = nodemailer.createTransport({
        // Configure your email provider here
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
      });
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: 'VJ-MART Password Reset',
        text: options.message
      };
     await transporter.sendMail(mailOptions);
}

module.exports = sendEmail
     