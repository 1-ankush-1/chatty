const { User } = require("../models")
const bcrypt = require("bcrypt");
const {generateJwtToken} = require("../utils/generateJwtToken");

exports.registerUser = (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(404).json({
            message: "some field are empty",
        })
    }

    const user = { name, email, phone, password }

    User.findOne({
        where: {
            email: email
        }
    }).then((result) => {
        //no user create one
        if (!result) {
            //hash the password(salt - randomness)
            bcrypt.hash(user.password, parseInt(process.env.SALT), (err, hash) => {
                if (err) {
                    console.log(`${err} in signup`)
                    return res.status(500).json({
                        message: "failed to register user",
                    })
                }
                user.password = hash;
                User.create(user).then(result => {
                    res.status(200).json({
                        message: "registered successfully",
                        data: result
                    })
                }).catch(err => {
                    console.log(`${err} in registerUser`);
                    res.status(500).json({
                        message: "failed to register user",
                    })
                })
            });
        } else {
            res.status(404).json({
                message: "user already exist",
            })
        }
    }).catch(err => {
        console.log(`${err} in registerUser`);
        res.status(500).json({
            message: "failed to register user",
        })
    })
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