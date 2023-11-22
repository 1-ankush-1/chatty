const { Op } = require("sequelize");
const sequelize = require("../config/connect");
const { Message } = require("../models");
const { uploadToS3 } = require("./s3_service");
const msgLimit = Number(process.env.MSG_LIMIT);
let totalMsg;

exports.sendMessage = async (body) => {
    try {
        // console.log("1--------------1,in")
        const { userId, file, ...data } = body;
        let fileUrl;
        if (!data) {
            return
        }
        //check if msg is file then upload else check for text is not empty
        if (file) {
            let base64String = file.data;
            let base64Data = base64String.split(';base64,').pop();
            let bufferData = Buffer.from(base64Data, 'base64');
            fileUrl = await uploadToS3(bufferData, `Messages/${userId}/${file.name}`);

            /** save file in localserver
             * console.log(bufferData)
                console.log("0--------------0",file.data);
                let filePath = path.join(__dirname, '/pictures', file.name);
                fs.writeFile(filePath, bufferData, (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                });
                return;
            */
        } else {
            if (!data.text || !userId) {
                return
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
            return
        }
        return Message.create(message);
    } catch (err) {
        console.log(`${err} in sendMessage`);
        return
    }
}


exports.getMessages = async (body) => {
    const t = await sequelize.transaction();
    try {
        const { userId, ...data } = body
        //no query parameters
        if (!data) {
            return
        }
        let queryConditions;
        //check if group or not
        if (data.groupId) {
            queryConditions = {
                groupId: data.groupId,
                conversationType: "group"
            }
        } else if (data.receiverId) {
            queryConditions = {
                [Op.or]: [
                    {
                        senderId: parseInt(userId),
                        receiverId: parseInt(data.receiverId),
                        conversationType: "user"
                    },
                    {
                        senderId: parseInt(data.receiverId),
                        receiverId: parseInt(userId),
                        conversationType: "user",
                    }
                ]
            }
        } else {
            return
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
        return { data: allMessages, oldmessages };
    } catch (err) {
        t.rollback();
        console.log(`${err} in getMessages`);
        return
    }
}

exports.getMessagesBeforeId = async (body) => {
    const t = await sequelize.transaction();
    try {
        const { id, userId, ...data } = body;
        //no query parameters
        if (!data) {
            return
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
                [Op.or]: [
                    {
                        senderId: parseInt(userId),
                        receiverId: parseInt(data.receiverId),
                        conversationType: "user",
                        id: {
                            [Op.lt]: id
                        }
                    },
                    {
                        senderId: parseInt(data.receiverId),
                        receiverId: parseInt(userId),
                        conversationType: "user",
                        id: {
                            [Op.lt]: id
                        }
                    }
                ]
            }
        } else {
            return
        }

        const allMessages = await Message.findAll({
            where: queryConditions,
            order: [['createdAt', 'DESC']],
            limit: msgLimit
        }, { transaction: t });

        //check if old msg exist
        let oldmessages = totalMsg - allMessages.length > msgLimit ? true : false;
        totalMsg = totalMsg - allMessages.length;
        t.commit();
        return { data: allMessages, oldmessages }
    } catch (err) {
        t.rollback();
        console.log(`${err} in getMessagesBeforeId `);
        return
    }
}