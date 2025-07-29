const jwt = require("jsonwebtoken");
const jwt_secret = "0949102287";

const generateToken = (userId) => {
    return jwt.sign({id: userId}, jwt_secret, {expiresIn: '1h'});
}

module.exports = generateToken;