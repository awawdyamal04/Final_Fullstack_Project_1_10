export function detectGuest(req, _res, next) {
  // אם יש כותרת X-Guest או טוקן אורח
  const isGuest = req.header("X-Guest") === "true";
  req.user = req.user || {};
  req.user.isGuest = !!isGuest;
  next();
}
