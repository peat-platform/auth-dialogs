var jwt        = require('jwt-simple');
var jwt2       = require('jsonwebtoken');
var postScript = require('./postScript');
var deepEqual  = require('deep-equal');

var checkPerms = function(req, res, next) {

   var redurl  = req.session.redURL;
   var path    = "/api/v1/permissions";

   var headers = {
      "Authorization": req.session.token
   };

   postScript("GET", {}, path, headers, function (resp_data) {

      path = "/api/v1/app_permissions_latest/" + req.session.api_key;

      postScript("GET", {}, path, headers, function (datat3) {
         var app_perms = datat3.result[0]

         req.session.appPerms = app_perms;

         if (undefined === app_perms){
            res.status(500).send('Internal error: permission not set for this app.');
         }
         else if (deepEqual(resp_data, req.session.appPerms["permissions"])) {
            var nexttt = redurl + "?OUST=" + req.session.token;
            res.send(nexttt);
         }
         else {
            res.send('/auth/permissions');
         }
      }, function () {
         res.status(500).send('Internal error: getting app permissions  failed');
      });
   });
};


module.exports = function(cmd_args) {

   var seckeyenc              = cmd_args.seckeyenc
   var auth_server_public_key = cmd_args.auth_server_public_key

   return function (req, res, next) {
      // post authorization to openi
      //Validate first with jwt key
      //console.log(req.sessionID);
      //console.log("\n\n");
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
            }
            else {
               var data2 = {
                  "username": req.body.username,
                  "password": req.body.password,
                  "api_key" : req.session.api_key,
                  "secret"  : req.session.secret
               };
               postScript("POST", data2, path2, null, function (auth_endpoint_resp) {
                  if (auth_endpoint_resp.error === undefined) {

                     jwt2.verify(auth_endpoint_resp.session, auth_server_public_key, function (err, token) {

                        if (undefined !== err && null !== err) {
                           res.status(500).send(err);
                        }
                        else {
                           req.session.token = auth_endpoint_resp.session;
                           checkPerms(req, res, next);
                        }
                     });
                  }
                  else {
                     if (auth_endpoint_resp.error === "Auth failed, check username, password, and api keys." ||
                        auth_endpoint_resp.error === "Error reading entity: Entity with that id does not exist") {
                        auth_endpoint_resp.error = "Login Failed, please try again.";
                     }
                     res.status(500).send(auth_endpoint_resp.error);
                  }
               }, function () {
                  res.status(500).send('Internal error: session token generation failed');
               });
            }
         }, function (e) {
            //error;
            console.log("error", e);
            res.status(500).send('Internal error: register failed');
         });
      }
      else {
         // jwt auth failed
         res.status(401).send('Authentication failed')
      }
   }
};