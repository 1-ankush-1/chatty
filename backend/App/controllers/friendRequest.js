const { AppConfigData } = require("aws-sdk");
const { User, Contact } = require("../models");
const sequelize = require("../config/connect");
const { Op } = require("sequelize");

exports.getRequests = async (req, res, next) => {
    try {
        const userId = req.userId;

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
            new Error("no user found");
        }

        requests = requests.map(request => request.individualuser);

        res.status(200).json({
            message: "fetched request successfull",
            data: requests
        })
    } catch (err) {
        console.log(`${err} in getRequests`)
        res.status(500).json(err);
    }
}

exports.sendRequest = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const contactUserId = req.body.contactUserId;
        const userId = req.userId
        if (!contactUserId) {
            res.status(404).json({
                message: "user missing"
            })
            return;  // Stop execution if user is missing
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
                await request.save({ transaction: t });  // Wait for the save operation to complete
                await t.commit();
                return res.status(200).json({
                    message: "Friend Request send Successfully"
                })
            } else {
                return res.status(401).json({
                    message: "already friend request send"
                })
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
        res.status(200).json({
            message: "Friend Request send Successfully"
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in sendRequest`)
        res.status(500).json({ message: err.message });  // Send the error message in the response
    }
}

exports.handleRequest = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const contactUserId = req.params.contactId;
        const userId = req.userId;
        const status = req.body.status;

        if (!status || !contactUserId) {
            res.status(404).json({
                message: "missing data"
            })
        }
        const updatedContact = await Contact.update({ status: status }, {
            where: {
                [Op.or]: [
                    {
                        userId,
                        contactUserId
                    }, {
                        userId: contactUserId,
                        contactUserId: userId
                    }]
            }, transaction: t
        })
        console.log(updatedContact);
        await t.commit();
        res.status(200).json({
            message: `request succesfully ${status}`,
            data: updatedContact
        })
    } catch (err) {
        await t.rollback();
        console.log(`${err} in handleRequest`)
        res.status(500).json(err);
    }
}
