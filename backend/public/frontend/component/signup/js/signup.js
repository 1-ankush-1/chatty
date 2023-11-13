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

const signupform = document.getElementById("signupform");
signupform.addEventListener("submit", handelSignup);
let img;

function handelSignup(e) {
    e.preventDefault();

    const signFormData = new FormData(e.target);

    const userData = {}

    for (let [name, value] of signFormData) {                             //putting all data in userData
        userData[name] = value
    }

    if (userData.password !== userData.confirmpassword) {               //compare password
        document.getElementById("passwordmessage").removeAttribute("hidden");
        return
    }
    document.getElementById("passwordmessage").setAttribute("hidden", "");

    console.log("data", userData);
    axios.post("http://localhost:3000/auth/register-user", signFormData).then((res) => {
        console.log(res);
        if (res.status === 200) {
            alert("User SuccessFully Registered");
            window.location.href = "../../login/html/login.html"
        }
    }).catch(err => {
        // console.log(err);
        alert(err.response.data.message)
    })
}

const profile = document.getElementById("profile");
profile.addEventListener("change", handleInputProfile);

profile.addEventListener("change", handleInputProfile);

function handleInputProfile(e) {
    if (e.target.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector('#profileDisplay').setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(e.target.files[0]);
    }
}
