const jwt = require("jsonwebtoken");

exports.generateJwtToken = (id, name) => {
    return jwt.sign({ id, name }, process.env.SECRET);
}