const { User } = require("../models")
const bcrypt = require("bcrypt");

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

exports.loginUser = (res,req,next)=>{

}
