var postScript = require('./postScript');
var jwt        = require('jwt-simple');

module.exports = function(cmd_args) {

   return function (req, res, next) {
      // post permissions to peat

      //first step: validate token
      //console.log(req.sessionID);
      //console.log("\n\n");
      var seckeyenc  = cmd_args.seckeyenc
      var validated  = false;
      var tok        = jwt.decode(req.session.authtoken, seckeyenc);

      if (tok.hasOwnProperty("ip")) {
         if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
            validated = true;
         }
      }
      //proceed only if validated
      if (validated) {

         var path = "/api/v1/permissions/"+req.session.api_key;
         //prepare the data to send to PEAT

         if (req.session.appPerms.hasOwnProperty("permissions")) {

            for (var i = 0; i < req.session.appPerms.permissions.length; i++){
               var perm = req.session.appPerms.permissions[i]

               if ('service_enabler' === perm.type){

                  for (var j =0; j < req.session.appPerms.service_enablers.length; j++){
                     var se = req.session.appPerms.service_enablers[j]

                     if (se.name === perm.ref){
                        req.session.appPerms.permissions[i].cloudlet = se.cloudlet
                     }
                  }
               }
            }

            var data   = req.session.appPerms.permissions;
            var redurl = req.session.redURL;
            var toki   = req.session.token;

            var headi  = {
               "Authorization": toki
            };

            postScript("POST", 8443, data, path, headi, function (data) {
               //success: send url so that client redirects
               // redirect to redirectURI only if there is no error

               if (typeof data.error == 'undefined') {
                  var nexttt = redurl + "?OUST=" + toki;
                  res.send(nexttt);
               }
               else {
                  res.send(data.error);
               }
            }, function () {
               res.status(500).send('Internal error: accepting permissions failed');
            });

         }
         else {

            res.status(500).send('Internal error: getting app permissions failed');

         }

      }
      else {
         //jwt auth failed
         res.status(401).send('Authentication failed')
      }
   }
};