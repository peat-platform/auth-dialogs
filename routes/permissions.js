var postScript = require('./postScript');


function getTypes2(dat, callback) {

    var types = {};
    console.log("yea");
    dat.forEach(function (obj) {
        var name = obj['@reference'];
        var id = obj['@id'];
        name = name.replace('_post', '');
        types[id] = name;
    });
    callback(types);
}


/*======================*/
/* get permissions page */
/*======================*/
module.exports = function (req, res, next) {

    //ID - name match for proper view
    console.log(req.sessionID);
    console.log("\n\n");
    var headi = {
        "Authorization": req.session.token
    };
    var path = "/api/v1/app_permissions/" + req.session.api_key;
    postScript("GET", {}, path, headi, function (datat3) {

        var app_perms = datat3.result[0]
        req.session.appPerms = app_perms;

        if (undefined == app_perms){
           res.status(500).send('OPENi Internal error: permission not set for this app.');
        }
        else if (req.session.appPerms.hasOwnProperty("permissions") ) {

            var testAppPermJson = req.session.appPerms.permissions;
            //prepare html string based on manifest
            var app_perms = '';
            var showjson = {};
            //USE getTypes for BASE 64
            
            if (req.session.appPerms.hasOwnProperty("types")) {

                getTypes2(req.session.appPerms.types, function (names) {

                    console.log('Got');
                    console.log(names);
                    console.log(testAppPermJson);

                    testAppPermJson.forEach(function (obj) {

                        console.log(obj.id);
                        var idaki = names[obj.ref];
                        console.log(idaki);

                        if (typeof showjson[idaki] == 'undefined') {
                            showjson[idaki] = [];
                            showjson[idaki].push(obj.access_type);
                        } else {
                            showjson[idaki].push(obj.access_type);
                        }
                    });

                    for (var key in showjson) {
                        app_perms += ('<div class="contA">' +
                        '<div style="font-weight: bold">' + key + '</div>' +
                        '<div>Permission Types: ' + showjson[key].toString().replace(/,/g, ', ') + '</div>' +
                        '</div>');
                    }
                    res.render('app_perm.ejs', {app_perms: app_perms});
                    //res.send()
                });
            } else {
                res.status(500).send('OPENi Internal error: App Types not found');

            }
            

        } else {
            res.status(500).send('OPENi Internal error: App Permissions not found');

        }

    }, function () {
        res.status(500).send('OPENi Internal error: getting app permissions  failed');
    });
};
