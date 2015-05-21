/**
 * Created by nstasinos on 7/10/2014.
 */


//
//  check register input
//
function onClickRegisterButton() {

    var username        = $(" #_openi_username").val();
    var password        = $(" #_openi_passwd").val();
    var confirmPassword = $(" #_openi_conf_passwd").val();
    var validated       = true;


    if (username === "") {

        if (password === "" && confirmPassword ==="") {
            custAlert("Please provide correct credentials");
            validated = false;
        } else {
            custAlert("User name is required");
            validated = false;
        }
    } else {
        if (password === "") {
            custAlert("Password is required");
            validated = false;
        } else {
            if (confirmPassword === "") {
                custAlert("Confirmation password is required");
                validated = false;
            } else {
                if (confirmPassword !== "" && password !== "") {
                    if (confirmPassword != password) {
                        custAlert("Passwords do not match");
                        validated = false;
                    }
                    else {
                        if ( !$("#accept-openi").is(':checked') ) {
                            custAlert("You must accept PEAT's terms and conditions");
                            validated = false
                        }
                    }
                }
            }
        }
    }


    if (validated) {
        createUser(username, password);
    }
}

//
//
//
function onClickLogInButton() {


    var username = $(" #login-username").val();
    var password = $(" #login-password").val();
    //var confirmPassword = confirmPasswordField.getValue();
    var validated = true;
    if (username === "") {
        custAlert("Please provide a username");
        validated = false;
    } else {
        if (password === "") {
            custAlert("Please provide a password");
            validated = false;

        }
    }
    if (validated) {

        loginUser(username, password);
    }
}

/*
 * Create User
 */
function createUser(username, password) {

    console.log("Creating cloudlet/user");

    var dt = {
        "username": username,
        "password": password
    };

    dt = JSON.stringify(dt);

    $.ajax({
        type: "POST",
        url: "/auth/create",
        contentType: "application/json",
        crossDomain: true,
        data: dt,
        success: function (res) {

           if (res.indexOf("/auth/permissions") !== -1) {
              window.open( res, "_self")
           }
           else if (res.indexOf("OUST") === -1) {
              custAlert(res);
           }
           else {
              window.open(res, "_self")
           }

            //if (res.indexOf("Error") != -1) {
            //
            //    if (res.indexOf("exists") !=-1){
            //        custAlert("An account with that username already exists! Please try another.");
            //    } else {
            //        custAlert(res);
            //
            //    }
            //}
            //else {
            //    window.location.href = "./permissions"
            //}

        },
        error: function (error) {
            console.log("failed with " + error.status);
        }
    });

}

/*
 *   Login User
 */
function loginUser(username, password) {

    var dt = {
        "username": username,
        "password": password
    };

    dt = JSON.stringify(dt);

    $.ajax({
        type: "POST",
        url: "/auth/login",
        contentType: "application/json",
        crossDomain: true,
        data: dt,
        success: function (res) {
           console.log("res ",  res);

            if (res.indexOf("/auth/permissions") !== -1) {
                window.open( res, "_self")
            }
            else if (res.indexOf("OUST") === -1) {
                custAlert(res);
            }
            else {
                window.open(res, "_self")
            }
        },
        error: function (error) {
           custAlert(error.responseText);
           console.log("failed with ",  error.responseText);
           console.log("failed with " + error.status);
        }
    });

}

function custAlert(text) {
    $(".custAlert").text("").text(text);
    $("#alertBtn").click()
}

function getURLparam(name) {
    if (name === (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)){
       return decodeURIComponent(name[1]);
    }
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false
    }
}


function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {
        // IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    }
    else {
        // Others
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


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
        while (c.charAt(0) === ' ') {
           c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
           return c.substring(name.length, c.length);
        }
    }
    return "";
}


$("#findMorePeat").click(function(){
   custAlert("PEAT is a secure web service that aims to give you better control over your " +
   "personal data. An app cannot view, change, or delete your data without your explicit permission." +
   "To view the data in your account just swipe to the right on any PEAT enabled application and " +
   "click on the 'OPEN DASHBOARD' button. This will open a portal to your PEAT account from which you " +
   "can view and control the access to your data.");
})