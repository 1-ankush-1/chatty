const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const ArchivedChat = sequelize.define("archivedChat", {                 //should use extra column instead of new table
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



//if more columns are there prefer to use new table

//name should be always common ex-model name is request and controller is friendRequest
//for file name use hyfen instead of camel case