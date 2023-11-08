const { Op } = require("sequelize");
const { User } = require("../models");

exports.getUsersByName = async (req, res, next) => {
    try {

        const { name } = req.params;
        const allUser = await User.findAll({
            where: {
                name: {
                    [Op.like]: '%' + name + '%'
                }
            },
            attributes: ["id", "name"]
        })

        res.status(200).json({
            message: "users fetched successfully",
            data: allUser
        })
    } catch (err) {
        console.log(`${err} in getUsersByName`);
        res.status(500).json({
            message: "failed to fetch users"
        })
    }
}