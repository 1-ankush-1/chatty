const { User } = require("../models")
const bcrypt = require("bcrypt");
const { generateJwtToken } = require("../utils/generateJwtToken");
const sequelize = require("../config/connect");
const { uploadToS3 } = require("../services/s3_service");

exports.registerUser = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, phone, password, about } = req.body;
        const profile = req.files?.profile;

        if (!name || !email || !phone || !password) {
            return res.status(404).json({
                message: "some field are empty",
            })
        }
        //userobj
        const user = { name, email, phone, password, about }

        //find user already exist
        const result = await User.findOne({
            where: {
                email: email
            }
        }, { transaction: t })

        if (result) {
            res.status(404).json({
                message: "user already exist",
            })
        }

        //hash the password(salt - randomness)
        bcrypt.hash(user.password, parseInt(process.env.SALT), async (err, hash) => {
            if (err) {
                console.log(`${err} in signup`)
                return res.status(500).json({
                    message: "failed to register user",
                })
            }
            user.password = hash;
            if (profile) {
                const url = await uploadToS3(profile.data, `profile/${profile.name}`);
                // console.log(url);
                user.profile = url;
            }
            const newUser = await User.create(user, { transaction: t })
            await t.commit();
            res.status(200).json({
                message: "registered successfully",
                data: newUser
            })
        })

    } catch (err) {
        await t.rollback();
        console.log(`${err} in registerUser`);
        res.status(500).json({
            message: "failed to register user",
        })
    }
}

exports.loginUser = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({
            message: "some field is empty",
        })
    }

    //check if user exist
    User.findOne({
        where: {
            email: email,
        }
    }).then(user => {
        //not exist
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        //compare incoming password with saved hash
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.log(`${err} in login `)
                res.status(500).json({
                    message: "failed to login"
                })
            }
            if (result) {
                //except password send everything
                let { password: userPassword, ...userDataToSend } = user.dataValues;

                let token = generateJwtToken(userDataToSend.id, userDataToSend.name);
                // Set the token as a secure cookie
                res.cookie('authToken', token,
                    {
                        expires: new Date(Date.now() + 900000),
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== "development",
                        path: "/",
                        sameSite: "strict",
                    });

                return res.status(200).json({
                    message: "User login sucessful", token: token, data: userDataToSend
                })
            } else {
                return res.status(401).json({
                    message: "incorrect password"
                })
            }
        });
    }).catch(err => {
        console.log(`${err} in login `)
        res.status(500).json({
            message: "failed to login"
        })
    })
}