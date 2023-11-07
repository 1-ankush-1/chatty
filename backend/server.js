const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const Router = require("./App/routes/index.js")
const sequelize = require("./App/config/connect.js");
const cookieParser = require("cookie-parser");

const app = express();

/**
 * Middlewares
 */

app.use(cors({
    origin: [`${process.env.ALLOWED_DOMAIN}:5500`],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyparser.json({ extended: false }));

/**
 * Routes
 */
app.use(Router);

/**
 * sync with database
 */
sequelize.sync().then(() => {
}).catch(err => {
    console.log(`${err} occured whne syncing with sequalize`)
});


/**
 * start server
*/
app.listen(process.env.port || 3000, () => {
    console.log(`server is running on http://localhost:${process.env.port || 3000}`)
})
