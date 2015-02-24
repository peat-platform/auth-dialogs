
/**
 * Created by nstasinos on 5/10/2014.
 */

function getURLparam(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}


$(" #accept_permapp").click(function () {
    //window.location.replace(getCookie("redirectURI") + "?OUST=" + getCookie("jwt") );

    //for now we accept everything.
    var dt = {
        "all": 'yes'
    };
    dt = JSON.stringify(dt);

    $.ajax({
        type: "POST",
        url: "https://" + window.location.host + "/auth/accept",
        contentType: "application/json",
        crossDomain: true,
        data: dt,
        success: function (res) {

            if (res.indexOf("OUST") == -1) {
                custAlert(res);
            } else {
                window.open(res, "_self")
            }
        },
        error: function (error) {
            console.log("failed with " + error.status);
        }

    });

});


$(" #cancel_permapp").click(function () {

    $.ajax({
        type: "POST",
        url: "https://" + window.location.host + "/auth/cancel",
        contentType: "application/json",
        crossDomain: true,
        data: "",
        success: function (res) {

            if (res.indexOf("ERROR") != -1) {
                //custAlert("Warning: Permissions denied");
                window.open(res, "_self")
            } else {
                window.open(res, "_self")
            }
        },
        error: function (error) {
            console.log("failed with " + error.status);
        }
    });

});

function custAlert(text) {
    $(".custAlert").text("").text(text);
    $("#alertBtn").click()
}

// insert iframe for permissions in app

//$("#some_div").append('"<iframe src="app_perm.html" style="margin: auto;display: block;width: 50%;height: 100%;margin-top: 10%;margin-bottom: 10%;overflow: visible;border: none;></iframe>"');

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}