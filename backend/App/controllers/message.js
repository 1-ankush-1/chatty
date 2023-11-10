const { Op } = require("sequelize");
const { Message } = require("../models");
const sequelize = require("../config/connect");
const { uploadToS3 } = require("../services/s3_service");
const msgLimit = parseInt(process.env.MSG_LIMIT);
let totalMsg;

exports.sendMessage = async (req, res, next) => {
    try {
        const userId = req.userId;
        const data = req.body;
        const file = req.files?.file;
        let fileUrl;
        if (!data) {
            return res.status(404).json({
                message: "empty parameters"
            })
        }
        //check if msg is file then upload else check for text is not empty
        if (file) {
            fileUrl = await uploadToS3(file.data, `Messages/${userId}/${file.name}`);
        } else {
            if (!data.text || !userId) {
                return res.status(404).json({
                    message: "text cannot be empty"
                })
            }
        }
        //create message to save
        let message;
        if (data.groupId) {
            message = {
                senderId: userId, text: data.text, groupId: data.groupId, conversationType: "group", fileUrl
            }
        } else if (data.receiverId) {
            message = {
                senderId: userId, text: data.text, receiverId: data.receiverId, conversationType: "user", fileUrl
            }
        } else {
            return res.status(404).json({
                message: "empty parameters"
            })
        }
        // console.log(message);
        const result = await Message.create(message);

        res.status(200).json({
            message: "successfully send", data: result
        })
    } catch (err) {
        console.log(`${err} in sendMessage`);
        res.status(500).json({
            message: "failed to send message"
        })
    }
}

exports.getMessages = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const data = req.query;
        //no query parameters
        if (!data) {
            return res.status(404).json({
                message: "empty parameters"
            })
        }
        const userId = req.userId;
        let queryConditions;
        //check if group or not
        if (data.groupId) {
            queryConditions = {
                groupId: data.groupId,
                conversationType: "group"
            }
        } else if (data.receiverId) {
            queryConditions = {
                senderId: userId,
                receiverId: data.receiverId,
                conversationType: "user"
            }
        } else {
            return res.status(404).json({
                message: "empty parameters"
            })
        }

        //count and no of messages
        const [allMessages, totalNoOfMsg] = await Promise.all([Message.findAll({
            where: queryConditions,
            order: [['createdAt', 'DESC']],
            limit: msgLimit,
        }, { transaction: t }),
        Message.count({
            where: queryConditions
        }, { transaction: t })]);

        //check if old msg exist
        let oldmessages = totalNoOfMsg - allMessages.length > 0 ? true : false;
        totalMsg = totalNoOfMsg;
        // console.log(totalMsg);
        t.commit();
        res.status(200).json({
            message: "successfully fetched", data: allMessages, oldmessages
        })
    } catch (err) {
        t.rollback();
        console.log(`${err} in getMessages`);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}

exports.getMessagesAfterId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.query;
        //no query parameters
        if (!data) {
            return res.status(404).json({
                message: "empty parameters"
            })
        }
        let queryConditions;
        //check if group or not
        if (data.groupId) {
            queryConditions = {
                groupId: data.groupId,
                conversationType: "group",
                id: {
                    [Op.gt]: id
                }
            }
        } else if (data.receiverId) {
            queryConditions = {
                receiverId: data.receiverId,
                conversationType: "user",
                id: {
                    [Op.gt]: id
                }
            }
        } else {
            return res.status(404).json({
                message: "empty parameters"
            })
        }

        const allMessages = await Message.findAll({
            where: queryConditions,
            order: [['createdAt', 'ASC']],
            limit: msgLimit
        });

        //check if old msg exist
        let oldmessages = totalMsg + allMessages.length > 0 ? true : false;
        // console.log(totalMsg, allMessages.length);
        totalMsg = totalMsg + allMessages.length;

        res.status(200).json({
            message: "successfully fetched", data: allMessages, oldmessages
        })
    } catch (err) {
        console.log(`${err} in getMessagesAfterId`);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}

exports.getMessagesBeforeId = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const data = req.query;
        //no query parameters
        if (!data) {
            return res.status(404).json({
                message: "empty parameters"
            })
        }
        let queryConditions;
        //check if group or not
        if (data.groupId) {
            queryConditions = {
                groupId: data.groupId,
                conversationType: "group",
                id: {
                    [Op.lt]: id
                }
            }
        } else if (data.receiverId) {
            queryConditions = {
                receiverId: data.receiverId,
                conversationType: "user",
                id: {
                    [Op.lt]: id
                }
            }
        } else {
            return res.status(404).json({
                message: "empty parameters"
            })
        }

        const allMessages = await Message.findAll({
            where: queryConditions,
            order: [['createdAt', 'ASC']],
            limit: msgLimit
        }, { transaction: t });

        //check if old msg exist
        let oldmessages = totalMsg - allMessages.length > 0 ? true : false;
        totalMsg = totalMsg - allMessages.length;
        console.log(totalMsg);
        t.commit();
        res.status(200).json({
            message: "successfully fetched", data: allMessages, oldmessages
        })
    } catch (err) {
        t.rollback();
        console.log(`${err} in getMessagesBeforeId `);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}