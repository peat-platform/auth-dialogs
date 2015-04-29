/**
 * Created by sspatharioti on 2/25/2015.
 */


var jwt        = require('jwt-simple');

module.exports = function(cmd_args) {

   return function (req, res, next) {

      var seckeyenc = cmd_args.seckeyenc

      //first step: validate token
      //console.log("permsDenied", req.sessionID);

      var validated = false;

      var tok = jwt.decode(req.session.authtoken, seckeyenc);

      if (tok.hasOwnProperty("ip")) {
         if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
            validated = true;
         }
      }

      //console.log("permsDenied", validated);

      //proceed only if validated
      if (validated) {
         var linkg = req.session.redURL + "?OUST=" + req.session.token + "&ERROR=error_permissions";

         //console.log("permsDenied", linkg);

         res.redirect(500, linkg);
      }
   }
};