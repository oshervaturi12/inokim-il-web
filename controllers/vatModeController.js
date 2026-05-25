

exports.setNoVAT = (req, res) => {
  res.cookie('noVAT', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
  res.json({ success: true, noVAT: true });
};

exports.unsetNoVAT = (req, res) => {
  res.clearCookie('noVAT');
  res.json({ success: true, noVAT: false });
};


exports.checkNoVAT = (req, res, next) => {
  req.noVAT = req.cookies.noVAT === 'true';
  res.locals.noVAT = req.noVAT;
  next();
};
