const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const ArchivedChat = sequelize.define("archivedChat", {
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

module.exports = ArchivedChat;