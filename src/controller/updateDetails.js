const User = require('../models/user')
const Seller = require('../models/seller')
const bcrypt = require('bcryptjs');
const { sendEmail, getUserEmailById, getSellerEmailById } = require('../services/emailSender');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')



// Encryption function
function encryptEmail(email) {
  const algorithm = 'aes-256-cbc';
  const secretKey = crypto.randomBytes(32); ; // Replace with your own secret key
  const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)
  
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encryptedEmail = cipher.update(email, 'utf8', 'hex');
  encryptedEmail += cipher.final('hex');
  
  const encryptedData = {
    iv: iv.toString('hex'),
    email: encryptedEmail
  };




  
  return Buffer.from(JSON.stringify(encryptedData)).toString('base64');
}

exports.updateProfile = async (req, res) => {
    try {
        console.log(req.params);
      const { userId, sellerId } = req.params;
  
      if (userId) {
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }
        await user.save();
        return res.status(201).json({ msg: "User details updated successfully" });
      }
  
      if (sellerId) {
        const seller = await Seller.findByIdAndUpdate(sellerId, req.body, { new: true });
        if (!seller) {
          return res.status(404).json({ msg: "Seller not found" });
        }
        await seller.save();
        return res.status(201).json({ msg: "Seller details updated successfully" });
      }
  
      return res.status(400).json({ msg: "Please provide either userId or sellerId" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  




  exports.changePassword = async (req, res) => {
    try {
      const { userId, sellerId } = req.params;
      const { CurrentPassword, NewPassword } = req.body;
  
      if (userId && userId !== 'seller') {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }
  
        // Check if the current password matches
        const isMatch = await bcrypt.compare(CurrentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: "Incorrect current password" });
        }
  
        // Update the password without hashing it again
        user.password = NewPassword;
        await user.save();
  
        return res.status(200).json({ msg: "Password changed successfully" });
      }
  
      if (sellerId && userId == 'seller') {
        const seller = await Seller.findById(sellerId);
        if (!seller) {
          return res.status(404).json({ msg: "Seller not found" });
        }
  
        // Check if the current password matches
        const isMatch = await bcrypt.compare(CurrentPassword, seller.password);
        if (!isMatch) {
          return res.status(400).json({ msg: "Incorrect current password" });
        }
  
        // Update the password without hashing it again
        seller.password = NewPassword;
        await seller.save();
  
        return res.status(200).json({ msg: "Password changed successfully" });
      }
  
      return res.status(400).json({ msg: "Please provide either userId or sellerId" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  
  



exports.sendPasswordResetEmail = async (req, res) => {
  try {
    console.log(req);
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    const seller = await Seller.findOne({ email });

    if (!user && !seller) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userEmail = user ? user.email : seller.email;
    const userName = user ? user.name : seller.name;

    // Generate a unique password reset token (JWT)
    const resetToken = jwt.sign(
      { email: userEmail, name: userName },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    // Save the reset token and its expiration time to the user or seller document
    if (user) {
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 1800000; // Token is valid for 30 minutes
      await user.save();
    } else {
      seller.resetToken = resetToken;
      seller.resetTokenExpiry = Date.now() + 1800000; // Token is valid for 30 minutes
      await seller.save();
    }

    // Compose the password reset email
    const resetLink = `https://fullstck-ecommerce-mhfs.vercel.app/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Hello ${userName},\n\nYou have requested a password reset for ${email}. Click on the following link to reset your password: ${resetLink}\n\nPlease note that the link is valid for 30 minutes only.\n\nIf you did not request this password reset, please ignore this email.\n\nBest regards,\nThe E-commerce Team`;

    // Send the email
    await sendEmail(userEmail, subject, text);

    return res.status(200).json({ msg: "Password reset email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


  




exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    // Check if the passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }
    
    // Find the user or seller based on the reset token and its expiration time
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    const seller = await Seller.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

    if (!user && !seller) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    const account = user || seller;

    // Update the password and clear the reset token fields
    account.password = newPassword;
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;
    await account.save();
    
    return res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};





