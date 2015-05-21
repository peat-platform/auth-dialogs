var postScript = require('./postScript');

var typePatternMatch         = new RegExp(/^t_[a-z0-9]{32}-[0-9]{1,10000}$/);

var isTypeId = function(path){

   return typePatternMatch.test(path);

};

function getTypes2(dat, callback) {

    var types = {};
    dat.forEach(function (obj) {
       if (null === obj){
          return;
       }
       types[obj["@reference"]] = obj
       types[obj["@id"]]        = obj
    });

    callback(types);
}


function getTopObj(dat, types, callback){

   dat.forEach(function (obj) {
      if (null === obj){
         return;
      }
      types[obj["@reference"]] = obj
      types[obj["@id"]]        = obj
   });


   //callback(types);
}

var aa = {
   "daily":[
      {
         "stream":[
            {
               "acc":[
                  "x",
                  "y",
                  "z"
               ]
            }
         ]
      }
   ]
}

var isArr = function(obj){
   return Object.prototype.toString.call( someVar ) === '[object Array]'
}

var isObj = function(obj){
   return typeof obj === 'object'
}


var objToHTML2 = function(obj){
   var html = "<ul>";
   for (var i in obj){
      var name = i;
      var val  = obj[i]
      html += "<li>" + name + "</li><ul>"
      for (var j = 0; j < val.length; j++){
         if (isObj(val[j])){
            html += objToHTML(val[j])
         }
         else{
            html += "<li>" + val[j] + "</li>"
         }
      }
      html += '</ul>'
   }
   html += "</ul>"
   return html
}


var objToHTML = function(val){
   var html = "";

   html += "<li>" + val["@reference"] + "</li><ul>"

   for (var j = 0; j < val["@context"].length; j++){
      if (isObj(val["@context"][j]['@data_type'])){
         html += objToHTML(val["@context"][j]['@data_type'])
      }
      else{
         html += "<li>" + val["@context"][j]['@context'] + "</li>"
      }
   }
   html += '</ul>'

   return html
}


//document.write(objToHTML(aa))

var typeHasSubType = function(type){
   for (var i = 0; i < type['@context'].length; i++){

      if ( isTypeId(type['@context'][i]['@data_type']) ){
         return true;
      }
   }
   return false;
}


var allSubTypesInProcessed = function(type, processed){
   for (var i = 0; i < type['@context'].length; i++){

      var primType = type['@context'][i]['@data_type']

      if (isTypeId(primType) && undefined === processed[primType]){
         return false
      }
   }
   return true;
}


var getProps = function(type){
   var props = []
   for (var i = 0; i < type['@context'].length; i++){
      props.push(type['@context'][i]['@context'])
   }
   return props;
}


var organiseTypes = function(types, showjson, key){

   var sanityCheck = 0;
   var processed   = {}

   var trucking = true;

   while (trucking && sanityCheck++ < 200){

      trucking = false;

      for (var name in types){

         if (!isTypeId(name)){
            delete types[name]
            continue;
         }

         var type = types[name]

         if (typeHasSubType(type)){
            trucking = true;
            if(allSubTypesInProcessed(type, processed)){
               for (var i = 0; i < type['@context'].length; i++){
                  var entry = type['@context'][i]
                  var cname = entry['@data_type']
                  if(isTypeId(cname)){
                     if (undefined !== processed[cname]){
                        types[name]['@context'][i]['@data_type'] = types[cname]
                        var id                                    = entry['@data_type']
                        delete types[cname]
                        delete showjson[cname]
                     }
                  }
               }
            }
         }
         else{
            processed[name] = getProps(type)
         }
      }
   }
}


var printObjectMembers = function(types, key){

   var html = "<ul>"

   for (var name in types) {
      if (key === name) {
         var type = types[name]
         html += objToHTML(type)
      }
   }

   html += "</ul>"

   return html
}

var extractMembers2 = function(type){

   var arr = []
   for(c in type['@context']){
      var entry = type['@context'][c];

      if (isTypeId(entry['@data_type'])){
         var n = entry['@context']
         var o = { n : ["a", "b", "c"] }
         arr.push(o)
      }
      else{
         arr.push(entry['@context'])
      }
   }

   return arr;
}

var extractMembers = function(type){

   var arr = []
   for(var c in type['@context']){
      var entry = type['@context'][c];
      arr.push(entry['@context'])
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

      postScript("GET", 8443, {}, path, headi, function (app_perms) {

         if (undefined === app_perms || undefined === app_perms.result || undefined === app_perms.result[0]) {
            res.status(500).send('Internal error: permission not set for this app.');
         }
         else if (app_perms.result[0].hasOwnProperty("permissions")) {

            var app_perms = app_perms.result[0]

            req.session.appPerms = app_perms;

            var testAppPermJson = req.session.appPerms.permissions;
            //prepare html string based on manifest
            var app_perms_html = '';
            var showjson  = {};
            var level     = {}
            //USE getTypes for BASE 64

            if (req.session.appPerms.hasOwnProperty("types")) {

               getTypes2(req.session.appPerms.types, function (typesById) {

                  testAppPermJson.forEach(function (obj) {

                     var type = typesById[obj.ref];

                     if (undefined === type){
                        return;
                     }

                     var name = type['@reference']

                     if (typeof showjson[type['@id']] == 'undefined') {
                        showjson[type['@id']]       = {};
                        showjson[type['@id']].name  = name
                        showjson[type['@id']].arr   = []
                        showjson[type['@id']].level = 'APP'
                     }

                     showjson[type['@id']].arr.push(obj.access_type);

                     if (showjson[type['@id']].level === 'APP') {
                        showjson[type['@id']].level = obj.access_level
                     }

                  });


                  organiseTypes(typesById, showjson)


                  for (var key in showjson) {
                     var entry = showjson[key]
                     app_perms_html += '<div class="contA"><div style="font-weight: bold">' + entry.name + '</div>';
                     app_perms_html += (('APP' === showjson[key].level) ? '' : '<div>This app wants access to data in your account that are created by other apps.</div>' )
                     app_perms_html += '<a class="moreDetails">More Details</a>';
                     app_perms_html += '<div class="permissionsDetails">' ;
                     app_perms_html += '"' + entry.name + '" data entries contain the following information: ';

                     //app_perms += organiseTypes(typesById, showjson, key)
                     app_perms_html += printObjectMembers(typesById, key)

                     app_perms_html += '<div class="type_access_requested">Type of access requested by this app:';
                     app_perms_html += '<div class="opts">';
                     for (var i =0; i < entry.arr.length; i++){
                        var accReq = entry.arr[i];
                        app_perms_html += '<input type="checkbox" name="perms" value="' + accReq + '" checked="checked"> ' + accReq + '<br/>';
                     }
                     app_perms_html += '</div></div>';

                     app_perms_html += '</div></div>';
                  }

                  var se_title = "<hr/><br/><br/><div class='acc_title'>This App uses the following additional services which depend on accessing the same data.</div>"

                  for (var i = 0; i < app_perms.permissions.length; i++){
                     var perm = app_perms.permissions[i]

                     if ('service_enabler' === perm.type){

                        if (se_title){
                           app_perms_html += se_title
                           se_title = false
                        }

                        for (var j =0; j < app_perms.service_enablers.length; j++){
                           var se = app_perms.service_enablers[j]

                           if (se.name === perm.ref){
                              app_perms_html += "<div class='contA'>"
                              app_perms_html += "<div style='font-weight: bold'><input type='checkbox' value='"+se.name+"' checked='checked'> " + se.name + "</div>"
                              app_perms_html += "<div class='permissionsDetails' style='display: block'>" + se.description + "</div>"
                              app_perms_html += "</div>"
                           }
                        }
                     }
                  }

                  res.render('app_perm.ejs', {app_perms: app_perms_html});
                  //res.send()
               });
            }
            else {
               res.status(500).send('Internal error: App Types not found');
            }
         }
         else {
            res.status(500).send('Internal error: App Permissions not found');
         }

      }, function () {
         res.status(500).send('Internal error: getting app permissions  failed');
      });
   }
};
