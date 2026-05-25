

module.exports = (app) => {
  // Protect against known bots
  app.use((req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (/bot|crawl|spider|scanner|curl|wget/i.test(ua)) {
      console.warn(`[BOT BLOCKED] UA: ${ua}, IP: ${req.ip}`);
      return res.status(403).send('Access Denied');
    }
    next();
  });

  // Block blacklisted paths
  const blacklistedPaths = ['/_t/', '/.env', '/wp-admin', '/phpmyadmin'];
  app.use((req, res, next) => {
    if (blacklistedPaths.some(path => req.path.startsWith(path))) {
      console.warn(`[BLOCKED PATH] ${req.path} from ${req.ip}`);
      return res.status(403).send('Forbidden');
    }
    next();
  });


};
