
var postScript = require('./postScript')


/*======================*/
/* get permissions page */
/*======================*/
module.exports = function (req, res, next) {


   //before redirect we need to check permissions have been set for this user on this app.
   //check permissions endpoint user_key + app_key
   //also check other (client???) bucket and compare permissions version
   //if new permissions or permission don't exist open perms dialog view
   //else return to redirect.

   var headi = {
      "Authorization": req.session.token
   };
   var path = "/api/v1/app_permissions/" + req.session.api_key;
   postScript("GET", {}, path, headi, function (datat) {

      var newPerms = datat.result[0]
      req.session.appPerms = newPerms.permissions

      res.render('app_perm.ejs', {app_perms: newPerms, app_perms_string: JSON.stringify(newPerms)})

   });

};
