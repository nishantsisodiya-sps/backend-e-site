const mongoose = require('mongoose');
const validator = require('validator')
const { isAlpha } = require('validator');

const superAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isAlpha(value),
      message: 'Name should only contain letters'
    }
  },


  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email address'
    }
  },


  password: {
    type: String,
    required: true,
    minlength: 6
  },

  isAdmin: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    default: 'superAdmin'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },


  tokens: [{
    token: { type: String, required: true }
  }]

});


superAdmin.pre('save' , async function(next){
  try {
    if(this.isModified('password')){
      const hashedPassword = await bcrypt.hash(this.password , 10)
      this.password = hashedPassword
    }
    next()
  } catch (error) {
    next(error)
  }
});


sellerSchema.methods.generateAuthToken = async function (){
  try {
    const token = jwt.sign({id : this.id , role : this.role , email : this.email , name: this.name} , process.env.JWT_SECRET , {
      expiresIn : '1d'
    });
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
  } catch (error) {
    console.log('superAdmin error' , error);
  }
}


module.exports = mongoose.model('SuperAdmin', superAdminSchema);
