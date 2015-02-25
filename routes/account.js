
var jwt        = require('jwt-simple');
var postScript = require('./postScript')
var seckeyenc  = 'oMF81IOFsZ0bvzSdcBVr';


var extractPermissions = function(req){

   var b64   = req.query.appPerms

   if (undefined === b64){
      return {}
   }

   var perms = new Buffer(b64, 'base64');

   return perms.toString('utf-8')
}


/*================*/
/* GET home page. */
/*================*/
module.exports = function (req, res, next) {
   // save the api key, secret key and redirect URL to session


   req.session.api_key  = req.query.api_key;
   req.session.secret   = req.query.secret;
   req.session.redURL   = req.query.redirectURL;
   req.session.appPerms = extractPermissions(req);

   var payload = {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
   };
   // encode token with the predefined secret key
   var token             = jwt.encode(payload, seckeyenc);
   req.session.authtoken = token;


   if (typeof req.session.token != 'undefined') {

      var headi = {
         "Authorization": req.session.token
      };
      var path = "/api/v1/cloudlets";
      postScript("GET", {}, path, headi, function (datat) {
         //success: send url so that client redirects
         // redirect to redirectURI only if there is no error
         if (typeof datat['@id'] != 'undefined') {

            if (req.session.accept) {
               var rdl = req.query.redirectURL + '?OUST=' + req.session.token;
               res.redirect(rdl);
            } else {
               var linkg = req.session.redURL + "?OUST=" + req.session.token + "?ERROR=error_permissions";
               res.redirect('/auth/permissions');

            }
         } else {
            res.render("openi_account")
         }
      }, function () {
         res.status(500).send('OPENi Internal error: getting cloudlet id failed');
      });
   } else {
      res.render("openi_account")
   }
}