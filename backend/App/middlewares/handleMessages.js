const { updateLastSeen } = require("../services/user");
const { sendMessage, getMessages, getMessagesBeforeId } = require("../services/message");
const { sendRequest, getRequests } = require("../services/friendRequest");
let users = {};

function handleMessaging(msgIo) {

    msgIo.on('connection', (socket) => {

        //update last seen
        socket.on("lastseen", async ({ id }) => {
            try {
                //map of all users
                users[id] = socket.id;
                socket.userId = id;
                if (id) {
                    const lastseenstatus = await updateLastSeen(id);
                    if (lastseenstatus) {
                        socket.emit("lastseen",);
                    }
                    const result = await getRequests({ userId: id })
                    let findSocketId;
                    findSocketId = users[id];
                    msgIo.to(findSocketId).emit("sendrequest", result);
                }
            } catch (err) {
                console.log(`${err} in socket lastseen event`);
            }
        })

        socket.on("noOfRequest", async ({ id }) => {
            try {
                const result = await getRequests({ userId: id })
                // console.log(result,result.data.length)
                socket.emit("noOfRequest", { count: result.data.length });
            } catch (err) {
                console.log(`${err} in socket noOfRequest event`);
            }
        })

        socket.on("sendrequest", async (body) => {
            try {
                body.userId = socket.userId;
                await sendRequest(body);
                const result = await getRequests({ userId: body.contactUserId })
                console.log(result);
                let findSocketId;
                findSocketId = users[body.contactUserId];
                msgIo.to(findSocketId).emit("sendrequest", result);
            } catch (err) {
                console.log(`${err} in socket sendrequest event`);
            }
        })

        socket.on("sendmsg", async (body) => {
            try {
                // console.log(body);
                body.userId = socket.userId;
                // console.log(body);
                const result = await sendMessage(body);
                if (result) {
                    let findSocketSenderId = users[body.userId];
                    if (body.type === "group") {
                        msgIo.to(body.groupId).emit("sendmsg", result)
                    } else {
                        let findSocketId;
                        findSocketId = users[body.receiverId]
                        // console.log("socketIds-->", findSocketSenderId, findSocketId, socket.id)
                        // socket.emit("sendmsg", result);
                        msgIo.to(findSocketSenderId).to(findSocketId).emit("sendmsg", result);
                    }
                }
            } catch (err) {
                console.log(`${err} in socket sendmsg event`);
            }
        })

        //listen for new message
        socket.on("receivemsg", async (body) => {
            try {
                body.userId = socket.userId;
                const result = await getMessages(body);
                if (body?.groupId) {
                    socket.join(body.groupId);
                }
                socket.emit('receivemsg', result);
            } catch (err) {
                console.log(`${err} in socket receivemsg event`);
            }
        })


        //handle new msg because of we can send limited no of messages
        // socket.on('after-id', (data) => {
        //     receiveAfter(data)
        // })

        //handle old messages
        socket.on('receivemsg-before-id', async (body) => {
            try {
                body.userId = socket.userId;
                const result = await getMessagesBeforeId(body);
                socket.emit('receivemsg-before-id', result);
            } catch (err) {
                console.log(`${err} in receivemsg-before-id socket`)
            }
        })

        socket.on('disconnect', () => {
            try {
                delete users[socket.userId];
                console.log(`${socket.userId} disconnected`)
            } catch (err) {
                console.log(`${err} in disconnect socket`)
            }
        });
    });
}

module.exports = handleMessaging;


