const { Op } = require("sequelize");
const { User, Group, Contact, UserGroup } = require("../models");
const sequelize = require("../config/connect");

exports.getUsersByName = async (req, res, next) => {
    try {

        const { name } = req.params;
        const userId = req.userId;
        const allUser = await User.findAll({
            where: {
                name: {
                    [Op.like]: '%' + name + '%'
                },
                id: {
                    [Op.ne]: Number(userId)
                }
            },
            attributes: ["id", "name"]
        })

        res.status(200).json({
            message: "users fetched successfully",
            data: allUser
        })
    } catch (err) {
        console.log(`${err} in getUsersByName`);
        res.status(500).json({
            message: "failed to fetch users"
        })
    }
}

exports.displayChatName = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        let displayData = [];
        const userId = req.userId;

        // Fetch all group IDs for a particular user
        const userGroups = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId'],
            transaction: t
        });

        // Extract group IDs from the result
        const groupIds = userGroups.map(userGroup => userGroup.groupId);

        const [groups, individualUsers, userContacts] = await Promise.all([Group.findAll({
            where: { id: groupIds },
            attributes: ["id", "name"],
            transaction: t
        }), Contact.findAll({
            where: {
                userId: userId,
                status: "accepted"
            },
            include: [
                {
                    model: User,
                    as: 'usercontact',
                    attributes: ['id', 'name', 'lastSeen']
                }
            ],
            attributes: [],
            transaction: t
        }), Contact.findAll({
            where: {
                contactUserId: userId,
                status: "accepted"
            },
            include: [
                {
                    model: User,
                    as: 'individualuser',
                    attributes: ['id', 'name', 'lastSeen']
                }
            ],
            attributes: [],
            transaction: t
        })])

        // Combine the results
        const contacts = [...individualUsers, ...userContacts];

        // Add groups to displayData
        for (let group of groups) {
            displayData.push({
                id: group.id,
                name: group.name,
                type: 'group'
            });
        }

        // Add contacts to displayData
        for (let contact of contacts) {
            // console.log(contact);
            displayData.push({
                id: contact.individualuser ? contact.individualuser.id : contact.usercontact.id,
                name: contact.individualuser ? contact.individualuser.name : contact.usercontact.name,
                lastSeen: contact.individualuser ? contact.individualuser.lastSeen : contact.usercontact.lastSeen,
                type: 'contact'
            });
        }

        // Send displayData to client
        await t.commit();
        res.status(200).json({
            message: `successfully display Chat Name`,
            data: displayData
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in displayChatName`);
        res.status(500).json({
            message: "failed to fetch display Chat Name"
        })
    }
}