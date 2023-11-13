const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const Router = require("./App/routes/index.js")
const sequelize = require("./App/config/connect.js");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs")
const path = require("path");
const compression = require("compression");
const morgan = require("morgan");

const app = express();
app.use(express.static('public'));
const accessLogStream = fs.WriteStream(path.join(__dirname, 'access.log'), {
    flag: 'a'
});
/**
 * Middlewares
 */
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors({
    origin: [`${process.env.ALLOWED_DOMAIN}`],
    methods: ['GET', 'POST', 'DELETE','PUT'],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyparser.json({ extended: false }));
app.use(
    fileUpload({
        limits: {
            fileSize: 2000000,
        },
        abortOnLimit: true,
    })
);
/**
 * Routes
 */
app.use(Router);

/**
 * sync with database
 */
sequelize.sync().then(() => {
    /**
    * start server
    */
    app.listen(process.env.port || 3000, () => {
        console.log(`server is running on http://localhost:${process.env.port || 3000}`)
    })
}).catch(err => {
    console.log(`${err} occured whne syncing with sequalize`)
});

