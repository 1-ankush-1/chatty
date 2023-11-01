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
        console.log(`${err}` in sendMessage);
        res.status(500).json({
            message: "failed to send message"
        })
    }
}