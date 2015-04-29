var postScript = require('./postScript');


function getTypes2(dat, callback) {

    var types = {};
    //console.log("yea");
    dat.forEach(function (obj) {
       types[obj["@reference"]] = obj
       types[obj["@id"]]        = obj
    });
    callback(types);
}


var extractMembers = function(type){
   var arr = []
   for(c in type['@context']){
      var entry = type['@context'][c];
      arr.push(entry['@property_name'])
   }

   return arr;
}


/*======================*/
/* get permissions page */
/*======================*/
module.exports = function(cmd_args) {

   return function (req, res, next) {

      //ID - name match for proper view
      var headi = {
         "Authorization": req.session.token
      };

      var path = "/api/v1/app_permissions_latest/" + req.session.api_key;

      postScript("GET", {}, path, headi, function (app_perms) {

         var app_perms = app_perms.result[0]
         req.session.appPerms = app_perms;

         if (undefined == app_perms) {
            res.status(500).send('OPENi Internal error: permission not set for this app.');
         }
         else if (req.session.appPerms.hasOwnProperty("permissions")) {

            var testAppPermJson = req.session.appPerms.permissions;
            //prepare html string based on manifest
            var app_perms = '';
            var showjson = {};
            var level = {}
            //USE getTypes for BASE 64

            if (req.session.appPerms.hasOwnProperty("types")) {

               getTypes2(req.session.appPerms.types, function (typesById) {


                  testAppPermJson.forEach(function (obj) {

                     //console.log("permissions.js", "obj", obj);
                     //console.log("permissions.js", "obj.ref", obj.ref);
                     //console.log("permissions.js", "typesById[obj.ref]", typesById[obj.ref]);

                     var type = typesById[obj.ref];

                     //console.log("permissions.js", type);

                     if (typeof showjson[type['@reference']] == 'undefined') {
                        showjson[type['@reference']] = [];
                     }
                     showjson[type['@reference']].push(obj.access_type);
                     if (undefined === level[type['@reference']] || level[type['@reference']] === 'APP') {
                        level[type['@reference']] = obj.access_level
                     }
                  });

                  for (var key in showjson) {
                     app_perms += ('<div class="contA">' +
                     '<div style="font-weight: bold">Your ' + key + ' data.</div>' +
                     '<a class="moreDetails">More Details</a>' +
                     '<div class="permissionsDetails">' +
                     '<div>Contains this information: ' + extractMembers(typesById[key]).join(', ') + '</div>' +
                     '<div>Type of Access Requested: ' + showjson[key].toString().replace(/,/g, ', ') + '</div>' +
                     (('APP' === level[key]) ? '<div>Access request limited to data created by this app.</div>' :
                        '<div>This app Requests access to data created by other apps.</div>' ) +
                     '</div>' +
                     '</div>');
                  }

                  //console.log(">> showjson", showjson)
                  //console.log(">>",          {app_perms: app_perms})

                  res.render('app_perm.ejs', {app_perms: app_perms});
                  //res.send()
               });
            }
            else {
               res.status(500).send('OPENi Internal error: App Types not found');

            }


         }
         else {
            res.status(500).send('OPENi Internal error: App Permissions not found');

         }

      }, function () {
         res.status(500).send('OPENi Internal error: getting app permissions  failed');
      });
   }
};
