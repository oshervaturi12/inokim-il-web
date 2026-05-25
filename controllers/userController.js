const User = require("../models/User");
const AppError = require("../util/appError");
const catchAsync = require('./../util/catchAsync')
const factory = require('./handlerFactory')
const moment = require('moment-timezone');



const filterObj = (obj, ...allowFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(el =>{
        if(allowFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.getAllUsers = factory.getAll(User)

exports.getMe = (req, res, next) =>{
    req.params.id = req.user.id
    next(); 
}

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User)

exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)