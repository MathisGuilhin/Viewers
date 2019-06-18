(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var Revision;

(function(){

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/johdirr_meteor-git-rev/packages/johdirr_meteor-git-rev.js          //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
(function () {

///////////////////////////////////////////////////////////////////////////
//                                                                       //
// packages/johdirr:meteor-git-rev/lib/collection.js                     //
//                                                                       //
///////////////////////////////////////////////////////////////////////////
                                                                         //
Revision = new Meteor.Collection('revision');                            // 1
Revision.deny({});                                                       // 2
                                                                         // 3
///////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////
//                                                                       //
// packages/johdirr:meteor-git-rev/server/git-rev.js                     //
//                                                                       //
///////////////////////////////////////////////////////////////////////////
                                                                         //
var gitRev = Npm.require('git-rev');                                     // 1
                                                                         // 2
var wrappedUpdate = Meteor.bindEnvironment(function(revId, key, value) { // 3
  var modifier = {};                                                     // 4
                                                                         // 5
  modifier[key] = value;                                                 // 6
                                                                         // 7
  Revision.update(revId, { $set: modifier }, function(err) {             // 8
    if (err) return console.error(err);                                  // 9
  });                                                                    // 10
});                                                                      // 11
                                                                         // 12
Meteor.startup(function() {                                              // 13
  if (Revision.find().count() > 0) Revision.remove({});                  // 14
                                                                         // 15
  var revId = Revision.insert({});                                       // 16
                                                                         // 17
  ['short', 'long', 'branch', 'tag'].forEach(function(key) {             // 18
    gitRev[key](function(value) {                                        // 19
      wrappedUpdate(revId, key, value);                                  // 20
    });                                                                  // 21
  });                                                                    // 22
});                                                                      // 23
                                                                         // 24
Meteor.publish('revision', function () {                                 // 25
  return Revision.find({});                                              // 26
});                                                                      // 27
                                                                         // 28
///////////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("johdirr:meteor-git-rev");

})();
