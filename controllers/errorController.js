const AppError = require('./../util/appError')

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };
  

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = err => new AppError('Invalid token. please log in', 401)
const handleJWTexpiredError = err => new AppError('your token has expired', 401)


const sendErrorDev = (err, req, res)=>{
    // API
    if(req.originalUrl.startsWith('/api')){
        
      return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // B) RENDER WEBSITE
      if(err.statusCode === 401){
        return res.status(401).render('login.ejs', {
          title:'התחבר',
          data: err,
          active : "/"
          
      })
      }
      console.error('ERROR 💥', err);
      return res.status(err.statusCode).render('error.ejs', {
      title:'error',
      data: err,
      active : "/"
      
  })
         
}


const sendErrorProd = (err, req, res) => {
  // A) API Route
  if (req.originalUrl.startsWith('/api')) {
    // A1) Operational, trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // A2) Programming or unknown error
    console.error('API ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // B) Rendered Website

  // B1) If 401, redirect to login with error data
  if (err.statusCode === 401) {
    return res.status(401).render('login.ejs', {
      title: 'התחבר',
      data: err,
      active: "/"
    });
  }

  // B2) Operational error
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'משהו השתבש!',
      msg: err.message,
      active: "/"
    });
  }

  // B3) Programming or unknown error
  console.error('RENDER ERROR 💥', err);
  return res.status(err.statusCode || 500).render('error', {
    title: 'שגיאה לא צפויה',
    msg: 'אנא נסה שוב מאוחר יותר.',
    active: "/"
  });
};

// new
module.exports = (err, req, res, next) => {
    // console.log(err.stack);
  
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err };
      error.message = err.message;
  
      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldDB(error);
      if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTexpiredError();
  
      sendErrorProd(error, req, res);
    }
  };

