const nodemailer = require('nodemailer');

// Create transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your email service provider like "SendGrid", "Mailgun", etc.
  auth: {
    user: process.env.EMAIL,       // Your email address
    pass: process.env.EMAIL_PASSWORD,  // The app password if using Gmail
  },
});

// Function to send password reset email
const sendResetEmail = async (recipientEmail, resetLink) => {
  try {
    // Email options
    const mailOptions = {
      from: '"Your App Name" <your-email@gmail.com>', // Sender address
      to: recipientEmail,                            // Receiver email
      subject: 'Password Reset Request',             // Subject line
      text: `You are receiving this because you (or someone else) requested the reset of your password.
      Please click on the following link, or paste this into your browser to complete the process:
      ${resetLink}`,
      html: `<p>You requested a password reset.</p>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendResetEmail;
