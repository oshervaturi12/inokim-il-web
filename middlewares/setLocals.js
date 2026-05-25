module.exports = (req, res, next) => {
    res.locals.isAdmin = req.originalUrl.startsWith('/admin'); 
    next();
};