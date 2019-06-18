(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Collection2 = Package['aldeed:collection2-core'].Collection2;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:servers":{"both":{"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/index.js                                                               //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.watch(require("./base.js"));
module.watch(require("./collections"));
module.watch(require("./lib"));
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"base.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/base.js                                                                //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.servers = {
  collections: {}
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"collections":{"currentServer.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/collections/currentServer.js                                           //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.export({
  CurrentServer: () => CurrentServer
});
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 1);
// CurrentServer is a single document collection to describe which of the Servers is being used
let collectionName = 'currentServer';

if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.clientOnly === true) {
  collectionName = null;
}

const CurrentServer = new Mongo.Collection(collectionName);
CurrentServer._debugName = 'CurrentServer';
OHIF.servers.collections.currentServer = CurrentServer;
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/collections/index.js                                                   //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.export({
  CurrentServer: () => CurrentServer,
  Servers: () => Servers
});
let CurrentServer;
module.watch(require("./currentServer.js"), {
  CurrentServer(v) {
    CurrentServer = v;
  }

}, 0);
let Servers;
module.watch(require("./servers.js"), {
  Servers(v) {
    Servers = v;
  }

}, 1);
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"servers.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/collections/servers.js                                                 //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.export({
  Servers: () => Servers
});
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 1);
// import { Servers as ServerSchema } from 'meteor/ohif:servers/both/schema/servers.js';
let collectionName = 'servers';

if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.clientOnly === true) {
  collectionName = null;
} // Servers describe the DICOM servers configurations


const Servers = new Mongo.Collection(collectionName); // TODO: Make the Schema match what we are currently sticking into the Collection
//Servers.attachSchema(ServerSchema);

Servers._debugName = 'Servers';
OHIF.servers.collections.servers = Servers;
///////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lib":{"applyCloudServerConfig.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/lib/applyCloudServerConfig.js                                          //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let Session;
module.watch(require("meteor/session"), {
  Session(v) {
    Session = v;
  }

}, 1);
let Servers, CurrentServer;
module.watch(require("meteor/ohif:servers/both/collections"), {
  Servers(v) {
    Servers = v;
  },

  CurrentServer(v) {
    CurrentServer = v;
  }

}, 2);

/**
 * Recreates a current server with GCloud config
 */
OHIF.servers.applyCloudServerConfig = config => {
  Session.set('GCP_HEALTHCARE_CONFIG', config);
  CurrentServer.remove({});
  if (!config) return;
  config.name = "gcs";
  config.imageRendering = "wadors";
  config.origin = "json";
  config.thumbnailRendering = "wadors";
  config.qidoSupportsIncludeField = false;
  config.type = "dicomweb";
  config.requestOptions = {};
  config.requestOptions.requestFromBrowser = true;
  config.origin = 'json';
  config.type = 'dicomWeb';
  config.isCloud = true;
  const serverId = Servers.insert(config);
  CurrentServer.insert({
    serverId
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"getCurrentServer.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/lib/getCurrentServer.js                                                //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let Servers, CurrentServer;
module.watch(require("meteor/ohif:servers/both/collections"), {
  Servers(v) {
    Servers = v;
  },

  CurrentServer(v) {
    CurrentServer = v;
  }

}, 1);

/**
 * Retrieves the current server configuration used to retrieve studies
 */
OHIF.servers.getCurrentServer = () => {
  const currentServer = CurrentServer.findOne();

  if (!currentServer) {
    return;
  }

  const serverConfiguration = Servers.findOne({
    _id: currentServer.serverId
  });
  return serverConfiguration;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/both/lib/index.js                                                           //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.watch(require("./getCurrentServer.js"));
module.watch(require("./applyCloudServerConfig.js"));
///////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/index.js                                                             //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.watch(require("./publications.js"));
module.watch(require("./methods.js"));
module.watch(require("./startup.js"));
module.watch(require("./lib"));
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/methods.js                                                           //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
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
Meteor.methods({
  serverFind: query => OHIF.servers.control.find(query),
  serverSave: serverSettings => OHIF.servers.control.save(serverSettings),
  serverSetActive: serverId => OHIF.servers.control.setActive(serverId),
  serverRemove: serverId => OHIF.servers.control.remove(serverId)
});
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"publications.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/publications.js                                                      //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Servers, CurrentServer;
module.watch(require("meteor/ohif:servers/both/collections"), {
  Servers(v) {
    Servers = v;
  },

  CurrentServer(v) {
    CurrentServer = v;
  }

}, 1);
// When publishing Servers Collection, do not publish the requestOptions.headers
// field in case any authentication information is being passed
Meteor.publish('servers', () => Servers.find({}, {
  fields: {
    'requestOptions.headers': 0,
    'requestOptions.auth': 0
  }
}));
Meteor.publish('currentServer', () => CurrentServer.find());
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"startup.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/startup.js                                                           //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);

let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
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

// Check the servers on meteor startup
if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.clientOnly !== true) {
  Meteor.startup(function () {
    OHIF.log.info('Updating servers information from JSON configuration');

    _.each(Meteor.settings.servers, function (endpoints, serverType) {
      _.each(endpoints, function (endpoint) {
        const server = _.clone(endpoint);

        server.origin = 'json';
        server.type = serverType; // Try to find a server with the same name/type/origin combination

        const existingServer = Servers.findOne({
          name: server.name,
          type: server.type,
          origin: server.origin
        }); // Check if server was already added. Update it if so and insert if not

        if (existingServer) {
          Servers.update(existingServer._id, {
            $set: server
          });
        } else {
          Servers.insert(server);
        }
      });
    });

    OHIF.servers.control.resetCurrentServer();
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"control.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/lib/control.js                                                       //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
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
let Servers, CurrentServer;
module.watch(require("meteor/ohif:servers/both/collections"), {
  Servers(v) {
    Servers = v;
  },

  CurrentServer(v) {
    CurrentServer = v;
  }

}, 2);
OHIF.servers.control = {
  writeCallback(error, affected) {
    if (error) {
      throw new Meteor.Error('data-write', error);
    }
  },

  resetCurrentServer() {
    const currentServer = CurrentServer.findOne();

    if (currentServer && Servers.find({
      _id: currentServer.serverId
    }).count()) {
      return;
    }

    const newServer = Servers.findOne({
      origin: 'json',
      type: Meteor.settings.defaultServiceType || 'dicomWeb'
    });

    if (newServer) {
      CurrentServer.remove({});
      CurrentServer.insert({
        serverId: newServer._id
      });
    }
  },

  find(query) {
    return Servers.find(query).fetch();
  },

  save(serverSettings) {
    const query = {
      _id: serverSettings._id
    };
    const options = {
      upsert: true
    };

    if (!serverSettings._id) {
      delete serverSettings._id;
    }

    return Servers.update(query, serverSettings, options, this.writeCallback);
  },

  setActive(serverId) {
    CurrentServer.remove({});
    CurrentServer.insert({
      serverId: serverId
    });
  },

  remove(serverId) {
    const query = {
      _id: serverId
    };
    const removeStatus = Servers.remove(query, this.writeCallback);
    OHIF.servers.control.resetCurrentServer();
    return removeStatus;
  }

};
///////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ohif_servers/server/lib/index.js                                                         //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
module.watch(require("./control.js"));
///////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:servers/both/index.js");
require("/node_modules/meteor/ohif:servers/server/index.js");

/* Exports */
Package._define("ohif:servers");

})();

//# sourceURL=meteor://💻app/packages/ohif_servers.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzZXJ2ZXJzL2JvdGgvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c2VydmVycy9ib3RoL2Jhc2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c2VydmVycy9ib3RoL2NvbGxlY3Rpb25zL2N1cnJlbnRTZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c2VydmVycy9ib3RoL2NvbGxlY3Rpb25zL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucy9zZXJ2ZXJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnNlcnZlcnMvYm90aC9saWIvYXBwbHlDbG91ZFNlcnZlckNvbmZpZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzZXJ2ZXJzL2JvdGgvbGliL2dldEN1cnJlbnRTZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c2VydmVycy9ib3RoL2xpYi9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzZXJ2ZXJzL3NlcnZlci9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzZXJ2ZXJzL3NlcnZlci9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnNlcnZlcnMvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzZXJ2ZXJzL3NlcnZlci9zdGFydHVwLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnNlcnZlcnMvc2VydmVyL2xpYi9jb250cm9sLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnNlcnZlcnMvc2VydmVyL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJ3YXRjaCIsInJlcXVpcmUiLCJPSElGIiwidiIsInNlcnZlcnMiLCJjb2xsZWN0aW9ucyIsImV4cG9ydCIsIkN1cnJlbnRTZXJ2ZXIiLCJNb25nbyIsImNvbGxlY3Rpb25OYW1lIiwiTWV0ZW9yIiwic2V0dGluZ3MiLCJwdWJsaWMiLCJjbGllbnRPbmx5IiwiQ29sbGVjdGlvbiIsIl9kZWJ1Z05hbWUiLCJjdXJyZW50U2VydmVyIiwiU2VydmVycyIsIlNlc3Npb24iLCJhcHBseUNsb3VkU2VydmVyQ29uZmlnIiwiY29uZmlnIiwic2V0IiwicmVtb3ZlIiwibmFtZSIsImltYWdlUmVuZGVyaW5nIiwib3JpZ2luIiwidGh1bWJuYWlsUmVuZGVyaW5nIiwicWlkb1N1cHBvcnRzSW5jbHVkZUZpZWxkIiwidHlwZSIsInJlcXVlc3RPcHRpb25zIiwicmVxdWVzdEZyb21Ccm93c2VyIiwiaXNDbG91ZCIsInNlcnZlcklkIiwiaW5zZXJ0IiwiZ2V0Q3VycmVudFNlcnZlciIsImZpbmRPbmUiLCJzZXJ2ZXJDb25maWd1cmF0aW9uIiwiX2lkIiwibWV0aG9kcyIsInNlcnZlckZpbmQiLCJxdWVyeSIsImNvbnRyb2wiLCJmaW5kIiwic2VydmVyU2F2ZSIsInNlcnZlclNldHRpbmdzIiwic2F2ZSIsInNlcnZlclNldEFjdGl2ZSIsInNldEFjdGl2ZSIsInNlcnZlclJlbW92ZSIsInB1Ymxpc2giLCJmaWVsZHMiLCJfIiwic3RhcnR1cCIsImxvZyIsImluZm8iLCJlYWNoIiwiZW5kcG9pbnRzIiwic2VydmVyVHlwZSIsImVuZHBvaW50Iiwic2VydmVyIiwiY2xvbmUiLCJleGlzdGluZ1NlcnZlciIsInVwZGF0ZSIsIiRzZXQiLCJyZXNldEN1cnJlbnRTZXJ2ZXIiLCJ3cml0ZUNhbGxiYWNrIiwiZXJyb3IiLCJhZmZlY3RlZCIsIkVycm9yIiwiY291bnQiLCJuZXdTZXJ2ZXIiLCJkZWZhdWx0U2VydmljZVR5cGUiLCJmZXRjaCIsIm9wdGlvbnMiLCJ1cHNlcnQi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QUwsQ0FBYXFDLE9BQWIsQ0FBcUJ1QixrQkFBckI7QUFFQSxXQUFPVyxZQUFQO0FBQ0g7O0FBOURrQixDQUF2QixDOzs7Ozs7Ozs7OztBQ0pBNUUsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGNBQVIsQ0FBYixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX3NlcnZlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vYmFzZS5qcyc7XHJcbmltcG9ydCAnLi9jb2xsZWN0aW9ucyc7XHJcbmltcG9ydCAnLi9saWInO1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5PSElGLnNlcnZlcnMgPSB7XHJcbiAgICBjb2xsZWN0aW9uczoge31cclxufTtcclxuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG4vLyBDdXJyZW50U2VydmVyIGlzIGEgc2luZ2xlIGRvY3VtZW50IGNvbGxlY3Rpb24gdG8gZGVzY3JpYmUgd2hpY2ggb2YgdGhlIFNlcnZlcnMgaXMgYmVpbmcgdXNlZFxyXG5sZXQgY29sbGVjdGlvbk5hbWUgPSAnY3VycmVudFNlcnZlcic7XHJcbmlmIChNZXRlb3Iuc2V0dGluZ3MgJiYgTWV0ZW9yLnNldHRpbmdzLnB1YmxpYyAmJiBNZXRlb3Iuc2V0dGluZ3MucHVibGljLmNsaWVudE9ubHkgPT09IHRydWUpIHtcclxuICAgIGNvbGxlY3Rpb25OYW1lID0gbnVsbDtcclxufVxyXG5cclxuY29uc3QgQ3VycmVudFNlcnZlciA9IG5ldyBNb25nby5Db2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcclxuQ3VycmVudFNlcnZlci5fZGVidWdOYW1lID0gJ0N1cnJlbnRTZXJ2ZXInO1xyXG5PSElGLnNlcnZlcnMuY29sbGVjdGlvbnMuY3VycmVudFNlcnZlciA9IEN1cnJlbnRTZXJ2ZXI7XHJcblxyXG5leHBvcnQgeyBDdXJyZW50U2VydmVyIH07XHJcbiIsImltcG9ydCB7IEN1cnJlbnRTZXJ2ZXIgfSBmcm9tICcuL2N1cnJlbnRTZXJ2ZXIuanMnO1xyXG5pbXBvcnQgeyBTZXJ2ZXJzIH0gZnJvbSAnLi9zZXJ2ZXJzLmpzJztcclxuXHJcbmV4cG9ydCB7IEN1cnJlbnRTZXJ2ZXIsIFNlcnZlcnMgfTtcclxuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcbi8vIGltcG9ydCB7IFNlcnZlcnMgYXMgU2VydmVyU2NoZW1hIH0gZnJvbSAnbWV0ZW9yL29oaWY6c2VydmVycy9ib3RoL3NjaGVtYS9zZXJ2ZXJzLmpzJztcclxuXHJcbmxldCBjb2xsZWN0aW9uTmFtZSA9ICdzZXJ2ZXJzJztcclxuaWYgKE1ldGVvci5zZXR0aW5ncyAmJiBNZXRlb3Iuc2V0dGluZ3MucHVibGljICYmIE1ldGVvci5zZXR0aW5ncy5wdWJsaWMuY2xpZW50T25seSA9PT0gdHJ1ZSkge1xyXG4gICAgY29sbGVjdGlvbk5hbWUgPSBudWxsO1xyXG59XHJcblxyXG4vLyBTZXJ2ZXJzIGRlc2NyaWJlIHRoZSBESUNPTSBzZXJ2ZXJzIGNvbmZpZ3VyYXRpb25zXHJcbmNvbnN0IFNlcnZlcnMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XHJcbi8vIFRPRE86IE1ha2UgdGhlIFNjaGVtYSBtYXRjaCB3aGF0IHdlIGFyZSBjdXJyZW50bHkgc3RpY2tpbmcgaW50byB0aGUgQ29sbGVjdGlvblxyXG4vL1NlcnZlcnMuYXR0YWNoU2NoZW1hKFNlcnZlclNjaGVtYSk7XHJcblNlcnZlcnMuX2RlYnVnTmFtZSA9ICdTZXJ2ZXJzJztcclxuT0hJRi5zZXJ2ZXJzLmNvbGxlY3Rpb25zLnNlcnZlcnMgPSBTZXJ2ZXJzO1xyXG5cclxuZXhwb3J0IHsgU2VydmVycyB9O1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcbmltcG9ydCB7IFNlc3Npb24gfSBmcm9tICdtZXRlb3Ivc2Vzc2lvbic7XHJcbmltcG9ydCB7IFNlcnZlcnMsIEN1cnJlbnRTZXJ2ZXIgfSBmcm9tICdtZXRlb3Ivb2hpZjpzZXJ2ZXJzL2JvdGgvY29sbGVjdGlvbnMnO1xyXG5cclxuLyoqXHJcbiAqIFJlY3JlYXRlcyBhIGN1cnJlbnQgc2VydmVyIHdpdGggR0Nsb3VkIGNvbmZpZ1xyXG4gKi9cclxuT0hJRi5zZXJ2ZXJzLmFwcGx5Q2xvdWRTZXJ2ZXJDb25maWcgPSAoY29uZmlnKSA9PiB7XHJcbiAgICBTZXNzaW9uLnNldCgnR0NQX0hFQUxUSENBUkVfQ09ORklHJywgY29uZmlnKTtcclxuICAgIEN1cnJlbnRTZXJ2ZXIucmVtb3ZlKHt9KTtcclxuICAgIGlmICghY29uZmlnKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGNvbmZpZy5uYW1lID0gXCJnY3NcIjtcclxuICAgIGNvbmZpZy5pbWFnZVJlbmRlcmluZyA9IFwid2Fkb3JzXCI7XHJcbiAgICBjb25maWcub3JpZ2luID0gXCJqc29uXCI7XHJcbiAgICBjb25maWcudGh1bWJuYWlsUmVuZGVyaW5nID0gXCJ3YWRvcnNcIjtcclxuICAgIGNvbmZpZy5xaWRvU3VwcG9ydHNJbmNsdWRlRmllbGQgPSBmYWxzZTtcclxuICAgIGNvbmZpZy50eXBlID0gXCJkaWNvbXdlYlwiO1xyXG4gICAgY29uZmlnLnJlcXVlc3RPcHRpb25zID0ge307XHJcbiAgICBjb25maWcucmVxdWVzdE9wdGlvbnMucmVxdWVzdEZyb21Ccm93c2VyID0gdHJ1ZTtcclxuICAgIGNvbmZpZy5vcmlnaW4gPSAnanNvbic7XHJcbiAgICBjb25maWcudHlwZSA9ICdkaWNvbVdlYic7XHJcbiAgICBjb25maWcuaXNDbG91ZCA9IHRydWU7XHJcbiAgICBjb25zdCBzZXJ2ZXJJZCA9IFNlcnZlcnMuaW5zZXJ0KGNvbmZpZyk7XHJcbiAgICBDdXJyZW50U2VydmVyLmluc2VydCh7XHJcbiAgICAgICAgc2VydmVySWRcclxuICAgIH0pO1xyXG59OyIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgU2VydmVycywgQ3VycmVudFNlcnZlciB9IGZyb20gJ21ldGVvci9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucyc7XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNlcnZlciBjb25maWd1cmF0aW9uIHVzZWQgdG8gcmV0cmlldmUgc3R1ZGllc1xyXG4gKi9cclxuT0hJRi5zZXJ2ZXJzLmdldEN1cnJlbnRTZXJ2ZXIgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBjdXJyZW50U2VydmVyID0gQ3VycmVudFNlcnZlci5maW5kT25lKCk7XHJcblxyXG4gICAgaWYgKCFjdXJyZW50U2VydmVyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlcnZlckNvbmZpZ3VyYXRpb24gPSBTZXJ2ZXJzLmZpbmRPbmUoeyBfaWQ6IGN1cnJlbnRTZXJ2ZXIuc2VydmVySWQgfSk7XHJcblxyXG4gICAgcmV0dXJuIHNlcnZlckNvbmZpZ3VyYXRpb247XHJcbn07XHJcbiIsImltcG9ydCAnLi9nZXRDdXJyZW50U2VydmVyLmpzJztcclxuaW1wb3J0ICcuL2FwcGx5Q2xvdWRTZXJ2ZXJDb25maWcuanMnO1xyXG4iLCJpbXBvcnQgJy4vcHVibGljYXRpb25zLmpzJztcclxuaW1wb3J0ICcuL21ldGhvZHMuanMnO1xyXG5pbXBvcnQgJy4vc3RhcnR1cC5qcyc7XHJcbmltcG9ydCAnLi9saWInO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuTWV0ZW9yLm1ldGhvZHMoe1xyXG4gICAgc2VydmVyRmluZDogcXVlcnkgPT4gT0hJRi5zZXJ2ZXJzLmNvbnRyb2wuZmluZChxdWVyeSksXHJcbiAgICBzZXJ2ZXJTYXZlOiBzZXJ2ZXJTZXR0aW5ncyA9PiBPSElGLnNlcnZlcnMuY29udHJvbC5zYXZlKHNlcnZlclNldHRpbmdzKSxcclxuICAgIHNlcnZlclNldEFjdGl2ZTogc2VydmVySWQgPT4gT0hJRi5zZXJ2ZXJzLmNvbnRyb2wuc2V0QWN0aXZlKHNlcnZlcklkKSxcclxuICAgIHNlcnZlclJlbW92ZTogc2VydmVySWQgPT4gT0hJRi5zZXJ2ZXJzLmNvbnRyb2wucmVtb3ZlKHNlcnZlcklkKVxyXG59KTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IFNlcnZlcnMsIEN1cnJlbnRTZXJ2ZXIgfSBmcm9tICdtZXRlb3Ivb2hpZjpzZXJ2ZXJzL2JvdGgvY29sbGVjdGlvbnMnO1xyXG5cclxuLy8gV2hlbiBwdWJsaXNoaW5nIFNlcnZlcnMgQ29sbGVjdGlvbiwgZG8gbm90IHB1Ymxpc2ggdGhlIHJlcXVlc3RPcHRpb25zLmhlYWRlcnNcclxuLy8gZmllbGQgaW4gY2FzZSBhbnkgYXV0aGVudGljYXRpb24gaW5mb3JtYXRpb24gaXMgYmVpbmcgcGFzc2VkXHJcbk1ldGVvci5wdWJsaXNoKCdzZXJ2ZXJzJywgKCkgPT4gU2VydmVycy5maW5kKHt9LCB7XHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICAncmVxdWVzdE9wdGlvbnMuaGVhZGVycyc6IDAsXHJcbiAgICAgICAgJ3JlcXVlc3RPcHRpb25zLmF1dGgnOiAwLFxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5NZXRlb3IucHVibGlzaCgnY3VycmVudFNlcnZlcicsICgpID0+IEN1cnJlbnRTZXJ2ZXIuZmluZCgpKTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcbmltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgU2VydmVycyB9IGZyb20gJ21ldGVvci9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucyc7XHJcblxyXG4vLyBDaGVjayB0aGUgc2VydmVycyBvbiBtZXRlb3Igc3RhcnR1cFxyXG5pZiAoTWV0ZW9yLnNldHRpbmdzICYmXHJcbiAgICBNZXRlb3Iuc2V0dGluZ3MucHVibGljICYmXHJcbiAgICBNZXRlb3Iuc2V0dGluZ3MucHVibGljLmNsaWVudE9ubHkgIT09IHRydWUpIHtcclxuXHJcbiAgICBNZXRlb3Iuc3RhcnR1cChmdW5jdGlvbigpIHtcclxuICAgICAgICBPSElGLmxvZy5pbmZvKCdVcGRhdGluZyBzZXJ2ZXJzIGluZm9ybWF0aW9uIGZyb20gSlNPTiBjb25maWd1cmF0aW9uJyk7XHJcblxyXG4gICAgICAgIF8uZWFjaChNZXRlb3Iuc2V0dGluZ3Muc2VydmVycywgZnVuY3Rpb24oZW5kcG9pbnRzLCBzZXJ2ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgIF8uZWFjaChlbmRwb2ludHMsIGZ1bmN0aW9uKGVuZHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBfLmNsb25lKGVuZHBvaW50KTtcclxuICAgICAgICAgICAgICAgIHNlcnZlci5vcmlnaW4gPSAnanNvbic7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIudHlwZSA9IHNlcnZlclR5cGU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYSBzZXJ2ZXIgd2l0aCB0aGUgc2FtZSBuYW1lL3R5cGUvb3JpZ2luIGNvbWJpbmF0aW9uXHJcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1NlcnZlciA9IFNlcnZlcnMuZmluZE9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc2VydmVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogc2VydmVyLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBzZXJ2ZXIub3JpZ2luXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBzZXJ2ZXIgd2FzIGFscmVhZHkgYWRkZWQuIFVwZGF0ZSBpdCBpZiBzbyBhbmQgaW5zZXJ0IGlmIG5vdFxyXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nU2VydmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgU2VydmVycy51cGRhdGUoZXhpc3RpbmdTZXJ2ZXIuX2lkLCB7ICRzZXQ6IHNlcnZlciB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgU2VydmVycy5pbnNlcnQoc2VydmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIE9ISUYuc2VydmVycy5jb250cm9sLnJlc2V0Q3VycmVudFNlcnZlcigpO1xyXG4gICAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgU2VydmVycywgQ3VycmVudFNlcnZlciB9IGZyb20gJ21ldGVvci9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucyc7XHJcblxyXG5PSElGLnNlcnZlcnMuY29udHJvbCA9IHtcclxuICAgIHdyaXRlQ2FsbGJhY2soZXJyb3IsIGFmZmVjdGVkKSB7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RhdGEtd3JpdGUnLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldEN1cnJlbnRTZXJ2ZXIoKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFNlcnZlciA9IEN1cnJlbnRTZXJ2ZXIuZmluZE9uZSgpO1xyXG4gICAgICAgIGlmIChjdXJyZW50U2VydmVyICYmIFNlcnZlcnMuZmluZCh7IF9pZDogY3VycmVudFNlcnZlci5zZXJ2ZXJJZCB9KS5jb3VudCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1NlcnZlciA9IFNlcnZlcnMuZmluZE9uZSh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogJ2pzb24nLFxyXG4gICAgICAgICAgICB0eXBlOiBNZXRlb3Iuc2V0dGluZ3MuZGVmYXVsdFNlcnZpY2VUeXBlIHx8ICdkaWNvbVdlYidcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKG5ld1NlcnZlcikge1xyXG4gICAgICAgICAgICBDdXJyZW50U2VydmVyLnJlbW92ZSh7fSk7XHJcbiAgICAgICAgICAgIEN1cnJlbnRTZXJ2ZXIuaW5zZXJ0KHtcclxuICAgICAgICAgICAgICAgIHNlcnZlcklkOiBuZXdTZXJ2ZXIuX2lkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZmluZChxdWVyeSkge1xyXG4gICAgICAgIHJldHVybiBTZXJ2ZXJzLmZpbmQocXVlcnkpLmZldGNoKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNhdmUoc2VydmVyU2V0dGluZ3MpIHtcclxuICAgICAgICBjb25zdCBxdWVyeSA9IHtcclxuICAgICAgICAgICAgX2lkOiBzZXJ2ZXJTZXR0aW5ncy5faWRcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHVwc2VydDogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICghc2VydmVyU2V0dGluZ3MuX2lkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzZXJ2ZXJTZXR0aW5ncy5faWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gU2VydmVycy51cGRhdGUocXVlcnksIHNlcnZlclNldHRpbmdzLCBvcHRpb25zLCB0aGlzLndyaXRlQ2FsbGJhY2spO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRBY3RpdmUoc2VydmVySWQpIHtcclxuICAgICAgICBDdXJyZW50U2VydmVyLnJlbW92ZSh7fSk7XHJcbiAgICAgICAgQ3VycmVudFNlcnZlci5pbnNlcnQoe1xyXG4gICAgICAgICAgICBzZXJ2ZXJJZDogc2VydmVySWRcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlKHNlcnZlcklkKSB7XHJcbiAgICAgICAgY29uc3QgcXVlcnkgPSB7XHJcbiAgICAgICAgICAgIF9pZDogc2VydmVySWRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZW1vdmVTdGF0dXMgPSBTZXJ2ZXJzLnJlbW92ZShxdWVyeSwgdGhpcy53cml0ZUNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgT0hJRi5zZXJ2ZXJzLmNvbnRyb2wucmVzZXRDdXJyZW50U2VydmVyKCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZW1vdmVTdGF0dXM7XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCAnLi9jb250cm9sLmpzJztcclxuIl19
