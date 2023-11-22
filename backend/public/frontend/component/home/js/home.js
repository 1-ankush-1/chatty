const socket = io("http://52.73.149.108/message");
let msgType = "user";
let maxMessages = 30;
let currentuserId;
let currentGrpId;
let myInterval;
let noOfRequest = 0;
let noOfFriendRequest = document.getElementById("noOfFriendRequest");
noOfFriendRequest.textContent = 0;
// let lastSeenInterval;
const userData = JSON.parse(localStorage.getItem("userData"));
const usertoken = localStorage.getItem("chatToken");

const darkMode = document.getElementById("darkMode");
document.getElementById('colorTheme').addEventListener('click', function (e) {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const img = document.getElementById('colorImage');
    img.src = isDarkMode ? '../../common/img/icons8-sun-48 (1).png' : '../../common/img/icons8-moon-30.png';
    e.target.parentElement.style.backgroundColor = isDarkMode ? "black" : "white"
});


socket.on('connect', function () {
    socket.emit('lastseen', { id: userData.id });
    socket.off("noOfRequest");
    socket.on("noOfRequest", (body) => {
        try {
            // console.log(body);
            noOfRequest = body?.count ? body.count : 0;
            noOfFriendRequest.textContent = noOfRequest;
        } catch (err) {
            console.log(err);
        }
    })
    socket.emit("noOfRequest", { id: userData.id });
});
// // When user disconnects
// clearInterval(lastSeenInterval);

async function onloadData() {
    try {
        if (!usertoken) {
            window.location.href = "../../login/html/login.html";
        }
        //fetch all the messages
        fetchGroups();
    } catch (err) {
        console.log(err);
        if (err.response && (err.response.status === 404 || err.response.status === 500)) {
            alert(err.response.data.message)
        }
    }
}

//onload - fetch from server
window.addEventListener("DOMContentLoaded", onloadData);
/**
 * Element of message screen
 */
const parentChatBoxDiv = document.getElementById("chatMessage");
const unorderedChatBox = document.getElementById("chatMessageList");

/**
 * turn on polling
 */
// parentChatBoxDiv.onscroll = () => {
//     if (myInterval) {
//         clearInterval(myInterval);  // Clear the existing interval
//         if (parentChatBoxDiv.scrollTop + parentChatBoxDiv.clientHeight + 2 >= parentChatBoxDiv.scrollHeight) {
//             myInterval = setInterval(handleNewdMessages, 5000);  // Set a new interval
//         }
//     }
// }

/**
 * image
 */
let attachement;
document.getElementById("imageToSend").addEventListener("click", handelImageToSend)
function handelImageToSend(e) {
    e.preventDefault();
    const imageModel = document.getElementById("fileInput");
    imageModel.click();
    imageModel.addEventListener("change", handleDisplayMessageImage);
}

function handleDisplayMessageImage(e) {
    let file = e.target.files[0];
    // Check if the file exists and is an image
    // if (file && file.type.startsWith('image/')) {
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector('#textMsgImg').setAttribute('src', e.target.result);
            // Emit the file name and data
            attachement = { name: file.name, data: e.target.result };
            //putting file name in input field of message
            document.getElementById("message").value = file.name;
        }
        reader.readAsDataURL(file);
        // } else if (file) {
        //     // Handle non-image files here
        //     alert("The file is not an image.");
        // }
    }
}

/**
 * old messages
*/
function handleOldMessages() {
    //localstorage first id
    let userMessages = JSON.parse(localStorage.getItem("userMessages"));
    let body = { id: userMessages[0].id };
    if (currentGrpId) {
        body["groupId"] = currentGrpId;
    } else {
        body["receiverId"] = currentuserId;
    }

    socket.emit("receivemsg-before-id", body)

    socket.off("receivemsg-before-id");
    socket.on("receivemsg-before-id", (result) => {
        try {
            const loadOldMessages = document.getElementById("loadOldMessages");
            loadOldMessages.removeAttribute("hidden");
            const messages = result.data;
            let oldmsglength = messages.length
            console.log(messages, unorderedChatBox);
            // Remove old messages from the back(if maxsize exceed)
            if (maxMessages <= userMessages.length + oldmsglength) {
                // console.log("size", maxMessages, "old =", userMessages.length, "new =", oldmsglength, "sum =", userMessages.length + oldmsglength, "exceed by=", userMessages.length + oldmsglength - maxMessages);
                // if (userMessages.length > oldmsglength) {
                userMessages = userMessages.slice(0, userMessages.length + oldmsglength - maxMessages);    //0 to exceedbynofomessages
            }
            // Add old messages to the front
            // userMessages = messages.concat(userMessages);
            // [...messages.reverse(), ...userMessages];
            let messageSet = new Set(messages.reverse());
            userMessages = Array.from(new Set([...messageSet, ...userMessages]));

            localStorage.setItem("userMessages", JSON.stringify(userMessages));

            // Remove from DOM
            // while (unorderedChatBox.hasChildNodes() && oldmsglength > 0) {
            //     unorderedChatBox.removeChild(unorderedChatBox.lastChild);
            //     oldmsglength--;
            // }

            // Add elements to the DOM
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].fileUrl === null) {
                    addMessagesBeforeInHtml(messages[i], unorderedChatBox);
                } else {
                    displayImageInMsgHtml(messages[i], unorderedChatBox, "before");
                }
            }
            parentChatBoxDiv.appendChild(unorderedChatBox);

            //old message flag
            if (!result.oldmessages) {
                loadOldMessages.setAttribute("hidden", "");
            }
        } catch (err) {
            console.log(err);
        }
    })
}

function addMessagesBeforeInHtml(message, ul) {
    // console.log(message);
    const time = msgTimer(message.updatedAt);
    const li = document.createElement("li");
    li.id = message.id;
    li.className = (message.senderId === userData.id) ? "d-flex justify-content-start align-items-center gap-2" : "d-flex justify-content-end align-items-center gap-2";

    const wrapper = document.createElement("div");
    // wrapper.className = (message.senderId === userData.id) ? "p-2 my-2 bg-light text-wrap rounded text-start" : "p-2 my-2 text-wrap rounded text-end receiver";

    const h5 = document.createElement("h5");
    h5.textContent = message.text
    h5.className = (message.senderId === userData.id) ? "p-2 m-2 text-wrap rounded text-start sender" : "p-2 m-2 text-wrap rounded text-end receiver"
    h5.style.whiteSpace = 'normal';
    wrapper.appendChild(h5); // Add the h5 to the wrapper

    const small = document.createElement("small");
    small.textContent = time
    small.className = "text-2 d-block mx-3";
    wrapper.appendChild(small); // Add the small to the wrapper

    li.appendChild(wrapper); // Add the wrapper to the div
    ul.prepend(li);
}

function displayImageBeforeInMsgHtml(ul, li) {
    ul.prepend(li);
}

function displayImageAfterInMsgHtml(ul, li) {
    ul.appendChild(li)
}

/**
 * Fetch Messages
 */

function handleNewdMessages() {
    //get all the messages
    let userMessages = JSON.parse(localStorage.getItem("userMessages"));
    let lastMsgId = userMessages[userMessages.length - 1]?.id;
    let queryString;
    if (msgType === "group") {
        queryString = `http://52.73.149.108/message/msg-after-id/${lastMsgId}?groupId=${currentGrpId}`
    } else {
        queryString = `http://52.73.149.108/message/msg-after-id/${lastMsgId}?receiverId=${currentuserId}`
    }
    //messages after last message id
    axios.get(queryString, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            // console.log(res.data.data)
            const messages = res.data.data;
            const newmsglength = messages.length;

            if (newmsglength > 0) {
                // Calculate how many messages exceed the maximum limit
                let excessMessages = userMessages.length + newmsglength - maxMessages;

                if (excessMessages > 0) {
                    // Remove old messages from the front to maintain the maximum limit
                    userMessages = userMessages.slice(excessMessages);
                    // Update userMessages with new messages
                    userMessages = userMessages.concat(messages);

                    // Remove from DOM
                    while (unorderedChatBox.hasChildNodes() && excessMessages > 0) {
                        unorderedChatBox.removeChild(unorderedChatBox.firstChild);
                        excessMessages--;
                    }
                } else {
                    // Just add new messages to the userMessages
                    userMessages = userMessages.concat(messages);
                }

                // Update localStorage with the updated userMessages
                localStorage.setItem("userMessages", JSON.stringify(userMessages));

                // Add elements to the DOM
                for (let msg of messages) {
                    addChatMessagesInHtml(msg, unorderedChatBox);
                }
                parentChatBoxDiv.appendChild(unorderedChatBox);

                //old message flag
                if (res.data.oldmessages) {
                    const loadOldMessages = document.getElementById("loadOldMessages");
                    loadOldMessages.removeAttribute("hidden");
                }
            }
        }
    }).catch(err => {
        console.log(err);
    })
}


function fetchMessages(to) {
    document.getElementById("addMembersInIndividualGroup").setAttribute("hidden", "");
    socket.emit("receivemsg", to);
    socket.on("receivemsg", (result) => {
        try {
            if (!result) {
                return
            }
            //attachement to null
            attachement = null;
            document.getElementById("message").value = ""
            //remove html
            while (unorderedChatBox.firstChild) {
                unorderedChatBox.removeChild(unorderedChatBox.firstChild);
            }
            //data
            const firstFetchMessages = result.data;
            //add in locastorage
            localStorage.setItem("userMessages", JSON.stringify([...firstFetchMessages].reverse()));

            if (firstFetchMessages.length > 0) {
                //add in html dom
                for (let i = firstFetchMessages.length - 1; i >= 0; i--) {
                    if (firstFetchMessages[i].fileUrl === null) {
                        addChatMessagesInHtml(firstFetchMessages[i], unorderedChatBox);
                    } else {
                        displayImageInMsgHtml(firstFetchMessages[i], unorderedChatBox)
                    }
                }
                //old message btn
                if (result.oldmessages) {
                    // if (firstFetchMessages.length >= maxMessages) {
                    const loadOldMessages = document.getElementById("loadOldMessages");
                    loadOldMessages.removeAttribute("hidden");
                    loadOldMessages.addEventListener("click", handleOldMessages);
                }
            }
            else {
                //no message found
                const li = document.createElement("li");
                li.textContent = "no messages ..."
                li.className = "text-center"
                unorderedChatBox.appendChild(li);
            }
        } catch (err) {
            console.log(err);
        }
    })
}

function addChatMessagesInHtml(message, ul) {

    const time = msgTimer(message.updatedAt);
    // console.log(time);
    const li = document.createElement("li");
    li.id = message.id;
    li.className = (message.senderId === userData.id) ? "d-flex justify-content-start align-items-center gap-2" : "d-flex justify-content-end align-items-center gap-2";

    const wrapper = document.createElement("div");

    const h5 = document.createElement("h5");
    h5.textContent = message.text
    h5.className = (message.senderId === userData.id) ? "p-2 mt-2 mb-1 mx-2 bg-light text-wrap rounded text-start sender" : "p-2 mt-2 mb-1 mx-2 text-wrap rounded text-end receiver"
    wrapper.appendChild(h5); // Add the h5 to the wrapper

    const small = document.createElement("small");
    small.textContent = time
    small.className = "text-2 d-block mx-3";
    wrapper.appendChild(small); // Add the small to the wrapper

    li.appendChild(wrapper); // Add the wrapper to the div

    ul.appendChild(li);
}

function msgTimer(time) {
    let updatedAt = new Date(time);
    let currDate = new Date();
    let diff = currDate - updatedAt; // Difference in milliseconds

    let seconds = Math.floor(diff / 1000); // Convert to seconds
    let minutes = Math.floor(seconds / 60); // Convert to minutes
    let hours = Math.floor(minutes / 60); // Convert to hours
    let days = Math.floor(hours / 24); // Convert to days

    if (days > 0) {
        // If the message was updated yesterday or earlier, show the number of days and the time
        let updatedTime = updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        time = days + 'd ' + updatedTime;
    } else {
        // If the message was updated today, just show the time
        time = updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return time;
}

/**
 * send Message
 */
const sendMsgForm = document.getElementById("sendMsgForm");
sendMsgForm.addEventListener("submit", handlesendMsgForm);

function handlesendMsgForm(e) {
    e.preventDefault();
    const message = document.getElementById("message");
    let messageContent = { text: message.value };
    if (msgType === "group") {
        messageContent["groupId"] = currentGrpId
    } else {
        messageContent["receiverId"] = currentuserId
    }
    // console.log("what")
    messageContent.type = msgType;
    messageContent.file = attachement;
    if (attachement) {
        // console.log("in")
        messageContent.text = "";
    }
    // console.log("out",messageContent)
    // return
    //to stop being called displaySendMessages listener multiple times
    // console.log(messageContent);
    socket.off("sendmsg");
    displaySendMessages()
    socket.emit("sendmsg", messageContent);
}

function displaySendMessages() {
    // console.log("called");
    socket.on("sendmsg", (msg) => {
        try {
            let shouldDisplay = false;
            attachement = null;
            if (currentGrpId === null && msg?.groupId === undefined) {
                // One-to-one messaging
                if (currentuserId === msg.senderId || currentuserId === msg.receiverId) {
                    shouldDisplay = true;
                }
            } else if (msg.groupId === currentGrpId) {
                // Group messaging
                shouldDisplay = true;
            }

            if (shouldDisplay) {
                // Display message
                if (msg.fileUrl === null || msg.fileUrl === undefined) {
                    addChatMessagesInHtml(msg, unorderedChatBox);
                } else {
                    displayImageInMsgHtml(msg, unorderedChatBox);
                }
                sendMsgForm.reset();
                // console.log(document.body.scrollHeight)
                parentChatBoxDiv.scrollTo(0, parentChatBoxDiv.scrollHeight);
            }
        } catch (err) { console.log(err) }
    });
}
function displayImageInMsgHtml(message, ul, position) {
    //file sets
    const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp']);
    const fileExtensions = new Set(['pdf', 'doc', 'docx', 'xml']);

    //get name and extension
    // console.log(message.fileUrl);
    const pathComponents = message.fileUrl.split("/");
    const name = pathComponents[pathComponents.length - 1];
    const nameComponents = name.split(".");
    const extension = nameComponents[nameComponents.length - 1];

    //time
    const time = msgTimer(message.updatedAt);

    //item
    const li = document.createElement("li");
    li.id = message.id;
    li.className = (message.senderId === userData.id) ? "d-flex justify-content-start align-items-center gap-2" : "d-flex justify-content-end align-items-center gap-2";

    const wrapper = document.createElement("div");

    const div = document.createElement("div");
    div.className = (message.senderId === userData.id) ? "p-3 mt-2 mb-1 mx-2 bg-light text-wrap rounded text-start sender" : "p-3  mt-2 mb-1 mx-2 text-wrap rounded text-end receiver";
    const filename = document.createElement("h6");
    const object = document.createElement("object");
    object.setAttribute("height", "200px");
    object.setAttribute("width", "200px");
    if (imageExtensions.has(extension)) {
        object.data = message.fileUrl;
        object.className = "cursor-pointer"
    } else if (fileExtensions.has(extension)) {
        object.data = "../../common/img/pdf.png"
        filename.textContent = name;
    }
    object.textContent = name;
    const p = document.createElement("p");
    p.textContent = "This browser does not support this File Format. Please download the file to view it:";
    const a = document.createElement("a");
    a.href = message.fileUrl
    a.textContent = "Download"
    p.appendChild(a);
    object.appendChild(p);
    const downloadIcon = document.createElement("a");
    downloadIcon.href = message.fileUrl;
    downloadIcon.download = name;
    const icon = document.createElement("img");
    if (li.classList.contains("text-start")) {
        icon.className = "position-absolute document-pos-relative cursor-pointer"
    }
    icon.src = "../../common/img/icons8-download-26.png"
    icon.alt = "download"
    icon.setAttribute("height", "20px");
    icon.setAttribute("width", "20px");
    icon.title = "download"
    downloadIcon.appendChild(icon);

    const small = document.createElement("small");
    small.textContent = time
    small.className = "text-2 d-block mx-3";

    div.appendChild(object);
    div.appendChild(filename);
    div.appendChild(downloadIcon);
    wrapper.appendChild(div);
    wrapper.appendChild(small);
    li.appendChild(wrapper);
    // console.log(li)
    if (position === "before") {
        ul.prepend(li);
    } else {
        ul.appendChild(li);
    }
}
/**
 * User
 */


/**
 * Search User
*/
const triggerSearchUser = document.getElementById("triggerSearchUser")
triggerSearchUser.addEventListener("click", handleSearchedUser);
const searchedUserList = document.getElementById("searchedUserList");

function handleSearchedUser(e) {
    e.preventDefault();
    const name = document.getElementById("searchedusername");
    axios.get(`http://52.73.149.108/user/by_name/${name.value}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            // console.log(res)
            for (let user of res.data.data) {
                placeSearchedUserInHtml(user);
            }
        }
    }).catch(err => {
        console.log(err);
        alert("failed to create group");
    })
}

function placeSearchedUserInHtml(user) {
    const li = document.createElement("li");
    li.className = "d-flex justify-content-between p-2 cursor-pointer"
    li.id = user.id;
    const h6 = document.createElement("h6");
    h6.textContent = user.name;
    const img = document.createElement("img");
    img.src = "../../common/img/sendFriendReques.png"
    img.alt = user.name.slice(0, 6);
    img.setAttribute("height", "25px")
    img.setAttribute("width", "25px")
    img.title = "send Friend Request"
    li.appendChild(h6);
    li.appendChild(img);
    img.addEventListener("click", handelSendFriendRequest);
    // li.textContent = user.name;
    // li.addEventListener("click", handleSelectedSearchUser)
    searchedUserList.appendChild(li);
    const hr = document.createElement("hr");
    searchedUserList.appendChild(hr);
}

function handleSelectedSearchUser(e) {
    e.preventDefault();
    // console.log("clicked", e.target);
    let id = e.target.id;
    let name = e.target.textContent;
    let desc = "something";
    const chat = { id, name, desc }
    addChatInHtml(chat, "user");
}
/**
 * Friend Request
 */
const friendRequest = document.getElementById("friendRequest")
const friendRequestList = document.getElementById("friendRequestList");
friendRequest.addEventListener("click", getAllFriendRequest);

function getAllFriendRequest(e) {
    e.preventDefault();

    axios.get(`http://52.73.149.108/user/friend_request`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        // console.log(res);
        if (res.status === 200) {
            const allrequests = res.data.data;
            for (let req of allrequests) {
                addFriendRequestInHtml(req);
            }
        }
    }).catch(err => {
        console.log(err);
        alert("failed to get friend Request");
    });

}

function addFriendRequestInHtml(user) {
    const li = document.createElement("li");
    li.className = "d-flex justify-content-between p-2 cursor-pointer align-items-center gap-3"
    li.id = user.id;
    //head
    const h6 = document.createElement("h6");
    h6.textContent = user.name;
    //body
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center gap-2"
    const approve = document.createElement("img");
    approve.src = "../../common/img/icons8-done-48.png"
    approve.alt = "accepted";
    approve.setAttribute("height", "20px")
    approve.setAttribute("width", "20px")
    approve.title = "accept request"

    const reject = document.createElement("img");
    reject.src = "../../common/img/icons8-close-48.png"
    reject.alt = "rejected";
    reject.setAttribute("height", "20px")
    reject.setAttribute("width", "20px")
    reject.title = "reject request"

    //append body
    div.appendChild(approve);
    div.appendChild(reject);
    //append structure
    li.appendChild(h6);
    li.appendChild(div);

    approve.addEventListener("click", handelFriendRequest);
    reject.addEventListener("click", handelFriendRequest);

    // li.addEventListener("click", handleSelectedSearchUser)
    friendRequestList.appendChild(li);
    const hr = document.createElement("hr");
    friendRequestList.appendChild(hr);
}


function handelFriendRequest(e) {
    e.preventDefault();
    const status = e.target.alt;
    const contactId = e.target.parentElement.parentElement.id;

    if (status) {
        axios.put(`http://52.73.149.108/user/friend_request/handle/${contactId}`, { status }, {
            headers: {
                Authorization: usertoken
            }
        }).then(res => {
            // console.log(res);
            if (res.status === 200) {
                try {
                    noOfFriendRequest.textContent = Number(noOfFriendRequest.textContent) - 1;
                    alert(`friend request ${status} successfully`)
                    window.location.reload();
                } catch (err) {
                    console.log(err);
                }
            }
        }).catch(err => {
            console.log(err);
            alert(`failed to ${status} friend Request`);
        });
    }
}

function handelSendFriendRequest(e) {
    e.preventDefault();
    const contactUserId = e.target.parentElement.id;

    // socket.off("sendrequest");
    socket.emit("sendrequest", { contactUserId }, function () {
        alert('successfully send friend request');
    });

    socket.off("sendrequest");
    socket.on("sendrequest", (msg) => {
        try {
            // console.log(msg)
            if (!msg) {
                return
            }
            const friend_request = document.getElementById("noOfFriendRequest")
            friend_request.textContent = friend_request.textContent + 1;
        } catch (err) {
            console.log(err);
        }
    })

    // axios.post(`http://52.73.149.108/user/friend_request/send`, { contactUserId }, {
    //     headers: {
    //         Authorization: usertoken
    //     }
    // }).then(res => {
    //     // console.log(res);
    //     if (res.status === 200) {
    //         alert("friend request send successfully")
    //     }
    // }).catch(err => {
    //     console.log(err);
    //     alert("failed to send friend Request");
    // });
}

/**Search N Add member */
const triggeraddmember = document.getElementById("triggeraddmember")
triggeraddmember.addEventListener("click", handleSearchedMember);
const searchedMemberList = document.getElementById("searchedMemberList");

function handleSearchedMember(e) {
    e.preventDefault();
    const name = document.getElementById("Addmember");
    axios.get(`http://52.73.149.108/user/by_name/${name.value}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            // console.log(res)
            for (let user of res.data.data) {
                placeSearchedMemberInHtml(user);
            }
        }
    }).catch(err => {
        console.log(err);
        alert("failed to search members in group");
    })
}

function placeSearchedMemberInHtml(user) {
    const li = document.createElement("li");
    li.className = "d-flex justify-content-between p-2 cursor-pointer"
    li.title = "add user"
    li.id = user.id;
    li.textContent = user.name;
    li.addEventListener("click", handleAddMemberInGroup)
    searchedMemberList.appendChild(li);
    const hr = document.createElement("hr");
    searchedMemberList.appendChild(hr);
}

function handleAddMemberInGroup(e) {
    e.preventDefault();
    let id = e.target.id;
    if (confirm("do you want to add this user in group")) {
        axios.get(`http://52.73.149.108/group/admin/add_user?groupId=${currentGrpId}&userId=${id} `, {
            headers: {
                Authorization: usertoken
            },
            withCredentials: true
        }).then(res => {
            if (res.status === 200) {
                alert("member added successfully")
                document.getElementById("Addmember").value = "";
            }
        }).catch(err => {
            console.log(err);
            alert("failed to add members in group");
        })
    }
}

/**
 * Common in User N Group
 */
function addChatInHtml(chat, chatType) {
    let sharebtn;
    let seen = document.createElement("small");
    const ul = document.getElementById("chatUserNamesList");
    const li = document.createElement("li");
    li.cid = chat.id
    li.className = "d-flex justify-content-between chatusernamelistitem p-2 cursor-pointer"
    const div = document.createElement("div");
    // if (chatType === "group") {
    // console.log(chat.type)
    if (chat.type === "group" || chatType === "group") {
        // console.log("in")
        li.msgType = "group";
        sharebtn = document.createElement("button");
        sharebtn.className = "btn h-100"
        sharebtn.title = "Share group url"
        sharebtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    } else {
        li.msgType = "user";
        const lastuseronline = chat?.lastSeen ?? new Date();
        const time = msgTimer(lastuseronline);
        let now = new Date();
        let lastSeen = new Date(lastuseronline);

        // Round to nearest minute
        now.setSeconds(0, 0);
        lastSeen.setSeconds(0, 0);

        if (now.getTime() === lastSeen.getTime()) {
            seen.textContent = "online";
        } else {
            seen.textContent = time;
        }

    }
    div.className = "d-flex justify-content-center flex-column align-center"
    const h3 = document.createElement("h6");
    h3.className = "chatusername"
    h3.textContent = chat.name
    const p = document.createElement("p");
    p.className = "word-wrap te"
    // p.title = chat.desc;
    // p.textContent = chat.desc.substring(0, 11) + ".."
    div.appendChild(h3);
    div.appendChild(seen);
    // div.appendChild(p);
    div.addEventListener("click", showMessages);
    li.appendChild(div);
    if (chat.type === "group" || chatType === "group") {
        // if (chatType === "group") {
        sharebtn.addEventListener("click", handleShareGroup);
        li.appendChild(sharebtn);
    }
    ul.prepend(li)
    chatType = "";
}

const backToChatList = document.getElementById("backToChatList");
backToChatList.addEventListener("click", goBackTochatListNames);

function goBackTochatListNames() {
    //dynamic
    messageScreen = document.getElementById("chatScreen");
    chatListNames = document.getElementById("chatUserNames");
    // Check if the right side is showing, and if so, remove the 'show' class
    if (messageScreen.classList.contains('show')) {
        messageScreen.classList.remove('show');
    }

    // Check if the left side is hidden, and if so, remove the 'hide' class
    if (chatListNames.classList.contains('hide')) {
        chatListNames.classList.remove('hide');
    }
}

function showMessages(e) {
    e.preventDefault();
    msgType = e.currentTarget.parentElement.msgType;

    //dynamic
    messageScreen = document.getElementById("chatScreen");
    chatListNames = document.getElementById("chatUserNames");
    if (!chatListNames.classList.contains('hide')) {
        chatListNames.classList.toggle('hide');
    }
    if (!messageScreen.classList.contains('show')) {
        messageScreen.classList.toggle('show');
    }

    if (msgType === "group") {
        document.getElementById("chatScreenHeader").className = "d-flex justify-content-between p-2"
    } else {
        document.getElementById("chatScreenHeader").className = "d-none"
    }
    document.getElementById("sendMsg").removeAttribute("hidden");

    //cleare the messages of prev group
    clearMessageScreeen();
    const loadOldMessages = document.getElementById("loadOldMessages");
    loadOldMessages.setAttribute("hidden", "");
    if (e.currentTarget.parentElement.msgType === "group") {
        currentGrpId = e.currentTarget.parentElement.cid;
        currentuserId = null
        fetchMessages({ groupId: currentGrpId })
    } else {
        currentuserId = e.currentTarget.parentElement.cid;
        currentGrpId = null
        fetchMessages({ receiverId: currentuserId })
    }
}

/**
 * Group
 */
const createNewGroup = document.getElementById("createNewGroup");
const GroupModel = new bootstrap.Modal(document.getElementById('createGroupModal'))
const closeModel = document.getElementById("closeModel");


createNewGroup.addEventListener("click", () => {
    GroupModel.show()
})

closeModel.addEventListener("click", () => {
    GroupModel.hide()
})

const groupModalForm = document.getElementById("groupModalForm");
groupModalForm.addEventListener("submit", handleGroupModalForm);
function handleGroupModalForm(e) {
    e.preventDefault();
    let name = document.getElementById("groupname").value;
    let desc = document.getElementById("groupdesc").value;
    let GroupDetails = { name, desc }
    axios.post("http://52.73.149.108/group/create", GroupDetails, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            alert("successfully created group");
            GroupModel.hide();
            addChatInHtml(res.data.data, "group");
        }
    }).catch(err => {
        console.log(err);
        alert("failed to create group");
    })
}

function fetchGroups() {
    axios.get("http://52.73.149.108/group/fetch_all", {
        headers: {
            Authorization: usertoken,
        },
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            const userGroups = res.data.data;
            // userGroups = 
            for (let grp of userGroups) {
                addChatInHtml(grp);
            }
        }
    }).catch(err => {
        console.log(err);
    })
}


//generate link to share
function handleShareGroup(e) {
    e.preventDefault();
    let link = `http://52.73.149.108/group/add_request/?groupId=${e.currentTarget.parentElement.cid}`;


    if (navigator.clipboard) {
        //only work with https
        navigator.clipboard.writeText(link)
            .then(() => {
                alert(`Share your link: '${link}'\n\nIt has also been copied to your clipboard do: Cntrl+v.`);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    } else {
        // Otherwise fallback to the above function
        unsecuredCopyToClipboard(link);
    }
}

function unsecuredCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        alert(`Share your link: '${text}'\n\nIt has also been copied to your clipboard do: Cntrl+v.`);
    } catch (err) {
        console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
}

function clearMessageScreeen() {
    try {
        while (unorderedChatBox.firstChild) {
            unorderedChatBox.removeChild(unorderedChatBox.firstChild);
        }
    } catch (err) {
        console.log(err);
    }
}

//leave group
const leaveGroup = document.getElementById("leaveGroup");
leaveGroup.addEventListener("click", handleLeaveGroup);

function handleLeaveGroup(e) {
    e.preventDefault();
    if (confirm("do you want to leave the group!")) {
        axios.post("http://52.73.149.108/group/leave", { groupId: currentGrpId }, {
            headers: {
                Authorization: usertoken,
            }
        }).then(res => {
            if (res.status === 200) {
                alert("successfully left the group");
                window.location.reload();
            }
        }).catch(err => {
            console.log(err.response);
            alert("failed to leave try again!!")
        })
    }
}

//groupMembers
const allGroupMembers = document.getElementById("allGroupMembers");
allGroupMembers.addEventListener("click", handleGroupMember);

function handleGroupMember(e) {
    e.preventDefault();
    axios.get(`http://52.73.149.108/group/members/?groupId=${currentGrpId}`, {
        headers: {
            Authorization: usertoken,
        }
    }).then(res => {
        if (res.status === 200) {
            const allMembers = res.data.data;
            const ul = document.getElementById("allGroupMembersList");
            //set of adminid for searching
            const admin = new Set(allMembers.filter(member => member.isAdmin).map(member => member.id));
            if (admin.has(userData.id)) {
                document.getElementById("addMembersInIndividualGroup").removeAttribute("hidden");
            } else {
                document.getElementById("addMembersInIndividualGroup").setAttribute("hidden", "");
            }
            for (let member of allMembers) {
                showGroupMembersInHtml(member, ul, admin)
            }
            ul.addEventListener('click', (e) => {
                // Stop the propagation of the click event
                e.stopPropagation();
                if (e.target.className.includes('makeadmin')) {
                    if (confirm(`do you want to Make ${e.target.textContent} admin!`)) {
                        const memberId = e.target.parentNode.id;
                        axios.put(`http://52.73.149.108/group/admin/make_admin`, { userId: memberId, groupId: currentGrpId }, {
                            headers: {
                                Authorization: usertoken,
                            }
                        }).then(res => {
                            if (res.status === 200) {
                                alert("made admin successfully");
                                window.location.reload();
                            }
                        }).catch(err => {
                            console.log(err);
                            alert("failed to make memeber admin!!")
                        })
                    }
                    return;
                }

                if (e.target.parentNode.className.includes('removeadmin') && e.target.className.includes('removeadminofgroup')) {
                    if (confirm(`do you want to remove this member from admin of this group!`)) {
                        const memberId = e.target.parentNode.parentNode.id;
                        axios.put(`http://52.73.149.108/group/admin/remove_admin`, { userId: memberId, groupId: currentGrpId }, {
                            headers: {
                                Authorization: usertoken,
                            }
                        }).then(res => {
                            if (res.status === 200) {
                                alert("removed admin successfully");
                                window.location.reload();
                            }
                        }).catch(err => {
                            console.log(err);
                            alert("failed to remove memeber from admin!!")
                        })
                    }
                    return;
                }

                // Check if the clicked element is a button
                // console.log("hit", e.target.className)
                if (e.target.parentNode.className.includes('remove member') && e.target.className.includes('removeFromGroup')) {
                    if (confirm("do you want to remove this member!")) {
                        const memberId = e.target.parentNode.parentNode.id;
                        axios.delete(`http://52.73.149.108/group/admin/member/${memberId}?groupId=${currentGrpId}`, {
                            headers: {
                                Authorization: usertoken,
                            }
                        }).then(res => {
                            if (res.status === 200) {
                                alert("removed successfully");
                                window.location.reload();
                            }
                        }).catch(err => {
                            console.log(err);
                            alert("failed to remove memeber!!")
                        })
                    }
                    return;
                }
            })
        }
    }).catch(err => {
        console.log(err);
        alert("failed to fetch memebers!!")
    })
}

function showGroupMembersInHtml(member, ul, admin) {
    const div = document.createElement("div");
    div.id = member.id;
    div.className = "d-flex justify-center align-items-center w-100 gap-2"
    div.style.overflowWrap = "break-word";
    const li = document.createElement("li");
    const h5 = document.createElement("h6");
    const removeFromGroupbtn = document.createElement("button");
    removeFromGroupbtn.title = `remove member`
    removeFromGroupbtn.className = "btn h-100 remove member"
    removeFromGroupbtn.innerHTML = `<i class="fas fa-trash removeFromGroup"></i>`;
    const AdminIconGroup = document.createElement("button");
    AdminIconGroup.title = `Group Admin`
    AdminIconGroup.className = "btn h-100"
    AdminIconGroup.innerHTML = `<i class="fa fa-lock removeadminofgroup" aria-hidden="true"></i>`;
    h5.textContent = member.name;
    h5.className = "w-100 overflow-auto"
    div.appendChild(h5);
    if (admin.has(member.id)) {
        div.appendChild(AdminIconGroup);
    }
    if (admin.has(userData.id)) {
        h5.title = "make admin"
        h5.className = "w-100 overflow-auto cursor-pointer makeadmin"
        AdminIconGroup.className = "btn h-100 removeadmin"
        AdminIconGroup.title = `remove Admin`
        addMembersInIndividualGroup
        div.appendChild(removeFromGroupbtn);
    }
    li.appendChild(div);
    ul.appendChild(li);
    const hr = document.createElement("hr");
    ul.appendChild(hr);
}

//if anywhere click close member popup 
document.addEventListener('click', () => {
    // Remove all items from the ul
    const GroupmemberList = document.getElementById("allGroupMembersList");
    while (GroupmemberList.firstChild) {
        GroupmemberList.removeChild(GroupmemberList.firstChild);
    }
    while (searchedUserList.firstChild) {
        searchedUserList.removeChild(searchedUserList.firstChild);
    }
    while (searchedMemberList.children[0]) {
        searchedMemberList.removeChild(searchedMemberList.children[0])
    }
    while (friendRequestList.firstChild) {
        friendRequestList.removeChild(friendRequestList.firstChild);
    }
});


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