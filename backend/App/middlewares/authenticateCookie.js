
const cookieAuthentication = (req, res, next) => {
    try {
        // console.log("got in here", req.cookies);
        const cookietoken = req.cookies.authToken;
        if (!cookietoken) {
            return res.status(404).json({ message: "try again" });
        }
        req.cookietoken = cookietoken;
        next();
    } catch (err) {
        console.log(`${err} in cookieAuthentication`);
        return res.status(401).json({ message: "authatication fail" })
    }
}
module.exports = cookieAuthentication;



/**cookie info */
//expire - time to expire token
//httpOnly - cannot access token in browser javascript only accessed with server
//path - cookie is only visible to following path(default /)
//domain - cookie can be accessed only by following domain (default localhost)(if ip is given it wont be accepted by browser ex- localhost get accepted but 127.0.0.1 not get accepted so check the client ip and browser ip is same(just run the sever on same ip as client ex - if server is running on 127.0.0.1 then send request to 127.0.0.1 from client or if server is running on localhost 127.0.0.1 then send request to localhost both must be same))
//secure - enable it for https else you cannot access it on http(except localhost)
//sameSite - it means when request come from third party like (youtube is embedded in some site - it will allow user to take action(here domain flag doesnt work)) but with strict it cannot access the token(so we need samesite flag)