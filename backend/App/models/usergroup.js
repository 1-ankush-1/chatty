const sequelize = require("../config/connect");
const Sequelize = require("sequelize");

const UserGroup = sequelize.define('usergroup', {
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = UserGroup

