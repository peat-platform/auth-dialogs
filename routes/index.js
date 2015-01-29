var express = require('express');
//var express = require('express-session');
var router = express.Router();
var path = require('path');
var https = require('https');
var jwt = require('jwt-simple');

var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


function postScript(method, postdata, path, addheaders, success, error) {
    "use strict";
    // An object of options to indicate where to post to
    var obj, options, req,
        post_data = JSON.stringify(postdata),
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data)
        };

    if (typeof addheaders === 'object') {
        for (obj in addheaders) {
            if (addheaders.hasOwnProperty(obj)) {
                headers[obj] = addheaders.obj;
            }
        }
    }

    options = {
        host: '10.130.34.17',
        port: 443,
        path: path,
        method: method,
        headers: headers,
        rejectUnauthorized: false
    };

    req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        console.log("hereeee");

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            var resultObject = JSON.parse(responseString);
            success(resultObject);
        });
    });

    req.on('error', function (e) {
        console.log("Error :\n" + e);
        error(e);
    });

    req.write(post_data);
    req.end();

}

/* GET home page. */
router.get('/account', function(req, res, next) {
    // save the api key, secret key and redirect URL to session
    req.session.api_key=req.query.api_key;
    req.session.secret=req.query.secret;
    req.session.redURL=req.query.redirectURL;

    //create an extra token for authentication

    var payload = {
        ip: req.connection.remoteAddress
    };

// encode token with the predefined secret key

    var token = jwt.encode(payload, seckeyenc);

    req.session.authtoken = token;

    //open openi_account page for username and password input
    res.sendfile(path.join( './auth_pages', 'openi_account', 'openi_account.html' /*path.basename(req.params.page) + '.html'*/));
});



router.get('/permissions', function(req, res, next) {

    //open openi_account page for username and password input
    res.sendfile(path.join( './auth_pages', 'app_permissions', 'app_perm.html' /*path.basename(req.params.page) + '.html'*/));
});


/* GET home page. */
router.post('/login', function(req, res, next) {
    // post authorization to openi

    //first step: validate token

    var validated = false;

    var tok = jwt.decode(req.session.authtoken,seckeyenc);

    console.log(tok);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
            validated = true;
        }
    }


    //proceed only if validated

    if (validated) {


    //get session token from OPENi

    var path = "/api/v1/auth/authorizations";

    var data = {
        "username": req.body.username,
        "password": req.body.password,
        "api_key": req.session.api_key,
        "secret": req.session.secret
    };

    var redurl = req.session.redURL;

    console.log(data);

    postScript("POST", data, path, null, function (datat) {
        //success: send url so that client redirects
        // redirect to redirectURI only if there is no error


        if (typeof datat.error == 'undefined') {
            var nexttt = redurl + "?OUST="+ datat.session;
            res.send(nexttt);
        } else {
            res.send(datat.error);
        }



    }, function () {
        res.status(500).send('Internal error');
    });
    //console.log(req.session.auth);
    } else {

        //jwt auth failed

        res.status(401).send('Authentication failed')
    }
});



router.post('/create', function(req, res, next) {
    // post authorization to openi

    //Validate first with jwt key

    var validated = false;

    var tok = jwt.decode(req.session.authtoken,seckeyenc);

    console.log(tok);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
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

        if (typeof dat.error != 'undefined'){
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

                    var redlink =  "http://127.0.0.1:3000/auth/permissions";

                    var nexttt = redlink + "?OUST="+data3.session;
                    res.send(nexttt);
                } else {
                    res.send(data3.error);
                }



            }, function () {
                res.status(500).send('Internal error');
            });


        }

    }, function () {
        //error;
        console.log("error");
        res.status(500).send('Internal error');

    });

    } else {

        // jwt auth failed

        res.status(401).send('Authentication failed')
    }

});

module.exports = router;
