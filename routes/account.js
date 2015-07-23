var jwt        = require('jwt-simple');
var postScript = require('./postScript');

var extractPermissions = function (req) {
    var b64 = req.query.appPerms;
    if (undefined === b64) {
        return {}
    }
    var perms = new Buffer(b64, 'base64');
    return perms.toString('utf-8')
};


var arrEq = function(a, b){

   if (a.length !== b.length){
      return false
   }

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


/*================*/
/* GET home page. */
/*================*/
module.exports = function(cmd_args) {

   return function (req, res, next) {

      var seckeyenc = cmd_args.seckeyenc

      req.session.api_key = req.query.api_key;
      req.session.secret  = req.query.secret;
      req.session.redURL  = req.query.redirectURL;

      var payload = {
         ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };

      req.session.authtoken = jwt.encode(payload, seckeyenc);

      if (req.session.token === undefined) {
         res.render("peat_account")
      }
      else {
         //console.log("account.js", "req.session.token", req.session.token );

         var headi = {"Authorization": req.session.token};

         postScript("GET", 8443, {}, "/api/v1/permissions/" + req.query.api_key, headi, function (user_app_perms) {
            //success: send url so that client redirects
            // redirect to redirectURI only if there is no error

            //console.log("account.js", "user_app_perms", user_app_perms );

            var path = "/api/v1/app_permissions_latest/" + req.query.api_key;

            postScript("GET", 8443, {}, path, headi, function (app_perms) {

               if (undefined === app_perms || undefined === app_perms.result || undefined === app_perms.result[0] ) {
                  //console.log("account.js", "1" );
                  res.status(500).send('Internal error: permission not set for this app.');
                  return;
               }

               var app_perms = app_perms.result[0]

               req.session.appPerms = app_perms

               if (app_perms.hasOwnProperty("permissions")) {
                  //console.log("account.js", "2" );
                  //req.session.appPermJson = JSON.parse(new Buffer(req.query.appPerms, 'base64').toString('utf8'));
                  if (arrEq(user_app_perms, app_perms["permissions"])) {
                     res.redirect(req.query.redirectURL + '?OUST=' + req.session.token);
                  }
                  else {
                     res.render("peat_account");
                  }

               }
               else {
                  //console.log("account.js", "5" );
                  res.status(500).send('Internal error: getting app permissions  failed');
               }

            }, function () {
               //console.log("account.js", "6" );
               res.status(500).send('Internal error: getting app permissions  failed');
            });

         }, function () {
            //console.log("account.js", "7" );
            res.status(500).send('Internal error: checking accepted permissions  failed');
         });
      }
   }
};