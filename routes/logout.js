var jwt       = require('jwt-simple');

module.exports = function(cmd_args) {

   return function (req, res, next) {

      var seckeyenc = cmd_args.seckeyenc
      //console.log(req.sessionID);
      //console.log("\n\n");
      var validated = false;
      if (typeof req.session.authtoken != "undefined") {

         var tok = jwt.decode(req.session.authtoken, seckeyenc);
         if (tok.hasOwnProperty("ip")) {
            if (tok.ip == req.headers['x-forwarded-for'] || req.connection.remoteAddress) {
               validated = true;
            }
         }
      }
      else {
         res.status(401).send('Authentication failed')
      }
      //proceed only if validated
      if (validated) {

         var link = req.session.redURL;
         req.session.destroy();
         res.render('logout.ejs', {link: link});

      }
   }
};