var jwt = require('jwt-simple');
var postScript = require('./postScript');
var login = require('./login');
var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


module.exports = function (req, res, next) {
    // post authorization to openi
    //Validate first with jwt key
    console.log(req.sessionID);
    console.log("\n\n");
    var validated = false;
    var tok = jwt.decode(req.session.authtoken, seckeyenc);
    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
            validated = true;
        }
    }
    if (validated) {

        //create user, then login to get session token
        var path1 = "/api/v1/auth/users";
        var path2 = "/api/v1/auth/authorizations";
        var data = {
            "username": req.body.username,
            "password": req.body.password
        };
        postScript("POST", data, path1, null, function (dat) {
            //success
            if (typeof dat.error != 'undefined') {
                res.send(dat.error);
            } else {

                var data2 = {
                    "username": req.body.username,
                    "password": req.body.password,
                    "api_key": req.session.api_key,
                    "secret": req.session.secret
                };
                postScript("POST", data2, path2, null, function (data3) {
                    //success
                    // redirect to redirectURI only if no error is found
                    if (typeof data3.error == 'undefined') {
                        req.session.token = data3.session;
                        res.send('OK');
                    } else {
                        //OPENi returned error
                        res.send(data3.error);
                    }
                }, function () {
                    res.status(500).send('OPENi Internal error: session token generation failed');
                });
            }
        }, function () {
            //error;
            console.log("error");
            res.status(500).send('OPENi Internal error: register failed');
        });
    } else {
        // jwt auth failed
        res.status(401).send('Authentication failed')
    }
};