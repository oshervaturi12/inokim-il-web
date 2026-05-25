const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please tell us your name']
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'please provide your email']
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'password is required!'],
        minlength: 8,
        select: false
    },
    googleId: { 
        type: String,
        unique: true,
        sparse: true
    },
    googleAccessToken: {
        type: String
    },
    googleRefreshToken: {
        type: String
    },

    role:{
        type:String,
        enum: ['customer', 'admin', 'dealer', 'superAdmin', 'salesManager'],
         default: 'customer'
    },
    warranties: [{
        model: String,
        warranty: String
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }],

    passwordChangedAt:Date,

    recentlyViewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
})





userSchema.pre('save' ,async function(next){

    //Only run this function if the password is modified
    if(!this.isModified('password')) return next()

    // hash the password
    this.password = await bcrypt.hash(this.password, 12)
    
    next()
})




  userSchema.pre('save', function(next) {
    if (this.recentlyViewedProducts.length > 10) {
        this.recentlyViewedProducts = this.recentlyViewedProducts.slice(-10);
    }
    next();
});



userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTtimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTtimestamp < changedTimestamp
    }

    return false 
}

const User = mongoose.model('User', userSchema)

module.exports = User