const User = require('./user');
const Message = require("./message");
const Group = require("./group");
const UserGroup = require('./usergroup');

User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

Group.hasMany(Message);
Message.belongsTo(Group);

module.exports = { User, Message, Group };