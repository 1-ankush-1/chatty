const { Op } = require("sequelize");
const { Message } = require("../models");
const sequelize = require("../config/connect");
const msgLimit = 20;
let totalMsg;

exports.sendMessage = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { text, groupId } = req.body
        const message = {
            userId, text, groupId
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
        const { groupId } = req.query;

        //count and no of messages
        const [allMessages, totalNoOfMsg] = await Promise.all([Message.findAll({
            where: {
                groupId
            },
            order: [['createdAt', 'DESC']],
            limit: msgLimit
        }, { transaction: t }),
        Message.count({
            where: {
                groupId
            }
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
        const { groupId } = req.query;

        const allMessages = await Message.findAll({
            where: {
                groupId,
                id: {
                    [Op.gt]: id
                }
            },
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
        const { groupId } = req.query;

        const allMessages = await Message.findAll({
            where: {
                groupId,
                id: {
                    [Op.lt]: id
                }
            },
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