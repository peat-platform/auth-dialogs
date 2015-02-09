var express = require('express');
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
                headers[obj] = addheaders[obj];
            }
        }
    }

    options = {
        host: '127.0.0.1',
        port: 443,
        path: path,
        method: method,
        headers: headers,
        rejectUnauthorized: false
    };

    //console.log(post_data);

    req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        //console.log("hereeee");

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

router.post("/sendPerms", function (req, res) {
    req.session.appPermJson = "mple"
    res.status = 200;
    res.end()
})

/*================*/
/* GET home page. */
/*================*/
router.get('/account', function (req, res, next) {
    // save the api key, secret key and redirect URL to session

    console.log(req.sessionID)
    console.log("\n\n")

    req.session.api_key = req.query.api_key;
    req.session.secret = req.query.secret;
    req.session.redURL = req.query.redirectURL;
    try{
        req.session.appPermJson = JSON.parse(new Buffer( req.query.appPerms, 'base64').toString('utf8'));
    } catch (e){
        console.log(e)
    }


    //console.log(req.session.appPermJson)

    //create an extra token for authentication
    var payload = {
        ip: req.connection.remoteAddress
    };

    // encode token with the predefined secret key
    var token = jwt.encode(payload, seckeyenc);

    req.session.authtoken = token;
    //sess.authtoken = token;

    res.render("openi_account")

});

/*======================*/
/* get permissions page */
/*======================*/
router.get('/permissions', function (req, res, next) {

    //open openi_account page for username and password input
    //res.sendfile(path.join('./auth_pages', 'app_permissions', 'app_perm.html' /*path.basename(req.params.page) + '.html'*/));

    //ID - name match for proper view
    console.log(req.sessionID)
    console.log("\n\n")
    //sess = req.session;


    var typesName = ["Account",
        "Application",
        "Article",
        "Audio",
        "Badge",
        "Card",
        "Checkin",
        "Contact",
        "Context",
        "Device",
        "Event",
        "File",
        "Game",
        "Measurement",
        "Note",
        "Nutrition",
        "Order",
        "Photo",
        "Place",
        "Product",
        "Question",
        "Registeredapplication",
        "Route",
        "Service",
        "Shop",
        "Sleep",
        "SocialAccount",
        "SocialToken",
        "Socialapp",
        "Status",
        "User",
        "Video",
        "Workout",
        "File Post",
        "Comment Post",
        "Like Post",
        "Location Post",
        "Photo Post",
        "Article Post"

    ];

    var typesId = [
        "Account",
        "Application",
        "t_892173921h12zz1328319",
        "Audio",
        "Badge",
        "t_892173921h12zz1328320",
        "Checkin",
        "Contact",
        "Context",
        "t_7ea9e1db966accdd139222c9d33202bc-804",
        "Event",
        "t_892173921h12zz1328321",
        "Game",
        "t_30f13a9ed5288a2d7960ede0a9157e28-981",
        "t_892173921h12zz1328322",
        "Nutrition",
        "Order",
        "t_7378a4f73b49482f2fe19f512ada1af1-1267",
        "t_892173921h12zz1328323",
        "t_892173921h12zz1328324",
        "Question",
        "Registeredapplication",
        "Route",
        "Service",
        "t_892173921h12zz1328325",
        "Sleep",
        "t_d25d6cb49f2226ab412057bce7ad9a99-735",
        "SocialToken",
        "Socialapp",
        "Status",
        "t_9f69b3afd7e3fcf9c15fdb0d150d1e5a-1331",
        "Video",
        "Workout",
        "t_08f64bf281f848387e0014e133f83b5e-590",
        "t_0d6f8e52d02625bb0bdea50044dd0302-485",
        "t_0f1acbc52b18e4f289cbb4fd5726d6d3-268",
        "t_0fbf34ea379f8703510356679f0523cc-384",
        "t_16cad6c574a2d32b58e87b5869ce6ed0-705",
        "t_1abc0b9d6939405281305b0a0c179ee8-601"
    ];


    //get manifest from OPENi

    //TEST: FIX IT
    var testAppPermJson = [
        {
            "trg": "app",
            "type": "type",
            "id": "t_08f64bf281f848387e0014e133f83b5e-590",
            "prm": ["CREATE", "READ"],
            "grnt": "grant"
        },
        {
            "trg": "app",
            "type": "type",
            "id": "t_0d6f8e52d02625bb0bdea50044dd0302-485",
            "prm": ["READ", "CREATE"],
            "grnt": "grant"
        },
        {
            "trg": "app",
            "type": "type",
            "id": "t_0f1acbc52b18e4f289cbb4fd5726d6d3-268",
            "prm": ["READ"],
            "grnt": "grant"
        },
        {
            "trg": "app",
            "type": "type",
            "id": "t_0fbf34ea379f8703510356679f0523cc-384",
            "prm": ["READ", "DELETE"],
            "grnt": "grant"
        },
        {
            "trg": "app",
            "type": "type",
            "id": "t_16cad6c574a2d32b58e87b5869ce6ed0-705",
            "prm": ["READ", "UPDATE"],
            "grnt": "grant"
        },
        {
            "trg": "app",
            "type": "type",
            "id": "t_1abc0b9d6939405281305b0a0c179ee8-601",
            "prm": ["UPDATE"],
            "grnt": "grant"
        }
    ];


    //save manifest at session for accept
    //req.session.accpt_prm = testAppPermJson;
    req.session.accpt_prm = testAppPermJson;

    //prepare html string based on manifest

    var app_perms = '';

    testAppPermJson.forEach(function (obj) {

        app_perms += ('<div class="contA">' +
        '<div style="font-weight: bold">' + typesName[typesId.indexOf(obj.id)] + '</div>' +
        '<div>Permission Types: ' + obj.prm + '</div>' +
        '</div>');

    });

    res.locals.session = req.session
    //send permissions page with permissions
    res.render('app_perm.ejs', {app_perms: app_perms})

});

/*==================*/
/* post login creds */
/*==================*/
router.post('/login', function (req, res, next) {
    // post authorization to openi

    var validated = false;

    //var tok = jwt.decode(req.session.authtoken, seckeyenc);
    var tok = jwt.decode(req.session.authtoken, seckeyenc);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
            validated = true;
        }
    }
    //proceed only if validated
    if (validated) {
        //get session token from OPENi
        var path = "/api/v1/auth/authorizations";

        //var data = {
        //    "username": req.body.username,
        //    "password": req.body.password,
        //    "api_key": req.session.api_key,
        //    "secret": req.session.secret
        //};

        var data = {
            "username": req.body.username,
            "password": req.body.password,
            "api_key": req.session.api_key,
            "secret": req.session.secret
        };

        //var redurl = req.session.redURL;

        var redurl = req.session.redURL;


        //console.log(data);

        postScript("POST", data, path, null, function (datat) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error
            if (typeof datat.error == 'undefined') {
                var nexttt = redurl + "?OUST=" + datat.session;
                res.send(nexttt);
            } else {
                res.send(datat.error);
            }
        }, function () {

            res.status(500).send('OPENi internal error');
        });
    } else {
        //jwt auth failed
        res.status(401).send('Authentication failed')
    }
});

/*================*/
/* register creds */
/*================*/
router.post('/create', function (req, res, next) {
    // post authorization to openi
    //Validate first with jwt key
    console.log(req.sessionID)
    console.log("\n\n")
    //sess = req.session;

    var validated = false;
    //var tok = jwt.decode(req.session.authtoken, seckeyenc);
    var tok = jwt.decode(req.session.authtoken, seckeyenc);

    //console.log(tok);

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
            if (typeof dat.error != 'undefined') {
                res.send(dat.error);
            } else {

                //var data2 = {
                //    "username": req.body.username,
                //    "password": req.body.password,
                //    "api_key": req.session.api_key,
                //    "secret": req.session.secret
                //};

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

                        var redlink = "http://127.0.0.1:3000/auth/permissions";

                        //req.session.token = data3.session;
                        req.session.token = data3.session;

                        var nexttt = redlink;
                        //res.redirect('/auth/permissions');
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
});

/*================*/
/* register accept permissions */
/*================*/
router.post('/accept', function (req, res, next) {
    // post permissions to openi

    //first step: validate token
    console.log(req.sessionID)
    console.log("\n\n")
    var validated = false;

    //sess = req.session;

    var tok = jwt.decode(req.session.authtoken, seckeyenc);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
            validated = true;
        }
    }

    //proceed only if validated
    if (validated) {

        var path = "/api/v1/permissions";

        //prepare the data to send to OPENi
        var data = [];

        req.session.accpt_prm.forEach(function (obj) {

            obj.prm.forEach(function (obj2) {

                var data_i =
                {
                    "type": obj.type,
                    "ref": obj.id,
                    "access_type": obj2,
                    "access_level": obj.trg
                };
                data.push(data_i);
            });
        });

        //console.log(data);

        var redurl = req.session.redURL;
        var toki = req.session.token;

        var headi = {
            "Authorization": toki
        };

        postScript("POST", data, path, headi, function (datat) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error
            if (typeof datat.error == 'undefined') {
                var nexttt = redurl + "?OUST=" + toki;
                res.send(nexttt);
            } else {
                res.send(datat.error);
            }
        }, function () {
            res.status(500).send('OPENi Internal error: accepting permissions failed');
        });
    } else {
        //jwt auth failed
        res.status(401).send('Authentication failed')
    }
});


/*================*/
/* register decline permissions */
/*================*/
router.post('/cancel', function (req, res, next) {

    //first step: validate token
    console.log(req.sessionID)
    console.log("\n\n")
    var validated = false;

    var tok = jwt.decode(req.session.authtoken, seckeyenc);

    if (tok.hasOwnProperty("ip")) {
        if (tok.ip == req.connection.remoteAddress) {
            validated = true;
        }
    }

    //proceed only if validated
    if (validated) {

        var linkg = req.session.redURL + "?OUST=" + req.session.token + "?ERROR=error_permissions";
        res.send(linkg);

    }
});


module.exports = router;
