const { Op } = require("sequelize");
const { Message } = require("../models")

exports.sendMessage = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { text } = req.body
        const message = {
            userId, text
        }

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
    try {
        const allMessages = await Message.findAll();

        res.status(200).json({
            message: "successfully fetched", data: allMessages
        })
    } catch (err) {
        console.log(`${err} in getMessages`);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}

exports.getMessagesAfterId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const allMessages = await Message.findAll({
            where: {
                id: {
                    [Op.gt]: id
                }
            }
        });

        res.status(200).json({
            message: "successfully fetched", data: allMessages
        })
    } catch (err) {
        console.log(`${err} in getMessagesAfterId`);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}

exports.getMessagesBeforeId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const allMessages = await Message.findAll({
            where: {
                id: {
                    [Op.lt]: id
                }
            }
        });

        res.status(200).json({
            message: "successfully fetched", data: allMessages
        })
    } catch (err) {
        console.log(`${err} in getMessagesBeforeId `);
        res.status(500).json({
            message: "failed to get Messages"
        })
    }
}