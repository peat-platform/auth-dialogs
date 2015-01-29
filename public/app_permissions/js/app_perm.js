/**
 * Created by nstasinos on 5/10/2014.
 */

function getURLparam(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

if (!(getURLparam("jwt") == null)) {
    var jwt = getURLparam("jwt")
    setCookie("jwt",jwt,1)
}
else {
    alert("No jwt!")
}

var typesName = [   "Account",
                    "Application",
                    "Article",
                    "Audio",
                    "Badge",
                    "Card",
                    "Checkin",
                    "Contact",
                    "Context",
                    "Device",
                    "Event",
                    "File",
                    "Game",
                    "Measurement",
                    "Note",
                    "Nutrition",
                    "Order",
                    "Photo",
                    "Place",
                    "Product",
                    "Question",
                    "Registeredapplication",
                    "Route",
                    "Service",
                    "Shop",
                    "Sleep",
                    "SocialAccount",
                    "SocialToken",
                    "Socialapp",
                    "Status",
                    "User",
                    "Video",
                    "Workout"
             ];

var typesId = [
                    "Account",
                    "Application",
                    "t_892173921h12zz1328319",
                    "Audio",
                    "Badge",
                    "t_892173921h12zz1328320",
                    "Checkin",
                    "Contact",
                    "Context",
                    "t_7ea9e1db966accdd139222c9d33202bc-804",
                    "Event",
                    "t_892173921h12zz1328321",
                    "Game",
                    "t_30f13a9ed5288a2d7960ede0a9157e28-981",
                    "t_892173921h12zz1328322",
                    "Nutrition",
                    "Order",
                    "t_7378a4f73b49482f2fe19f512ada1af1-1267",
                    "t_892173921h12zz1328323",
                    "t_892173921h12zz1328324",
                    "Question",
                    "Registeredapplication",
                    "Route",
                    "Service",
                    "t_892173921h12zz1328325",
                    "Sleep",
                    "t_d25d6cb49f2226ab412057bce7ad9a99-735",
                    "SocialToken",
                    "Socialapp",
                    "Status",
                    "t_9f69b3afd7e3fcf9c15fdb0d150d1e5a-1331",
                    "Video",
                    "Workout"
];



// .indexOf("arrayElementValue")
// ({"trg": "app", "type": "type", "id": "t_892173921h12zz1328319", "prm": ["read"], "grnt": "grant"})
// ({"trg": "acc", "type": "object", "id": "o_324243252", "prm": ["create", "read", "write", "delete"], "grnt": "deny"})

var testAppPermJson = [
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328319", "prm": ["read","write"], "grnt": "grant"},
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328320", "prm": ["read","create"], "grnt": "grant"},
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328321", "prm": ["read"], "grnt": "grant"},
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328322", "prm": ["read","delete"], "grnt": "grant"},
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328323", "prm": ["read","write"], "grnt": "grant"},
    {"trg": "app", "type": "type", "id": "t_892173921h12zz1328324", "prm": ["write"], "grnt": "grant"}
];

testAppPermJson.forEach(function(obj){

   $("#permCont").append('<div class="contA">'+
       '<div style="font-weight: bold">'+ typesName[typesId.indexOf(obj.id)] +'</div>'+
       '<div>Permission Types: '+ obj.prm +'</div>'+
       '</div>');

});

$(" #accept_permapp").click(function(){
    window.location.replace(getCookie("redirectURI") + "?OUST=" + getCookie("jwt") );
});
// insert iframe for permissions in app

//$("#some_div").append('"<iframe src="app_perm.html" style="margin: auto;display: block;width: 50%;height: 100%;margin-top: 10%;margin-bottom: 10%;overflow: visible;border: none;></iframe>"');

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}