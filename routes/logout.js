var jwt       = require('jwt-simple');
var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';

module.exports = function (req, res, next) {

    //first step: validate token
    console.log(req.sessionID);
    console.log("\n\n");
    var validated = false;
    if (typeof req.session.authtoken != "undefined") {

        var tok = jwt.decode(req.session.authtoken, seckeyenc);
        if (tok.hasOwnProperty("ip")) {
            if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
                validated = true;
            }
        }
    } else {
        res.status(401).send('Authentication failed')
    }
    //proceed only if validated
    if (validated) {
        req.session.destroy();
        res.send("You've been successfully logged out of OPENi")
    }
};