const Sequelize = require("sequelize");
const sequelize = require("../config/connect");

const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastSeen: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
    },
    profile: {
        type: Sequelize.STRING,
        defaultValue: "https://chattymessanger.s3.amazonaws.com/default_img/default.jpg"
    },
    about: {
        type: Sequelize.TEXT,
    }
})

module.exports = User;