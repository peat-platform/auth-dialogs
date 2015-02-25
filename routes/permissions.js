
var postScript = require('./postScript')



function getTypes(offset, callback) {

   var types = {};

   function recsrv(offset, callback2) {

      var path = "/api/v1/types?offset=" + offset;

      postScript("GET", {}, path, null, function (dat) {

         console.log("yea");
         dat.result.forEach(function (obj) {

            var name = obj['@reference'];
            var id = obj['@id'];
            name = name.replace('_post', '');
            types[id] = name;
         });
         var more = dat.meta.total_count >= 30;
         if (more) {
            recsrv(offset + 30,callback2);
         } else {
            callback2();
         }

      })

   }

   recsrv(0, function () {
      callback(types);

   });

}




/*======================*/
/* get permissions page */
/*======================*/
module.exports = function (req, res, next) {


   //before redirect we need to check permissions have been set for this user on this app.
   //check permissions endpoint user_key + app_key
   //also check other (client???) bucket and compare permissions version
   //if new permissions or permission don't exist open perms dialog view
   //else return to redirect.


   var newPerms = req.session.appPerms

   console.log("newPerms", newPerms)

   //prepare html string based on manifest

   var app_perms = '';
   var showjson, names = {};


   //for (var key in newPerms) {
   //
   //   app_perms += ('<div class="contA">' +
   //   '<div style="font-weight: bold">' + key + '</div>' +
   //   '<div>Permission Types: ' + showjson[key].toString().replace(/,/g,', ') + '</div>' +
   //   '</div>');
   //
   //}

   //res.locals.session = req.session;
   //send permissions page with permissions
   res.render('app_perm.ejs', {app_perms: newPerms})



}