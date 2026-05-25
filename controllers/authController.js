const {promisify} = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/User')
const catchAsync = require('./../util/catchAsync')
const AppErorr = require('./../util/appError')


const PRIVILEGED_EMAILS = {
    superAdmin: ['osher@12.com'],                   
    admin:      ['osher@12.com'],
    salesManager:  ['osher@12.com'],
}

const PRIVILEGED_ROLES = ['admin', 'superAdmin', 'salesManager']


const isEmailAllowedForRole = (email, role) => {
    if (!PRIVILEGED_ROLES.includes(role)) return true // customer/dealer = public
    const allowed = PRIVILEGED_EMAILS[role] || []
    return allowed.includes(email.toLowerCase())
}

const signTokem = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) =>{
    const token = signTokem(user._id)
    const cookieOptions = {
        expires:  new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
        httponly: true
    }
   
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions )

    // remove the password from output
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}





// exports.signup = catchAsync(async (req, res, next) =>{
//     const newUser = await User.create({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         role: req.body.role,
//         admins: req.body.admins,
//         id: req.body.id,
//         phone: req.body.phone,
//         signatureImage: req.body.signatureImage
//     })
//     createSendToken(newUser, 201, res)
// })

exports.signup = catchAsync(async (req, res, next) => {
    const email = (req.body.email || '').toLowerCase()
    const requestedRole = req.body.role || 'customer'

    // Public signup can ONLY create non-privileged roles
    if (PRIVILEGED_ROLES.includes(requestedRole)) {
        return next(new AppErorr('Cannot create privileged role via public signup', 403))
    }

    const newUser = await User.create({
        name: req.body.name,
        email,
        password: req.body.password,
        role: requestedRole === 'dealer' ? 'dealer' : 'customer', // hard whitelist
        phone: req.body.phone
    })

    createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async(req,res,next) =>{
    const { email, password } = req.body
    // 1) check if email and password exsist
    if(!email || !password){
       return next(new AppErorr('please provide email and password', 400))
    }
    // 2)check if user exsist and password is correct
    const user = await User.findOne({email}).select('+password')

    if(!user || !await user.correctPassword(password, user.password)){
        return next(new AppErorr('incorrect email or password', 401))
    }

    createSendToken(user, 201, res)
})




exports.protect = catchAsync(async(req, res, next) =>{
    let token;
    
    // // 1) getting the token and check if its there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if(!token || token === 'logedout'){
         return next(new AppErorr('אתה לא מחובר אנא התחבר!', 401))
        //  return res.redirect('/')
    }

    // // 2)verification token
  
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded)
    
    

    // //  3) check if user still exist
    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next(new AppErorr('the user does not exsist', 401))
       
    }
    // // 4)check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppErorr('User changed password! please log in again!', 401)) 
    } 

    // GRANT Access To Protected Route
    req.user = freshUser
    return next()
})


// Only for render pages, No Errors
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;

            // 4) Fetch notification count for the logged-in user
            const notificationsCount = await Notification.countDocuments({
                user: currentUser._id,
                isRead: false
            });

            // Attach the notifications count to res.locals for access in views
             res.locals.notificationsCount = notificationsCount;
            // res.locals.notificationsCount = 0;

            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};


exports.logout = (req, res) =>{
    res.cookie('jwt', 'logedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: 'success'})
}


exports.restricTo = (...roles) =>{
    return (req, res, next) =>{
        if (req.user.role === 'superAdmin') {
            return next();
          }
        // roles ['admin', 'user']
        if(!roles.includes(req.user.role)){
            return next(new AppErorr('you do not have premission ', 403))
        }
        next();
    }
}





exports.updatePassword = catchAsync(async (req, res, next) =>{
    // 1) Get user from collection
    const user = await User.findById(req.params.userId).select('+password')
    // 2)check if posted current password is correct
    // if(!(await user.correctPassword(req.body.passwordCurrent, user.password ))){
    //     return next(new AppErorr('your current password is wrong', 401))
    // }
    // 3)if so update password
    const newPassword = req.body.password
    user.password = newPassword
    await user.save()
    const dataToEmail = {
        name: user.name,
        email: user.email,
        password: newPassword,
        phone: user.phone,
        id: user.id
    }
    return res.status(201).json({
        status: "success",
         dataToEmail 
    })
    // 4) log user in
  })

exports.checkPermission = (action) =>{
    return async(req, res, next) =>{
         const role = req.user.role;
        const permissions = {
            user: ['read'],
            admin: ['create','read', 'update', 'delete'],
          };
          if (!permissions[role].includes(action)) {
            return next(new AppErorr('you do not have premission ', 403))
          } 
          next();
      
    }
}


exports.rolesConfig = {
    owner: ['/', 'inquiry/company'],
    admin: ['*'],
    superAdmin: ['*'],
    tech: ['/', 'technician/history'],
  };



  exports.createPrivilegedUser = catchAsync(async (req, res, next) => {
    const email = (req.body.email || '').toLowerCase()
    const role = req.body.role

    if (!PRIVILEGED_ROLES.includes(role)) {
        return next(new AppErorr('Use /signup for non-privileged roles', 400))
    }

    if (!isEmailAllowedForRole(email, role)) {
        return next(new AppErorr(`Email ${email} is not authorized for role ${role}`, 403))
    }

    const newUser = await User.create({
        name: req.body.name,
        email,
        password: req.body.password,
        role,
        phone: req.body.phone
    })

    // Don't auto-login as the new user — the superAdmin is the one calling this
    newUser.password = undefined
    res.status(201).json({ status: 'success', data: { user: newUser } })
})