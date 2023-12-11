const forgetform = document.getElementById("forgetform");
forgetform.addEventListener("submit", forgetPassword);

function forgetPassword(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {}
    for (let [name, value] of formData) {
        user[name] = value;
    }
    console.log(user);

    axios.post("http://34.229.6.78/auth/password/forget-password", user).then((res) => {
        if (res.status === 200) {
            alert("check you mail successfully sended")
        }
    }).catch(err => {
        console.log(err);
        alert(err.response.data.message)
    })
}