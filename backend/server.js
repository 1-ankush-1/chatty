const http = require("http");
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
const socketIo = require("socket.io");
const handleMessages = require("../backend/App/middlewares/handleMessages.js")

//setup server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 6e6 // size slightly above 5 MB
});

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
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true                       //for cookie
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
 * io handelers
 */
const msgIo = io.of("/message");
handleMessages(msgIo);

/**
 * sync with database
 */
sequelize.sync().then(() => {
    /**
    * start server
    */
    server.listen(process.env.port || 3000, () => {
        console.log(`server is running on http://localhost:${process.env.port || 3000}`)
    })
}).catch(err => {
    console.log(`${err} occured whne syncing with sequalize`)
});

