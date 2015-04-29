var deepEqual  = require('deep-equal');
var jwt2       = require('jsonwebtoken');
var jwt        = require('jwt-simple');
var postScript = require('./postScript');


var auth_server_public_key = '-----BEGIN PUBLIC KEY-----\n'+
'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
'-----END PUBLIC KEY-----';

var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


var checkPerms = function(req, res, next) {

   var redurl  = req.session.redURL;
   var path    = "/api/v1/permissions";

   var headers = {
      "Authorization": req.session.token
   };

   postScript("GET", {}, path, headers, function (resp_data) {

      path = "/api/v1/app_permissions/" + req.session.api_key;

      postScript("GET", {}, path, headers, function (datat3) {

         var app_perms = datat3.result[datat3.result.length -1]

         req.session.appPerms = app_perms;

         if (undefined == app_perms){
            res.status(500).send('OPENi Internal error: permission not set for this app.');
         }
         else if (deepEqual(resp_data, req.session.appPerms["permissions"])) {
            var nexttt = redurl + "?OUST=" + req.session.token;
            res.send(nexttt);
         }
         else {
            res.send('/auth/permissions');
         }
      }, function () {
         res.status(500).send('OPENi Internal error: getting app permissions  failed');
      });
   });
};


/*==================*/
/* post login creds */
/*==================*/
module.exports = function (req, res, next) {

   var validated = false;
   //var tok = jwt.decode(req.session.authtoken, seckeyenc);
   var tok = jwt.decode(req.session.authtoken, seckeyenc);

   if (tok.hasOwnProperty("ip")) {
      if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
         validated = true;
      }
   }

   //proceed only if validated
   if (validated) {
      //get session token from OPENi
      var path = "/api/v1/auth/authorizations";

      var data = {
         "username" : req.body.username,
         "password" : req.body.password,
         "api_key"  : req.session.api_key,
         "secret"   : req.session.secret
      };

      var redurl = req.session.redURL;

      postScript("POST", data, path, null, function (auth_endpoint_resp) {
         //success: send url so that client redirects
         // redirect to redirectURI only if there is no error

         if (auth_endpoint_resp.error === undefined) {

            jwt2.verify(auth_endpoint_resp.session, auth_server_public_key, function (err, token) {

               if (undefined !== err && null !== err) {
                  res.send(err);
               }
               else {
                  req.session.token = auth_endpoint_resp.session;
                  checkPerms(req, res, next);
               }
            });
         }
         else {
            if (auth_endpoint_resp.error === "Auth failed, check username, password, and api keys." ||
                        auth_endpoint_resp.error === "Error reading entity: Entity with that id does not exist" ){
               auth_endpoint_resp.error = "Login Failed, please try again.";
            }
            res.send(auth_endpoint_resp.error);
         }
      }, function () {

         res.status(500).send('OPENi internal error');
      });
   } else {
      //jwt auth failed
      res.status(401).send('Authentication failed')
   }
};