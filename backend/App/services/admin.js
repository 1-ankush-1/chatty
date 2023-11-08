const UserGroup = require("../models/usergroup")

exports.groupExist = async (groupId, userId) => {
    return await UserGroup.findOne({
        where: {
            groupId,
            userId
        }
    })
}