var jwt = require('jwt-simple');

module.exports = function(cmd_args) {

   return function (req, res, next) {

      //first step: validate token
      //console.log(req.sessionID);
      //console.log("\n\n");
      var seckeyenc = cmd_args.seckeyenc
      var validated = false;
      var tok = jwt.decode(req.session.authtoken, seckeyenc);

      if (tok.hasOwnProperty("ip")) {
         if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
            validated = true;
         }
      }
      //proceed only if validated
      if (validated) {
         var linkg = req.session.redURL + "?OUST=" + req.session.token + "&ERROR=error_permissions";
         res.send(linkg);
      }
   }
};