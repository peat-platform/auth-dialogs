var jwt        = require('jwt-simple');
var postScript = require('./postScript');
var deepEqual  = require('deep-equal');

var extractPermissions = function (req) {
    var b64 = req.query.appPerms;
    if (undefined === b64) {
        return {}
    }
    var perms = new Buffer(b64, 'base64');
    return perms.toString('utf-8')
};


/*================*/
/* GET home page. */
/*================*/
module.exports = function(cmd_args) {

   return function (req, res, next) {

      var seckeyenc = cmd_args.seckeyenc

      req.session.api_key = req.query.api_key;
      req.session.secret = req.query.secret;
      req.session.redURL = req.query.redirectURL;

      //COMMENT OUT TO REVERT TO BASE 64 SOLUTION
      //req.session.appPerms = extractPermissions(req);

      var payload = {
         //ip: req.connection.remoteAddress
         ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };

      // encode token with the predefined secret key
      req.session.authtoken = jwt.encode(payload, seckeyenc);

      if (req.session.token === undefined) {
         //console.log("account.js", "10" );
         res.render("openi_account")
      }
      else {
         //console.log("account.js", "req.session.token", req.session.token );

         var headi = {"Authorization": req.session.token};

         postScript("GET", {}, "/api/v1/permissions", headi, function (user_app_perms) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error

            //console.log("account.js", "user_app_perms", user_app_perms );

            var path = "/api/v1/app_permissions_latest/" + req.session.api_key;

            postScript("GET", {}, path, headi, function (app_perms) {

               //console.log("account.js", "app_perms", app_perms );

               if (undefined === app_perms || undefined == app_perms.result) {
                  //console.log("account.js", "1" );
                  res.status(500).send('OPENi Internal error: permission not set for this app.');
                  return;
               }

               var app_perms = app_perms.result[0]

               if (app_perms.hasOwnProperty("permissions")) {
                  //console.log("account.js", "2" );
                  //req.session.appPermJson = JSON.parse(new Buffer(req.query.appPerms, 'base64').toString('utf8'));
                  if (deepEqual(user_app_perms, app_perms["permissions"])) {
                     //console.log("account.js", "3" );
                     res.redirect(req.query.redirectURL + '?OUST=' + req.session.token);
                  }
                  else {
                     res.render("openi_account");
                     ////console.log("account.js", "4" );
                     //res.redirect('/auth/permsDenied')
                  }

               }
               else {
                  //console.log("account.js", "5" );
                  res.status(500).send('OPENi Internal error: getting app permissions  failed');
               }

            }, function () {
               //console.log("account.js", "6" );
               res.status(500).send('OPENi Internal error: getting app permissions  failed');
            });

         }, function () {
            //console.log("account.js", "7" );
            res.status(500).send('OPENi Internal error: checking accepted permissions  failed');
         });
      }
   }
};