// // const User = require("../models/user");

// // async function handleUserSignUp(req, res) {
// //   const { name, email, password, phone } = req.body;

// //   await User.create({
// //     name,
// //     email,
// //     password,
// //     phone,
// //   });

// //   return res.render("login");
// // }

// // module.exports = {
// //   handleUserSignUp,
// // };
// // userController.js
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const User = require('../models/user');
// const sendResetEmail = require('../services/emailService');

// // Forgot password handler
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate a reset token and set its expiry time
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const tokenExpiry = Date.now() + 3600000; // 1 hour expiry

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = tokenExpiry;

//     await user.save();

//     const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
//     await sendResetEmail(email, resetLink);

//     res.json({ message: 'Password reset email sent' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Reset password handler
// exports.resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: 'Password has been reset successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
