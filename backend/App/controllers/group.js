
const sequelize = require("../config/connect");
const { Group, User } = require("../models");
const UserGroup = require("../models/usergroup");

exports.createGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { name, desc } = req.body;
        const userId = req.userId;

        //missing details   
        if (name === null || desc === null || userId === null) {
            return res.status(400).json({ message: "parameter missing" });
        }

        //group obj
        const group = {
            name, desc
        }
        //create group
        const createdGroup = await Group.create(group, { transaction: t });

        //add a user
        await UserGroup.create({ userId, groupId: createdGroup.id, isAdmin: true }, { transaction: t })

        await t.commit();
        res.status(200).json({
            message: "group created successfully",
            data: createdGroup
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in createGroup`)
        return res.status(500).json({ message: "failed to create group" });
    }
}

exports.fetchGroups = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.userId;

        if (userId === null) {
            return res.status(404).json({ message: "no user found" });
        }

        // Fetch all group IDs for a particular user
        const userGroups = await UserGroup.findAll({
            where: { userId: userId },
            attributes: ['groupId'],
            transaction: t
        });

        // Extract group IDs from the result
        const groupIds = userGroups.map(userGroup => userGroup.groupId);

        // Fetch all groups that match the group IDs
        const groups = await Group.findAll({
            where: { id: groupIds },
            attributes: ["id", "name", "desc"],
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            message: "successfully fetched the data",
            data: groups
        })

    } catch (err) {
        await t.rollback();
        console.log(`${err} in fetchGroups`)
        return res.status(500).json({ message: "failed to fetch group" });
    }
}

exports.fetchAllGroupMembers = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.userId;
        const { groupId } = req.query;

        if (userId === null) {
            return res.status(404).json({ message: "no user found" });
        }

        // fetch all users and group 
        const group = await Group.findOne({
            where: { id: groupId },
            include: [
                {
                    model: User,
                    through: {
                        attributes: ['isAdmin']
                    },
                    attributes: ['id', 'name']
                }
            ],
            transaction: t
        });

        //setting admin
        const users = group.users.map(user => {
            return { ...user.dataValues, admin: user.usergroup.isAdmin };
        });

        t.commit();
        res.status(200).json({
            message: "successfully fetched",
            data: users
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in fetchAllGroupMembers`)
        return res.status(500).json({ message: "failed to fetch group" });
    }
}

exports.userWantToLeaveGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.userId;
        const { groupId } = req.body;
        //check if user exist
        let user = await UserGroup.findOne({
            where: {
                userId,
                groupId
            }
        }, { transaction: t });
        if (!user) {
            return res.status(404).json({ message: "user is not part of group" });
        }
        console.log(user);
        //delete that user
        await user.destroy({ transaction: t })

        t.commit()
        res.status(200).json({
            message: "successfully left"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in userWantToLeaveGroup`)
        return res.status(500).json({ message: "failed to leave group" });
    }
}

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
        res.send(200).json({
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
            return res.status(404).json({ message: "no group exist" });
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

exports.wantToAddInGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupId } = req.query;
        console.log(groupId);
        const group = await Group.findByPk(groupId);
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Group Invite</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        </head>
        <body>
            <div class="text-center p-5 shadow" style="max-width: 500px; margin: auto;">
                <h2 class="text-dark">Want to add in this group?</h2>
                <h3 id="groupName" class="text-secondary">${group.name}</h3>
                <p id="groupDesc" class="text-muted">${group.desc}</p>
                <button id="yesBtn" class="btn btn-success mr-2">Yes</button>
                <button id="noBtn" class="btn btn-danger">No</button>
            </div>
        
            <!-- js -->
            <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
            <script>
                document.getElementById('yesBtn').addEventListener('click', function() {
                    let token = localStorage.getItem('chatToken');  // Fetch token from local storage
                    console.log("token",token);
        
                    axios.get('${process.env.ALLOWED_DOMAIN}:3000/group/adduser?groupId=${groupId}', {
                        headers: {
                            Authorization: token
                        }
                    }).then(res => {
                        if(res.status === 200){
                            window.location.href = '${process.env.ALLOWED_DOMAIN}:5500/frontend/component/home/html/home.html';  // Redirect to home.html
                        }
                    })
                    .catch(error => {
                        if (error.response && error.response.status === 401) {
                            alert('Login then try...'); 
                            window.location.href = '${process.env.ALLOWED_DOMAIN}:5500/frontend/component/home/html/home.html'
                        } else {
                            alert('Failed. Please try again.'); 
                        }
                    });
                });
        
                document.getElementById('noBtn').addEventListener('click', function() {
                    window.location.href = '${process.env.ALLOWED_DOMAIN}:5500/frontend/component/home/html/home.html'
                });
            </script>
        </body>
        </html>
        `)
    } catch (err) {
        console.log(err);
    }
}