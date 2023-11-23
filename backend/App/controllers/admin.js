const sequelize = require("../config/connect");
const { Op } = require("sequelize");
const { Group, Contact, User } = require("../models");
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
        console.log(group);
        await t.commit();
        res.status(200).json({
            message: "admin created successfully"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in removeMemberFromGroup`)
        return res.status(500).json({ message: "failed to remove memeber from group" });
    }
};

exports.removeAdminOfGroup = async (req, res, next) => {
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
        group.isAdmin = false;
        await group.save({ transaction: t });
        await t.commit();
        res.status(200).json({
            message: "admin removed successfully"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in removeAdminOfGroup`)
        return res.status(500).json({ message: "failed to remove admin of group" });
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
        await t.commit();
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
        const userId = req.query.userId ?? req.userId;
        if (groupId === null || userId === null) {
            return res.status(404).json({ message: "empty Credentials" });
        }
        const groupExist = await Group.findByPk(groupId, { transaction: t });
        if (!groupExist) {
            return res.status(404).json({ message: "no Group exist" });
        }
        const group = { groupId, userId }
        await UserGroup.create(group, { transaction: t });
        await t.commit();
        res.status(200).json({ message: "added successfully" });
    } catch (err) {
        await t.rollback();
        console.log(`${err} in addUserInGroup`)
        return res.status(500).json({ message: "failed to add in group" });
    }
}

exports.getContactDetails = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { name } = req.params;
        const userId = req.userId;

        //get all contact then search the contact match the searched name  
        const contacts = await Contact.findAll({
            where: {
                [Op.or]: [                                  //either can be friend
                    {
                        userId: userId,
                    },
                    {
                        contactUserId: Number(userId),
                    }
                ],
                status: "accepted"
            },
            attributes: [],
            include: [                                    //because contact has multiple relation with user
                {
                    model: User,
                    as: 'individualuser',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'usercontact',
                    attributes: ['id', 'name']
                }
            ]
        }, { transaction: t });

        // console.log(contacts)

        //structure the data
        let [contactData, individualData] = await Promise.all([contacts.map(request => request.usercontact),
        contacts.map(request => request.individualuser)
        ])

        //check is user is not himself and check the params name with user name
        contactData = contactData.filter(user => user.name.includes(name) && user.id !== userId);
        individualData = individualData.filter(user => user.name.includes(name) && user.id !== userId);

        // console.log(contactData, individualData);

        //merge the data
        let alldata = [...contactData, ...individualData];

        await t.commit();
        // console.log(alldata);
        res.status(200).json({
            message: "Contact fetched successfully",
            data: alldata
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in getContactDetails`);
        res.status(500).json({
            message: "failed to get Contact Details"
        })
    }
}




/**Optimise Query - not working as expected
 * 
 * 
 * const query = `SELECT 
        c.*,
            u1.id AS 'individualuserId', u1.name AS 'individualuserName',
                u2.id AS 'usercontactId', u2.name AS 'usercontactName'
        FROM 
        contacts c
    LEFT JOIN 
        users u1 ON c.userId = u1.id AND u1.name LIKE '%:name%' AND u1.id != :userId
    LEFT JOIN 
        users u2 ON c.contactUserId = u2.id AND u2.name LIKE '%:name%' AND u2.id != :userId
        WHERE
            (c.userId = :userId OR c.contactUserId = :userId) AND c.status = 'accepted'`
 */