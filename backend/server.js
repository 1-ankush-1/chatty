const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser");
const cors = require("cors");
const Router = require("./App/routes/index.js")
const sequelize = require("./App/config/connect.js");
// const helmet = require("helmet");
// const compression = require("compression");
// const morgan = require("morgan");
// const path = require("path");

const app = express();
// const accessLogStream = fs.WriteStream(path.join(__dirname, 'access.log'), {
//     flag: 'a'
// });
/**
 * Middleware
 */
// app.use(helmet());
// app.use(compression());
// app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
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
