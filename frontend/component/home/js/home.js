const userData = JSON.parse(localStorage.getItem("userData"));
const usertoken = localStorage.getItem("chatToken");
let myInterval;
let maxMessages = 20;

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
parentChatBoxDiv.onscroll = () => {
    if (myInterval) {
        clearInterval(myInterval);  // Clear the existing interval
        if (parentChatBoxDiv.scrollTop + parentChatBoxDiv.clientHeight + 2 >= parentChatBoxDiv.scrollHeight) {
            myInterval = setInterval(handleNewdMessages, 5000);  // Set a new interval
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
    axios.get(`http://localhost:3000/message/msg-before-id/${userMessages[0].id}?groupId=${currentGrpId}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            const loadOldMessages = document.getElementById("loadOldMessages");
            loadOldMessages.removeAttribute("hidden");
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
            console.log(res.data.oldmessages, "call");
            //old message flag
            if (res.data.oldmessages) {
                loadOldMessages.setAttribute("hidden", "");
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function addMessagesBeforeInHtml(message, ul) {
    const li = document.createElement("li");
    li.id = message.id;
    li.className = (message.userId === userData.id) ? "p-2 my-2 bg-light text-wrap rounded text-start text-lg" : "p-2 my-2 text-wrap rounded text-end receiver text-lg";
    li.textContent = message.text;
    ul.prepend(li);
}

/**
 * Fetch Messages
 */

function handleNewdMessages() {
    //get all the messages
    let userMessages = JSON.parse(localStorage.getItem("userMessages"));

    let lastMsgId = userMessages[userMessages.length - 1]?.id;
    //messages after last message id
    axios.get(`http://localhost:3000/message/msg-after-id/${lastMsgId}?groupId=${currentGrpId}`, {
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
                    addMessagesInHtml(msg, unorderedChatBox);
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


function fetchMessages() {
    axios.get(`http://localhost:3000/message/receive/?groupId=${currentGrpId}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            //clear interval
            clearInterval(myInterval);
            const firstFetchMessages = res.data.data;
            //add in locastorage
            localStorage.setItem("userMessages", JSON.stringify([...firstFetchMessages].reverse()));
            if (firstFetchMessages.length > 0) {
                //add in html dom
                console.log(firstFetchMessages);
                for (let i = firstFetchMessages.length - 1; i >= 0; i--) {
                    addMessagesInHtml(firstFetchMessages[i], unorderedChatBox);
                }
                //old message btn
                if (firstFetchMessages.length >= maxMessages) {
                    const loadOldMessages = document.getElementById("loadOldMessages");
                    loadOldMessages.removeAttribute("hidden");
                    loadOldMessages.addEventListener("click", handleOldMessages);
                }
                //set interval
                myInterval = setInterval(handleNewdMessages, 5000);
            }
            else {
                //no message found
                const li = document.createElement("li");
                li.textContent = "no messages ..."
                li.className = "text-center"
                unorderedChatBox.appendChild(li);
            }
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

    axios.post("http://localhost:3000/message/send", { text: message.value, groupId: currentGrpId }, {
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
 * Group
 */
const createNewGroup = document.getElementById("createNewGroup");
const GroupModel = new bootstrap.Modal(document.getElementById('createGroupModal'))
const closeModel = document.getElementById("closeModel");
let currentGrpId;

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
    axios.post("http://localhost:3000/group/create", GroupDetails, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            alert("successfully created group");
            GroupModel.hide();
            addGroupsInHtml(res.data.data);
        }
    }).catch(err => {
        console.log(err);
        alert("failed to create group");
    })
}

function fetchGroups() {
    axios.get("http://localhost:3000/group/fetchall", {
        headers: {
            Authorization: usertoken,
        },
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            const userGroups = res.data.data;
            // userGroups = 
            for (let grp of userGroups) {
                addGroupsInHtml(grp);
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function addGroupsInHtml(group) {
    const ul = document.getElementById("chatUserNamesList");
    const li = document.createElement("li");
    li.id = group.id
    li.className = "d-flex justify-content-between chatusernamelistitem p-2 cursor-pointer"
    const div = document.createElement("div");
    const sharebtn = document.createElement("button");
    sharebtn.className = "btn h-100"
    sharebtn.innerHTML = '<i class="fas fa-share-alt"></i>';;
    div.className = "d-flex justify-content-center flex-column align-center"
    const h3 = document.createElement("h3");
    h3.className = "chatusername"
    h3.textContent = group.name
    const p = document.createElement("p");
    p.className = "word-wrap te"
    p.title = group.desc;
    p.textContent = group.desc.substring(0, 11) + ".."
    div.appendChild(h3);
    div.appendChild(p);
    div.addEventListener("click", showGroupMessages);
    li.appendChild(div);
    sharebtn.addEventListener("click", handleShareGroup);
    li.appendChild(sharebtn);
    ul.appendChild(li)
}

//generate link to share
function handleShareGroup(e) {
    e.preventDefault();
    let link = `http://localhost:3000/group/user-want-to-add/?groupId=${e.currentTarget.parentElement.id}`;
    navigator.clipboard.writeText(link)
        .then(() => {
            alert(`Share your link: '${link}'\n\nIt has also been copied to your clipboard do: Cntrl+v.`);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
        });
}
function showGroupMessages(e) {
    e.preventDefault();

    document.getElementById("chatScreenHeader").className = "d-flex justify-content-between p-2"
    document.getElementById("sendMsg").removeAttribute("hidden");
    //click on not current group
    if (currentGrpId !== e.currentTarget.parentElement.id) {
        currentGrpId = e.currentTarget.parentElement.id;
        //cleare the messages of prev group
        try {
            while (unorderedChatBox.firstChild) {
                unorderedChatBox.removeChild(unorderedChatBox.firstChild);
            }
        } catch (err) {
            console.log(err);
        }
        const loadOldMessages = document.getElementById("loadOldMessages");
        loadOldMessages.setAttribute("hidden", "");
        fetchMessages();
    }
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