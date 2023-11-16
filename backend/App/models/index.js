const User = require('./user');
const Message = require("./message");
const Group = require("./group");
const UserGroup = require('./usergroup');
const Contact = require('./contact');

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

Contact.belongsTo(User, { as: "individualuser", foreignKey: "userId" });
Contact.belongsTo(User, { as: "usercontact", foreignKey: "contactUserId" });

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

Group.hasMany(Message);
Message.belongsTo(Group);

module.exports = { User, Message, Group, Contact, UserGroup };