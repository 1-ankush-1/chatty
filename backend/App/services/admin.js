const UserGroup = require("../models/usergroup")

exports.groupWithUserExist = async (groupId, userId, t) => {
    return await UserGroup.findOne({
        where: {
            groupId,
            userId
        }
    }, { transaction: t })
}