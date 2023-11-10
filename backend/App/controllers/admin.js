const sequelize = require("../config/connect");
const { Group } = require("../models");
const UserGroup = require("../models/usergroup");
const { groupWithUserExist } = require("../services/admin");

exports.creatingAdminOfGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupId, userId } = req.body;
        if (groupId === null || userId === null) {
            return res.status(404).json({ message: "empty Credentials" });
        }
        const group = await groupWithUserExist(groupId, userId, t);

        if (!group) {
            return res.status(404).json({ message: "no user exist" });
        }
        group.isAdmin = true;
        await group.save({ transaction: t });
        t.commit();
        res.status(200).json({
            message: "admin created successfully"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in removeMemberFromGroup`)
        return res.status(500).json({ message: "failed to remove memeber from group" });
    }
};

exports.removeMemberFromGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { groupId } = req.query;

        if (groupId === null || id === null) {
            return res.status(404).json({ message: "empty Credentials" });
        }

        const group = await groupWithUserExist(groupId, id, t);

        if (!group) {
            return res.status(404).json({ message: "no user exist" });
        }
        await group.destroy({ transaction: t });
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
        const groupExist = await Group.findByPk(groupId, { transaction: t });
        if (!groupExist) {
            return res.status(404).json({ message: "no Group exist" });
        }
        const group = { groupId, userId }
        await UserGroup.create(group, { transaction: t });
        t.commit();
        res.status(200).json({ message: "added successfully" });
    } catch (err) {
        await t.rollback();
        console.log(`${err} in addUserInGroup`)
        return res.status(500).json({ message: "failed to add in group" });
    }
}