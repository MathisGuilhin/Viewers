(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Router = Package['clinical:router'].Router;
var RouteController = Package['clinical:router'].RouteController;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var WADOProxy;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:wadoproxy":{"both":{"namespace.js":function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/ohif_wadoproxy/both/namespace.js                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
WADOProxy = {};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"convertURL.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/ohif_wadoproxy/both/convertURL.js                                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let queryString;
module.watch(require("query-string"), {
  default(v) {
    queryString = v;
  }

}, 0);

WADOProxy.convertURL = (url, serverConfiguration) => {
  if (!url) {
    return null;
  }

  if (serverConfiguration.requestOptions && serverConfiguration.requestOptions.requestFromBrowser === true) {
    return url;
  }

  const {
    settings
  } = WADOProxy;

  if (!settings.enabled) {
    return url;
  }

  const serverId = serverConfiguration._id;
  const query = queryString.stringify({
    url,
    serverId
  });
  return `${settings.uri}?${query}`;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"initialize.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/ohif_wadoproxy/both/initialize.js                                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 1);
WADOProxy.settings = Object.assign({
  uri: OHIF.utils.absoluteUrl("/__wado_proxy")
}, Meteor.settings && Meteor.settings.proxy ? Meteor.settings.proxy : {});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"routes.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/ohif_wadoproxy/server/routes.js                                                                     //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Router;
module.watch(require("meteor/clinical:router"), {
  Router(v) {
    Router = v;
  }

}, 1);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 2);
let Servers;
module.watch(require("meteor/ohif:servers/both/collections"), {
  Servers(v) {
    Servers = v;
  }

}, 3);

const url = require('url');

const http = require('http');

const https = require('https');

const now = require('performance-now'); // The WADO Proxy can perform user authentication if desired.
// In order to use this, create a function to override
// OHIF.user.authenticateUser(request), which returns a Boolean.


let doAuth = false;
let authenticateUser = null;

if (OHIF.user && OHIF.user.authenticateUser) {
  doAuth = true;
  authenticateUser = OHIF.user.authenticateUser;
}

const handleRequest = function () {
  const request = this.request;
  const response = this.response;
  const params = this.params;
  let start = now();
  let user;

  if (doAuth) {
    user = authenticateUser(request);

    if (!user) {
      response.writeHead(401);
      response.end('Error: You must be logged in to perform this action.\n');
      return;
    }
  }

  let end = now();
  const authenticationTime = end - start;
  start = now();
  const server = Servers.findOne(params.query.serverId);

  if (!server) {
    response.writeHead(500);
    response.end('Error: No Server with the specified Server ID was found.\n');
    return;
  }

  const requestOpt = server.requestOptions; // If no Web Access to DICOM Objects (WADO) Service URL is provided
  // return an error for the request.

  const wadoUrl = params.query.url;

  if (!wadoUrl) {
    response.writeHead(500);
    response.end('Error: No WADO URL was provided.\n');
    return;
  }

  if (requestOpt.logRequests) {
    console.log(request.url);
  }

  start = now();

  if (requestOpt.logTiming) {
    console.time(request.url);
  } // Use Node's URL parse to decode the query URL


  const parsed = url.parse(wadoUrl); // Create an object to hold the information required
  // for the request to the PACS.

  let options = {
    headers: {},
    method: request.method,
    hostname: parsed.hostname,
    path: parsed.path
  };
  let requester;

  if (parsed.protocol === 'https:') {
    requester = https.request;
    const allowUnauthorizedAgent = new https.Agent({
      rejectUnauthorized: false
    });
    options.agent = allowUnauthorizedAgent;
  } else {
    requester = http.request;
  }

  if (parsed.port) {
    options.port = parsed.port;
  }

  Object.keys(request.headers).forEach(entry => {
    const value = request.headers[entry];

    if (entry) {
      options.headers[entry] = value;
    }
  }); // Retrieve the authorization user:password string for the PACS,
  // if one is required, and include it in the request to the PACS.

  if (requestOpt.auth) {
    options.auth = requestOpt.auth;
  }

  end = now();
  const prepRequestTime = end - start; // Use Node's HTTP API to send a request to the PACS

  const proxyRequest = requester(options, proxyResponse => {
    // When we receive data from the PACS, stream it as the
    // response to the original request.
    // console.log(`Got response: ${proxyResponse.statusCode}`);
    end = now();
    const proxyReqTime = end - start;
    const totalProxyTime = authenticationTime + prepRequestTime + proxyReqTime;
    const serverTimingHeaders = `
        auth;dur=${authenticationTime};desc="Authenticate User";,
		prep-req;dur=${prepRequestTime};desc="Prepare Request Headers",
	    proxy-req;dur=${proxyReqTime};desc="Request to WADO server",
        total-proxy;dur=${totalProxyTime};desc="Total"
        `.replace(/\n/g, '');
    proxyResponse.headers['Server-Timing'] = serverTimingHeaders;
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);

    if (requestOpt.logTiming) {
      console.timeEnd(request.url);
    }

    return proxyResponse.pipe(response, {
      end: true
    });
  }); // If our request to the PACS fails, log the error message

  proxyRequest.on('error', error => {
    end = now();
    const proxyReqTime = end - start;
    const totalProxyTime = authenticationTime + prepRequestTime + proxyReqTime;
    console.timeEnd(request.url);
    const serverTimingHeaders = {
      'Server-Timing': `
              auth;dur=${authenticationTime};desc="Authenticate User";,
              prep-req;dur=${prepRequestTime};desc="Prepare Request Headers",
              proxy-req;dur=${proxyReqTime};desc="Request to WADO server",
              total-proxy;dur=${totalProxyTime};desc="Total"
          `.replace(/\n/g, '')
    };
    response.writeHead(500, serverTimingHeaders);
    response.end(`Error: Problem with request to PACS: ${error.message}\n`);
  }); // Stream the original request information into the request
  // to the PACS

  request.pipe(proxyRequest);
}; // Setup a Route using Iron Router to avoid Cross-origin resource sharing
// (CORS) errors. We only handle this route on the Server.


Router.route(WADOProxy.settings.uri.replace(OHIF.utils.absoluteUrl(), ''), handleRequest, {
  where: 'server'
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"query-string":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// node_modules/meteor/ohif_wadoproxy/node_modules/query-string/package.json                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
exports.name = "query-string";
exports.version = "5.1.1";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// node_modules/meteor/ohif_wadoproxy/node_modules/query-string/index.js                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"performance-now":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// node_modules/meteor/ohif_wadoproxy/node_modules/performance-now/package.json                                 //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
exports.name = "performance-now";
exports.version = "2.1.0";
exports.main = "lib/performance-now.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"performance-now.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// node_modules/meteor/ohif_wadoproxy/node_modules/performance-now/lib/performance-now.js                       //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:wadoproxy/both/namespace.js");
require("/node_modules/meteor/ohif:wadoproxy/both/convertURL.js");
require("/node_modules/meteor/ohif:wadoproxy/both/initialize.js");
require("/node_modules/meteor/ohif:wadoproxy/server/routes.js");

/* Exports */
Package._define("ohif:wadoproxy", {
  WADOProxy: WADOProxy
});

})();

//# sourceURL=meteor://💻app/packages/ohif_wadoproxy.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjp3YWRvcHJveHkvYm90aC9uYW1lc3BhY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6d2Fkb3Byb3h5L2JvdGgvY29udmVydFVSTC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjp3YWRvcHJveHkvYm90aC9pbml0aWFsaXplLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOndhZG9wcm94eS9zZXJ2ZXIvcm91dGVzLmpzIl0sIm5hbWVzIjpbIldBRE9Qcm94eSIsInF1ZXJ5U3RyaW5nIiwibW9kdWxlIiwid2F0Y2giLCJyZXF1aXJlIiwiZGVmYXVsdCIsInYiLCJjb252ZXJ0VVJMIiwidXJsIiwic2VydmVyQ29uZmlndXJhdGlvbiIsInJlcXVlc3RPcHRpb25zIiwicmVxdWVzdEZyb21Ccm93c2VyIiwic2V0dGluZ3MiLCJlbmFibGVkIiwic2VydmVySWQiLCJfaWQiLCJxdWVyeSIsInN0cmluZ2lmeSIsInVyaSIsIk1ldGVvciIsIk9ISUYiLCJPYmplY3QiLCJhc3NpZ24iLCJ1dGlscyIsImFic29sdXRlVXJsIiwicHJveHkiLCJSb3V0ZXIiLCJTZXJ2ZXJzIiwiaHR0cCIsImh0dHBzIiwibm93IiwiZG9BdXRoIiwiYXV0aGVudGljYXRlVXNlciIsInVzZXIiLCJoYW5kbGVSZXF1ZXN0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwicGFyYW1zIiwic3RhcnQiLCJ3cml0ZUhlYWQiLCJlbmQiLCJhdXRoZW50aWNhdGlvblRpbWUiLCJzZXJ2ZXIiLCJmaW5kT25lIiwicmVxdWVzdE9wdCIsIndhZG9VcmwiLCJsb2dSZXF1ZXN0cyIsImNvbnNvbGUiLCJsb2ciLCJsb2dUaW1pbmciLCJ0aW1lIiwicGFyc2VkIiwicGFyc2UiLCJvcHRpb25zIiwiaGVhZGVycyIsIm1ldGhvZCIsImhvc3RuYW1lIiwicGF0aCIsInJlcXVlc3RlciIsInByb3RvY29sIiwiYWxsb3dVbmF1dGhvcml6ZWRBZ2VudCIsIkFnZW50IiwicmVqZWN0VW5hdXRob3JpemVkIiwiYWdlbnQiLCJwb3J0Iiwia2V5cyIsImZvckVhY2giLCJlbnRyeSIsInZhbHVlIiwiYXV0aCIsInByZXBSZXF1ZXN0VGltZSIsInByb3h5UmVxdWVzdCIsInByb3h5UmVzcG9uc2UiLCJwcm94eVJlcVRpbWUiLCJ0b3RhbFByb3h5VGltZSIsInNlcnZlclRpbWluZ0hlYWRlcnMiLCJyZXBsYWNlIiwic3RhdHVzQ29kZSIsInRpbWVFbmQiLCJwaXBlIiwib24iLCJlcnJvciIsIm1lc3NhZ2UiLCJyb3V0ZSIsIndoZXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLFlBQVksRUFBWixDOzs7Ozs7Ozs7OztBQ0FBLElBQUlDLFdBQUo7QUFBZ0JDLE9BQU9DLEtBQVAsQ0FBYUMsUUFBUSxjQUFSLENBQWIsRUFBcUM7QUFBQ0MsVUFBUUMsQ0FBUixFQUFVO0FBQUNMLGtCQUFZSyxDQUFaO0FBQWM7O0FBQTFCLENBQXJDLEVBQWlFLENBQWpFOztBQUVoQk4sVUFBVU8sVUFBVixHQUF1QixDQUFDQyxHQUFELEVBQU1DLG1CQUFOLEtBQThCO0FBQ2pELE1BQUksQ0FBQ0QsR0FBTCxFQUFVO0FBQ04sV0FBTyxJQUFQO0FBQ0g7O0FBRUQsTUFBSUMsb0JBQW9CQyxjQUFwQixJQUNBRCxvQkFBb0JDLGNBQXBCLENBQW1DQyxrQkFBbkMsS0FBMEQsSUFEOUQsRUFDb0U7QUFDaEUsV0FBT0gsR0FBUDtBQUNIOztBQUVELFFBQU07QUFBRUk7QUFBRixNQUFlWixTQUFyQjs7QUFDQSxNQUFJLENBQUNZLFNBQVNDLE9BQWQsRUFBdUI7QUFDbkIsV0FBT0wsR0FBUDtBQUNIOztBQUVELFFBQU1NLFdBQVdMLG9CQUFvQk0sR0FBckM7QUFDQSxRQUFNQyxRQUFRZixZQUFZZ0IsU0FBWixDQUFzQjtBQUFDVCxPQUFEO0FBQU1NO0FBQU4sR0FBdEIsQ0FBZDtBQUVBLFNBQVEsR0FBRUYsU0FBU00s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QixFQUE2QjtBQUFFSSxXQUFLO0FBQVAsS0FBN0IsQ0FBUDtBQUNILEdBdkJvQixDQUFyQixDQTNGK0IsQ0FvSC9COztBQUNBK0IsZUFBYVMsRUFBYixDQUFnQixPQUFoQixFQUF5QkMsU0FBUztBQUM5QnpDLFVBQU1WLEtBQU47QUFDQSxVQUFNMkMsZUFBZWpDLE1BQU1GLEtBQTNCO0FBQ0EsVUFBTW9DLGlCQUFpQmpDLHFCQUFxQjZCLGVBQXJCLEdBQXVDRyxZQUE5RDtBQUNBMUIsWUFBUStCLE9BQVIsQ0FBZ0IzQyxRQUFRM0IsR0FBeEI7QUFFQSxVQUFNbUUsc0JBQXNCO0FBQ3hCLHVCQUFrQjt5QkFDSGxDLGtCQUFtQjs2QkFDZjZCLGVBQWdCOzhCQUNmRyxZQUFhO2dDQUNYQyxjQUFlO1dBSnBCLENBS2ZFLE9BTGUsQ0FLUCxLQUxPLEVBS0EsRUFMQTtBQURPLEtBQTVCO0FBU0F4QyxhQUFTRyxTQUFULENBQW1CLEdBQW5CLEVBQXdCb0MsbUJBQXhCO0FBQ0F2QyxhQUFTSSxHQUFULENBQWMsd0NBQXVDeUMsTUFBTUMsT0FBUSxJQUFuRTtBQUNILEdBakJELEVBckgrQixDQXdJL0I7QUFDQTs7QUFDQS9DLFVBQVE0QyxJQUFSLENBQWFSLFlBQWI7QUFDRCxDQTNJRCxDLENBNklBO0FBQ0E7OztBQUNBN0MsT0FBT3lELEtBQVAsQ0FBYW5GLFVBQVVZLFFBQVYsQ0FBbUJNLEdBQW5CLENBQXVCMEQsT0FBdkIsQ0FBK0J4RCxLQUFLRyxLQUFMLENBQVdDLFdBQVgsRUFBL0IsRUFBeUQsRUFBekQsQ0FBYixFQUEyRVUsYUFBM0UsRUFBMEY7QUFBRWtELFNBQU87QUFBVCxDQUExRixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX3dhZG9wcm94eS5qcyIsInNvdXJjZXNDb250ZW50IjpbIldBRE9Qcm94eSA9IHt9O1xyXG4iLCJpbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcclxuXHJcbldBRE9Qcm94eS5jb252ZXJ0VVJMID0gKHVybCwgc2VydmVyQ29uZmlndXJhdGlvbikgPT4ge1xyXG4gICAgaWYgKCF1cmwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VydmVyQ29uZmlndXJhdGlvbi5yZXF1ZXN0T3B0aW9ucyAmJlxyXG4gICAgICAgIHNlcnZlckNvbmZpZ3VyYXRpb24ucmVxdWVzdE9wdGlvbnMucmVxdWVzdEZyb21Ccm93c2VyID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHNldHRpbmdzIH0gPSBXQURPUHJveHk7XHJcbiAgICBpZiAoIXNldHRpbmdzLmVuYWJsZWQpIHtcclxuICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlcnZlcklkID0gc2VydmVyQ29uZmlndXJhdGlvbi5faWQ7XHJcbiAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7dXJsLCBzZXJ2ZXJJZH0pO1xyXG5cclxuICAgIHJldHVybiBgJHtzZXR0aW5ncy51cml9PyR7cXVlcnl9YDtcclxufVxyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuV0FET1Byb3h5LnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICB1cmkgOiBPSElGLnV0aWxzLmFic29sdXRlVXJsKFwiL19fd2Fkb19wcm94eVwiKSxcclxufSwgKE1ldGVvci5zZXR0aW5ncyAmJiBNZXRlb3Iuc2V0dGluZ3MucHJveHkpID8gTWV0ZW9yLnNldHRpbmdzLnByb3h5IDoge30pO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnbWV0ZW9yL2NsaW5pY2FsOnJvdXRlcic7XHJcbmltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgU2VydmVycyB9IGZyb20gJ21ldGVvci9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucyc7XHJcblxyXG5jb25zdCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcclxuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcclxuY29uc3QgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xyXG5jb25zdCBub3cgPSByZXF1aXJlKCdwZXJmb3JtYW5jZS1ub3cnKTtcclxuXHJcbi8vIFRoZSBXQURPIFByb3h5IGNhbiBwZXJmb3JtIHVzZXIgYXV0aGVudGljYXRpb24gaWYgZGVzaXJlZC5cclxuLy8gSW4gb3JkZXIgdG8gdXNlIHRoaXMsIGNyZWF0ZSBhIGZ1bmN0aW9uIHRvIG92ZXJyaWRlXHJcbi8vIE9ISUYudXNlci5hdXRoZW50aWNhdGVVc2VyKHJlcXVlc3QpLCB3aGljaCByZXR1cm5zIGEgQm9vbGVhbi5cclxubGV0IGRvQXV0aCA9IGZhbHNlO1xyXG5sZXQgYXV0aGVudGljYXRlVXNlciA9IG51bGw7XHJcblxyXG5pZiAoT0hJRi51c2VyICYmXHJcbiAgICBPSElGLnVzZXIuYXV0aGVudGljYXRlVXNlcikge1xyXG4gICAgZG9BdXRoID0gdHJ1ZTtcclxuICAgIGF1dGhlbnRpY2F0ZVVzZXIgPSBPSElGLnVzZXIuYXV0aGVudGljYXRlVXNlcjtcclxufVxyXG5cclxuY29uc3QgaGFuZGxlUmVxdWVzdCA9IGZ1bmN0aW9uKCkge1xyXG4gIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnJlcXVlc3Q7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSB0aGlzLnJlc3BvbnNlO1xyXG4gIGNvbnN0IHBhcmFtcyA9IHRoaXMucGFyYW1zO1xyXG5cclxuICBsZXQgc3RhcnQgPSBub3coKTtcclxuICBsZXQgdXNlcjtcclxuICBpZiAoZG9BdXRoKSB7XHJcbiAgICAgIHVzZXIgPSBhdXRoZW50aWNhdGVVc2VyKHJlcXVlc3QpO1xyXG4gICAgICBpZiAoIXVzZXIpIHtcclxuICAgICAgICAgIHJlc3BvbnNlLndyaXRlSGVhZCg0MDEpO1xyXG4gICAgICAgICAgcmVzcG9uc2UuZW5kKCdFcnJvcjogWW91IG11c3QgYmUgbG9nZ2VkIGluIHRvIHBlcmZvcm0gdGhpcyBhY3Rpb24uXFxuJyk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBlbmQgPSBub3coKTtcclxuICBjb25zdCBhdXRoZW50aWNhdGlvblRpbWUgPSBlbmQgLSBzdGFydDtcclxuXHJcbiAgc3RhcnQgPSBub3coKTtcclxuXHJcbiAgY29uc3Qgc2VydmVyID0gU2VydmVycy5maW5kT25lKHBhcmFtcy5xdWVyeS5zZXJ2ZXJJZCk7XHJcbiAgaWYgKCFzZXJ2ZXIpIHtcclxuICAgICAgcmVzcG9uc2Uud3JpdGVIZWFkKDUwMCk7XHJcbiAgICAgIHJlc3BvbnNlLmVuZCgnRXJyb3I6IE5vIFNlcnZlciB3aXRoIHRoZSBzcGVjaWZpZWQgU2VydmVyIElEIHdhcyBmb3VuZC5cXG4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcmVxdWVzdE9wdCA9IHNlcnZlci5yZXF1ZXN0T3B0aW9ucztcclxuXHJcbiAgLy8gSWYgbm8gV2ViIEFjY2VzcyB0byBESUNPTSBPYmplY3RzIChXQURPKSBTZXJ2aWNlIFVSTCBpcyBwcm92aWRlZFxyXG4gIC8vIHJldHVybiBhbiBlcnJvciBmb3IgdGhlIHJlcXVlc3QuXHJcbiAgY29uc3Qgd2Fkb1VybCA9IHBhcmFtcy5xdWVyeS51cmw7XHJcbiAgaWYgKCF3YWRvVXJsKSB7XHJcbiAgICAgIHJlc3BvbnNlLndyaXRlSGVhZCg1MDApO1xyXG4gICAgICByZXNwb25zZS5lbmQoJ0Vycm9yOiBObyBXQURPIFVSTCB3YXMgcHJvdmlkZWQuXFxuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChyZXF1ZXN0T3B0LmxvZ1JlcXVlc3RzKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QudXJsKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0ID0gbm93KCk7XHJcbiAgaWYgKHJlcXVlc3RPcHQubG9nVGltaW5nKSB7XHJcbiAgICAgIGNvbnNvbGUudGltZShyZXF1ZXN0LnVybCk7XHJcbiAgfVxyXG5cclxuICAvLyBVc2UgTm9kZSdzIFVSTCBwYXJzZSB0byBkZWNvZGUgdGhlIHF1ZXJ5IFVSTFxyXG4gIGNvbnN0IHBhcnNlZCA9IHVybC5wYXJzZSh3YWRvVXJsKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGFuIG9iamVjdCB0byBob2xkIHRoZSBpbmZvcm1hdGlvbiByZXF1aXJlZFxyXG4gIC8vIGZvciB0aGUgcmVxdWVzdCB0byB0aGUgUEFDUy5cclxuICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgaGVhZGVyczoge30sXHJcbiAgICAgIG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXHJcbiAgICAgIGhvc3RuYW1lOiBwYXJzZWQuaG9zdG5hbWUsXHJcbiAgICAgIHBhdGg6IHBhcnNlZC5wYXRoXHJcbiAgfTtcclxuXHJcbiAgbGV0IHJlcXVlc3RlcjtcclxuICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnaHR0cHM6Jykge1xyXG4gICAgICByZXF1ZXN0ZXIgPSBodHRwcy5yZXF1ZXN0O1xyXG5cclxuICAgICAgY29uc3QgYWxsb3dVbmF1dGhvcml6ZWRBZ2VudCA9IG5ldyBodHRwcy5BZ2VudCh7IHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UgfSk7XHJcbiAgICAgIG9wdGlvbnMuYWdlbnQgPSBhbGxvd1VuYXV0aG9yaXplZEFnZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICAgIHJlcXVlc3RlciA9IGh0dHAucmVxdWVzdDtcclxuICB9XHJcblxyXG4gIGlmIChwYXJzZWQucG9ydCkge1xyXG4gICAgICBvcHRpb25zLnBvcnQgPSBwYXJzZWQucG9ydDtcclxuICB9XHJcblxyXG4gIE9iamVjdC5rZXlzKHJlcXVlc3QuaGVhZGVycykuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gcmVxdWVzdC5oZWFkZXJzW2VudHJ5XTtcclxuICAgICAgaWYgKGVudHJ5KSB7XHJcbiAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbZW50cnldID0gdmFsdWU7XHJcbiAgICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gUmV0cmlldmUgdGhlIGF1dGhvcml6YXRpb24gdXNlcjpwYXNzd29yZCBzdHJpbmcgZm9yIHRoZSBQQUNTLFxyXG4gIC8vIGlmIG9uZSBpcyByZXF1aXJlZCwgYW5kIGluY2x1ZGUgaXQgaW4gdGhlIHJlcXVlc3QgdG8gdGhlIFBBQ1MuXHJcbiAgaWYgKHJlcXVlc3RPcHQuYXV0aCkge1xyXG4gICAgICBvcHRpb25zLmF1dGggPSByZXF1ZXN0T3B0LmF1dGg7XHJcbiAgfVxyXG5cclxuICBlbmQgPSBub3coKTtcclxuICBjb25zdCBwcmVwUmVxdWVzdFRpbWUgPSBlbmQgLSBzdGFydDtcclxuXHJcbiAgLy8gVXNlIE5vZGUncyBIVFRQIEFQSSB0byBzZW5kIGEgcmVxdWVzdCB0byB0aGUgUEFDU1xyXG4gIGNvbnN0IHByb3h5UmVxdWVzdCA9IHJlcXVlc3RlcihvcHRpb25zLCBwcm94eVJlc3BvbnNlID0+IHtcclxuICAgICAgLy8gV2hlbiB3ZSByZWNlaXZlIGRhdGEgZnJvbSB0aGUgUEFDUywgc3RyZWFtIGl0IGFzIHRoZVxyXG4gICAgICAvLyByZXNwb25zZSB0byB0aGUgb3JpZ2luYWwgcmVxdWVzdC5cclxuICAgICAgLy8gY29uc29sZS5sb2coYEdvdCByZXNwb25zZTogJHtwcm94eVJlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XHJcbiAgICAgIGVuZCA9IG5vdygpO1xyXG4gICAgICBjb25zdCBwcm94eVJlcVRpbWUgPSBlbmQgLSBzdGFydDtcclxuICAgICAgY29uc3QgdG90YWxQcm94eVRpbWUgPSBhdXRoZW50aWNhdGlvblRpbWUgKyBwcmVwUmVxdWVzdFRpbWUgKyBwcm94eVJlcVRpbWU7XHJcbiAgICAgIGNvbnN0IHNlcnZlclRpbWluZ0hlYWRlcnMgPSBgXHJcbiAgICAgICAgYXV0aDtkdXI9JHthdXRoZW50aWNhdGlvblRpbWV9O2Rlc2M9XCJBdXRoZW50aWNhdGUgVXNlclwiOyxcclxuXHRcdHByZXAtcmVxO2R1cj0ke3ByZXBSZXF1ZXN0VGltZX07ZGVzYz1cIlByZXBhcmUgUmVxdWVzdCBIZWFkZXJzXCIsXHJcblx0ICAgIHByb3h5LXJlcTtkdXI9JHtwcm94eVJlcVRpbWV9O2Rlc2M9XCJSZXF1ZXN0IHRvIFdBRE8gc2VydmVyXCIsXHJcbiAgICAgICAgdG90YWwtcHJveHk7ZHVyPSR7dG90YWxQcm94eVRpbWV9O2Rlc2M9XCJUb3RhbFwiXHJcbiAgICAgICAgYC5yZXBsYWNlKC9cXG4vZywgJycpXHJcblxyXG4gICAgICBwcm94eVJlc3BvbnNlLmhlYWRlcnNbJ1NlcnZlci1UaW1pbmcnXSA9IHNlcnZlclRpbWluZ0hlYWRlcnM7XHJcblxyXG4gICAgICByZXNwb25zZS53cml0ZUhlYWQocHJveHlSZXNwb25zZS5zdGF0dXNDb2RlLCBwcm94eVJlc3BvbnNlLmhlYWRlcnMpO1xyXG5cclxuICAgICAgaWYgKHJlcXVlc3RPcHQubG9nVGltaW5nKSB7XHJcbiAgICAgICAgICBjb25zb2xlLnRpbWVFbmQocmVxdWVzdC51cmwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcHJveHlSZXNwb25zZS5waXBlKHJlc3BvbnNlLCB7IGVuZDogdHJ1ZSB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSWYgb3VyIHJlcXVlc3QgdG8gdGhlIFBBQ1MgZmFpbHMsIGxvZyB0aGUgZXJyb3IgbWVzc2FnZVxyXG4gIHByb3h5UmVxdWVzdC5vbignZXJyb3InLCBlcnJvciA9PiB7XHJcbiAgICAgIGVuZCA9IG5vdygpO1xyXG4gICAgICBjb25zdCBwcm94eVJlcVRpbWUgPSBlbmQgLSBzdGFydDtcclxuICAgICAgY29uc3QgdG90YWxQcm94eVRpbWUgPSBhdXRoZW50aWNhdGlvblRpbWUgKyBwcmVwUmVxdWVzdFRpbWUgKyBwcm94eVJlcVRpbWU7XHJcbiAgICAgIGNvbnNvbGUudGltZUVuZChyZXF1ZXN0LnVybCk7XHJcblxyXG4gICAgICBjb25zdCBzZXJ2ZXJUaW1pbmdIZWFkZXJzID0ge1xyXG4gICAgICAgICAgJ1NlcnZlci1UaW1pbmcnOiBgXHJcbiAgICAgICAgICAgICAgYXV0aDtkdXI9JHthdXRoZW50aWNhdGlvblRpbWV9O2Rlc2M9XCJBdXRoZW50aWNhdGUgVXNlclwiOyxcclxuICAgICAgICAgICAgICBwcmVwLXJlcTtkdXI9JHtwcmVwUmVxdWVzdFRpbWV9O2Rlc2M9XCJQcmVwYXJlIFJlcXVlc3QgSGVhZGVyc1wiLFxyXG4gICAgICAgICAgICAgIHByb3h5LXJlcTtkdXI9JHtwcm94eVJlcVRpbWV9O2Rlc2M9XCJSZXF1ZXN0IHRvIFdBRE8gc2VydmVyXCIsXHJcbiAgICAgICAgICAgICAgdG90YWwtcHJveHk7ZHVyPSR7dG90YWxQcm94eVRpbWV9O2Rlc2M9XCJUb3RhbFwiXHJcbiAgICAgICAgICBgLnJlcGxhY2UoL1xcbi9nLCAnJylcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJlc3BvbnNlLndyaXRlSGVhZCg1MDAsIHNlcnZlclRpbWluZ0hlYWRlcnMpO1xyXG4gICAgICByZXNwb25zZS5lbmQoYEVycm9yOiBQcm9ibGVtIHdpdGggcmVxdWVzdCB0byBQQUNTOiAke2Vycm9yLm1lc3NhZ2V9XFxuYCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFN0cmVhbSB0aGUgb3JpZ2luYWwgcmVxdWVzdCBpbmZvcm1hdGlvbiBpbnRvIHRoZSByZXF1ZXN0XHJcbiAgLy8gdG8gdGhlIFBBQ1NcclxuICByZXF1ZXN0LnBpcGUocHJveHlSZXF1ZXN0KTtcclxufVxyXG5cclxuLy8gU2V0dXAgYSBSb3V0ZSB1c2luZyBJcm9uIFJvdXRlciB0byBhdm9pZCBDcm9zcy1vcmlnaW4gcmVzb3VyY2Ugc2hhcmluZ1xyXG4vLyAoQ09SUykgZXJyb3JzLiBXZSBvbmx5IGhhbmRsZSB0aGlzIHJvdXRlIG9uIHRoZSBTZXJ2ZXIuXHJcblJvdXRlci5yb3V0ZShXQURPUHJveHkuc2V0dGluZ3MudXJpLnJlcGxhY2UoT0hJRi51dGlscy5hYnNvbHV0ZVVybCgpLCAnJyksIGhhbmRsZVJlcXVlc3QsIHsgd2hlcmU6ICdzZXJ2ZXInIH0pO1xyXG4iXX0=
