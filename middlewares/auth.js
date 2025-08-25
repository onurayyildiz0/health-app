const jwt = require("jsonwebtoken");
const accessTokenBlacklist = require("../utils/tokenBlacklist");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (accessTokenBlacklist.includes(token)) {
      return res
        .status(401)
        .json({ error: "Geçersiz veya logout edilmiş token." });
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Erişim izni yok. Lütfen giriş yapın." });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Geçersiz veya süresi dolmuş token." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bu işlemi yapmak için yetkiniz yok." });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };
