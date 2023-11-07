const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const Group = sequelize.define("group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    desc: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

module.exports = Group;