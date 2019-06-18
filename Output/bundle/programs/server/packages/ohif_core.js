(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var Log = Package.logging.Log;
var Tracker = Package.deps.Tracker;
var Deps = Package.deps.Deps;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Blaze = Package.ui.Blaze;
var UI = Package.ui.UI;
var Handlebars = Package.ui.Handlebars;
var Spacebars = Package.spacebars.Spacebars;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var HTML = Package.htmljs.HTML;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:core":{"main.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/main.js                                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  OHIF: () => OHIF
});
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);

/*
 * Defines the base OHIF object
 */
const OHIF = {
  log: {},
  ui: {},
  utils: {},
  viewer: {},
  cornerstone: {},
  user: {},
  DICOMWeb: {} // Temporarily added

}; // Expose the OHIF object to the client if it is on development mode
// @TODO: remove this after applying namespace to this package

if (Meteor.isClient) {
  window.OHIF = OHIF;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"both":{"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/index.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.watch(require("./lib"));
module.watch(require("./utils"));
module.watch(require("./schema.js"));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"schema.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/schema.js                                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let SimpleSchema;
module.watch(require("meteor/aldeed:simple-schema"), {
  SimpleSchema(v) {
    SimpleSchema = v;
  }

}, 0);

/*
 Extend the available options on schema definitions:

  * valuesLabels: Used in conjunction with allowedValues to define the text
    label for each value (used on forms)

  * textOptional: Used to allow empty strings

 */
SimpleSchema.extendOptions({
  valuesLabels: Match.Optional([String]),
  textOptional: Match.Optional(Boolean)
}); // Add default required validation for empty strings which can be bypassed
// using textOptional=true definition

SimpleSchema.addValidator(function () {
  if (this.definition.optional !== true && this.definition.textOptional !== true && this.value === '') {
    return 'required';
  }
}); // Including [label] for some messages

SimpleSchema.messages({
  maxCount: '[label] can not have more than [maxCount] values',
  minCount: '[label] must have at least [minCount] values',
  notAllowed: '[label] has an invalid value: "[value]"'
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/index.js                                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.watch(require("./object.js"));
module.watch(require("./DICOMWeb/"));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"object.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/object.js                                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.object = {}; // Transforms a shallow object with keys separated by "." into a nested object

OHIF.object.getNestedObject = shallowObject => {
  const nestedObject = {};

  for (let key in shallowObject) {
    if (!shallowObject.hasOwnProperty(key)) continue;
    const value = shallowObject[key];
    const propertyArray = key.split('.');
    let currentObject = nestedObject;

    while (propertyArray.length) {
      const currentProperty = propertyArray.shift();

      if (!propertyArray.length) {
        currentObject[currentProperty] = value;
      } else {
        if (!currentObject[currentProperty]) {
          currentObject[currentProperty] = {};
        }

        currentObject = currentObject[currentProperty];
      }
    }
  }

  return nestedObject;
}; // Transforms a nested object into a shallowObject merging its keys with "." character


OHIF.object.getShallowObject = nestedObject => {
  const shallowObject = {};

  const putValues = (baseKey, nestedObject, resultObject) => {
    for (let key in nestedObject) {
      if (!nestedObject.hasOwnProperty(key)) continue;
      let currentKey = baseKey ? `${baseKey}.${key}` : key;
      const currentValue = nestedObject[key];

      if (typeof currentValue === 'object') {
        if (currentValue instanceof Array) {
          currentKey += '[]';
        }

        putValues(currentKey, currentValue, resultObject);
      } else {
        resultObject[currentKey] = currentValue;
      }
    }
  };

  putValues('', nestedObject, shallowObject);
  return shallowObject;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"DICOMWeb":{"getAttribute.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getAttribute.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getAttribute
});

function getAttribute(element, defaultValue) {
  if (!element) {
    return defaultValue;
  } // Value is not present if the attribute has a zero length value


  if (!element.Value) {
    return defaultValue;
  } // Sanity check to make sure we have at least one entry in the array.


  if (!element.Value.length) {
    return defaultValue;
  }

  return convertToInt(element.Value);
}

;

function convertToInt(input) {
  function padFour(input) {
    var l = input.length;
    if (l == 0) return '0000';
    if (l == 1) return '000' + input;
    if (l == 2) return '00' + input;
    if (l == 3) return '0' + input;
    return input;
  }

  var output = '';

  for (var i = 0; i < input.length; i++) {
    for (var j = 0; j < input[i].length; j++) {
      output += padFour(input[i].charCodeAt(j).toString(16));
    }
  }

  return parseInt(output, 16);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getAuthorizationHeader.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getAuthorizationHeader.js                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getAuthorizationHeader
});
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let btoa;
module.watch(require("isomorphic-base64"), {
  btoa(v) {
    btoa = v;
  }

}, 1);

function getAuthorizationHeader() {
  const headers = {}; // Check for OHIF.user since this can also be run on the server

  const accessToken = OHIF.user && OHIF.user.getAccessToken && OHIF.user.getAccessToken();
  const server = OHIF.servers.getCurrentServer();

  if (server && server.requestOptions && server.requestOptions.auth) {
    // HTTP Basic Auth (user:password)
    headers.Authorization = `Basic ${btoa(server.requestOptions.auth)}`;
  } else if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getModalities.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getModalities.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getModalities
});

function getModalities(modality, modalitiesInStudy) {
  var modalities = {};

  if (modality) {
    modalities = modality;
  }

  if (modalitiesInStudy) {
    // Find vr in modalities
    if (modalities.vr && modalities.vr === modalitiesInStudy.vr) {
      for (var i = 0; i < modalitiesInStudy.Value.length; i++) {
        var value = modalitiesInStudy.Value[i];

        if (modalities.Value.indexOf(value) === -1) {
          modalities.Value.push(value);
        }
      }
    } else {
      modalities = modalitiesInStudy;
    }
  }

  return modalities;
}

;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getName.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getName.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getName
});

function getName(element, defaultValue) {
  if (!element) {
    return defaultValue;
  } // Value is not present if the attribute has a zero length value


  if (!element.Value) {
    return defaultValue;
  } // Sanity check to make sure we have at least one entry in the array.


  if (!element.Value.length) {
    return defaultValue;
  } // Return the Alphabetic component group


  if (element.Value[0].Alphabetic) {
    return element.Value[0].Alphabetic;
  } // Orthanc does not return PN properly so this is a temporary workaround


  return element.Value[0];
}

;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getNumber.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getNumber.js                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getNumber
});

function getNumber(element, defaultValue) {
  if (!element) {
    return defaultValue;
  } // Value is not present if the attribute has a zero length value


  if (!element.Value) {
    return defaultValue;
  } // Sanity check to make sure we have at least one entry in the array.


  if (!element.Value.length) {
    return defaultValue;
  }

  return parseFloat(element.Value[0]);
}

;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getString.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/getString.js                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  default: () => getString
});

function getString(element, defaultValue) {
  if (!element) {
    return defaultValue;
  } // Value is not present if the attribute has a zero length value


  if (!element.Value) {
    return defaultValue;
  } // Sanity check to make sure we have at least one entry in the array.


  if (!element.Value.length) {
    return defaultValue;
  } // Join the array together separated by backslash
  // NOTE: Orthanc does not correctly split values into an array so the join is a no-op


  return element.Value.join('\\');
}

;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/lib/DICOMWeb/index.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let getAttribute;
module.watch(require("./getAttribute.js"), {
  default(v) {
    getAttribute = v;
  }

}, 1);
let getAuthorizationHeader;
module.watch(require("./getAuthorizationHeader.js"), {
  default(v) {
    getAuthorizationHeader = v;
  }

}, 2);
let getModalities;
module.watch(require("./getModalities.js"), {
  default(v) {
    getModalities = v;
  }

}, 3);
let getName;
module.watch(require("./getName.js"), {
  default(v) {
    getName = v;
  }

}, 4);
let getNumber;
module.watch(require("./getNumber.js"), {
  default(v) {
    getNumber = v;
  }

}, 5);
let getString;
module.watch(require("./getString.js"), {
  default(v) {
    getString = v;
  }

}, 6);
const DICOMWeb = {
  getAttribute,
  getAuthorizationHeader,
  getModalities,
  getName,
  getNumber,
  getString
};
OHIF.DICOMWeb = DICOMWeb;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"utils":{"absoluteUrl.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/utils/absoluteUrl.js                                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);

// Return an absolute URL with the page domain using sub path of ROOT_URL
// to let multiple domains directed to the same server work
OHIF.utils.absoluteUrl = function (path) {
  let absolutePath = '/';
  const absoluteUrl = Meteor.absoluteUrl();
  const absoluteUrlParts = absoluteUrl.split('/');

  if (absoluteUrlParts.length > 4) {
    const rootUrlPrefixIndex = absoluteUrl.indexOf(absoluteUrlParts[3]);
    absolutePath += absoluteUrl.substring(rootUrlPrefixIndex) + path;
  } else {
    absolutePath += path;
  }

  return absolutePath.replace(/\/\/+/g, '/');
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/utils/index.js                                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.watch(require("./absoluteUrl"));
module.watch(require("./objectPath"));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"objectPath.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ohif_core/both/utils/objectPath.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);

class ObjectPath {
  /**
   * Set an object property based on "path" (namespace) supplied creating
   * ... intermediary objects if they do not exist.
   * @param object {Object} An object where the properties specified on path should be set.
   * @param path {String} A string representing the property to be set, e.g. "user.study.series.timepoint".
   * @param value {Any} The value of the property that will be set.
   * @return {Boolean} Returns "true" on success, "false" if any intermediate component of the supplied path
   * ... is not a valid Object, in which case the property cannot be set. No excpetions are thrown.
   */
  static set(object, path, value) {
    let components = ObjectPath.getPathComponents(path),
        length = components !== null ? components.length : 0,
        result = false;

    if (length > 0 && ObjectPath.isValidObject(object)) {
      let i = 0,
          last = length - 1,
          currentObject = object;

      while (i < last) {
        let field = components[i];

        if (field in currentObject) {
          if (!ObjectPath.isValidObject(currentObject[field])) {
            break;
          }
        } else {
          currentObject[field] = {};
        }

        currentObject = currentObject[field];
        i++;
      }

      if (i === last) {
        currentObject[components[last]] = value;
        result = true;
      }
    }

    return result;
  }
  /**
   * Get an object property based on "path" (namespace) supplied traversing the object
   * ... tree as necessary.
   * @param object {Object} An object where the properties specified might exist.
   * @param path {String} A string representing the property to be searched for, e.g. "user.study.series.timepoint".
   * @return {Any} The value of the property if found. By default, returns the special type "undefined".
   */


  static get(object, path) {
    let found,
        // undefined by default
    components = ObjectPath.getPathComponents(path),
        length = components !== null ? components.length : 0;

    if (length > 0 && ObjectPath.isValidObject(object)) {
      let i = 0,
          last = length - 1,
          currentObject = object;

      while (i < last) {
        let field = components[i];
        const isValid = ObjectPath.isValidObject(currentObject[field]);

        if (field in currentObject && isValid) {
          currentObject = currentObject[field];
          i++;
        } else {
          break;
        }
      }

      if (i === last && components[last] in currentObject) {
        found = currentObject[components[last]];
      }
    }

    return found;
  }
  /**
   * Check if the supplied argument is a real JavaScript Object instance.
   * @param object {Any} The subject to be tested.
   * @return {Boolean} Returns "true" if the object is a real Object instance and "false" otherwise.
   */


  static isValidObject(object) {
    return typeof object === 'object' && object !== null && object instanceof Object;
  }

  static getPathComponents(path) {
    return typeof path === 'string' ? path.split('.') : null;
  }

}

OHIF.utils.ObjectPath = ObjectPath;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"node_modules":{"isomorphic-base64":{"package.json":function(require,exports){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/ohif_core/node_modules/isomorphic-base64/package.json                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
exports.name = "isomorphic-base64";
exports.version = "1.0.2";
exports.main = "index.js";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/ohif_core/node_modules/isomorphic-base64/index.js                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("/node_modules/meteor/ohif:core/main.js");
require("/node_modules/meteor/ohif:core/both/index.js");

/* Exports */
Package._define("ohif:core", exports);

})();

//# sourceURL=meteor://💻app/packages/ohif_core.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL21haW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6Y29yZS9ib3RoL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmNvcmUvYm90aC9zY2hlbWEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6Y29yZS9ib3RoL2xpYi9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL29iamVjdC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL0RJQ09NV2ViL2dldEF0dHJpYnV0ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL0RJQ09NV2ViL2dldEF1dGhvcml6YXRpb25IZWFkZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6Y29yZS9ib3RoL2xpYi9ESUNPTVdlYi9nZXRNb2RhbGl0aWVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmNvcmUvYm90aC9saWIvRElDT01XZWIvZ2V0TmFtZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL0RJQ09NV2ViL2dldE51bWJlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL0RJQ09NV2ViL2dldFN0cmluZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvbGliL0RJQ09NV2ViL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmNvcmUvYm90aC91dGlscy9hYnNvbHV0ZVVybC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpjb3JlL2JvdGgvdXRpbHMvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6Y29yZS9ib3RoL3V0aWxzL29iamVjdFBhdGguanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiT0hJRiIsIk1ldGVvciIsIndhdGNoIiwicmVxdWlyZSIsInYiLCJsb2ciLCJ1aSIsInV0aWxzIiwidmlld2VyIiwiY29ybmVyc3RvbmUiLCJ1c2VyIiwiRElDT01XZWIiLCJpc0NsaWVudCIsIndpbmRvdyIsIlNpbXBsZVNjaGVtYSIsImV4dGVuZE9wdGlvbnMiLCJ2YWx1ZXNMYWJlbHMiLCJNYXRjaCIsIk9wdGlvbmFsIiwiU3RyaW5nIiwidGV4dE9wdGlvbmFsIiwiQm9vbGVhbiIsImFkZFZhbGlkYXRvciIsImRlZmluaXRpb24iLCJvcHRpb25hbCIsInZhbHVlIiwibWVzc2FnZXMiLCJtYXhDb3VudCIsIm1pbkNvdW50Iiwibm90QWxsb3dlZCIsIm9iamVjdCIsImdldE5lc3RlZE9iamVjdCIsInNoYWxsb3dPYmplY3QiLCJuZXN0ZWRPYmplY3QiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInByb3BlcnR5QXJyYXkiLCJzcGxpdCIsImN1cnJlbnRPYmplY3QiLCJsZW5ndGgiLCJjdXJyZW50UHJvcGVydHkiLCJzaGlmdCIsImdldFNoYWxsb3dPYmplY3QiLCJwdXRWYWx1ZXMiLCJiYXNlS2V5IiwicmVzdWx0T2JqZWN0IiwiY3VycmVudEtleSIsImN1cnJlbnRWYWx1ZSIsIkFycmF5IiwiZGVmYXVsdCIsImdldEF0dHJpYnV0ZSIsImVsZW1lbnQiLCJkZWZhdWx0VmFsdWUiLCJWYWx1ZSIsImNvbnZlcnRUb0ludCIsImlucHV0IiwicGFkRm91ciIsImwiLCJvdXRwdXQiLCJpIiwiaiIsImNoYXJDb2RlQXQiLCJ0b1N0cmluZyIsInBhcnNlSW50IiwiZ2V0QXV0aG9yaXphdGlvbkhlYWRlciIsImJ0b2EiLCJoZWFkZXJzIiwiYWNjZXNzVG9rZW4iLCJnZXRBY2Nlc3NUb2tlbiIsInNlcnZlciIsInNlcnZlcnMiLCJnZXRDdXJyZW50U2VydmVyIiwicmVxdWVzdE9wdGlvbnMiLCJhdXRoIiwiQXV0aG9yaXphdGlvbiIsImdldE1vZGFsaXRpZXMiLCJtb2RhbGl0eSIsIm1vZGFsaXRpZXNJblN0dWR5IiwibW9kYWxpdGllcyIsInZyIiwiaW5kZXhPZiIsInB1c2giLCJnZXROYW1lIiwiQWxwaGFiZXRpYyIsImdldE51bWJlciIsInBhcnNlRmxvYXQiLCJnZXRTdHJpbmciLCJqb2luIiwiYWJzb2x1dGVVcmwiLCJwYXRoIiwiYWJzb2x1dGVQYXRoIiwiYWJzb2x1dGVVcmxQYXJ0cyIsInJvb3RVcmxQcmVmaXhJbmRleCIsInN1YnN0cmluZyIsInJlcGxhY2UiLCJPYmplY3RQYXRoIiwic2V0IiwiY29tcG9uZW50cyIsImdldFBhdGhDb21wb25lbnRzIiwicmVzdWx0IiwiaXNWYWxpZE9iamVjdCIsImxhc3QiLCJmaWVsZCIsImdldCIsImZvdW5kIiwiaXNWYWxpZCIsIk9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE9BQU9DLE1BQVAsQ0FBYztBQUFDQyxRQUFLLE1BQUlBO0FBQVYsQ0FBZDtBQUErQixJQUFJQyxNQUFKO0FBQVdILE9BQU9JLEtBQVAsQ0FBYUMsUUFBUSxlQUFSLENBQWIsRUFBc0M7QUFBQ0YsU0FBT0csQ0FBUCxFQUFTO0FBQUNILGFBQU9HLENBQVA7QUFBUzs7QUFBcEIsQ0FBdEMsRUFBNEQsQ0FBNUQ7O0FBRTFDOzs7QUFJQSxNQUFNSixPQUFPO0FBQ1RLLE9BQUssRUFESTtBQUVUQyxNQUFJLEVBRks7QUFHVEMsU0FBTyxFQUhFO0FBSVRDLFVBQVEsRUFKQztBQUtUQyxlQUFhLEVBTEo7QUFNVEMsUUFBTSxFQU5HO0FBT1RDLFlBQVUsRUFQRCxDQU9LOztBQVBMLENBQWIsQyxDQVVBO0FBQ0E7O0FBQ0EsSUFBSVYsT0FBT1csUUFBWCxFQUFxQjtBQUNqQkMsU0FBT2IsSUFBUCxHQUFjQSxJQUFkO0FBQ0gsQzs7Ozs7Ozs7Ozs7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RCxNQUdPO0FBQ0g7QUFDSDtBQUVKOztBQUVELFVBQUlBLE1BQU0wQyxJQUFOLElBQWNKLFdBQVdJLElBQVgsS0FBb0IvRCxhQUF0QyxFQUFxRDtBQUNqRGtFLGdCQUFRbEUsY0FBYzJELFdBQVdJLElBQVgsQ0FBZCxDQUFSO0FBQ0g7QUFFSjs7QUFFRCxXQUFPRyxLQUFQO0FBRUg7QUFFRDs7Ozs7OztBQUtBLFNBQU9KLGFBQVAsQ0FBcUJ0RSxNQUFyQixFQUE2QjtBQUN6QixXQUNJLE9BQU9BLE1BQVAsS0FBa0IsUUFBbEIsSUFDQUEsV0FBVyxJQURYLElBRUFBLGtCQUFrQjRFLE1BSHRCO0FBS0g7O0FBRUQsU0FBT1IsaUJBQVAsQ0FBeUJULElBQXpCLEVBQStCO0FBQzNCLFdBQVEsT0FBT0EsSUFBUCxLQUFnQixRQUFoQixHQUEyQkEsS0FBS3BELEtBQUwsQ0FBVyxHQUFYLENBQTNCLEdBQTZDLElBQXJEO0FBQ0g7O0FBN0dZOztBQWlIakJyQyxLQUFLTyxLQUFMLENBQVd3RixVQUFYLEdBQXdCQSxVQUF4QixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX2NvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuXHJcbi8qXHJcbiAqIERlZmluZXMgdGhlIGJhc2UgT0hJRiBvYmplY3RcclxuICovXHJcblxyXG5jb25zdCBPSElGID0ge1xyXG4gICAgbG9nOiB7fSxcclxuICAgIHVpOiB7fSxcclxuICAgIHV0aWxzOiB7fSxcclxuICAgIHZpZXdlcjoge30sXHJcbiAgICBjb3JuZXJzdG9uZToge30sXHJcbiAgICB1c2VyOiB7fSxcclxuICAgIERJQ09NV2ViOiB7fSwgLy8gVGVtcG9yYXJpbHkgYWRkZWRcclxufTtcclxuXHJcbi8vIEV4cG9zZSB0aGUgT0hJRiBvYmplY3QgdG8gdGhlIGNsaWVudCBpZiBpdCBpcyBvbiBkZXZlbG9wbWVudCBtb2RlXHJcbi8vIEBUT0RPOiByZW1vdmUgdGhpcyBhZnRlciBhcHBseWluZyBuYW1lc3BhY2UgdG8gdGhpcyBwYWNrYWdlXHJcbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcclxuICAgIHdpbmRvdy5PSElGID0gT0hJRjtcclxufVxyXG5cclxuZXhwb3J0IHsgT0hJRiB9O1xyXG4iLCJpbXBvcnQgJy4vbGliJztcclxuaW1wb3J0ICcuL3V0aWxzJztcclxuXHJcbmltcG9ydCAnLi9zY2hlbWEuanMnO1xyXG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICdtZXRlb3IvYWxkZWVkOnNpbXBsZS1zY2hlbWEnO1xyXG5cclxuLypcclxuIEV4dGVuZCB0aGUgYXZhaWxhYmxlIG9wdGlvbnMgb24gc2NoZW1hIGRlZmluaXRpb25zOlxyXG5cclxuICAqIHZhbHVlc0xhYmVsczogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGFsbG93ZWRWYWx1ZXMgdG8gZGVmaW5lIHRoZSB0ZXh0XHJcbiAgICBsYWJlbCBmb3IgZWFjaCB2YWx1ZSAodXNlZCBvbiBmb3JtcylcclxuXHJcbiAgKiB0ZXh0T3B0aW9uYWw6IFVzZWQgdG8gYWxsb3cgZW1wdHkgc3RyaW5nc1xyXG5cclxuICovXHJcblNpbXBsZVNjaGVtYS5leHRlbmRPcHRpb25zKHtcclxuICAgIHZhbHVlc0xhYmVsczogTWF0Y2guT3B0aW9uYWwoW1N0cmluZ10pLFxyXG4gICAgdGV4dE9wdGlvbmFsOiBNYXRjaC5PcHRpb25hbChCb29sZWFuKVxyXG59KTtcclxuXHJcbi8vIEFkZCBkZWZhdWx0IHJlcXVpcmVkIHZhbGlkYXRpb24gZm9yIGVtcHR5IHN0cmluZ3Mgd2hpY2ggY2FuIGJlIGJ5cGFzc2VkXHJcbi8vIHVzaW5nIHRleHRPcHRpb25hbD10cnVlIGRlZmluaXRpb25cclxuU2ltcGxlU2NoZW1hLmFkZFZhbGlkYXRvcihmdW5jdGlvbigpIHtcclxuICAgIGlmIChcclxuICAgICAgICB0aGlzLmRlZmluaXRpb24ub3B0aW9uYWwgIT09IHRydWUgJiZcclxuICAgICAgICB0aGlzLmRlZmluaXRpb24udGV4dE9wdGlvbmFsICE9PSB0cnVlICYmXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9PT0gJydcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiAncmVxdWlyZWQnO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIEluY2x1ZGluZyBbbGFiZWxdIGZvciBzb21lIG1lc3NhZ2VzXHJcblNpbXBsZVNjaGVtYS5tZXNzYWdlcyh7XHJcbiAgICBtYXhDb3VudDogJ1tsYWJlbF0gY2FuIG5vdCBoYXZlIG1vcmUgdGhhbiBbbWF4Q291bnRdIHZhbHVlcycsXHJcbiAgICBtaW5Db3VudDogJ1tsYWJlbF0gbXVzdCBoYXZlIGF0IGxlYXN0IFttaW5Db3VudF0gdmFsdWVzJyxcclxuICAgIG5vdEFsbG93ZWQ6ICdbbGFiZWxdIGhhcyBhbiBpbnZhbGlkIHZhbHVlOiBcIlt2YWx1ZV1cIidcclxufSk7XHJcbiIsImltcG9ydCAnLi9vYmplY3QuanMnO1xyXG5pbXBvcnQgJy4vRElDT01XZWIvJztcclxuIiwiaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuT0hJRi5vYmplY3QgPSB7fTtcclxuXHJcbi8vIFRyYW5zZm9ybXMgYSBzaGFsbG93IG9iamVjdCB3aXRoIGtleXMgc2VwYXJhdGVkIGJ5IFwiLlwiIGludG8gYSBuZXN0ZWQgb2JqZWN0XHJcbk9ISUYub2JqZWN0LmdldE5lc3RlZE9iamVjdCA9IHNoYWxsb3dPYmplY3QgPT4ge1xyXG4gICAgY29uc3QgbmVzdGVkT2JqZWN0ID0ge307XHJcbiAgICBmb3IgKGxldCBrZXkgaW4gc2hhbGxvd09iamVjdCkge1xyXG4gICAgICAgIGlmICghc2hhbGxvd09iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IHNoYWxsb3dPYmplY3Rba2V5XTtcclxuICAgICAgICBjb25zdCBwcm9wZXJ0eUFycmF5ID0ga2V5LnNwbGl0KCcuJyk7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRPYmplY3QgPSBuZXN0ZWRPYmplY3Q7XHJcbiAgICAgICAgd2hpbGUgKHByb3BlcnR5QXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wZXJ0eSA9IHByb3BlcnR5QXJyYXkuc2hpZnQoKTtcclxuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eUFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE9iamVjdFtjdXJyZW50UHJvcGVydHldID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRPYmplY3RbY3VycmVudFByb3BlcnR5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmplY3RbY3VycmVudFByb3BlcnR5XSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmplY3QgPSBjdXJyZW50T2JqZWN0W2N1cnJlbnRQcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5lc3RlZE9iamVjdDtcclxufTtcclxuXHJcbi8vIFRyYW5zZm9ybXMgYSBuZXN0ZWQgb2JqZWN0IGludG8gYSBzaGFsbG93T2JqZWN0IG1lcmdpbmcgaXRzIGtleXMgd2l0aCBcIi5cIiBjaGFyYWN0ZXJcclxuT0hJRi5vYmplY3QuZ2V0U2hhbGxvd09iamVjdCA9IG5lc3RlZE9iamVjdCA9PiB7XHJcbiAgICBjb25zdCBzaGFsbG93T2JqZWN0ID0ge307XHJcbiAgICBjb25zdCBwdXRWYWx1ZXMgPSAoYmFzZUtleSwgbmVzdGVkT2JqZWN0LCByZXN1bHRPYmplY3QpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gbmVzdGVkT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmICghbmVzdGVkT2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudEtleSA9IGJhc2VLZXkgPyBgJHtiYXNlS2V5fS4ke2tleX1gIDoga2V5O1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBuZXN0ZWRPYmplY3Rba2V5XTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50S2V5ICs9ICdbXSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcHV0VmFsdWVzKGN1cnJlbnRLZXksIGN1cnJlbnRWYWx1ZSwgcmVzdWx0T2JqZWN0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdE9iamVjdFtjdXJyZW50S2V5XSA9IGN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHV0VmFsdWVzKCcnLCBuZXN0ZWRPYmplY3QsIHNoYWxsb3dPYmplY3QpO1xyXG4gICAgcmV0dXJuIHNoYWxsb3dPYmplY3Q7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBhcyBhIGRpY29tIGF0dHJpYnV0ZSBncm91cC9lbGVtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIFRoZSBncm91cC9lbGVtZW50IG9mIHRoZSBlbGVtZW50IChlLmcuICcwMDI4MDAwOScpXHJcbiAqIEBwYXJhbSBbZGVmYXVsdFZhbHVlXSAtIFRoZSB2YWx1ZSB0byByZXR1cm4gaWYgdGhlIGVsZW1lbnQgaXMgbm90IHByZXNlbnRcclxuICogQHJldHVybnMgeyp9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRBdHRyaWJ1dGUoZWxlbWVudCwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICBpZiAoIWVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgLy8gVmFsdWUgaXMgbm90IHByZXNlbnQgaWYgdGhlIGF0dHJpYnV0ZSBoYXMgYSB6ZXJvIGxlbmd0aCB2YWx1ZVxyXG4gICAgaWYgKCFlbGVtZW50LlZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIC8vIFNhbml0eSBjaGVjayB0byBtYWtlIHN1cmUgd2UgaGF2ZSBhdCBsZWFzdCBvbmUgZW50cnkgaW4gdGhlIGFycmF5LlxyXG4gICAgaWYgKCFlbGVtZW50LlZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbnZlcnRUb0ludChlbGVtZW50LlZhbHVlKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNvbnZlcnRUb0ludChpbnB1dCkge1xyXG4gICAgZnVuY3Rpb24gcGFkRm91cihpbnB1dCkge1xyXG4gICAgICAgIHZhciBsID0gaW5wdXQubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAobCA9PSAwKSByZXR1cm4gJzAwMDAnO1xyXG4gICAgICAgIGlmIChsID09IDEpIHJldHVybiAnMDAwJyArIGlucHV0O1xyXG4gICAgICAgIGlmIChsID09IDIpIHJldHVybiAnMDAnICsgaW5wdXQ7XHJcbiAgICAgICAgaWYgKGwgPT0gMykgcmV0dXJuICcwJyArIGlucHV0O1xyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG91dHB1dCA9ICcnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaW5wdXRbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IHBhZEZvdXIoaW5wdXRbaV0uY2hhckNvZGVBdChqKS50b1N0cmluZygxNikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFyc2VJbnQob3V0cHV0LCAxNik7XHJcbn1cclxuIiwiaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5pbXBvcnQgeyBidG9hIH0gZnJvbSAnaXNvbW9ycGhpYy1iYXNlNjQnO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIEF1dGhvcml6YXRpb24gaGVhZGVyIGFzIHBhcnQgb2YgYW4gT2JqZWN0LlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0QXV0aG9yaXphdGlvbkhlYWRlcigpIHtcclxuICAgIGNvbnN0IGhlYWRlcnMgPSB7fTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgT0hJRi51c2VyIHNpbmNlIHRoaXMgY2FuIGFsc28gYmUgcnVuIG9uIHRoZSBzZXJ2ZXJcclxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gT0hJRi51c2VyICYmIE9ISUYudXNlci5nZXRBY2Nlc3NUb2tlbiAmJiBPSElGLnVzZXIuZ2V0QWNjZXNzVG9rZW4oKTtcclxuICAgIGNvbnN0IHNlcnZlciA9IE9ISUYuc2VydmVycy5nZXRDdXJyZW50U2VydmVyKCk7XHJcblxyXG4gICAgaWYgKHNlcnZlciAmJlxyXG4gICAgICAgIHNlcnZlci5yZXF1ZXN0T3B0aW9ucyAmJlxyXG4gICAgICAgIHNlcnZlci5yZXF1ZXN0T3B0aW9ucy5hdXRoKSB7XHJcbiAgICAgICAgLy8gSFRUUCBCYXNpYyBBdXRoICh1c2VyOnBhc3N3b3JkKVxyXG4gICAgICAgIGhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IGBCYXNpYyAke2J0b2Eoc2VydmVyLnJlcXVlc3RPcHRpb25zLmF1dGgpfWA7XHJcbiAgICB9IGVsc2UgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgaGVhZGVycy5BdXRob3JpemF0aW9uID0gYEJlYXJlciAke2FjY2Vzc1Rva2VufWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGhlYWRlcnM7XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TW9kYWxpdGllcyhtb2RhbGl0eSwgbW9kYWxpdGllc0luU3R1ZHkpIHtcclxuICAgIHZhciBtb2RhbGl0aWVzID0ge307XHJcbiAgICBpZiAobW9kYWxpdHkpIHtcclxuICAgICAgICBtb2RhbGl0aWVzID0gbW9kYWxpdHk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1vZGFsaXRpZXNJblN0dWR5KSB7XHJcbiAgICAgICAgLy8gRmluZCB2ciBpbiBtb2RhbGl0aWVzXHJcbiAgICAgICAgaWYgKG1vZGFsaXRpZXMudnIgJiYgbW9kYWxpdGllcy52ciA9PT0gbW9kYWxpdGllc0luU3R1ZHkudnIpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RhbGl0aWVzSW5TdHVkeS5WYWx1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbW9kYWxpdGllc0luU3R1ZHkuVmFsdWVbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAobW9kYWxpdGllcy5WYWx1ZS5pbmRleE9mKHZhbHVlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbGl0aWVzLlZhbHVlLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9kYWxpdGllcyA9IG1vZGFsaXRpZXNJblN0dWR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtb2RhbGl0aWVzO1xyXG59O1xyXG4iLCIvKipcclxuICogUmV0dXJucyB0aGUgQWxwaGFiZXRpYyB2ZXJzaW9uIG9mIGEgUE5cclxuICpcclxuICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgZ3JvdXAvZWxlbWVudCBvZiB0aGUgZWxlbWVudCAoZS5nLiAnMDAyMDAwMTMnKVxyXG4gKiBAcGFyYW0gW2RlZmF1bHRWYWx1ZV0gLSBUaGUgZGVmYXVsdCB2YWx1ZSB0byByZXR1cm4gaWYgdGhlIGVsZW1lbnQgaXMgbm90IGZvdW5kXHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TmFtZShlbGVtZW50LCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIGlmICghZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcbiAgICAvLyBWYWx1ZSBpcyBub3QgcHJlc2VudCBpZiB0aGUgYXR0cmlidXRlIGhhcyBhIHplcm8gbGVuZ3RoIHZhbHVlXHJcbiAgICBpZiAoIWVsZW1lbnQuVmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgLy8gU2FuaXR5IGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IG9uZSBlbnRyeSBpbiB0aGUgYXJyYXkuXHJcbiAgICBpZiAoIWVsZW1lbnQuVmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIC8vIFJldHVybiB0aGUgQWxwaGFiZXRpYyBjb21wb25lbnQgZ3JvdXBcclxuICAgIGlmIChlbGVtZW50LlZhbHVlWzBdLkFscGhhYmV0aWMpIHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5WYWx1ZVswXS5BbHBoYWJldGljO1xyXG4gICAgfVxyXG4gICAgLy8gT3J0aGFuYyBkb2VzIG5vdCByZXR1cm4gUE4gcHJvcGVybHkgc28gdGhpcyBpcyBhIHRlbXBvcmFyeSB3b3JrYXJvdW5kXHJcbiAgICByZXR1cm4gZWxlbWVudC5WYWx1ZVswXTtcclxufTtcclxuIiwiLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IHN0cmluZyB2YWx1ZSBhcyBhIEphdmFzY3JpcHQgTnVtYmVyXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gVGhlIGdyb3VwL2VsZW1lbnQgb2YgdGhlIGVsZW1lbnQgKGUuZy4gJzAwMjAwMDEzJylcclxuICogQHBhcmFtIFtkZWZhdWx0VmFsdWVdIC0gVGhlIGRlZmF1bHQgdmFsdWUgdG8gcmV0dXJuIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0XHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TnVtYmVyKGVsZW1lbnQsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIC8vIFZhbHVlIGlzIG5vdCBwcmVzZW50IGlmIHRoZSBhdHRyaWJ1dGUgaGFzIGEgemVybyBsZW5ndGggdmFsdWVcclxuICAgIGlmICghZWxlbWVudC5WYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcbiAgICAvLyBTYW5pdHkgY2hlY2sgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYXQgbGVhc3Qgb25lIGVudHJ5IGluIHRoZSBhcnJheS5cclxuICAgIGlmICghZWxlbWVudC5WYWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXJzZUZsb2F0KGVsZW1lbnQuVmFsdWVbMF0pO1xyXG59O1xyXG4iLCIvKipcclxuICogUmV0dXJucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgYXMgYSBzdHJpbmcuICBNdWx0aS12YWx1ZWQgZWxlbWVudHMgd2lsbCBiZSBzZXBhcmF0ZWQgYnkgYSBiYWNrc2xhc2hcclxuICpcclxuICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgZ3JvdXAvZWxlbWVudCBvZiB0aGUgZWxlbWVudCAoZS5nLiAnMDAyMDAwMTMnKVxyXG4gKiBAcGFyYW0gW2RlZmF1bHRWYWx1ZV0gLSBUaGUgdmFsdWUgdG8gcmV0dXJuIGlmIHRoZSBlbGVtZW50IGlzIG5vdCBwcmVzZW50XHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U3RyaW5nKGVsZW1lbnQsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgaWYgKCFlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIC8vIFZhbHVlIGlzIG5vdCBwcmVzZW50IGlmIHRoZSBhdHRyaWJ1dGUgaGFzIGEgemVybyBsZW5ndGggdmFsdWVcclxuICAgIGlmICghZWxlbWVudC5WYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcbiAgICAvLyBTYW5pdHkgY2hlY2sgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYXQgbGVhc3Qgb25lIGVudHJ5IGluIHRoZSBhcnJheS5cclxuICAgIGlmICghZWxlbWVudC5WYWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgLy8gSm9pbiB0aGUgYXJyYXkgdG9nZXRoZXIgc2VwYXJhdGVkIGJ5IGJhY2tzbGFzaFxyXG4gICAgLy8gTk9URTogT3J0aGFuYyBkb2VzIG5vdCBjb3JyZWN0bHkgc3BsaXQgdmFsdWVzIGludG8gYW4gYXJyYXkgc28gdGhlIGpvaW4gaXMgYSBuby1vcFxyXG4gICAgcmV0dXJuIGVsZW1lbnQuVmFsdWUuam9pbignXFxcXCcpO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5pbXBvcnQgZ2V0QXR0cmlidXRlIGZyb20gJy4vZ2V0QXR0cmlidXRlLmpzJztcclxuaW1wb3J0IGdldEF1dGhvcml6YXRpb25IZWFkZXIgZnJvbSAnLi9nZXRBdXRob3JpemF0aW9uSGVhZGVyLmpzJztcclxuaW1wb3J0IGdldE1vZGFsaXRpZXMgZnJvbSAnLi9nZXRNb2RhbGl0aWVzLmpzJztcclxuaW1wb3J0IGdldE5hbWUgZnJvbSAnLi9nZXROYW1lLmpzJztcclxuaW1wb3J0IGdldE51bWJlciBmcm9tICcuL2dldE51bWJlci5qcyc7XHJcbmltcG9ydCBnZXRTdHJpbmcgZnJvbSAnLi9nZXRTdHJpbmcuanMnO1xyXG5cclxuY29uc3QgRElDT01XZWIgPSB7XHJcbiAgICBnZXRBdHRyaWJ1dGUsXHJcbiAgICBnZXRBdXRob3JpemF0aW9uSGVhZGVyLFxyXG4gICAgZ2V0TW9kYWxpdGllcyxcclxuICAgIGdldE5hbWUsXHJcbiAgICBnZXROdW1iZXIsXHJcbiAgICBnZXRTdHJpbmcsXHJcbn07XHJcblxyXG5PSElGLkRJQ09NV2ViID0gRElDT01XZWI7XHJcbiIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuXHJcbi8vIFJldHVybiBhbiBhYnNvbHV0ZSBVUkwgd2l0aCB0aGUgcGFnZSBkb21haW4gdXNpbmcgc3ViIHBhdGggb2YgUk9PVF9VUkxcclxuLy8gdG8gbGV0IG11bHRpcGxlIGRvbWFpbnMgZGlyZWN0ZWQgdG8gdGhlIHNhbWUgc2VydmVyIHdvcmtcclxuT0hJRi51dGlscy5hYnNvbHV0ZVVybCA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgIGxldCBhYnNvbHV0ZVBhdGggPSAnLyc7XHJcblxyXG4gICAgY29uc3QgYWJzb2x1dGVVcmwgPSBNZXRlb3IuYWJzb2x1dGVVcmwoKTtcclxuICAgIGNvbnN0IGFic29sdXRlVXJsUGFydHMgPSBhYnNvbHV0ZVVybC5zcGxpdCgnLycpO1xyXG5cclxuICAgIGlmIChhYnNvbHV0ZVVybFBhcnRzLmxlbmd0aCA+IDQpIHtcclxuICAgICAgICBjb25zdCByb290VXJsUHJlZml4SW5kZXggPSBhYnNvbHV0ZVVybC5pbmRleE9mKGFic29sdXRlVXJsUGFydHNbM10pO1xyXG4gICAgICAgIGFic29sdXRlUGF0aCArPSBhYnNvbHV0ZVVybC5zdWJzdHJpbmcocm9vdFVybFByZWZpeEluZGV4KSArIHBhdGg7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFic29sdXRlUGF0aCArPSBwYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhYnNvbHV0ZVBhdGgucmVwbGFjZSgvXFwvXFwvKy9nLCAnLycpO1xyXG59O1xyXG4iLCJpbXBvcnQgJy4vYWJzb2x1dGVVcmwnO1xyXG5pbXBvcnQgJy4vb2JqZWN0UGF0aCc7XHJcbiIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuXHJcbmNsYXNzIE9iamVjdFBhdGgge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGFuIG9iamVjdCBwcm9wZXJ0eSBiYXNlZCBvbiBcInBhdGhcIiAobmFtZXNwYWNlKSBzdXBwbGllZCBjcmVhdGluZ1xyXG4gICAgICogLi4uIGludGVybWVkaWFyeSBvYmplY3RzIGlmIHRoZXkgZG8gbm90IGV4aXN0LlxyXG4gICAgICogQHBhcmFtIG9iamVjdCB7T2JqZWN0fSBBbiBvYmplY3Qgd2hlcmUgdGhlIHByb3BlcnRpZXMgc3BlY2lmaWVkIG9uIHBhdGggc2hvdWxkIGJlIHNldC5cclxuICAgICAqIEBwYXJhbSBwYXRoIHtTdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJvcGVydHkgdG8gYmUgc2V0LCBlLmcuIFwidXNlci5zdHVkeS5zZXJpZXMudGltZXBvaW50XCIuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUge0FueX0gVGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSB0aGF0IHdpbGwgYmUgc2V0LlxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBcInRydWVcIiBvbiBzdWNjZXNzLCBcImZhbHNlXCIgaWYgYW55IGludGVybWVkaWF0ZSBjb21wb25lbnQgb2YgdGhlIHN1cHBsaWVkIHBhdGhcclxuICAgICAqIC4uLiBpcyBub3QgYSB2YWxpZCBPYmplY3QsIGluIHdoaWNoIGNhc2UgdGhlIHByb3BlcnR5IGNhbm5vdCBiZSBzZXQuIE5vIGV4Y3BldGlvbnMgYXJlIHRocm93bi5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNldChvYmplY3QsIHBhdGgsIHZhbHVlKSB7XHJcblxyXG4gICAgICAgIGxldCBjb21wb25lbnRzID0gT2JqZWN0UGF0aC5nZXRQYXRoQ29tcG9uZW50cyhwYXRoKSxcclxuICAgICAgICAgICAgbGVuZ3RoID0gY29tcG9uZW50cyAhPT0gbnVsbCA/IGNvbXBvbmVudHMubGVuZ3RoIDogMCxcclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChsZW5ndGggPiAwICYmIE9iamVjdFBhdGguaXNWYWxpZE9iamVjdChvYmplY3QpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgaSA9IDAsXHJcbiAgICAgICAgICAgICAgICBsYXN0ID0gbGVuZ3RoIC0gMSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmplY3QgPSBvYmplY3Q7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxhc3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZmllbGQgPSBjb21wb25lbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWVsZCBpbiBjdXJyZW50T2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFPYmplY3RQYXRoLmlzVmFsaWRPYmplY3QoY3VycmVudE9iamVjdFtmaWVsZF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE9iamVjdFtmaWVsZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFtmaWVsZF07XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFzdCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE9iamVjdFtjb21wb25lbnRzW2xhc3RdXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGFuIG9iamVjdCBwcm9wZXJ0eSBiYXNlZCBvbiBcInBhdGhcIiAobmFtZXNwYWNlKSBzdXBwbGllZCB0cmF2ZXJzaW5nIHRoZSBvYmplY3RcclxuICAgICAqIC4uLiB0cmVlIGFzIG5lY2Vzc2FyeS5cclxuICAgICAqIEBwYXJhbSBvYmplY3Qge09iamVjdH0gQW4gb2JqZWN0IHdoZXJlIHRoZSBwcm9wZXJ0aWVzIHNwZWNpZmllZCBtaWdodCBleGlzdC5cclxuICAgICAqIEBwYXJhbSBwYXRoIHtTdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJvcGVydHkgdG8gYmUgc2VhcmNoZWQgZm9yLCBlLmcuIFwidXNlci5zdHVkeS5zZXJpZXMudGltZXBvaW50XCIuXHJcbiAgICAgKiBAcmV0dXJuIHtBbnl9IFRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgaWYgZm91bmQuIEJ5IGRlZmF1bHQsIHJldHVybnMgdGhlIHNwZWNpYWwgdHlwZSBcInVuZGVmaW5lZFwiLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0KG9iamVjdCwgcGF0aCkge1xyXG5cclxuICAgICAgICBsZXQgZm91bmQsIC8vIHVuZGVmaW5lZCBieSBkZWZhdWx0XHJcbiAgICAgICAgICAgIGNvbXBvbmVudHMgPSBPYmplY3RQYXRoLmdldFBhdGhDb21wb25lbnRzKHBhdGgpLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBjb21wb25lbnRzICE9PSBudWxsID8gY29tcG9uZW50cy5sZW5ndGggOiAwO1xyXG5cclxuICAgICAgICBpZiAobGVuZ3RoID4gMCAmJiBPYmplY3RQYXRoLmlzVmFsaWRPYmplY3Qob2JqZWN0KSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGkgPSAwLFxyXG4gICAgICAgICAgICAgICAgbGFzdCA9IGxlbmd0aCAtIDEsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gb2JqZWN0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBsYXN0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGZpZWxkID0gY29tcG9uZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gT2JqZWN0UGF0aC5pc1ZhbGlkT2JqZWN0KGN1cnJlbnRPYmplY3RbZmllbGRdKTtcclxuICAgICAgICAgICAgICAgIGlmIChmaWVsZCBpbiBjdXJyZW50T2JqZWN0ICYmIGlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2JqZWN0ID0gY3VycmVudE9iamVjdFtmaWVsZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpID09PSBsYXN0ICYmIGNvbXBvbmVudHNbbGFzdF0gaW4gY3VycmVudE9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBjdXJyZW50T2JqZWN0W2NvbXBvbmVudHNbbGFzdF1dO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZSBzdXBwbGllZCBhcmd1bWVudCBpcyBhIHJlYWwgSmF2YVNjcmlwdCBPYmplY3QgaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gb2JqZWN0IHtBbnl9IFRoZSBzdWJqZWN0IHRvIGJlIHRlc3RlZC5cclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgXCJ0cnVlXCIgaWYgdGhlIG9iamVjdCBpcyBhIHJlYWwgT2JqZWN0IGluc3RhbmNlIGFuZCBcImZhbHNlXCIgb3RoZXJ3aXNlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNWYWxpZE9iamVjdChvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICAgICAgICBvYmplY3QgIT09IG51bGwgJiZcclxuICAgICAgICAgICAgb2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0UGF0aENvbXBvbmVudHMocGF0aCkge1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnID8gcGF0aC5zcGxpdCgnLicpIDogbnVsbCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5PSElGLnV0aWxzLk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xyXG4iXX0=
