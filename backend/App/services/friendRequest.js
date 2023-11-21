const { Op } = require("sequelize");
const sequelize = require("../config/connect");
const { Contact, User } = require("../models");


exports.getRequests = async (body) => {
    try {
        const userId = body.userId;

        let requests = await Contact.findAll({
            where: {
                contactUserId: userId,
                status: "pending"
            },
            include: [
                {
                    model: User,
                    as: 'individualuser',  // specifying the alias(because user table has two relation with contact)
                    attributes: ['id', 'name', 'profile']
                }
            ],
            attributes: [],
        })

        if (!requests) {
            return { data: [] }
        }

        requests = requests.map(request => request.individualuser);

        return { data: requests }
    } catch (err) {
        console.log(`${err} in getRequests`)
        return
    }
}


exports.sendRequest = async (body) => {
    const t = await sequelize.transaction();
    try {
        const { userId, contactUserId } = body;
        if (!contactUserId) {
            return;
        }

        //request exist - then no need to create new request
        const request = await Contact.findOne({
            where: {
                [Op.or]: [
                    {
                        userId,
                        contactUserId: Number(contactUserId)
                    }, {
                        userId: Number(contactUserId),
                        contactUserId: userId
                    }]
            },
            transaction: t
        })

        //if already exist - update the request 
        if (request) {
            if (request.status === "rejected") {
                request.status = "pending";
                await request.save({ transaction: t });
                await t.commit();
                return
            } else {
                return
            }
        }

        //create new request
        const contact = {
            userId,
            contactUserId: Number(contactUserId),
        }

        const requestsend = await Contact.create(contact, { transaction: t });
        if (!requestsend) {
            throw new Error("failed to send request");  // Throw an error if the request fails
        }
        await t.commit();
        return requestsend;
    } catch (err) {
        await t.rollback();
        console.log(`${err} in sendRequest`)
        return
    }
}