/**
 * Created by nstasinos on 7/10/2014.
 */

//var urlServer = "https://"+window.location.host+"/api-spec/v1"; //"https://"+window.location.host+"/api-spec/v1/cloudlet";
//
//if (!(getURLparam("api_key") == null)) {
//    var api_key = getURLparam("api_key")
//}
//else {
//    custAlert("No api_key!")
//}
//
//if (!(getURLparam("secret") == null)) {
//    var secret = getURLparam("secret")
//}
//else {
//    custAlert("No secret key!")
//}
//
//if (!(getURLparam("redirectURI") == null)) {
//    var redirectURI = getURLparam("redirectURI");
//    setCookie("redirectURI", redirectURI,1);
//}
//else {
//    custAlert("No redirectURI!")
//}
//
///*if (!(getURLparam("redirectDomain") == null)) {
//    var redirectDomain = getURLparam("redirectDomain");
//    setCookie("redirectDomain", redirectDomain, 1);
//}
//else {
//    custAlert("No redirectDomain!")
//}*/
//
//// Swagger JS
//loadScript("https://"+window.location.host+"/api-docs/lib/shred.bundle.js", function () {
//    loadScript("https://"+window.location.host+"/api-docs/lib/swagger.js", function () {
//        initSwagger(function () {
//            $(" #btn-signup").click(function () {
//                if (!(getURLparam("api_key") == null)) {
//                    if ($("#accept-openi").is(':checked')) {
//                        onClickRegisterButton()
//                    }
//                    else {
//                        custAlert("Please allow OPENi to create your Cloudlet")
//                    }
//                }
//                else {
//                    custAlert("No api_key!")
//                }
//
//            });
//            $(" #btn-login").click(function(){
//                if (!(getURLparam("api_key") == null)) {
//                        onClickLogInButton()
//                }
//                else {
//                    custAlert("No api_key!")
//                }
//            })
//        })
//    });
//});
//
//function initSwagger(success) {
//    window.swagger = new SwaggerApi({
//        url: urlServer,
//        success: function () {
//            if (swagger.ready === true) {
//                console.log("swagger is ready");
//                success();
//            } else {
//                console.log("swagger is not ready");
//            }
//        },
//        failure: function () {
//            console.log("Failure initiating swaggerApi");
//            //custAlert("Failure initiating swaggerApi");
//        }
//    });
//}

//
//  check register input
//
function onClickRegisterButton() {

    var username = $(" #_openi_username").val();
    var password = $(" #_openi_passwd").val();
    var confirmPassword = $(" #_openi_conf_passwd").val();
    var validated = true;


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
                if (confirmPassword != "" && password != "") {
                    if (confirmPassword != password) {
                        custAlert("Passwords do not match");
                        validated = false;
                    } else {
                        if (!$("#accept-openi").is(':checked')) {
                            custAlert("You must accept OPENi permissions");
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
        custAlert("Please provide correct credentials");
        validated = false;
    } else {
        if (password === "") {
            custAlert("Please provide correct credentials");
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
    //var json = JSON.stringify({
    //    "username": username,
    //    "password": password
    //});
    //
    //console.log(json);
    //if (isValidJSON(json)) {
    //    swagger.apis.simple_auth.createUser({
    //        body: json
    //    }, function (response) {
    //        console.log(response);
    //        if (response.status == 201) {
    //            //console.log("Cloudlet created successfully.");
    //            var json = JSON.stringify({
    //                "username": username,
    //                "password": password,
    //                "api_key": api_key,
    //                "secret": secret
    //            });
    //
    //            swagger.apis.simple_auth.getAuthToken({
    //                body: json
    //            }, function (response) {
    //
    //                        console.log(response);
    //                        var data = JSON.parse(response.data);
    //                        var token = data.session;
    //                        setCookie("token",token,1);
    //                        window.location.replace("../app_permissions/app_perm.html?jwt="+token);
    //
    //                        /*
    //                        var json = JSON.stringify({
    //                            "token": token
    //                        });
    //                        window.authorizations.add("key", new ApiKeyAuthorization("Authorization", token, "header"));
    //                        swagger.apis.cloudlets.getCloudletId({
    //                        }, function (response) {
    //
    //                            console.log(response);
    //                            var data = JSON.parse(response.data);
    //                            var cloudletId = data.id;
    //                            //window.localStorage.setItem("cloudletId", cloudletId); // c_9414cbdc83691c35921f15fef48de54b-90
    //                            console.log("cloudletId: " + cloudletId);
    //                            //return {"token":token, "cloudletId":cloudletId}
    //                            window.location.replace(redirectURI + "?cloudletId=" + cloudletId + "&acc_token=" + token)
    //
    //                        }, function (error) {
    //                            console.log(error)
    //                        })
    //                        */
    //                    }, function (error) {
    //                        custAlert("Something went wrong with login!!!\n :( ");
    //                        console.log(error)
    //                    })
    //                }
    //            }, function (error) {
    //                custAlert("Something went wrong with register!!!\n :( ");
    //                console.log(error)
    //            });
    //} else {
    //    console.log("json is invalid");
    //}

    var dt = {
        "username": username,
        "password": password
    };

    dt = JSON.stringify(dt);

    $.ajax({
        type: "POST",
        url: "https://" + window.location.host + "/auth/create",
        contentType: "application/json",
        crossDomain: true,
        data: dt,
        success: function (res) {

            if (res.indexOf("Error") != -1) {

                if (res.indexOf("exists") !=-1){
                    custAlert("Same user exists!");

                } else {
                    custAlert(res);

                }
            } else {
                window.location.href = "./permissions"
            }

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

    /*console.log("logging in user");
     var json = JSON.stringify({
     "username": username,
     "password": password,
     "api_key": api_key,
     "secret": secret
     });

     swagger.apis.simple_auth.getAuthToken({
     body: json
     }, function (response) {
     console.log(response);
     if (response.status == 200) {
     console.log(response);
     var data = JSON.parse(response.data);
     var token = data.session;
     setCookie("token",token,1);
     window.location.replace(redirectURI + "?OUST=" + token );

     // check app perms

     */
    /*
     var json = JSON.stringify({
     "token": token
     });
     window.authorizations.add("key", new ApiKeyAuthorization("Authorization", token, "header"));
     swagger.apis.cloudlets.getCloudletId({
     }, function (response) {
     console.log(response);
     var data = JSON.parse(response.data);
     var cloudletId = data.id;//.replace("https://demo2.openi-ict.eu/api/v1/cloudlets/", " ");
     window.localStorage.setItem("cloudletId", cloudletId); // c_9414cbdc83691c35921f15fef48de54b-90
     console.log("cloudletId: " + cloudletId);


     //get object ids
     var args = {
     cloudletId: localStorage.cloudletId,
     objectId: localStorage.userObjectId
     };
     swagger.apis.objects.getObject(args,
     function (response) {
     if (response.status == 200) {
     window.localStorage.setItem("userObjectId", userObjectId);
     }
     }
     , function (error) {
     console.log("Login: Error getting userObjectId");
     console.log(error);
     });

     }, function (error) {
     console.log(error)
     })
     */
    /*
     }
     }, function (error) {
     custAlert("Something went wrong with login!!! \n :( ");
     console.log(error)
     });
     */

    //post to server


    var dt = {
        "username": username,
        "password": password
    };

    dt = JSON.stringify(dt);

    $.ajax({
        type: "POST",
        url: "https://" + window.location.host + "/auth/login",
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

}

function custAlert(text) {
    $(".custAlert").text("").text(text);
    $("#alertBtn").click()
}

//=========================
//      utils
//=========================
/*
 function getCookie(cname) {
 var name = cname + "=";
 var ca = document.cookie.split(';');
 for(var i=0; i<ca.length; i++) {
 var c = ca[i];
 while (c.charAt(0)==' ') c = c.substring(1);
 if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
 }
 return "";
 }

 function setCookie(cname, cvalue, domain, exdays) {
 var d = new Date();
 d.setTime(d.getTime() + (exdays*24*60*60*1000));
 var expires = "expires="+d.toUTCString();
 document.cookie = cname + "=" + cvalue + "; " + expires + "; domain=." + domain + "; Path=/" ;
 }
 */
function getURLparam(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
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
    } else {
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
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}