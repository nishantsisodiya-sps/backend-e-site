const support = require('../models/support')


exports.contactus = async (req , res)=>{
    const {userId , sellerId , name , email , message} = req.body;
    console.log(name);
    try {
        if(userId){
             contactForm = new support ({
                userId,
                name ,
                email ,
                message
            });
            
        }
        else if (sellerId){
             contactForm = new support ({
                sellerId,
                name ,
                email ,
                message
            });
        }
        else{
            throw new Error('userId or sellerId is required');
        }
        
        await contactForm.save()
        res.status(201).json("message sent successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}