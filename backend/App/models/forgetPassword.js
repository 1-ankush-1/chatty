const sequelize = require("../config/connect");
const Sequelize = require("sequelize");

const ForgetPasswordRequest = sequelize.define("forgetpasswordrequest", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    isactive: {
        type: Sequelize.BOOLEAN
    }
})

module.exports = ForgetPasswordRequest;