let Sib = require('sib-api-v3-sdk');

function sendMail({ id, receiver }) {
    console.log(id);
    //creating client 
    let client = Sib.ApiClient.instance;

    //get api from client
    let apiKey = client.authentications['api-key'];

    apiKey.apiKey = process.env.MAIL_KEY;

    //to send to one person
    let TranEmailAPi = new Sib.TransactionalEmailsApi();

    const sender = {
        email: process.env.SENDER_MAIL
    }

    //list of receivers
    const receivers = [
        {
            email: receiver
        },
    ]

    //sending mail
    return TranEmailAPi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Reset Password link",
        htmlContent: `
        <p>This is your link to reset your password. Here are the steps:</p>
        <ol>
            <li>Click on the <a href="http://54.226.26.94/auth/password/reset-password/${id}">link</a></li>
            <li>Enter your new password</li>
            <li>Hit save</li>
        </ol>
    `
    }).then(result => {
        return result.messageId;
    }).catch(err => console.error(err.reponse.message))
}

module.exports = sendMail;