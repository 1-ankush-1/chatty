const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const Message = sequelize.define("message", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    text: {
        type: Sequelize.STRING,
    },
    conversationType: {
        type: Sequelize.ENUM("user", "group"),
        allowNull: true,
        defaultValue: "user",
    },
    fileUrl: {
        type: Sequelize.TEXT,
    }
})

module.exports = Message;