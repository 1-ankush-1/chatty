const cron = require('node-cron');
// Import your models
const sequelize = require('../config/connect');
const { Op } = require('sequelize');
const { Message, ArchivedChat } = require('../models');


exports.archieveMessages = async () => {
    // Schedule a task to run at 1am every day
    cron.schedule('0 1 * * *', async function () {

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 11);   //  11 days old messages

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

            // Prepare data for bulk insert
            const bulkData = oldMessages.map(message => message.toJSON());

            // Bulk create entries in the old messages table
            await ArchivedChat.bulkCreate(bulkData, { transaction: t });

            // Delete old messages from the main table
            await Message.destroy({
                where: {
                    updatedAt: {
                        [Op.lte]: oneDayAgo
                    }
                },
                transaction: t
            });

            // console.log("in", oneDayAgo, bulkData);
            // Commit the transaction
            await t.commit();
        } catch (err) {
            await t.rollback();
            console.log(err)
        }
    });
}
