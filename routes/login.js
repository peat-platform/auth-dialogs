var deepEqual  = require('deep-equal');
var jwt2        = require('jsonwebtoken');
var jwt       = require('jwt-simple');
var postScript = require('./postScript');


var auth_server_public_key = '-----BEGIN PUBLIC KEY-----\n'+
'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
'-----END PUBLIC KEY-----';

var seckeyenc = 'oMF81IOFsZ0bvzSdcBVr';


var checkPerms = function(req, res, next) {

   var redurl = req.session.redURL;
   var path = "/api/v1/permissions";
   var headers = {
      "Authorization": req.session.token
   };

   postScript("GET", {}, path, headers, function (resp_data) {

      path = "/api/v1/app_permissions/" + req.session.api_key;
      postScript("GET", {}, path, headers, function (datat3) {
         req.session.appPerms = datat3.result[0];
         if (deepEqual(resp_data, req.session.appPerms["permissions"])) {
            var nexttt = redurl + "?OUST=" + req.session.token;
            res.send(nexttt);
         }
         else {
            //res.send('https://' + req.headers.host + '/auth/permissions?OUST=OUST'); // TODO: redirect to permissions page in order to accept/deny again???
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
         "username": req.body.username,
         "password": req.body.password,
         "api_key": req.session.api_key,
         "secret": req.session.secret
      };
      var redurl = req.session.redURL;
      postScript("POST", data, path, null, function (datat) {
         //success: send url so that client redirects
         // redirect to redirectURI only if there is no error

         if (typeof datat.error === 'undefined') {

            jwt2.verify(datat.session, auth_server_public_key, function (err, token) {

               if (undefined !== err && null !== err) {
                  res.send(err);
               }
               else {
                  req.session.token = datat.session;
                  checkPerms(req, res, next);

                  // path = "/api/v1/permissions";
                  //var headi = {
                  //    "Authorization": req.session.token
                  //};
                  //
                  //postScript("GET", {}, path, headi, function (datat2) {
                  //    //success: send url so that client redirects
                  //    // redirect to redirectURI only if there is no error
                  //    console.log(datat2);
                  //
                  //    if ( comparePermissions(datat2, JSON.parse(req.session.appPerms)) ) {
                  //        var rdl = req.query.redirectURL + '?OUST=' + req.session.token;
                  //        res.redirect(rdl);
                  //    } else {
                  //        res.redirect('/auth/permsDenied');
                  //        //res.redirect('/auth/permissions');
                  //
                  //    }
                  //}, function () {
                  //    res.status(500).send('OPENi Internal error: checking accepted permissions  failed');
                  //});
               }
            });
         }
         else {
            res.send(datat.error);
         }
      }, function () {

         res.status(500).send('OPENi internal error');
      });
   } else {
      //jwt auth failed
      res.status(401).send('Authentication failed')
   }
};