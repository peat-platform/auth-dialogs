var deepEqual  = require('deep-equal')
var jwt        = require('jsonwebtoken');
var jwt2       = require('jwt-simple');
var postScript = require('./postScript')


var auth_server_public_key = '-----BEGIN PUBLIC KEY-----\n'+
'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
'-----END PUBLIC KEY-----'

var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


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
         res.send('https://' + req.headers.host + '/auth/permissions?OUST=OUST'); // TODO: redirect to permissions page in order to accept/deny again???
      }

   });

}


/*==================*/
/* post login creds */
/*==================*/
module.exports = function (req, res, next) {

   var validated = false;

   //auth-dialog app internal method of verifying source. Not to be
   //confused with auth frameworks jwt
   var tok = jwt2.decode(req.session.authtoken, seckeyenc);


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

      postScript("POST", data, path, null, function (datat) {
         //success: send url so that client redirects
         // redirect to redirectURI only if there is no error

         if (typeof datat.error === 'undefined') {

            jwt.verify(datat.session, auth_server_public_key, function(err, token) {

               if (undefined !== err && null !== err){
                  res.send(err);
               }
               else {
                  req.session.token = datat.session;
                  checkPerms(req, res, next)
               }
            });
         }
         else {
            res.send(datat.error);
         }
      },
         function () {
         console.log("asdasdasd")
         res.status(500).send('OPENi internal error');
      });
   }
   else {
      //jwt auth failed
      res.status(401).send('Authentication failed')
   }
}