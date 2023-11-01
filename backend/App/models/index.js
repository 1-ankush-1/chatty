const User = require('./user');
const Message = require("./message");

User.hasMany(Message);
Message.belongsTo(User);

module.exports = { User, Message };