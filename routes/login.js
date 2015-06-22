var jwt2       = require('jsonwebtoken');
var jwt        = require('jwt-simple');
var postScript = require('./postScript');

var arrEq = function(a, b){
   var onlyInA = a.filter(function(current){
      return b.filter(function(current_b){
            var b = false;
            if (current_b.type === "service_enabler" ) {
               b = ( current_b.cloudlet == current.cloudlet &&  current_b.app_id == current.app_id )
            }
            else{
               b = ( current_b.access_type == current.access_type &&  current_b.access_level == current.access_level )
            }
            return current_b.ref == current.ref && current_b.type == current.type && b
         }).length == 0
   });

   var onlyInB = b.filter(function(current){
      return a.filter(function(current_a){
            var b = false;
            if (current_a.type === "service_enabler" ) {
               b = ( current_a.cloudlet == current.cloudlet &&  current_a.app_id == current.app_id )
            }
            else{
               b = ( current_a.access_type == current.access_type &&  current_a.access_level == current.access_level )
            }
            return current_a.ref == current.ref && current_a.type == current.type && b
         }).length == 0
   });

   var result = onlyInA.concat(onlyInB);

   return ( result.length === 0 ) ? true : false
}

var checkPerms = function(req, res, next) {

   var redurl  = req.session.redURL;
   var path    = "/api/v1/permissions/"+req.session.api_key;

   var headers = {
      "Authorization": req.session.token
   };

   postScript("GET", 8443, {}, path, headers, function (resp_data) {

      path = "/api/v1/app_permissions_latest/" + req.session.api_key;

      postScript("GET", 8443, {}, path, headers, function (datat3) {

         var app_perms = datat3.result[0]

         req.session.appPerms = app_perms;

         console.log("user_app_perms           ",   JSON.stringify(resp_data, null, 2))
         console.log("app_perms[\"permissions\"] ", JSON.stringify(app_perms["permissions"], null, 2))
         console.log("equals", arrEq(resp_data, app_perms["permissions"]))

         if (undefined == app_perms){
            res.status(500).send('Internal error: permission not set for this app.');
         }
         else if (arrEq(resp_data, req.session.appPerms["permissions"])) {
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


/*==================*/
/* post login creds */
/*==================*/
module.exports = function(cmd_args) {

   return function (req, res, next) {

      var validated              = false;
      var seckeyenc              = cmd_args.seckeyenc
      var auth_server_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n")

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
            "username": req.body.username,
            "password": req.body.password,
            "api_key" : req.session.api_key,
            "secret"  : req.session.secret
         };

         postScript("POST", 443, data, path, null, function (auth_endpoint_resp) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error

            if (auth_endpoint_resp.error === undefined) {

               jwt2.verify(auth_endpoint_resp.session, auth_server_public_key, function (err, token) {

                  if (undefined !== err && null !== err) {
                     console.log(err)
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

            res.status(500).send('Internal error');
         });
      }
      else {
         //jwt auth failed
         res.status(401).send('Authentication failed')
      }
   }
};