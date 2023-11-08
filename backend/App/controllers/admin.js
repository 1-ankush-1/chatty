const sequelize = require("../config/connect");
const { Group, User } = require("../models");
const UserGroup = require("../models/usergroup");

exports.creatingAdminOfGroup = async (req, res, next) => { };

exports.removeMemberFromGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { groupId } = req.query;
        const groupExist = await UserGroup.findOne({
            where: {
                userId: id,
                groupId: groupId
            }
        })
        if (!groupExist) {
            throw new Error("group not exist")
        }
        await groupExist.destroy();
        t.commit();
        res.status(200).json({
            message: "group deleted successfully"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in removeMemberFromGroup`)
        return res.status(500).json({ message: "failed to remove memeber from group" });
    }
}

exports.addUserInGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupId } = req.query;
        const userId = req.userId;
        if (groupId === null || userId === null) {
            return res.status(404).json({ message: "empty Credentials" });
        }
        const findGroup = await Group.findByPk(groupId);
        if (!findGroup) {
            return res.status(404).json({ message: "no Group exist" });
        }
        const group = { groupId, userId }
        await UserGroup.create(group);
        res.status(200).json({ message: "added successfully" });
    } catch (err) {
        await t.rollback();
        console.log(`${err} in addUserInGroup`)
        return res.status(500).json({ message: "failed to add in group" });
    }
}