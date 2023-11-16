const sequelize = require("../config/connect");
const Sequelize = require("sequelize");

const Contact = sequelize.define('contact', {
    userId: {
        type: Sequelize.INTEGER,
    },
    contactUserId: {
        type: Sequelize.INTEGER,
    }, 
    status: {
        type: Sequelize.ENUM,
        values: ['pending', 'accepted', 'rejected'],
        defaultValue: 'pending'
    }
});

module.exports = Contact


//user can have many contact