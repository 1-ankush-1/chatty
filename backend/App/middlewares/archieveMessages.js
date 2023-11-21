const cron = require('node-cron');
// Import your models
const sequelize = require('../config/connect');
const { Op } = require('sequelize');
const { Message, ArchivedChat } = require('../models');


exports.archieveMessages = async () => {
    // Schedule a task to run at 1am every day
    cron.schedule('* * * * *', async function () {

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 11);

        // Begin a transaction
        const t = await sequelize.transaction();

        try {

            // Fetch old messages from the main table
            const oldMessages = await Message.findAll({
                where: {
                    updatedAt: {
                        [Op.lte]: oneDayAgo
                    }
                },
                transaction: t
            })


            // Create entries in the old messages table
            // for (let message of oldMessages) {
            //     await ArchivedChat.create(message.toJSON(), { transaction: t });
            // }
            console.log("in", oneDayAgo);
            // Delete old messages from the main table
            // await Message.destroy({ where: {
            //     where: {
            //         updatedAt: {
            //             [Op.lte]: oneDayAgo
            //         }
            //     },
            //     transaction: t
            // } }, { transaction: t });

            // Commit the transaction
            await t.commit();
        } catch (err) {
            await t.rollback();
            console.log(err)
        }
    });
}
