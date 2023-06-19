const nodemailer = require('nodemailer');
const seller = require('../models/seller')
const user = require('../models/user')


// Create a transporter with your email service provider's configuration
const transporter = nodemailer.createTransport({
  service: 'The Nishnat Sisodiya',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'nishantsisodiya.softprodigy@gmail.com',
    pass: 'infsrohetndziepf',
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    // Define the email options
    const mailOptions = {
      from: 'nishantsisodiya.softprodigy@gmail.com',
      to,
      subject,
      text,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



async function getSellerEmailById(sellerId) {
  try {
    const Seller = await seller.findById(sellerId);
    return Seller.email; // Assuming the seller model has an 'email' field
  } catch (error) {
    console.error('Error fetching seller email:', error);
    throw error;
  }
}


async function getUserEmailById(userId) {
  try {
    const User = await user.findById(userId);
    return User.email;
  } catch (error) {
    console.error('Error fetching seller email:', error);
    throw error;
  }
}

module.exports = { transporter, sendEmail, getSellerEmailById , getUserEmailById };