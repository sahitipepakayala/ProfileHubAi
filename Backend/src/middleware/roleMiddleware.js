const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is restricted to: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { restrictTo };