const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const Attachment = sequelize.define("attachment", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: Sequelize.TEXT,
    }
})

module.exports = Attachment;