const socket = io("http://localhost:3000")
socket.on('connect', () => {
    console.log(socket.id);
})

let msgType = "user";
const userData = JSON.parse(localStorage.getItem("userData"));
const usertoken = localStorage.getItem("chatToken");
let myInterval;
let maxMessages = 20;

async function onloadData() {
    try {
        if (!usertoken) {
            window.location.href = "../../login/html/login.html";
        }
        console.log("innn");
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
    imageModel.addEventListener("change", handleDisplayMessageImage);
}

function handleDisplayMessageImage(e) {
    let file = e.target.files[0];
    // Check if the file exists and is an image
    if (file && file.type.startsWith('image/')) {
        let reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector('#textMsgImg').setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(file);
    } else if (file) {
        // Handle non-image files here
        alert("The file is not an image.");
    }
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
    let queryString;
    if (msgType === "group") {
        queryString = `http://localhost:3000/message/msg-after-id/${lastMsgId}?groupId=${currentGrpId}`
    } else {
        queryString = `http://localhost:3000/message/msg-after-id/${lastMsgId}?receiverId=${currentuserId}`
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
    li.className = (message.senderId === userData.id) ? "p-2 my-2 bg-light text-wrap rounded text-start text-lg" : "p-2 my-2 text-wrap rounded text-end receiver text-lg";
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
    let messageContent;
    if (msgType === "group") {
        messageContent = { text: message.value, groupId: currentGrpId }
    } else {
        messageContent = { text: message.value, receiverId: currentuserId }
    }

    io("http://localhost:3000/message/send", { message: messageContent });
    axios.post("http://localhost:3000/message/send", messageContent, {
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
 * User
 */
let currentuserId;
function showUserMessages() {
    //fetch all the messages of that user
    axios.get(`http://localhost:3000/message/receive/?receiverId=${currentuserId}`, {
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


/**
 * Search User
*/
const triggerSearchUser = document.getElementById("triggerSearchUser")
triggerSearchUser.addEventListener("click", handleSearchedUser);
const searchedUserList = document.getElementById("searchedUserList");

function handleSearchedUser(e) {
    e.preventDefault();
    const name = document.getElementById("searchedusername");
    axios.get(`http://localhost:3000/user/by_name/${name.value}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            console.log(res)
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
    li.addEventListener("click", handleSelectedSearchUser)
    searchedUserList.appendChild(li);
    const hr = document.createElement("hr");
    searchedUserList.appendChild(hr);
}

function handleSelectedSearchUser(e) {
    e.preventDefault();
    console.log("clicked", e.target);
    let id = e.target.id;
    let name = e.target.textContent;
    let desc = "something";
    const chat = { id, name, desc }
    addChatInHtml(chat);
}
/**
 * Friend Request
 */
const friendRequest = document.getElementById("friendRequest")
const friendRequestList = document.getElementById("friendRequestList");
friendRequest.addEventListener("click", getAllFriendRequest);

function getAllFriendRequest(e) {
    e.preventDefault();

    axios.get(`http://localhost:3000/user/friend_request`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        console.log(res);
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

    li.addEventListener("click", handleSelectedSearchUser)
    friendRequestList.appendChild(li);
    const hr = document.createElement("hr");
    friendRequestList.appendChild(hr);
}


function handelFriendRequest(e) {
    e.preventDefault();
    const status = e.target.alt;
    const contactId = e.target.parentElement.parentElement.id;

    if (status) {
        axios.put(`http://localhost:3000/user/friend_request/handle/${contactId}`, { status }, {
            headers: {
                Authorization: usertoken
            }
        }).then(res => {
            console.log(res);
            if (res.status === 200) {
                alert(`friend request ${status} successfully`)
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

    axios.post(`http://localhost:3000/user/friend_request/send`, { contactUserId }, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        console.log(res);
        if (res.status === 200) {
            alert("friend request send successfully")
        }
    }).catch(err => {
        console.log(err);
        alert("failed to send friend Request");
    });
}

/**Search N Add member */
const triggeraddmember = document.getElementById("triggeraddmember")
triggeraddmember.addEventListener("click", handleSearchedMember);
const searchedMemberList = document.getElementById("searchedMemberList");

function handleSearchedMember(e) {
    e.preventDefault();
    const name = document.getElementById("Addmember");
    axios.get(`http://localhost:3000/user/by_name/${name.value}`, {
        headers: {
            Authorization: usertoken
        }
    }).then(res => {
        if (res.status === 200) {
            console.log(res)
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
    li.className = "d-flex justify-content-between p-2 cursor-pointer bg-white"
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
        axios.get(`http://localhost:3000/group/admin/add_user?groupId=${currentGrpId}&userId=${id} `, {
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
    const ul = document.getElementById("chatUserNamesList");
    const li = document.createElement("li");
    li.cid = chat.id
    li.className = "d-flex justify-content-between chatusernamelistitem p-2 cursor-pointer"
    const div = document.createElement("div");
    if (chatType === "group") {
        li.msgType = "group";
        sharebtn = document.createElement("button");
        sharebtn.className = "btn h-100"
        sharebtn.title = "Share group url"
        sharebtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    } else {
        li.msgType = "user";
    }
    div.className = "d-flex justify-content-center flex-column align-center"
    const h3 = document.createElement("h6");
    h3.className = "chatusername"
    h3.textContent = chat.name
    const p = document.createElement("p");
    p.className = "word-wrap te"
    p.title = chat.desc;
    p.textContent = chat.desc.substring(0, 11) + ".."
    div.appendChild(h3);
    div.appendChild(p);
    div.addEventListener("click", showMessages);
    li.appendChild(div);
    if (chatType === "group") {
        sharebtn.addEventListener("click", handleShareGroup);
        li.appendChild(sharebtn);
    }
    ul.prepend(li)
}

function showMessages(e) {
    e.preventDefault();
    msgType = e.currentTarget.parentElement.msgType;
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
        fetchMessages();
    } else {
        currentuserId = e.currentTarget.parentElement.cid;
        showUserMessages();
    }
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
            addChatInHtml(res.data.data);
        }
    }).catch(err => {
        console.log(err);
        alert("failed to create group");
    })
}

function fetchGroups() {
    axios.get("http://localhost:3000/group/fetch_all", {
        headers: {
            Authorization: usertoken,
        },
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            const userGroups = res.data.data;
            // userGroups = 
            for (let grp of userGroups) {
                addChatInHtml(grp, "group");
            }
        }
    }).catch(err => {
        console.log(err);
    })
}


//generate link to share
function handleShareGroup(e) {
    e.preventDefault();
    let link = `http://localhost:3000/group/add_request/?groupId=${e.currentTarget.parentElement.cid}`;
    navigator.clipboard.writeText(link)
        .then(() => {
            alert(`Share your link: '${link}'\n\nIt has also been copied to your clipboard do: Cntrl+v.`);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
        });
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
        axios.post("http://localhost:3000/group/leave", { groupId: currentGrpId }, {
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
    axios.get(`http://localhost:3000/group/members/?groupId=${currentGrpId}`, {
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
                        axios.put(`http://localhost:3000/group/admin/make_admin`, { userId: memberId, groupId: currentGrpId }, {
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
                }

                if (e.target.parentNode.className.includes('removeadmin') && e.target.className.includes('removeadminofgroup')) {
                    if (confirm(`do you want to remove this member from admin of this group!`)) {
                        const memberId = e.target.parentNode.parentNode.id;
                        axios.put(`http://localhost:3000/group/admin/remove_admin`, { userId: memberId, groupId: currentGrpId }, {
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
                }

                // Check if the clicked element is a button
                console.log("hit", e.target.className)
                if (e.target.parentNode.className.includes('remove member') && e.target.className.includes('removeFromGroup')) {
                    if (confirm("do you want to remove this member!")) {
                        const memberId = e.target.parentNode.parentNode.id;
                        axios.delete(`http://localhost:3000/group/admin/member/${memberId}?groupId=${currentGrpId}`, {
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