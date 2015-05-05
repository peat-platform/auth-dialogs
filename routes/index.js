
var wrap = function(args){


   var express = require('express');
   var router  = express();

   var loginAction       = require('./login')(args)
   var accountAction     = require('./account')(args)
   var permissionsAction = require('./permissions')(args)
   var createAction      = require('./create')(args)
   var acceptAction      = require('./accept')(args)
   var cancelAction      = require('./cancel')(args)
   var logoutAction      = require('./logout')(args)
   var permdeniedAction  = require('./permsDenied')(args)


   router.get('/account',     accountAction)
   router.post('/login',      loginAction)
   router.get('/permissions', permissionsAction )
   router.post('/create',     createAction);
   router.post('/accept',     acceptAction);
   router.post('/cancel',     cancelAction);
   router.get('/logout',      logoutAction);
   router.get('/permsDenied', permdeniedAction);

   return router
}


module.exports = wrap;
