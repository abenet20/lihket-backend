const jwt = require("jsonwebtoken");
const jwt_secret = "0949102287";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }

  jwt.verify(token, jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;

    next();
  });
};

module.exports = verifyToken;
