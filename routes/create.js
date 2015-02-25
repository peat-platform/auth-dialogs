
var jwt        = require('jwt-simple');
var postScript = require('./postScript')
var login      = require('./login');
var seckeyenc  = 'oMF81IOFsZ0bvzSdcBVr';


var checkPerms = function(req, res, next){

   var redurl = req.session.redURL;
   var path   = "/api/v1/permissions";

   var headers = {
      "Authorization": req.session.token
   };

   postScript("GET", {}, path, headers, function (resp_data) {

      var newPerms = req.session.appPerms

      if (deepEqual(resp_data, newPerms)){
         var nexttt = redurl + "?OUST=" + req.session.token;
         res.send(nexttt);
      }
      else{
         res.send('https://' + req.headers.host + '/auth/permissions?OUST=OUST')
      }

   });

}


module.exports = function (req, res, next) {
   // post authorization to openi
   //Validate first with jwt key
   console.log(req.sessionID);
   console.log("\n\n");
   //sess = req.session;

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

      var data = {
         "username": req.body.username,
         "password": req.body.password
      };

      postScript("POST", data, path1, null, function (dat) {
         //success
         if (typeof dat.error != 'undefined') {
            res.send(dat.error);
         } else {
            login(req, res, next)
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
}