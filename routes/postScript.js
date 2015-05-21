
var https   = require('https');

module.exports = function postScript(method, port, postdata, path, addheaders, success, error) {
   "use strict";
   // An object of options to indicate where to post to
   var obj, options, req,
      post_data = JSON.stringify(postdata),
      headers = {
         'Content-Type': 'application/json',
         'Content-Length': Buffer.byteLength(post_data)
      };

   if (typeof addheaders === 'object') {
      for (obj in addheaders) {
         if (addheaders.hasOwnProperty(obj)) {
            headers[obj] = addheaders[obj];
         }
      }
   }

   var port = (undefined !== port) ? port : 443 ;

   options = {
      //host: '10.130.34.17',
      host: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: headers,
      rejectUnauthorized: false
   };

   req = https.request(options, function (res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function (data) {
         responseString += data;
      });

      res.on('end', function () {
         try{
            var resultObject = JSON.parse(responseString);
            success(resultObject);
         }
         catch (e) {
            error(responseString)
         }
      });
   });

   req.on('error', function (e) {
      console.log("Error :\n" + e);
      error(e);
   });

   req.write(post_data);
   req.end();
}