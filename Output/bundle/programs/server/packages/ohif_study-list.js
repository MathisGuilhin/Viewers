(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var WADOProxy = Package['ohif:wadoproxy'].WADOProxy;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Collection2 = Package['aldeed:collection2-core'].Collection2;
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
var _ = Package.underscore._;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var HTML = Package.htmljs.HTML;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:study-list":{"both":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/both/index.js                                                              //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
module.watch(require("./base.js"));
module.watch(require("./collections.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"base.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/both/base.js                                                               //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.studylist = {
  collections: {},
  actions: {}
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collections.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/both/collections.js                                                        //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
module.export({
  StudyImportStatus: () => StudyImportStatus
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
const StudyImportStatus = new Mongo.Collection('studyImportStatus');
StudyImportStatus._debugName = 'StudyImportStatus';
OHIF.studylist.collections.StudyImportStatus = StudyImportStatus;
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/server/index.js                                                            //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
module.watch(require("./methods"));
module.watch(require("./publications.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publications.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/server/publications.js                                                     //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
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
Meteor.publish('studyImportStatus', () => OHIF.studylist.collections.StudyImportStatus.find());
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods":{"importStudies.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/server/methods/importStudies.js                                            //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
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

const fs = Npm.require('fs');

const fiber = Npm.require('fibers');

WebApp.connectHandlers.use('/uploadFilesToImport', function (req, res) {
  if (!req.headers.filename) {
    //  Response: BAD REQUEST (400)
    res.statusCode = 400;
    res.end();
  } //  Store files in temp location (they will be deleted when their import operations are completed)


  const dicomDir = '/tmp/dicomDir';
  createFolderIfNotExist(dicomDir);
  const fullFileName = dicomDir + '/' + req.headers.filename;
  const file = fs.createWriteStream(fullFileName);
  file.on('error', function (error) {
    OHIF.log.warn(error); //  Response: INTERNAL SERVER ERROR (500)

    res.statusCode = 400;
    res.end();
  });
  file.on('finish', function () {
    //  Response: SUCCESS (200)
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end(fullFileName);
  }); //  Pipe the request to the file

  req.pipe(file);
});
Meteor.methods({
  /**
   * Returns true if import is supported for default service type
   * @returns {boolean}
   */
  importSupported: function () {
    const server = OHIF.servers.getCurrentServer();

    if (server && server.type === 'dimse') {
      return true;
    }
  },

  /**
   * Imports studies from local into study list
   * @param studiesToImport Studies to import
   * @param studyImportStatusId Study import status collection id to track import status
   */
  importStudies: function (studiesToImport, studyImportStatusId) {
    if (!studiesToImport || !studyImportStatusId) {
      return;
    }

    const server = OHIF.servers.getCurrentServer();

    if (!server) {
      throw 'No properly configured server was available over DICOMWeb or DIMSE.';
    }

    if (server.type === 'dicomWeb') {
      //TODO: Support importing studies into dicomWeb
      OHIF.log.warn('Importing studies into dicomWeb is currently not supported.');
    } else if (server.type === 'dimse') {
      importStudiesDIMSE(studiesToImport, studyImportStatusId);
    }
  },

  /**
   * Create a new study import status item and insert it into the collection to track import status
   * @returns {studyImportStatusId: string}
   */
  createStudyImportStatus: function () {
    const studyImportStatus = {
      numberOfStudiesImported: 0,
      numberOfStudiesFailed: 0
    };
    return OHIF.studylist.collections.StudyImportStatus.insert(studyImportStatus);
  },

  /**
   * Remove the study import status item from the collection
   * @param id Collection id of the study import status in the collection
   */
  removeStudyImportStatus: function (id) {
    OHIF.studylist.collections.StudyImportStatus.remove(id);
  }
});

function importStudiesDIMSE(studiesToImport, studyImportStatusId) {
  if (!studiesToImport || !studyImportStatusId) {
    return;
  } //  Perform C-Store to import studies and handle the callbacks to update import status


  DIMSE.storeInstances(studiesToImport, function (err, file) {
    try {
      //  Use fiber to be able to modify meteor collection in callback
      fiber(function () {
        try {
          //  Update the import status
          if (err) {
            OHIF.studylist.collections.StudyImportStatus.update({
              _id: studyImportStatusId
            }, {
              $inc: {
                numberOfStudiesFailed: 1
              }
            });
            OHIF.log.warn('Failed to import study via DIMSE: ', file, err);
          } else {
            OHIF.studylist.collections.StudyImportStatus.update({
              _id: studyImportStatusId
            }, {
              $inc: {
                numberOfStudiesImported: 1
              }
            });
            OHIF.log.info('Study successfully imported via DIMSE: ', file);
          }
        } catch (error) {
          OHIF.studylist.collections.StudyImportStatus.update({
            _id: studyImportStatusId
          }, {
            $inc: {
              numberOfStudiesFailed: 1
            }
          });
          OHIF.log.warn('Failed to import study via DIMSE: ', file, error);
        } finally {
          //  The import operation of this file is completed, so delete it if still exists
          if (fileExists(file)) {
            fs.unlink(file);
          }
        }
      }).run();
    } catch (error) {
      OHIF.studylist.collections.StudyImportStatus.update({
        _id: studyImportStatusId
      }, {
        $inc: {
          numberOfStudiesFailed: 1
        }
      });
      OHIF.log.warn('Failed to import study via DIMSE: ', file, error);
    }
  });
}

function createFolderIfNotExist(folder) {
  const folderParts = folder.split('/');
  let folderPart = folderParts[0];

  for (let i = 1; i < folderParts.length; i++) {
    folderPart += '/' + folderParts[i];

    if (!folderExists(folderPart)) {
      fs.mkdirSync(folderPart);
    }
  }
}

function fileExists(folder) {
  try {
    return fs.statSync(folder).isFile();
  } catch (err) {
    return false;
  }
}

function folderExists(folder) {
  try {
    return fs.statSync(folder).isDirectory();
  } catch (err) {
    return false;
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ohif_study-list/server/methods/index.js                                                    //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
module.watch(require("./importStudies.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:study-list/both/index.js");
require("/node_modules/meteor/ohif:study-list/server/index.js");

/* Exports */
Package._define("ohif:study-list");

})();

//# sourceURL=meteor://💻app/packages/ohif_study-list.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkeS1saXN0L2JvdGgvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZHktbGlzdC9ib3RoL2Jhc2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZHktbGlzdC9ib3RoL2NvbGxlY3Rpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWR5LWxpc3Qvc2VydmVyL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWR5LWxpc3Qvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkeS1saXN0L3NlcnZlci9tZXRob2RzL2ltcG9ydFN0dWRpZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZHktbGlzdC9zZXJ2ZXIvbWV0aG9kcy9pbmRleC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJ3YXRjaCIsInJlcXVpcmUiLCJPSElGIiwidiIsInN0dWR5bGlzdCIsImNvbGxlY3Rpb25zIiwiYWN0aW9ucyIsImV4cG9ydCIsIlN0dWR5SW1wb3J0U3RhdHVzIiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiX2RlYnVnTmFtZSIsIk1ldGVvciIsInB1Ymxpc2giLCJmaW5kIiwiZnMiLCJOcG0iLCJmaWJlciIsIldlYkFwcCIsImNvbm5lY3RIYW5kbGVycyIsInVzZSIsInJlcSIsInJlcyIsImhlYWRlcnMiLCJmaWxlbmFtZSIsInN0YXR1c0NvZGUiLCJlbmQiLCJkaWNvbURpciIsImNyZWF0ZUZvbGRlcklmTm90RXhpc3QiLCJmdWxsRmlsZU5hbWUiLCJmaWxlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsIndyaXRlSGVhZCIsInBpcGUiLCJtZXRob2RzIiwiaW1wb3J0U3VwcG9ydGVkIiwic2VydmVyIiwic2VydmVycyIsImdldEN1cnJlbnRTZXJ2ZXIiLCJ0eXBlIiwiaW1wb3J0U3R1ZGllcyIsInN0dWRpZXNUb0ltcG9ydCIsInN0dWR5SW1wb3J0U3RhdHVzSWQiLCJpbXBvcnRTdHVkaWVzRElNU0UiLCJjcmVhdGVTdHVkeUltcG9ydFN0YXR1cyIsInN0dWR5SW1wb3J0U3RhdHVzIiwibnVtYmVyT2ZTdHVkaWVzSW1wb3J0ZWQiLCJudW1iZXJPZlN0dWRpZXNGYWlsZWQiLCJpbnNlcnQiLCJyZW1vdmVTdHVkeUltcG9ydFN0YXR1cyIsImlkIiwicmVtb3ZlIiwiRElNU0UiLCJzdG9yZUluc3RhbmNlcyIsImVyciIsInVwZGF0ZSIsIl9pZCIsIiRpbmMiLCJpbmZvIiwiZmlsZUV4aXN0cyIsInVubGluayIsInJ1biIsImZvbGRlciIsImZvbGRlclBhcnRzIiwic3BsaXQiLCJmb2xkZXJQYXJ0IiwiaSIsImxlbmd0aCIsImZvbGRlckV4aXN0cyIsIm1rZGlyU3luYyIsInN0YXRTeW5jIiwiaXNGaWxlIiwiaXNEaXJlY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLFdBQVIsQ0FBYjtBQUFtQ0YsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGtCQUFSLENBQWIsRTs7Ozs7Ozs7Ozs7QUNBbkMsSUFBSUMsSUFBSjtBQUFTSCxPQUFPQyxLQUFQLENBQWFDLFFBQVEsa0JBQVIsQ0FBYixFQUF5QztBQUFDQyxPQUFLQyxDQUFMLEVBQU87QUFBQ0QsV0FBS0MsQ0FBTDtBQUFPOztBQUFoQixDQUF6QyxFQUEyRCxDQUEzRDtBQUVURCxLQUFLRSxTQUFMLEdBQWlCO0FBQ2JDLGVBQWEsRUFEQTtBQUViQyxXQUFTO0FBRkksQ0FBakIsQzs7Ozs7Ozs7Ozs7QUNGQVAsT0FBT1EsTUFBUCxDQUFjO0FBQUNDLHFCQUFrQixNQUFJQTtBQUF2QixDQUFkO0FBQXlELElBQUlDLEtBQUo7QUFBVVYs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Q1YsV0FBTyxLQUFQO0FBQ0g7QUFDSjs7QUFFRCxTQUFTYyxZQUFULENBQXNCTixNQUF0QixFQUE4QjtBQUMxQixNQUFJO0FBQ0EsV0FBT25ELEdBQUcyRCxRQUFILENBQVlSLE1BQVosRUFBb0JVLFdBQXBCLEVBQVA7QUFDSCxHQUZELENBRUUsT0FBT2xCLEdBQVAsRUFBWTtBQUNWLFdBQU8sS0FBUDtBQUNIO0FBQ0osQzs7Ozs7Ozs7Ozs7QUNyS0QzRCxPQUFPQyxLQUFQLENBQWFDLFFBQVEsb0JBQVIsQ0FBYixFIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX3N0dWR5LWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vYmFzZS5qcyc7XHJcbmltcG9ydCAnLi9jb2xsZWN0aW9ucy5qcyc7XHJcbiIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuXHJcbk9ISUYuc3R1ZHlsaXN0ID0ge1xyXG4gICAgY29sbGVjdGlvbnM6IHt9LFxyXG4gICAgYWN0aW9uczoge31cclxufTtcclxuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5jb25zdCBTdHVkeUltcG9ydFN0YXR1cyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdzdHVkeUltcG9ydFN0YXR1cycpO1xyXG5TdHVkeUltcG9ydFN0YXR1cy5fZGVidWdOYW1lID0gJ1N0dWR5SW1wb3J0U3RhdHVzJztcclxuT0hJRi5zdHVkeWxpc3QuY29sbGVjdGlvbnMuU3R1ZHlJbXBvcnRTdGF0dXMgPSBTdHVkeUltcG9ydFN0YXR1cztcclxuXHJcbmV4cG9ydCB7IFN0dWR5SW1wb3J0U3RhdHVzIH07XHJcbiIsImltcG9ydCAnLi9tZXRob2RzJztcclxuaW1wb3J0ICcuL3B1YmxpY2F0aW9ucy5qcyc7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5NZXRlb3IucHVibGlzaCgnc3R1ZHlJbXBvcnRTdGF0dXMnLCAoKSA9PiBPSElGLnN0dWR5bGlzdC5jb2xsZWN0aW9ucy5TdHVkeUltcG9ydFN0YXR1cy5maW5kKCkpO1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuY29uc3QgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcclxuY29uc3QgZmliZXIgPSBOcG0ucmVxdWlyZSgnZmliZXJzJyk7XHJcblxyXG5XZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgnL3VwbG9hZEZpbGVzVG9JbXBvcnQnLCBmdW5jdGlvbihyZXEsIHJlcykge1xyXG4gICAgaWYgKCFyZXEuaGVhZGVycy5maWxlbmFtZSkge1xyXG4gICAgICAgIC8vICBSZXNwb25zZTogQkFEIFJFUVVFU1QgKDQwMClcclxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICByZXMuZW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIFN0b3JlIGZpbGVzIGluIHRlbXAgbG9jYXRpb24gKHRoZXkgd2lsbCBiZSBkZWxldGVkIHdoZW4gdGhlaXIgaW1wb3J0IG9wZXJhdGlvbnMgYXJlIGNvbXBsZXRlZClcclxuICAgIGNvbnN0IGRpY29tRGlyID0gJy90bXAvZGljb21EaXInO1xyXG4gICAgY3JlYXRlRm9sZGVySWZOb3RFeGlzdChkaWNvbURpcik7XHJcblxyXG4gICAgY29uc3QgZnVsbEZpbGVOYW1lID0gZGljb21EaXIgKyAnLycgKyByZXEuaGVhZGVycy5maWxlbmFtZTtcclxuICAgIGNvbnN0IGZpbGUgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShmdWxsRmlsZU5hbWUpO1xyXG5cclxuICAgIGZpbGUub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBPSElGLmxvZy53YXJuKGVycm9yKTtcclxuICAgICAgICAvLyAgUmVzcG9uc2U6IElOVEVSTkFMIFNFUlZFUiBFUlJPUiAoNTAwKVxyXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgIHJlcy5lbmQoKTtcclxuICAgIH0pO1xyXG4gICAgZmlsZS5vbignZmluaXNoJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gIFJlc3BvbnNlOiBTVUNDRVNTICgyMDApXHJcbiAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyB9KTtcclxuICAgICAgICByZXMuZW5kKGZ1bGxGaWxlTmFtZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAgUGlwZSB0aGUgcmVxdWVzdCB0byB0aGUgZmlsZVxyXG4gICAgcmVxLnBpcGUoZmlsZSk7XHJcbn0pO1xyXG5cclxuTWV0ZW9yLm1ldGhvZHMoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgaW1wb3J0IGlzIHN1cHBvcnRlZCBmb3IgZGVmYXVsdCBzZXJ2aWNlIHR5cGVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpbXBvcnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IE9ISUYuc2VydmVycy5nZXRDdXJyZW50U2VydmVyKCk7XHJcbiAgICAgICAgaWYgKHNlcnZlciAmJiBzZXJ2ZXIudHlwZSA9PT0gJ2RpbXNlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBvcnRzIHN0dWRpZXMgZnJvbSBsb2NhbCBpbnRvIHN0dWR5IGxpc3RcclxuICAgICAqIEBwYXJhbSBzdHVkaWVzVG9JbXBvcnQgU3R1ZGllcyB0byBpbXBvcnRcclxuICAgICAqIEBwYXJhbSBzdHVkeUltcG9ydFN0YXR1c0lkIFN0dWR5IGltcG9ydCBzdGF0dXMgY29sbGVjdGlvbiBpZCB0byB0cmFjayBpbXBvcnQgc3RhdHVzXHJcbiAgICAgKi9cclxuICAgIGltcG9ydFN0dWRpZXM6IGZ1bmN0aW9uKHN0dWRpZXNUb0ltcG9ydCwgc3R1ZHlJbXBvcnRTdGF0dXNJZCkge1xyXG4gICAgICAgIGlmICghc3R1ZGllc1RvSW1wb3J0IHx8ICFzdHVkeUltcG9ydFN0YXR1c0lkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IE9ISUYuc2VydmVycy5nZXRDdXJyZW50U2VydmVyKCk7XHJcblxyXG4gICAgICAgIGlmICghc2VydmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdObyBwcm9wZXJseSBjb25maWd1cmVkIHNlcnZlciB3YXMgYXZhaWxhYmxlIG92ZXIgRElDT01XZWIgb3IgRElNU0UuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZXJ2ZXIudHlwZSA9PT0gJ2RpY29tV2ViJykge1xyXG4gICAgICAgICAgICAvL1RPRE86IFN1cHBvcnQgaW1wb3J0aW5nIHN0dWRpZXMgaW50byBkaWNvbVdlYlxyXG4gICAgICAgICAgICBPSElGLmxvZy53YXJuKCdJbXBvcnRpbmcgc3R1ZGllcyBpbnRvIGRpY29tV2ViIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VydmVyLnR5cGUgPT09ICdkaW1zZScpIHtcclxuICAgICAgICAgICAgaW1wb3J0U3R1ZGllc0RJTVNFKHN0dWRpZXNUb0ltcG9ydCwgc3R1ZHlJbXBvcnRTdGF0dXNJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IHN0dWR5IGltcG9ydCBzdGF0dXMgaXRlbSBhbmQgaW5zZXJ0IGl0IGludG8gdGhlIGNvbGxlY3Rpb24gdG8gdHJhY2sgaW1wb3J0IHN0YXR1c1xyXG4gICAgICogQHJldHVybnMge3N0dWR5SW1wb3J0U3RhdHVzSWQ6IHN0cmluZ31cclxuICAgICAqL1xyXG4gICAgY3JlYXRlU3R1ZHlJbXBvcnRTdGF0dXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnN0IHN0dWR5SW1wb3J0U3RhdHVzID0ge1xyXG4gICAgICAgICAgICBudW1iZXJPZlN0dWRpZXNJbXBvcnRlZDogMCxcclxuICAgICAgICAgICAgbnVtYmVyT2ZTdHVkaWVzRmFpbGVkOiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gT0hJRi5zdHVkeWxpc3QuY29sbGVjdGlvbnMuU3R1ZHlJbXBvcnRTdGF0dXMuaW5zZXJ0KHN0dWR5SW1wb3J0U3RhdHVzKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSB0aGUgc3R1ZHkgaW1wb3J0IHN0YXR1cyBpdGVtIGZyb20gdGhlIGNvbGxlY3Rpb25cclxuICAgICAqIEBwYXJhbSBpZCBDb2xsZWN0aW9uIGlkIG9mIHRoZSBzdHVkeSBpbXBvcnQgc3RhdHVzIGluIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVN0dWR5SW1wb3J0U3RhdHVzOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIE9ISUYuc3R1ZHlsaXN0LmNvbGxlY3Rpb25zLlN0dWR5SW1wb3J0U3RhdHVzLnJlbW92ZShpZCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gaW1wb3J0U3R1ZGllc0RJTVNFKHN0dWRpZXNUb0ltcG9ydCwgc3R1ZHlJbXBvcnRTdGF0dXNJZCkge1xyXG4gICAgaWYgKCFzdHVkaWVzVG9JbXBvcnQgfHwgIXN0dWR5SW1wb3J0U3RhdHVzSWQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyAgUGVyZm9ybSBDLVN0b3JlIHRvIGltcG9ydCBzdHVkaWVzIGFuZCBoYW5kbGUgdGhlIGNhbGxiYWNrcyB0byB1cGRhdGUgaW1wb3J0IHN0YXR1c1xyXG4gICAgRElNU0Uuc3RvcmVJbnN0YW5jZXMoc3R1ZGllc1RvSW1wb3J0LCBmdW5jdGlvbihlcnIsIGZpbGUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyAgVXNlIGZpYmVyIHRvIGJlIGFibGUgdG8gbW9kaWZ5IG1ldGVvciBjb2xsZWN0aW9uIGluIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGZpYmVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgVXBkYXRlIHRoZSBpbXBvcnQgc3RhdHVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBPSElGLnN0dWR5bGlzdC5jb2xsZWN0aW9ucy5TdHVkeUltcG9ydFN0YXR1cy51cGRhdGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF9pZDogc3R1ZHlJbXBvcnRTdGF0dXNJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAkaW5jOiB7IG51bWJlck9mU3R1ZGllc0ZhaWxlZDogMSB9IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgT0hJRi5sb2cud2FybignRmFpbGVkIHRvIGltcG9ydCBzdHVkeSB2aWEgRElNU0U6ICcsIGZpbGUsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgT0hJRi5zdHVkeWxpc3QuY29sbGVjdGlvbnMuU3R1ZHlJbXBvcnRTdGF0dXMudXBkYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfaWQ6IHN0dWR5SW1wb3J0U3RhdHVzSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJGluYzogeyBudW1iZXJPZlN0dWRpZXNJbXBvcnRlZDogMSB9IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgT0hJRi5sb2cuaW5mbygnU3R1ZHkgc3VjY2Vzc2Z1bGx5IGltcG9ydGVkIHZpYSBESU1TRTogJywgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBPSElGLnN0dWR5bGlzdC5jb2xsZWN0aW9ucy5TdHVkeUltcG9ydFN0YXR1cy51cGRhdGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX2lkOiBzdHVkeUltcG9ydFN0YXR1c0lkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgJGluYzogeyBudW1iZXJPZlN0dWRpZXNGYWlsZWQ6IDEgfSB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBPSElGLmxvZy53YXJuKCdGYWlsZWQgdG8gaW1wb3J0IHN0dWR5IHZpYSBESU1TRTogJywgZmlsZSwgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgVGhlIGltcG9ydCBvcGVyYXRpb24gb2YgdGhpcyBmaWxlIGlzIGNvbXBsZXRlZCwgc28gZGVsZXRlIGl0IGlmIHN0aWxsIGV4aXN0c1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlRXhpc3RzKGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnVubGluayhmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KS5ydW4oKTtcclxuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XHJcbiAgICAgICAgICAgIE9ISUYuc3R1ZHlsaXN0LmNvbGxlY3Rpb25zLlN0dWR5SW1wb3J0U3RhdHVzLnVwZGF0ZShcclxuICAgICAgICAgICAgICAgIHsgX2lkOiBzdHVkeUltcG9ydFN0YXR1c0lkIH0sXHJcbiAgICAgICAgICAgICAgICB7ICRpbmM6IHsgbnVtYmVyT2ZTdHVkaWVzRmFpbGVkOiAxIH0gfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBPSElGLmxvZy53YXJuKCdGYWlsZWQgdG8gaW1wb3J0IHN0dWR5IHZpYSBESU1TRTogJywgZmlsZSwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRm9sZGVySWZOb3RFeGlzdChmb2xkZXIpIHtcclxuICAgIGNvbnN0IGZvbGRlclBhcnRzID0gZm9sZGVyLnNwbGl0KCcvJyk7XHJcbiAgICBsZXQgZm9sZGVyUGFydCA9IGZvbGRlclBhcnRzWzBdO1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBmb2xkZXJQYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGZvbGRlclBhcnQgKz0gJy8nICsgZm9sZGVyUGFydHNbaV07XHJcbiAgICAgICAgaWYgKCFmb2xkZXJFeGlzdHMoZm9sZGVyUGFydCkpIHtcclxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGZvbGRlclBhcnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmlsZUV4aXN0cyhmb2xkZXIpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKGZvbGRlcikuaXNGaWxlKCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvbGRlckV4aXN0cyhmb2xkZXIpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKGZvbGRlcikuaXNEaXJlY3RvcnkoKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgJy4vaW1wb3J0U3R1ZGllcy5qcyc7XHJcbiJdfQ==
