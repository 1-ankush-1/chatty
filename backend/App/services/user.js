const { User } = require("../models")

exports.updateLastSeen = async (id) => {
    return User.update({ lastSeen: new Date() }, {
        where: {
            id
        }
    })
}