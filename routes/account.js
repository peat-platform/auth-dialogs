var jwt = require('jwt-simple');
var postScript = require('./postScript');
var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


var extractPermissions = function (req) {

    var b64 = req.query.appPerms;
    if (undefined === b64) {
        return {}
    }
    var perms = new Buffer(b64, 'base64');
    return perms.toString('utf-8')
};

function comparePermissions(totalperms, appperms) {

    var same = true;
    var bigstring = JSON.stringify(totalperms);
    var smallstring = '';
    console.log(bigstring);
    console.log(JSON.stringify(appperms[0]));
    for (var key in appperms) {

        console.log(appperms[key]);
        smallstring = JSON.stringify(appperms[key]);
        console.log(smallstring);
        if (bigstring.indexOf(smallstring) == -1) {
            same = false;
            break;
        }
    }
    return same;
}


/*================*/
/* GET home page. */
/*================*/
module.exports = function (req, res, next) {
    // save the api key, secret key and redirect URL to session

    console.log(req.sessionID);
    console.log("\n\n");
    req.session.api_key = req.query.api_key;
    req.session.secret = req.query.secret;
    req.session.redURL = req.query.redirectURL;

    //COMMENT OUT TO REVERT TO BASE 64 SOLUTION
    //req.session.appPerms = extractPermissions(req);

    var payload = {
        //ip: req.connection.remoteAddress
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    // encode token with the predefined secret key
    var token = jwt.encode(payload, seckeyenc);
    req.session.authtoken = token;

    if (typeof req.session.token != 'undefined') {

        var headi = {
            "Authorization": req.session.token
        };
        var path = "/api/v1/cloudlets";
        postScript("GET", {}, path, headi, function (datat) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error
            //console.log(datat);
            if (typeof datat['@id'] != 'undefined') {

                path = "/api/v1/permissions";
                postScript("GET", {}, path, headi, function (datat2) {
                    //success: send url so that client redirects
                    // redirect to redirectURI only if there is no error
                    console.log(datat2);
                    path = "/api/v1/app_permissions/" + req.session.api_key;
                    postScript("GET", {}, path, headi, function (datat3) {

                       var app_perms = datat3.result[datat3.result.length -1]
                        req.session.appPerms = app_perms;

                        if (undefined == app_perms){
                          res.status(500).send('OPENi Internal error: permission not set for this app.');
                        }
                        else if (req.session.appPerms.hasOwnProperty("permissions")) {
                            //req.session.appPermJson = JSON.parse(new Buffer(req.query.appPerms, 'base64').toString('utf8'));
                            if (comparePermissions(datat2, req.session.appPerms["permissions"])) {
                                var rdl = req.query.redirectURL + '?OUST=' + req.session.token;
                                res.redirect(rdl);
                            } else {
                                res.redirect('/auth/permsDenied')
                            }

                        } else {
                            res.status(500).send('OPENi Internal error: getting app permissions  failed');
                        }

                    }, function () {
                        res.status(500).send('OPENi Internal error: getting app permissions  failed');
                    });

                    //COMMENT OUT TO REVERT TO BASE 64
                    //if ( comparePermissions(datat2, JSON.parse(req.session.appPerms)) ) {
                    //    var rdl = req.query.redirectURL + '?OUST=' + req.session.token;
                    //    res.redirect(rdl);
                    //} else {
                    //    res.redirect('/auth/permissions')
                    //}
                }, function () {
                    res.status(500).send('OPENi Internal error: checking accepted permissions  failed');
                });

            } else {
                res.render("openi_account")
            }
        }, function () {
            res.status(500).send('OPENi Internal error: getting cloudlet id failed');
        });
    } else {
        res.render("openi_account")
    }
};