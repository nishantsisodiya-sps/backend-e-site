const contactUs = require('../models/support')


exports.contactus = async (req , res) => {
    const {userId, sellerId, name, email, message} = req.body;
  

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