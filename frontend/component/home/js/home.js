const userData = JSON.parse(localStorage.getItem("userData"));
const usertoken = localStorage.getItem("chatToken");
let myInterval;

async function onloadData() {
    try {
        if (!usertoken) {
            window.location.href = "../../login/html/login.html";
        }
        //get messages from localhost
        let userMessages = JSON.parse(localStorage.getItem("userMessages")) ?? [];
        for (let msg of userMessages) {
            addMessagesInHtml(msg, unorderedChatBox);
        }
        parentChatBoxDiv.appendChild(unorderedChatBox);
        //on every minute send request to fetch messages
        myInterval = setInterval(fetchMessages, 5000);
    } catch (err) {
        console.log(err);
        if (err.response && (err.response.status === 404 || err.response.status === 500)) {
            alert(err.response.data.message)
        }
    }
}

//onload - fetch from server
window.addEventListener("DOMContentLoaded", onloadData);
const parentChatBoxDiv = document.getElementById("chatMessage");
parentChatBoxDiv.style.background = "rgba(217, 217, 219, 0.673)";
parentChatBoxDiv.className = "px-2"
const unorderedChatBox = document.createElement("ul");
unorderedChatBox.className = "p-0 overflow-auto"
const loadOldMessages = document.createElement("button");
loadOldMessages.textContent = "old messages"
loadOldMessages.className = "btn border border-dark mx-auto d-block"
loadOldMessages.addEventListener("click", handleOldMessages);
parentChatBoxDiv.appendChild(loadOldMessages)

/**
 * turn on polling
 */
parentChatBoxDiv.onscroll = () => {
    if (myInterval) {
        if (parentChatBoxDiv.scrollTop + parentChatBoxDiv.clientHeight + 2 >= parentChatBoxDiv.scrollHeight) {
            myInterval = setInterval(fetchMessages, 5000);
        }
    }
}

/**
 * image
 */
document.getElementById("imageToSend").addEventListener("click", handelImageToSend)
function handelImageToSend(e) {
    e.preventDefault();
    const imageModel = document.getElementById("fileInput");
    imageModel.click();
    imageModel.addEventListener("change", getImage);
}
function getImage(e) {
    let file = e.target.files[0];
    console.log(file)
}

/**
 * old messages
*/
function handleOldMessages() {
    //localstorage first id
    let userMessages = JSON.parse(localStorage.getItem("userMessages"));
    // console.log(userMessages[0].id)
    axios.get(`http://localhost:3000/message/msg-before-id/${userMessages[0].id}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            const messages = res.data.data;
            let oldmsglength = messages.length
            if (oldmsglength > 0) {
                //stop the polling
                clearInterval(myInterval);
                // Remove old messages from the back
                if (userMessages.length > oldmsglength) {
                    userMessages = userMessages.slice(0, userMessages.length - oldmsglength);
                }
                // Add old messages to the front
                userMessages = messages.concat(userMessages);
                localStorage.setItem("userMessages", JSON.stringify(userMessages));

                // Remove from DOM
                while (unorderedChatBox.hasChildNodes() && oldmsglength > 0) {
                    unorderedChatBox.removeChild(unorderedChatBox.lastChild);
                    oldmsglength--;
                }

                // Add elements to the DOM
                for (let i = messages.length - 1; i >= 0; i--) {
                    addMessagesBeforeInHtml(messages[i], unorderedChatBox);
                }
                parentChatBoxDiv.appendChild(unorderedChatBox);
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function addMessagesBeforeInHtml(message, ul) {
    const li = document.createElement("li");
    li.className = (message.userId === userData.id) ? "p-2 my-2 bg-light text-wrap rounded text-start text-lg" : "p-2 my-2 text-wrap rounded text-end receiver text-lg";
    li.textContent = message.text;
    ul.prepend(li);
}

/**
 * Fetch Messages
 */

function fetchMessages() {
    //get all the messages
    let userMessages = JSON.parse(localStorage.getItem("userMessages"));
    //undefined then intialize
    if (!userMessages) {
        userMessages = [];
    }
    let lastMsgId = userMessages[userMessages.length - 1]?.id ?? 0;
    //messages after last message id
    axios.get(`http://localhost:3000/message/msg-after-id/${lastMsgId}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            // console.log(res.data.data)
            const messages = res.data.data;
            let newmsglength = messages.length

            // Remove new messages from the front
            if (userMessages.length - newmsglength >= 0 && newmsglength > 0) {
                userMessages = userMessages.slice(newmsglength);
            }

            // Add new messages to the back
            userMessages = userMessages.concat(messages);
            localStorage.setItem("userMessages", JSON.stringify(userMessages));

            // Remove from DOM
            while (unorderedChatBox.hasChildNodes() && newmsglength > 0) {
                console.log("remove")
                unorderedChatBox.removeChild(unorderedChatBox.firstChild);
                newmsglength--;
            }

            // Add elements to the DOM
            for (let msg of messages) {
                addMessagesInHtml(msg, unorderedChatBox);
            }
            parentChatBoxDiv.appendChild(unorderedChatBox);
        }
    }).catch(err => {
        console.log(err);
    })
}

function addMessagesInHtml(message, ul) {
    const li = document.createElement("li");
    li.id = message.id;
    li.className = (message.userId === userData.id) ? "p-2 my-2 bg-light text-wrap rounded text-start text-lg" : "p-2 my-2 text-wrap rounded text-end receiver text-lg";
    li.textContent = message.text;
    ul.appendChild(li);
}

/**
 * send Message
 */
const sendMsgForm = document.getElementById("sendMsgForm");
sendMsgForm.addEventListener("submit", handlesendMsgForm);

function handlesendMsgForm(e) {
    e.preventDefault();
    const message = document.getElementById("message");

    axios.post("http://localhost:3000/message/send", { text: message.value }, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            // alert("successfully send message")
            e.target.reset();
        }
    }).catch(err => {
        console.log(err);
        alert("failed to send msg")
    })
}

/**
 * Logout
 */
const logout = document.getElementById("logout");
logout.addEventListener("click", handleLogout);
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("chatToken");
    localStorage.removeItem("userData")
    window.location.href = "../../login/html/login.html";
}