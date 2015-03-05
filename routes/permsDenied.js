/**
 * Created by sspatharioti on 2/25/2015.
 */

var jwt = require('jwt-simple');

var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';

module.exports = function (req, res, next) {

    //first step: validate token
    console.log(req.sessionID);
    console.log("\n\n");
    var validated = false;

    var tok = jwt.decode(req.session.authtoken, seckeyenc);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
            validated = true;
        }
    }

    //proceed only if validated
    if (validated) {
        //req.session.accept = false;

        var linkg = req.session.redURL + "?OUST=" + req.session.token + "?ERROR=error_permissions";
        res.redirect(linkg);
    }
};