window.onload = function () {
    let spans = document.querySelectorAll('.formStructure-head-name span');
    for (let i = 0; i < spans.length; i++) {
        setTimeout(function () {
            spans[i].style.transform = 'translateY(0)';
            spans[i].style.opacity = '1';
        }, i * 500); // delay increases by 500ms for each letter
    }

    /* Add a separate timeout for the rotation animation */
    setTimeout(function () {
        document.querySelector('.rotate').style.transform += ' rotate(180deg)';
    }, spans.length * 500);
};

const loginform = document.getElementById("loginform");
loginform.addEventListener("submit", handelLogin);

function handelLogin(e) {
    e.preventDefault();

    const loginFormData = new FormData(e.target);

    const userData = {}

    for (let [name, value] of loginFormData) {                             //putting all data in userData
        userData[name] = value
    }

    // console.log("data",userData);
    axios.post("http://52.73.149.108/auth/login-user", userData, { withCredentials: true }).then((res) => {
        // console.log(res);
        if (res.status === 200) {
            localStorage.setItem("chatToken", res.data.token)
            localStorage.setItem("userData", JSON.stringify(res.data.data));
            document.getElementById("passwordmessage").setAttribute("hidden", "");
            alert("User SuccessFully Login");
            window.location.href = "../../home/html/home.html"
        }
    }).catch(err => {
        // console.log(err);
        const errorText = document.getElementById("passwordmessage");
        errorText.removeAttribute("hidden")
        errorText.textContent = err.response.data.message;
    })
}