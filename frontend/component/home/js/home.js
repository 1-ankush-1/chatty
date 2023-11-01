const userData = JSON.parse(localStorage.getItem("userData"));
const usertoken = localStorage.getItem("chatToken");

async function onloadData() {
    try {
        if (!usertoken) {
            window.location.href = "../../login/html/login.html";
        }

        axios.get("http://localhost:3000/message/receive", {
            headers: {
                Authorization: usertoken
            }
        }).then(res => {
            if (res.status === 200) {
                const messages = res.data.data
                console.log(messages)
                const ul = document.createElement("ul");
                ul.className = "p-0"
                const parent = document.getElementById("chatMessage");
                for (let msg of messages) {
                    addMessagesInHtml(msg, ul);
                }
                parent.appendChild(ul);
            }
        }).catch(err => {
            throw new Error(err);
        })
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
 * 
 */
function addMessagesInHtml(message, ul) {
    const li = document.createElement("li");
    li.className = "mt-2 w-50 bg-light"
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
            alert("successfully send message")
        }
    }).catch(err => {
        console.log(err);
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