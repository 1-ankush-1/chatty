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
    conversationType: {                                 //always use enum with captalize
        type: Sequelize.ENUM("user", "group"),
        allowNull: true,
        defaultValue: "user",
    },
    fileUrl: {                                      //always name like attachment and also mention type
        type: Sequelize.TEXT,
    }
})

module.exports = Message;


