const contactUs = require('../models/support')
const { transporter, sendEmail, getSellerEmailById } = require('../services/emailSender');

exports.contactus = async (req, res) => {
    const { userId, sellerId, name, email, message } = req.body;

    try {
        if (userId) {
            const contactForm = new contactUs({
                userId,
                name,
                email,
                message
            });
            await contactForm.save();
        } else if (sellerId) {
            const contactForm = new contactUs({
                sellerId,
                name,
                email,
                message
            });
            await contactForm.save();
        } else {
            throw new Error('userId or sellerId is required');
        }

        res.status(201).json("message sent successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.subscribe = async (req, res) => {

    try {
        const email = req.body.email
        const emailSubject = 'Thanks for subscribing to Apna Market'

        const emailText = `Hello , 

            
            Thank you for subscribing to Apna Market.
            You will get email notifications for product listings, product reviews and product discounts.
            
            
            Regards,
            Nishant Sisodiya (Founder , Apna Market)`;

        await sendEmail(email, emailSubject, emailText);
        res.status(201).json({message : 'Email sent to the subscriber'})

    } catch (error) {

        console.error('Error getting seller email:', error);
        res.status(500).json(error)
    }
}