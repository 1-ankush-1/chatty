exports.handleMessaging = () => {
    msgIo.on('connection', (socket) => {
        console.log('a user connected');

        //send message 
        socket.on('send', (data) => {
            sendMessage(data)
        })

        //listen for new message
        socket.on('receive', (data) => {
            receiveMessage(data)
        })

        //handle new msg because of we can send limited no of messages
        socket.on('after-id', (data) => {
            receiveAfter(data)
        })

        //handle old messages
        socket.on('before-id', (data) => {
            receiveBefore(data)
        })
    });
}


