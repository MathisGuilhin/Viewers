(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var moment = Package['momentjs:moment'].moment;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var HP = Package['ohif:hanging-protocols'].HP;
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
var EJSON = Package.ejson.EJSON;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var selector, options, MeasurementSchemaTypes;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:measurements":{"both":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/index.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.watch(require("./base.js"));
module.watch(require("./configuration"));
module.watch(require("./schema"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"base.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/base.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.measurements = {};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"configuration":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/configuration/index.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.watch(require("./measurements.js"));
module.watch(require("./timepoints.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"measurements.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/configuration/measurements.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let Tracker;
module.watch(require("meteor/tracker"), {
  Tracker(v) {
    Tracker = v;
  }

}, 1);

let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 2);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 3);
let cornerstoneTools;
module.watch(require("meteor/ohif:cornerstone"), {
  cornerstoneTools(v) {
    cornerstoneTools = v;
  }

}, 4);
let configuration = {};

class MeasurementApi {
  static setConfiguration(config) {
    _.extend(configuration, config);
  }

  static getConfiguration() {
    return configuration;
  }

  static getToolsGroupsMap() {
    const toolsGroupsMap = {};
    configuration.measurementTools.forEach(toolGroup => {
      toolGroup.childTools.forEach(tool => toolsGroupsMap[tool.id] = toolGroup.id);
    });
    return toolsGroupsMap;
  }

  constructor(timepointApi) {
    if (timepointApi) {
      this.timepointApi = timepointApi;
    }

    this.toolGroups = {};
    this.tools = {};
    this.toolsGroupsMap = MeasurementApi.getToolsGroupsMap();
    this.changeObserver = new Tracker.Dependency();
    configuration.measurementTools.forEach(toolGroup => {
      const groupCollection = new Mongo.Collection(null);
      groupCollection._debugName = toolGroup.name;
      groupCollection.attachSchema(toolGroup.schema);
      this.toolGroups[toolGroup.id] = groupCollection;
      toolGroup.childTools.forEach(tool => {
        const collection = new Mongo.Collection(null);
        collection._debugName = tool.name;
        collection.attachSchema(tool.schema);
        this.tools[tool.id] = collection;

        const addedHandler = measurement => {
          let measurementNumber; // Get the measurement number

          const timepoint = this.timepointApi.timepoints.findOne({
            studyInstanceUids: measurement.studyInstanceUid
          }); // Preventing errors thrown when non-associated (standalone) study is opened...
          // @TODO: Make sure this logic is correct.

          if (!timepoint) return;
          const emptyItem = groupCollection.findOne({
            toolId: {
              $eq: null
            },
            timepointId: timepoint.timepointId
          });

          if (emptyItem) {
            measurementNumber = emptyItem.measurementNumber;
            groupCollection.update({
              timepointId: timepoint.timepointId,
              measurementNumber
            }, {
              $set: {
                toolId: tool.id,
                toolItemId: measurement._id,
                createdAt: measurement.createdAt
              }
            });
          } else {
            measurementNumber = groupCollection.find({
              studyInstanceUid: {
                $in: timepoint.studyInstanceUids
              }
            }).count() + 1;
          }

          measurement.measurementNumber = measurementNumber; // Get the current location/description (if already defined)

          const updateObject = {
            timepointId: timepoint.timepointId,
            measurementNumber
          };
          const baselineTimepoint = timepointApi.baseline();
          const baselineGroupEntry = groupCollection.findOne({
            timepointId: baselineTimepoint.timepointId
          });

          if (baselineGroupEntry) {
            const tool = this.tools[baselineGroupEntry.toolId];
            const found = tool.findOne({
              measurementNumber
            });

            if (found) {
              updateObject.location = found.location;

              if (found.description) {
                updateObject.description = found.description;
              }
            }
          } // Set the timepoint ID, measurement number, location and description


          collection.update(measurement._id, {
            $set: updateObject
          });

          if (!emptyItem) {
            // Reflect the entry in the tool group collection
            groupCollection.insert({
              toolId: tool.id,
              toolItemId: measurement._id,
              timepointId: timepoint.timepointId,
              studyInstanceUid: measurement.studyInstanceUid,
              createdAt: measurement.createdAt,
              measurementNumber
            });
          } // Enable reactivity


          this.changeObserver.changed();
        };

        const changedHandler = measurement => {
          this.changeObserver.changed();
        };

        const removedHandler = measurement => {
          const measurementNumber = measurement.measurementNumber;
          groupCollection.update({
            toolItemId: measurement._id
          }, {
            $set: {
              toolId: null,
              toolItemId: null
            }
          });
          const nonEmptyItem = groupCollection.findOne({
            measurementNumber,
            toolId: {
              $not: null
            }
          });

          if (nonEmptyItem) {
            return;
          }

          const groupItems = groupCollection.find({
            measurementNumber
          }).fetch();
          groupItems.forEach(groupItem => {
            // Remove the record from the tools group collection too
            groupCollection.remove({
              _id: groupItem._id
            }); // Update the measurement numbers only if it is last item

            const timepoint = this.timepointApi.timepoints.findOne({
              timepointId: groupItem.timepointId
            });
            const filter = {
              studyInstanceUid: {
                $in: timepoint.studyInstanceUids
              },
              measurementNumber
            };
            const remainingItems = groupCollection.find(filter).count();

            if (!remainingItems) {
              filter.measurementNumber = {
                $gte: measurementNumber
              };
              const operator = {
                $inc: {
                  measurementNumber: -1
                }
              };
              const options = {
                multi: true
              };
              groupCollection.update(filter, operator, options);
              toolGroup.childTools.forEach(childTool => {
                const collection = this.tools[childTool.id];
                collection.update(filter, operator, options);
              });
            }
          }); // Synchronize the new tool data

          this.syncMeasurementsAndToolData(); // Enable reactivity

          this.changeObserver.changed();
        };

        collection.find().observe({
          added: addedHandler,
          changed: changedHandler,
          removed: removedHandler
        });
      });
    });
  }

  retrieveMeasurements(patientId, timepointIds) {
    const retrievalFn = configuration.dataExchange.retrieve;

    if (!_.isFunction(retrievalFn)) {
      return;
    }

    return new Promise((resolve, reject) => {
      retrievalFn(patientId, timepointIds).then(measurementData => {
        OHIF.log.info('Measurement data retrieval');
        OHIF.log.info(measurementData);
        const toolsGroupsMap = MeasurementApi.getToolsGroupsMap();
        const measurementsGroups = {};
        Object.keys(measurementData).forEach(measurementTypeId => {
          const measurements = measurementData[measurementTypeId];
          measurements.forEach(measurement => {
            const {
              toolType
            } = measurement;

            if (toolType && this.tools[toolType]) {
              delete measurement._id;
              const toolGroup = toolsGroupsMap[toolType];

              if (!measurementsGroups[toolGroup]) {
                measurementsGroups[toolGroup] = [];
              }

              measurementsGroups[toolGroup].push(measurement);
            }
          });
        });
        Object.keys(measurementsGroups).forEach(groupKey => {
          const group = measurementsGroups[groupKey];
          group.sort((a, b) => {
            if (a.measurementNumber > b.measurementNumber) {
              return 1;
            } else if (a.measurementNumber < b.measurementNumber) {
              return -1;
            }

            return 0;
          });
          group.forEach(m => this.tools[m.toolType].insert(m));
        });
        resolve();
      });
    });
  }

  storeMeasurements(timepointId) {
    const storeFn = configuration.dataExchange.store;

    if (!_.isFunction(storeFn)) {
      return;
    }

    let measurementData = {};
    configuration.measurementTools.forEach(toolGroup => {
      toolGroup.childTools.forEach(tool => {
        if (!measurementData[toolGroup.id]) {
          measurementData[toolGroup.id] = [];
        }

        measurementData[toolGroup.id] = measurementData[toolGroup.id].concat(this.tools[tool.id].find().fetch());
      });
    });
    const timepointFilter = timepointId ? {
      timepointId
    } : {};
    const timepoints = this.timepointApi.all(timepointFilter);
    const timepointIds = timepoints.map(t => t.timepointId);
    const patientId = timepoints[0].patientId;
    const filter = {
      patientId,
      timepointId: {
        $in: timepointIds
      }
    };
    OHIF.log.info('Saving Measurements for timepoints:', timepoints);
    return storeFn(measurementData, filter).then(() => {
      OHIF.log.info('Measurement storage completed');
    });
  }

  validateMeasurements() {
    const validateFn = configuration.dataValidation.validateMeasurements;

    if (validateFn && validateFn instanceof Function) {
      validateFn();
    }
  }

  syncMeasurementsAndToolData() {
    configuration.measurementTools.forEach(toolGroup => {
      toolGroup.childTools.forEach(tool => {
        const measurements = this.tools[tool.id].find().fetch();
        measurements.forEach(measurement => {
          OHIF.measurements.syncMeasurementAndToolData(measurement);
        });
      });
    });
  }

  sortMeasurements(baselineTimepointId) {
    const tools = configuration.measurementTools;
    const includedTools = tools.filter(tool => {
      return tool.options && tool.options.caseProgress && tool.options.caseProgress.include;
    }); // Update Measurement the displayed Measurements

    includedTools.forEach(tool => {
      const collection = this.tools[tool.id];
      const measurements = collection.find().fetch();
      measurements.forEach(measurement => {
        OHIF.measurements.syncMeasurementAndToolData(measurement);
      });
    });
  }

  deleteMeasurements(measurementTypeId, filter) {
    const groupCollection = this.toolGroups[measurementTypeId]; // Stop here if it is a temporary toolGroups

    if (!groupCollection) return; // Get the entries information before removing them

    const groupItems = groupCollection.find(filter).fetch();
    const entries = [];
    groupItems.forEach(groupItem => {
      if (!groupItem.toolId) {
        return;
      }

      const collection = this.tools[groupItem.toolId];
      entries.push(collection.findOne(groupItem.toolItemId));
      collection.remove(groupItem.toolItemId);
    }); // Stop here if no entries were found

    if (!entries.length) {
      return;
    } // If the filter doesn't have the measurement number, get it from the first entry


    const measurementNumber = filter.measurementNumber || entries[0].measurementNumber; // Synchronize the new data with cornerstone tools

    const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();

    _.each(entries, entry => {
      const measurementsData = [];
      const {
        tool
      } = OHIF.measurements.getToolConfiguration(entry.toolType);

      if (Array.isArray(tool.childTools)) {
        tool.childTools.forEach(key => {
          const childMeasurement = entry[key];
          if (!childMeasurement) return;
          measurementsData.push(childMeasurement);
        });
      } else {
        measurementsData.push(entry);
      }

      measurementsData.forEach(measurementData => {
        const {
          imagePath,
          toolType
        } = measurementData;
        const imageId = OHIF.viewerbase.getImageIdForImagePath(imagePath);

        if (toolState[imageId]) {
          const toolData = toolState[imageId][toolType];
          const measurementEntries = toolData && toolData.data;

          const measurementEntry = _.findWhere(measurementEntries, {
            _id: entry._id
          });

          if (measurementEntry) {
            const index = measurementEntries.indexOf(measurementEntry);
            measurementEntries.splice(index, 1);
          }
        }
      });
    });

    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(toolState); // Synchronize the updated measurements with Cornerstone Tools
    // toolData to make sure the displayed measurements show 'Target X' correctly

    const syncFilter = _.clone(filter);

    delete syncFilter.timepointId;
    syncFilter.measurementNumber = {
      $gt: measurementNumber - 1
    };

    const toolTypes = _.uniq(entries.map(entry => entry.toolType));

    toolTypes.forEach(toolType => {
      const collection = this.tools[toolType];
      collection.find(syncFilter).forEach(measurement => {
        OHIF.measurements.syncMeasurementAndToolData(measurement);
      });
    });
  }

  getMeasurementById(measurementId) {
    let foundGroup;

    _.find(this.toolGroups, toolGroup => {
      foundGroup = toolGroup.findOne({
        toolItemId: measurementId
      });
      return !!foundGroup;
    }); // Stop here if no group was found or if the record is a placeholder


    if (!foundGroup || !foundGroup.toolId) {
      return;
    }

    return this.tools[foundGroup.toolId].findOne(measurementId);
  }

  fetch(toolGroupId, selector, options) {
    if (!this.toolGroups[toolGroupId]) {
      throw 'MeasurementApi: No Collection with the id: ' + toolGroupId;
    }

    selector = selector || {};
    options = options || {};
    const result = [];
    const items = this.toolGroups[toolGroupId].find(selector, options).fetch();
    items.forEach(item => {
      if (item.toolId) {
        result.push(this.tools[item.toolId].findOne(item.toolItemId));
      } else {
        result.push({
          measurementNumber: item.measurementNumber
        });
      }
    });
    return result;
  }

}

OHIF.measurements.MeasurementApi = MeasurementApi;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"timepoints.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/configuration/timepoints.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
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
let TimepointSchema;
module.watch(require("meteor/ohif:measurements/both/schema/timepoints"), {
  schema(v) {
    TimepointSchema = v;
  }

}, 3);
const configuration = {};

class TimepointApi {
  static setConfiguration(config) {
    _.extend(configuration, config);
  }

  static getConfiguration() {
    return configuration;
  }

  constructor(currentTimepointId, options = {}) {
    if (currentTimepointId) {
      this.currentTimepointId = currentTimepointId;
    }

    this.options = options;
    this.timepoints = new Mongo.Collection(null);
    this.timepoints.attachSchema(TimepointSchema);
    this.timepoints._debugName = 'Timepoints';
  }

  retrieveTimepoints(filter) {
    const retrievalFn = configuration.dataExchange.retrieve;

    if (!_.isFunction(retrievalFn)) {
      OHIF.log.error('Timepoint retrieval function has not been configured.');
      return;
    }

    return new Promise((resolve, reject) => {
      retrievalFn(filter).then(timepointData => {
        OHIF.log.info('Timepoint data retrieval');

        _.each(timepointData, timepoint => {
          delete timepoint._id;
          const query = {
            timepointId: timepoint.timepointId
          };
          this.timepoints.update(query, {
            $set: timepoint
          }, {
            upsert: true
          });
        });

        resolve();
      }).catch(reason => {
        OHIF.log.error(`Timepoint retrieval function failed: ${reason}`);
        reject(reason);
      });
    });
  }

  storeTimepoints() {
    const storeFn = configuration.dataExchange.store;

    if (!_.isFunction(storeFn)) {
      return;
    }

    const timepointData = this.timepoints.find().fetch();
    OHIF.log.info('Preparing to store timepoints');
    OHIF.log.info(JSON.stringify(timepointData, null, 2));
    storeFn(timepointData).then(() => OHIF.log.info('Timepoint storage completed'));
  }

  disassociateStudy(timepointIds, studyInstanceUid) {
    const disassociateFn = configuration.dataExchange.disassociate;
    disassociateFn(timepointIds, studyInstanceUid).then(() => {
      OHIF.log.info('Disassociation completed');
      this.timepoints.remove({});
      this.retrieveTimepoints({});
    });
  }

  removeTimepoint(timepointId) {
    const removeFn = configuration.dataExchange.remove;

    if (!_.isFunction(removeFn)) {
      return;
    }

    const timepointData = {
      timepointId
    };
    OHIF.log.info('Preparing to remove timepoint');
    OHIF.log.info(JSON.stringify(timepointData, null, 2));
    removeFn(timepointData).then(() => {
      OHIF.log.info('Timepoint removal completed');
      this.timepoints.remove(timepointData);
    });
  }

  updateTimepoint(timepointId, query) {
    const updateFn = configuration.dataExchange.update;

    if (!_.isFunction(updateFn)) {
      return;
    }

    const timepointData = {
      timepointId
    };
    OHIF.log.info('Preparing to update timepoint');
    OHIF.log.info(JSON.stringify(timepointData, null, 2));
    OHIF.log.info(JSON.stringify(query, null, 2));
    updateFn(timepointData, query).then(() => {
      OHIF.log.info('Timepoint updated completed');
      this.timepoints.update(timepointData, query);
    });
  } // Return all timepoints


  all(filter = {}) {
    return this.timepoints.find(filter, {
      sort: {
        latestDate: -1
      }
    }).fetch();
  } // Return only the current timepoint


  current() {
    return this.timepoints.findOne({
      timepointId: this.currentTimepointId
    });
  }

  lock() {
    const current = this.current();

    if (!current) {
      return;
    }

    this.timepoints.update(current._id, {
      $set: {
        locked: true
      }
    });
  } // Return the prior timepoint


  prior() {
    const current = this.current();

    if (!current) {
      return;
    }

    const latestDate = current.latestDate;
    return this.timepoints.findOne({
      latestDate: {
        $lt: latestDate
      }
    }, {
      sort: {
        latestDate: -1
      }
    });
  } // Return only the current and prior timepoints


  currentAndPrior() {
    const timepoints = [];
    const current = this.current();

    if (current) {
      timepoints.push(current);
    }

    const prior = this.prior();

    if (current && prior && prior._id !== current._id) {
      timepoints.push(prior);
    }

    return timepoints;
  } // Return only the comparison timepoints


  comparison() {
    return this.currentAndPrior();
  } // Return only the baseline timepoint


  baseline() {
    return this.timepoints.findOne({
      timepointType: 'baseline'
    });
  } // Return only the nadir timepoint


  nadir() {
    const timepoint = this.timepoints.findOne({
      timepointKey: 'nadir'
    });
    return timepoint || this.baseline();
  } // Return only the key timepoints (current, prior, nadir and baseline)


  key(filter = {}) {
    const result = []; // Get all the timepoints

    const all = this.all(filter); // Iterate over each timepoint and insert the key ones in the result

    _.each(all, (timepoint, index) => {
      if (index < 2 || index === all.length - 1) {
        result.push(timepoint);
      }
    }); // Return the resulting timepoints


    return result;
  } // Return only the timepoints for the given study


  study(studyInstanceUid) {
    const result = []; // Iterate over each timepoint and insert the key ones in the result

    _.each(this.all(), (timepoint, index) => {
      if (_.contains(timepoint.studyInstanceUids, studyInstanceUid)) {
        result.push(timepoint);
      }
    }); // Return the resulting timepoints


    return result;
  } // Return the timepoint's name


  name(timepoint) {
    // Check if this is a Baseline timepoint, if it is, return 'Baseline'
    if (timepoint.timepointType === 'baseline') {
      return 'Baseline';
    } else if (timepoint.visitNumber) {
      return 'Follow-up ' + timepoint.visitNumber;
    } // Retrieve all of the relevant follow-up timepoints for this patient


    const followupTimepoints = this.timepoints.find({
      patientId: timepoint.patientId,
      timepointType: timepoint.timepointType
    }, {
      sort: {
        latestDate: 1
      }
    }); // Create an array of just timepointIds, so we can use indexOf
    // on it to find the current timepoint's relative position

    const followupTimepointIds = followupTimepoints.map(timepoint => timepoint.timepointId); // Calculate the index of the current timepoint in the array of all
    // relevant follow-up timepoints

    const index = followupTimepointIds.indexOf(timepoint.timepointId) + 1; // If index is 0, it means that the current timepoint was not in the list
    // Log a warning and return here

    if (!index) {
      OHIF.log.warn('Current follow-up was not in the list of relevant follow-ups?');
      return;
    } // Return the timepoint name as 'Follow-up N'


    return 'Follow-up ' + index;
  } // Build the timepoint title based on its date


  title(timepoint) {
    const timepointName = this.name(timepoint);

    const all = _.clone(this.all());

    let index = -1;
    let currentIndex = null;

    for (let i = 0; i < all.length; i++) {
      const currentTimepoint = all[i]; // Skip the iterations until we can't find the selected timepoint on study list

      if (this.currentTimepointId === currentTimepoint.timepointId) {
        currentIndex = 0;
      }

      if (_.isNumber(currentIndex)) {
        index = currentIndex++;
      } // Break the loop if reached the timepoint to get the title


      if (currentTimepoint.timepointId === timepoint.timepointId) {
        break;
      }
    }

    const states = {
      0: '(Current)',
      1: '(Prior)'
    }; // TODO: [design] find out how to define the nadir timepoint

    const parenthesis = states[index] || '';
    return `${timepointName} ${parenthesis}`;
  }

}

OHIF.measurements.TimepointApi = TimepointApi;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"schema":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/schema/index.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.watch(require("./measurements.js"));
module.watch(require("./timepoints.js"));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"measurements.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/schema/measurements.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  MeasurementSchemaTypes: () => MeasurementSchemaTypes
});
let SimpleSchema;
module.watch(require("meteor/aldeed:simple-schema"), {
  SimpleSchema(v) {
    SimpleSchema = v;
  }

}, 0);
const Measurement = new SimpleSchema({
  additionalData: {
    type: Object,
    label: 'Additional Data',
    defaultValue: {},
    optional: true,
    blackbox: true
  },
  userId: {
    type: String,
    label: 'User ID',
    optional: true
  },
  patientId: {
    type: String,
    label: 'Patient ID',
    optional: true
  },
  measurementNumber: {
    type: Number,
    label: 'Measurement Number',
    optional: true
  },
  timepointId: {
    type: String,
    label: 'Timepoint ID',
    optional: true
  },
  // Force value to be current date (on server) upon insert
  // and prevent updates thereafter.
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {// [PWV-184] Preventing unset due to child tools updating
        // this.unset(); // Prevent user from supplying their own value
      }
    }
  },
  // Force value to be current date (on server) upon update
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {// return new Date();
      }
    },
    optional: true
  }
});
const StudyLevelMeasurement = new SimpleSchema([Measurement, {
  studyInstanceUid: {
    type: String,
    label: 'Study Instance UID'
  }
}]);
const SeriesLevelMeasurement = new SimpleSchema([StudyLevelMeasurement, {
  seriesInstanceUid: {
    type: String,
    label: 'Series Instance UID'
  }
}]);
const CornerstoneVOI = new SimpleSchema({
  windowWidth: {
    type: Number,
    label: 'Window Width',
    decimal: true,
    optional: true
  },
  windowCenter: {
    type: Number,
    label: 'Window Center',
    decimal: true,
    optional: true
  }
});
const CornerstoneViewportTranslation = new SimpleSchema({
  x: {
    type: Number,
    label: 'X',
    decimal: true,
    optional: true
  },
  y: {
    type: Number,
    label: 'Y',
    decimal: true,
    optional: true
  }
});
const CornerstoneViewport = new SimpleSchema({
  scale: {
    type: Number,
    label: 'Scale',
    decimal: true,
    optional: true
  },
  translation: {
    type: CornerstoneViewportTranslation,
    label: 'Translation',
    optional: true
  },
  voi: {
    type: CornerstoneVOI,
    label: 'VOI',
    optional: true
  },
  invert: {
    type: Boolean,
    label: 'Invert',
    optional: true
  },
  pixelReplication: {
    type: Boolean,
    label: 'Pixel Replication',
    optional: true
  },
  hFlip: {
    type: Boolean,
    label: 'Horizontal Flip',
    optional: true
  },
  vFlip: {
    type: Boolean,
    label: 'Vertical Flip',
    optional: true
  },
  rotation: {
    type: Number,
    label: 'Rotation (degrees)',
    decimal: true,
    optional: true
  }
});
const InstanceLevelMeasurement = new SimpleSchema([StudyLevelMeasurement, SeriesLevelMeasurement, {
  sopInstanceUid: {
    type: String,
    label: 'SOP Instance UID'
  },
  viewport: {
    type: CornerstoneViewport,
    label: 'Viewport Parameters',
    optional: true
  }
}]);
const FrameLevelMeasurement = new SimpleSchema([StudyLevelMeasurement, SeriesLevelMeasurement, InstanceLevelMeasurement, {
  frameIndex: {
    type: Number,
    min: 0,
    label: 'Frame index in Instance'
  },
  imagePath: {
    type: String,
    label: 'Identifier for the measurement\'s image' // studyInstanceUid_seriesInstanceUid_sopInstanceUid_frameIndex

  }
}]);
const CornerstoneToolMeasurement = new SimpleSchema([StudyLevelMeasurement, SeriesLevelMeasurement, InstanceLevelMeasurement, FrameLevelMeasurement, {
  toolType: {
    type: String,
    label: 'Cornerstone Tool Type',
    optional: true
  },
  visible: {
    type: Boolean,
    label: 'Visible',
    defaultValue: true
  },
  active: {
    type: Boolean,
    label: 'Active',
    defaultValue: false
  },
  invalidated: {
    type: Boolean,
    label: 'Invalidated',
    defaultValue: false,
    optional: true
  }
}]);
const CornerstoneHandleBoundingBoxSchema = new SimpleSchema({
  width: {
    type: Number,
    label: 'Width',
    decimal: true
  },
  height: {
    type: Number,
    label: 'Height',
    decimal: true
  },
  left: {
    type: Number,
    label: 'Left',
    decimal: true
  },
  top: {
    type: Number,
    label: 'Top',
    decimal: true
  }
});
const CornerstoneHandleSchema = new SimpleSchema({
  x: {
    type: Number,
    label: 'X',
    decimal: true,
    optional: true // Not actually optional, but sometimes values like x/y position are missing

  },
  y: {
    type: Number,
    label: 'Y',
    decimal: true,
    optional: true // Not actually optional, but sometimes values like x/y position are missing

  },
  highlight: {
    type: Boolean,
    label: 'Highlight',
    defaultValue: false
  },
  active: {
    type: Boolean,
    label: 'Active',
    defaultValue: false,
    optional: true
  },
  drawnIndependently: {
    type: Boolean,
    label: 'Drawn Independently',
    defaultValue: false,
    optional: true
  },
  movesIndependently: {
    type: Boolean,
    label: 'Moves Independently',
    defaultValue: false,
    optional: true
  },
  allowedOutsideImage: {
    type: Boolean,
    label: 'Allowed Outside Image',
    defaultValue: false,
    optional: true
  },
  hasMoved: {
    type: Boolean,
    label: 'Has Already Moved',
    defaultValue: false,
    optional: true
  },
  hasBoundingBox: {
    type: Boolean,
    label: 'Has Bounding Box',
    defaultValue: false,
    optional: true
  },
  boundingBox: {
    type: CornerstoneHandleBoundingBoxSchema,
    label: 'Bounding Box',
    optional: true
  },
  index: {
    // TODO: Remove 'index' from bidirectionalTool since it's useless
    type: Number,
    optional: true
  },
  locked: {
    type: Boolean,
    label: 'Locked',
    optional: true,
    defaultValue: false
  }
});
const MeasurementSchemaTypes = {
  Measurement: Measurement,
  StudyLevelMeasurement: StudyLevelMeasurement,
  SeriesLevelMeasurement: SeriesLevelMeasurement,
  InstanceLevelMeasurement: InstanceLevelMeasurement,
  FrameLevelMeasurement: FrameLevelMeasurement,
  CornerstoneToolMeasurement: CornerstoneToolMeasurement,
  CornerstoneHandleSchema: CornerstoneHandleSchema
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"timepoints.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ohif_measurements/both/schema/timepoints.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  schema: () => schema
});
let SimpleSchema;
module.watch(require("meteor/aldeed:simple-schema"), {
  SimpleSchema(v) {
    SimpleSchema = v;
  }

}, 0);
const schema = new SimpleSchema({
  patientId: {
    type: String,
    label: 'Patient ID',
    optional: true
  },
  timepointId: {
    type: String,
    label: 'Timepoint ID'
  },
  timepointType: {
    type: String,
    label: 'Timepoint Type',
    allowedValues: ['baseline', 'followup'],
    defaultValue: 'baseline'
  },
  isLocked: {
    type: Boolean,
    label: 'Timepoint Locked'
  },
  studyInstanceUids: {
    type: [String],
    label: 'Study Instance Uids',
    defaultValue: []
  },
  earliestDate: {
    type: Date,
    label: 'Earliest Study Date from associated studies'
  },
  latestDate: {
    type: Date,
    label: 'Most recent Study Date from associated studies'
  },
  visitNumber: {
    type: Number,
    label: 'Number of patient\'s visit',
    optional: true
  },
  studiesData: {
    type: [Object],
    label: 'Studies data to allow lazy loading',
    optional: true,
    blackbox: true
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:measurements/both/index.js");

/* Exports */
Package._define("ohif:measurements", {
  MeasurementSchemaTypes: MeasurementSchemaTypes
});

})();

//# sourceURL=meteor://💻app/packages/ohif_measurements.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjptZWFzdXJlbWVudHMvYm90aC9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjptZWFzdXJlbWVudHMvYm90aC9iYXNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOm1lYXN1cmVtZW50cy9ib3RoL2NvbmZpZ3VyYXRpb24vaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6bWVhc3VyZW1lbnRzL2JvdGgvY29uZmlndXJhdGlvbi9tZWFzdXJlbWVudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6bWVhc3VyZW1lbnRzL2JvdGgvY29uZmlndXJhdGlvbi90aW1lcG9pbnRzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOm1lYXN1cmVtZW50cy9ib3RoL3NjaGVtYS9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjptZWFzdXJlbWVudHMvYm90aC9zY2hlbWEvbWVhc3VyZW1lbnRzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOm1lYXN1cmVtZW50cy9ib3RoL3NjaGVtYS90aW1lcG9pbnRzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsIndhdGNoIiwicmVxdWlyZSIsIk9ISUYiLCJ2IiwibWVhc3VyZW1lbnRzIiwiTW9uZ28iLCJUcmFja2VyIiwiXyIsImNvcm5lcnN0b25lVG9vbHMiLCJjb25maWd1cmF0aW9uIiwiTWVhc3VyZW1lbnRBcGkiLCJzZXRDb25maWd1cmF0aW9uIiwiY29uZmlnIiwiZXh0ZW5kIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldFRvb2xzR3JvdXBzTWFwIiwidG9vbHNHcm91cHNNYXAiLCJtZWFzdXJlbWVudFRvb2xzIiwiZm9yRWFjaCIsInRvb2xHcm91cCIsImNoaWxkVG9vbHMiLCJ0b29sIiwiaWQiLCJjb25zdHJ1Y3RvciIsInRpbWVwb2ludEFwaSIsInRvb2xHcm91cHMiLCJ0b29scyIsImNoYW5nZU9ic2VydmVyIiwiRGVwZW5kZW5jeSIsImdyb3VwQ29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJfZGVidWdOYW1lIiwibmFtZSIsImF0dGFjaFNjaGVtYSIsInNjaGVtYSIsImNvbGxlY3Rpb24iLCJhZGRlZEhhbmRsZXIiLCJtZWFzdXJlbWVudCIsIm1lYXN1cmVtZW50TnVtYmVyIiwidGltZXBvaW50IiwidGltZXBvaW50cyIsImZpbmRPbmUiLCJzdHVkeUluc3RhbmNlVWlkcyIsInN0dWR5SW5zdGFuY2VVaWQiLCJlbXB0eUl0ZW0iLCJ0b29sSWQiLCIkZXEiLCJ0aW1lcG9pbnRJZCIsInVwZGF0ZSIsIiRzZXQiLCJ0b29sSXRlbUlkIiwiX2lkIiwiY3JlYXRlZEF0IiwiZmluZCIsIiRpbiIsImNvdW50IiwidXBkYXRlT2JqZWN0IiwiYmFzZWxpbmVUaW1lcG9pbnQiLCJiYXNlbGluZSIsImJhc2VsaW5lR3JvdXBFbnRyeSIsImZvdW5kIiwibG9jYXRpb24iLCJkZXNjcmlwdGlvbiIsImluc2VydCIsImNoYW5nZWQiLCJjaGFuZ2VkSGFuZGxlciIsInJlbW92ZWRIYW5kbGVyIiwibm9uRW1wdHlJdGVtIiwiJG5vdCIsImdyb3VwSXRlbXMiLCJmZXRjaCIsImdyb3VwSXRlbSIsInJlbW92ZSIsImZpbHRlciIsInJlbWFpbmluZ0l0ZW1zIiwiJGd0ZSIsIm9wZXJhdG9yIiwiJGluYyIsIm9wdGlvbnMiLCJtdWx0aSIsImNoaWxkVG9vbCIsInN5bmNNZWFzdXJlbWVudHNBbmRUb29sRGF0YSIsIm9ic2VydmUiLCJhZGRlZCIsInJlbW92ZWQiLCJyZXRyaWV2ZU1lYXN1cmVtZW50cyIsInBhdGllbnRJZCIsInRpbWVwb2ludElkcyIsInJldHJpZXZhbEZuIiwiZGF0YUV4Y2hhbmdlIiwicmV0cmlldmUiLCJpc0Z1bmN0aW9uIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aGVuIiwibWVhc3VyZW1lbnREYXRhIiwibG9nIiwiaW5mbyIsIm1lYXN1cmVtZW50c0dyb3VwcyIsIk9iamVjdCIsImtleXMiLCJtZWFzdXJlbWVudFR5cGVJZCIsInRvb2xUeXBlIiwicHVzaCIsImdyb3VwS2V5IiwiZ3JvdXAiLCJzb3J0IiwiYSIsImIiLCJtIiwic3RvcmVNZWFzdXJlbWVudHMiLCJzdG9yZUZuIiwic3RvcmUiLCJjb25jYXQiLCJ0aW1lcG9pbnRGaWx0ZXIiLCJhbGwiLCJtYXAiLCJ0IiwidmFsaWRhdGVNZWFzdXJlbWVudHMiLCJ2YWxpZGF0ZUZuIiwiZGF0YVZhbGlkYXRpb24iLCJGdW5jdGlvbiIsInN5bmNNZWFzdXJlbWVudEFuZFRvb2xEYXRhIiwic29ydE1lYXN1cmVtZW50cyIsImJhc2VsaW5lVGltZXBvaW50SWQiLCJpbmNsdWRlZFRvb2xzIiwiY2FzZVByb2dyZXNzIiwiaW5jbHVkZSIsImRlbGV0ZU1lYXN1cmVtZW50cyIsImVudHJpZXMiLCJsZW5ndGgiLCJ0b29sU3RhdGUiLCJnbG9iYWxJbWFnZUlkU3BlY2lmaWNUb29sU3RhdGVNYW5hZ2VyIiwic2F2ZVRvb2xTdGF0ZSIsImVhY2giLCJlbnRyeSIsIm1lYXN1cmVtZW50c0RhdGEiLCJnZXRUb29sQ29uZmlndXJhdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsImtleSIsImNoaWxkTWVhc3VyZW1lbnQiLCJpbWFnZVBhdGgiLCJpbWFnZUlkIiwidmlld2VyYmFzZSIsImdldEltYWdlSWRGb3JJbWFnZVBhdGgiLCJ0b29sRGF0YSIsIm1lYXN1cmVtZW50RW50cmllcyIsImRhdGEiLCJtZWFzdXJlbWVudEVudHJ5IiwiZmluZFdoZXJlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwicmVzdG9yZVRvb2xTdGF0ZSIsInN5bmNGaWx0ZXIiLCJjbG9uZSIsIiRndCIsInRvb2xUeXBlcyIsInVuaXEiLCJnZXRNZWFzdXJlbWVudEJ5SWQiLCJtZWFzdXJlbWVudElkIiwiZm91bmRHcm91cCIsInRvb2xHcm91cElkIiwic2VsZWN0b3IiLCJyZXN1bHQiLCJpdGVtcyIsIml0ZW0iLCJUaW1lcG9pbnRTY2hlbWEiLCJUaW1lcG9pbnRBcGkiLCJjdXJyZW50VGltZXBvaW50SWQiLCJyZXRyaWV2ZVRpbWVwb2ludHMiLCJlcnJvciIsInRpbWVwb2ludERhdGEiLCJxdWVyeSIsInVwc2VydCIsImNhdGNoIiwicmVhc29uIiwic3RvcmVUaW1lcG9pbnRzIiwiSlNPTiIsInN0cmluZ2lmeSIsImRpc2Fzc29jaWF0ZVN0dWR5IiwiZGlzYXNzb2NpYXRlRm4iLCJkaXNhc3NvY2lhdGUiLCJyZW1vdmVUaW1lcG9pbnQiLCJyZW1vdmVGbiIsInVwZGF0ZVRpbWVwb2ludCIsInVwZGF0ZUZuIiwibGF0ZXN0RGF0ZSIsImN1cnJlbnQiLCJsb2NrIiwibG9ja2VkIiwicHJpb3IiLCIkbHQiLCJjdXJyZW50QW5kUHJpb3IiLCJjb21wYXJpc29uIiwidGltZXBvaW50VHlwZSIsIm5hZGlyIiwidGltZXBvaW50S2V5Iiwic3R1ZHkiLCJjb250YWlucyIsInZpc2l0TnVtYmVyIiwiZm9sbG93dXBUaW1lcG9pbnRzIiwiZm9sbG93dXBUaW1lcG9pbnRJZHMiLCJ3YXJuIiwidGl0bGUiLCJ0aW1lcG9pbnROYW1lIiwiY3VycmVudEluZGV4IiwiaSIsImN1cnJlbnRUaW1lcG9pbnQiLCJpc051bWJlciIsInN0YXRlcyIsInBhcmVudGhlc2lzIiwiZXhwb3J0IiwiTWVhc3VyZW1lbnRTY2hlbWFUeXBlcyIsIlNpbXBsZVNjaGVtYSIsIk1lYXN1cmVtZW50IiwiYWRkaXRpb25hbERhdGEiLCJ0eXBlIiwibGFiZWwiLCJkZWZhdWx0VmFsdWUiLCJvcHRpb25hbCIsImJsYWNrYm94IiwidXNlcklkIiwiU3RyaW5nIiwiTnVtYmVyIiwiRGF0ZSIsImF1dG9WYWx1ZSIsImlzSW5zZXJ0IiwiaXNVcHNlcnQiLCIkc2V0T25JbnNlcnQiLCJ1cGRhdGVkQXQiLCJpc1VwZGF0ZSIsIlN0dWR5TGV2ZWxNZWFzdXJlbWVudCIsIlNlcmllc0xldmVsTWVhc3VyZW1lbnQiLCJzZXJpZXNJbnN0YW5jZVVpZCIsIkNvcm5lcnN0b25lVk9JIiwid2luZG93V2lkdGgiLCJkZWNpbWFsIiwid2luZG93Q2VudGVyIiwiQ29ybmVyc3RvbmVWaWV3cG9ydFRyYW5zbGF0aW9uIiwieCIsInkiLCJDb3JuZXJzdG9uZVZpZXdwb3J0Iiwic2NhbGUiLCJ0cmFuc2xhdGlvbiIsInZvaSIsImludmVydCIsIkJvb2xlYW4iLCJwaXhlbFJlcGxpY2F0aW9uIiwiaEZsaXAiLCJ2RmxpcCIsInJvdGF0aW9uIiwiSW5zdGFuY2VMZXZlbE1lYXN1cmVtZW50Iiwic29wSW5zdGFuY2VVaWQiLCJ2aWV3cG9ydCIsIkZyYW1lTGV2ZWxNZWFzdXJlbWVudCIsImZyYW1lSW5kZXgiLCJtaW4iLCJDb3JuZXJzdG9uZVRvb2xNZWFzdXJlbWVudCIsInZpc2libGUiLCJhY3RpdmUiLCJpbnZhbGlkYXRlZCIsIkNvcm5lcnN0b25lSGFuZGxlQm91bmRpbmdCb3hTY2hlbWEiLCJ3aWR0aCIsImhlaWdodCIsImxlZnQiLCJ0b3AiLCJDb3JuZXJzdG9uZUhhbmRsZVNjaGVtYSIsImhpZ2hsaWdodCIsImRyYXduSW5kZXBlbmRlbnRseSIsIm1vdmVzSW5kZXBlbmRlbnRseSIsImFsbG93ZWRPdXRzaWRlSW1hZ2UiLCJoYXNNb3ZlZCIsImhhc0JvdW5kaW5nQm94IiwiYm91bmRpbmdCb3giLCJhbGxvd2VkVmFsdWVzIiwiaXNMb2NrZWQiLCJlYXJsaWVzdERhdGUiLCJzdHVkaWVzRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLFdBQVIsQ0FBYjtBQUFtQ0YsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGlCQUFSLENBQWI7QUFBeUNGLE9BQU9DLEtBQVAsQ0FBYUMsUUFBUSxVQUFSLENBQWIsRTs7Ozs7Ozs7Ozs7QUNBNUUsSUFBSUMsSUFBSjtBQUFTSCxPQUFPQyxLQUFQLENBQWFDLFFBQVEsa0JBQVIsQ0FBYixFQUF5QztBQUFDQyxPQUFL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TztBQUZFLEdBTnNCO0FBVW5DdkIsaUJBQWU7QUFDWHNCLFVBQU1NLE1BREs7QUFFWEwsV0FBTyxnQkFGSTtBQUdYeUQsbUJBQWUsQ0FBQyxVQUFELEVBQWEsVUFBYixDQUhKO0FBSVh4RCxrQkFBYztBQUpILEdBVm9CO0FBZ0JuQ3lELFlBQVU7QUFDTjNELFVBQU04QixPQURBO0FBRU43QixXQUFPO0FBRkQsR0FoQnlCO0FBb0JuQ2xMLHFCQUFtQjtBQUNmaUwsVUFBTSxDQUFDTSxNQUFELENBRFM7QUFFZkwsV0FBTyxxQkFGUTtBQUdmQyxrQkFBYztBQUhDLEdBcEJnQjtBQXlCbkMwRCxnQkFBYztBQUNWNUQsVUFBTVEsSUFESTtBQUVWUCxXQUFPO0FBRkcsR0F6QnFCO0FBNkJuQy9CLGNBQVk7QUFDUjhCLFVBQU1RLElBREU7QUFFUlAsV0FBTztBQUZDLEdBN0J1QjtBQWlDbkNsQixlQUFhO0FBQ1RpQixVQUFNTyxNQURHO0FBRVROLFdBQU8sNEJBRkU7QUFHVEUsY0FBVTtBQUhELEdBakNzQjtBQXNDbkMwRCxlQUFhO0FBQ1Q3RCxVQUFNLENBQUN2SCxNQUFELENBREc7QUFFVHdILFdBQU8sb0NBRkU7QUFHVEUsY0FBVSxJQUhEO0FBSVRDLGNBQVU7QUFKRDtBQXRDc0IsQ0FBakIsQ0FBZixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX21lYXN1cmVtZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9iYXNlLmpzJztcclxuaW1wb3J0ICcuL2NvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgJy4vc2NoZW1hJztcclxuIiwiaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuT0hJRi5tZWFzdXJlbWVudHMgPSB7fTtcclxuIiwiaW1wb3J0ICcuL21lYXN1cmVtZW50cy5qcyc7XHJcbmltcG9ydCAnLi90aW1lcG9pbnRzLmpzJztcclxuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgeyBUcmFja2VyIH0gZnJvbSAnbWV0ZW9yL3RyYWNrZXInO1xyXG5pbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcbmltcG9ydCB7IGNvcm5lcnN0b25lVG9vbHMgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JuZXJzdG9uZSc7XHJcblxyXG5sZXQgY29uZmlndXJhdGlvbiA9IHt9O1xyXG5cclxuY2xhc3MgTWVhc3VyZW1lbnRBcGkge1xyXG4gICAgc3RhdGljIHNldENvbmZpZ3VyYXRpb24oY29uZmlnKSB7XHJcbiAgICAgICAgXy5leHRlbmQoY29uZmlndXJhdGlvbiwgY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q29uZmlndXJhdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gY29uZmlndXJhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0VG9vbHNHcm91cHNNYXAoKSB7XHJcbiAgICAgICAgY29uc3QgdG9vbHNHcm91cHNNYXAgPSB7fTtcclxuICAgICAgICBjb25maWd1cmF0aW9uLm1lYXN1cmVtZW50VG9vbHMuZm9yRWFjaCh0b29sR3JvdXAgPT4ge1xyXG4gICAgICAgICAgICB0b29sR3JvdXAuY2hpbGRUb29scy5mb3JFYWNoKHRvb2wgPT4gKHRvb2xzR3JvdXBzTWFwW3Rvb2wuaWRdID0gdG9vbEdyb3VwLmlkKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRvb2xzR3JvdXBzTWFwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbWVwb2ludEFwaSkge1xyXG4gICAgICAgIGlmICh0aW1lcG9pbnRBcGkpIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lcG9pbnRBcGkgPSB0aW1lcG9pbnRBcGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRvb2xHcm91cHMgPSB7fTtcclxuICAgICAgICB0aGlzLnRvb2xzID0ge307XHJcbiAgICAgICAgdGhpcy50b29sc0dyb3Vwc01hcCA9IE1lYXN1cmVtZW50QXBpLmdldFRvb2xzR3JvdXBzTWFwKCk7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VPYnNlcnZlciA9IG5ldyBUcmFja2VyLkRlcGVuZGVuY3koKTtcclxuXHJcbiAgICAgICAgY29uZmlndXJhdGlvbi5tZWFzdXJlbWVudFRvb2xzLmZvckVhY2godG9vbEdyb3VwID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZ3JvdXBDb2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24obnVsbCk7XHJcbiAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbi5fZGVidWdOYW1lID0gdG9vbEdyb3VwLm5hbWU7XHJcbiAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbi5hdHRhY2hTY2hlbWEodG9vbEdyb3VwLnNjaGVtYSk7XHJcbiAgICAgICAgICAgIHRoaXMudG9vbEdyb3Vwc1t0b29sR3JvdXAuaWRdID0gZ3JvdXBDb2xsZWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgdG9vbEdyb3VwLmNoaWxkVG9vbHMuZm9yRWFjaCh0b29sID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihudWxsKTtcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uX2RlYnVnTmFtZSA9IHRvb2wubmFtZTtcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uYXR0YWNoU2NoZW1hKHRvb2wuc2NoZW1hKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9vbHNbdG9vbC5pZF0gPSBjb2xsZWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGFkZGVkSGFuZGxlciA9IG1lYXN1cmVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVhc3VyZW1lbnROdW1iZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbWVhc3VyZW1lbnQgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZXBvaW50ID0gdGhpcy50aW1lcG9pbnRBcGkudGltZXBvaW50cy5maW5kT25lKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZHM6IG1lYXN1cmVtZW50LnN0dWR5SW5zdGFuY2VVaWRcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudGluZyBlcnJvcnMgdGhyb3duIHdoZW4gbm9uLWFzc29jaWF0ZWQgKHN0YW5kYWxvbmUpIHN0dWR5IGlzIG9wZW5lZC4uLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiBNYWtlIHN1cmUgdGhpcyBsb2dpYyBpcyBjb3JyZWN0LlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGltZXBvaW50KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVtcHR5SXRlbSA9IGdyb3VwQ29sbGVjdGlvbi5maW5kT25lKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkOiB7ICRlcTogbnVsbCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lcG9pbnRJZDogdGltZXBvaW50LnRpbWVwb2ludElkXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbXB0eUl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnROdW1iZXIgPSBlbXB0eUl0ZW0ubWVhc3VyZW1lbnROdW1iZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cENvbGxlY3Rpb24udXBkYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVwb2ludElkOiB0aW1lcG9pbnQudGltZXBvaW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudE51bWJlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkOiB0b29sLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJdGVtSWQ6IG1lYXN1cmVtZW50Ll9pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG1lYXN1cmVtZW50LmNyZWF0ZWRBdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudE51bWJlciA9IGdyb3VwQ29sbGVjdGlvbi5maW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWR5SW5zdGFuY2VVaWQ6IHsgJGluOiB0aW1lcG9pbnQuc3R1ZHlJbnN0YW5jZVVpZHMgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5jb3VudCgpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50Lm1lYXN1cmVtZW50TnVtYmVyID0gbWVhc3VyZW1lbnROdW1iZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBsb2NhdGlvbi9kZXNjcmlwdGlvbiAoaWYgYWxyZWFkeSBkZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU9iamVjdCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXBvaW50SWQ6IHRpbWVwb2ludC50aW1lcG9pbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnROdW1iZXJcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VsaW5lVGltZXBvaW50ID0gdGltZXBvaW50QXBpLmJhc2VsaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZWxpbmVHcm91cEVudHJ5ID0gZ3JvdXBDb2xsZWN0aW9uLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lcG9pbnRJZDogYmFzZWxpbmVUaW1lcG9pbnQudGltZXBvaW50SWRcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZWxpbmVHcm91cEVudHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2wgPSB0aGlzLnRvb2xzW2Jhc2VsaW5lR3JvdXBFbnRyeS50b29sSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3VuZCA9IHRvb2wuZmluZE9uZSh7IG1lYXN1cmVtZW50TnVtYmVyIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU9iamVjdC5sb2NhdGlvbiA9IGZvdW5kLmxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlT2JqZWN0LmRlc2NyaXB0aW9uID0gZm91bmQuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgdGltZXBvaW50IElELCBtZWFzdXJlbWVudCBudW1iZXIsIGxvY2F0aW9uIGFuZCBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24udXBkYXRlKG1lYXN1cmVtZW50Ll9pZCwgeyAkc2V0OiB1cGRhdGVPYmplY3QgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZW1wdHlJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZmxlY3QgdGhlIGVudHJ5IGluIHRoZSB0b29sIGdyb3VwIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uLmluc2VydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQ6IHRvb2wuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSXRlbUlkOiBtZWFzdXJlbWVudC5faWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lcG9pbnRJZDogdGltZXBvaW50LnRpbWVwb2ludElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogbWVhc3VyZW1lbnQuc3R1ZHlJbnN0YW5jZVVpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbWVhc3VyZW1lbnQuY3JlYXRlZEF0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnROdW1iZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFbmFibGUgcmVhY3Rpdml0eVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlT2JzZXJ2ZXIuY2hhbmdlZCgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VkSGFuZGxlciA9IG1lYXN1cmVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU9ic2VydmVyLmNoYW5nZWQoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlZEhhbmRsZXIgPSBtZWFzdXJlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnROdW1iZXIgPSBtZWFzdXJlbWVudC5tZWFzdXJlbWVudE51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJdGVtSWQ6IG1lYXN1cmVtZW50Ll9pZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEl0ZW1JZDogbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vbkVtcHR5SXRlbSA9IGdyb3VwQ29sbGVjdGlvbi5maW5kT25lKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnROdW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJZDogeyAkbm90OiBudWxsIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vbkVtcHR5SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBncm91cEl0ZW1zID0gZ3JvdXBDb2xsZWN0aW9uLmZpbmQoeyBtZWFzdXJlbWVudE51bWJlciB9KS5mZXRjaCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBncm91cEl0ZW1zLmZvckVhY2goZ3JvdXBJdGVtID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSByZWNvcmQgZnJvbSB0aGUgdG9vbHMgZ3JvdXAgY29sbGVjdGlvbiB0b29cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uLnJlbW92ZSh7IF9pZDogZ3JvdXBJdGVtLl9pZCB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgbWVhc3VyZW1lbnQgbnVtYmVycyBvbmx5IGlmIGl0IGlzIGxhc3QgaXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lcG9pbnQgPSB0aGlzLnRpbWVwb2ludEFwaS50aW1lcG9pbnRzLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXBvaW50SWQ6IGdyb3VwSXRlbS50aW1lcG9pbnRJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWR5SW5zdGFuY2VVaWQ6IHsgJGluOiB0aW1lcG9pbnQuc3R1ZHlJbnN0YW5jZVVpZHMgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50TnVtYmVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdJdGVtcyA9IGdyb3VwQ29sbGVjdGlvbi5maW5kKGZpbHRlcikuY291bnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdJdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyLm1lYXN1cmVtZW50TnVtYmVyID0geyAkZ3RlOiBtZWFzdXJlbWVudE51bWJlciB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlcmF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGluYzogeyBtZWFzdXJlbWVudE51bWJlcjogLTEgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IG11bHRpOiB0cnVlIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cENvbGxlY3Rpb24udXBkYXRlKGZpbHRlciwgb3BlcmF0b3IsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEdyb3VwLmNoaWxkVG9vbHMuZm9yRWFjaChjaGlsZFRvb2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnRvb2xzW2NoaWxkVG9vbC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbi51cGRhdGUoZmlsdGVyLCBvcGVyYXRvciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBTeW5jaHJvbml6ZSB0aGUgbmV3IHRvb2wgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3luY01lYXN1cmVtZW50c0FuZFRvb2xEYXRhKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVuYWJsZSByZWFjdGl2aXR5XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VPYnNlcnZlci5jaGFuZ2VkKCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24uZmluZCgpLm9ic2VydmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZGVkOiBhZGRlZEhhbmRsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZDogY2hhbmdlZEhhbmRsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZEhhbmRsZXJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXRyaWV2ZU1lYXN1cmVtZW50cyhwYXRpZW50SWQsIHRpbWVwb2ludElkcykge1xyXG4gICAgICAgIGNvbnN0IHJldHJpZXZhbEZuID0gY29uZmlndXJhdGlvbi5kYXRhRXhjaGFuZ2UucmV0cmlldmU7XHJcbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24ocmV0cmlldmFsRm4pKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHJpZXZhbEZuKHBhdGllbnRJZCwgdGltZXBvaW50SWRzKS50aGVuKG1lYXN1cmVtZW50RGF0YSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgT0hJRi5sb2cuaW5mbygnTWVhc3VyZW1lbnQgZGF0YSByZXRyaWV2YWwnKTtcclxuICAgICAgICAgICAgICAgIE9ISUYubG9nLmluZm8obWVhc3VyZW1lbnREYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0b29sc0dyb3Vwc01hcCA9IE1lYXN1cmVtZW50QXBpLmdldFRvb2xzR3JvdXBzTWFwKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlbWVudHNHcm91cHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhtZWFzdXJlbWVudERhdGEpLmZvckVhY2gobWVhc3VyZW1lbnRUeXBlSWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmVtZW50cyA9IG1lYXN1cmVtZW50RGF0YVttZWFzdXJlbWVudFR5cGVJZF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50cy5mb3JFYWNoKG1lYXN1cmVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB0b29sVHlwZSB9ID0gbWVhc3VyZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sVHlwZSAmJiB0aGlzLnRvb2xzW3Rvb2xUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lYXN1cmVtZW50Ll9pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xHcm91cCA9IHRvb2xzR3JvdXBzTWFwW3Rvb2xUeXBlXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVhc3VyZW1lbnRzR3JvdXBzW3Rvb2xHcm91cF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudHNHcm91cHNbdG9vbEdyb3VwXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50c0dyb3Vwc1t0b29sR3JvdXBdLnB1c2gobWVhc3VyZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhtZWFzdXJlbWVudHNHcm91cHMpLmZvckVhY2goZ3JvdXBLZXkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwID0gbWVhc3VyZW1lbnRzR3JvdXBzW2dyb3VwS2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBncm91cC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhLm1lYXN1cmVtZW50TnVtYmVyID4gYi5tZWFzdXJlbWVudE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5tZWFzdXJlbWVudE51bWJlciA8IGIubWVhc3VyZW1lbnROdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwLmZvckVhY2gobSA9PiB0aGlzLnRvb2xzW20udG9vbFR5cGVdLmluc2VydChtKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3JlTWVhc3VyZW1lbnRzKHRpbWVwb2ludElkKSB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVGbiA9IGNvbmZpZ3VyYXRpb24uZGF0YUV4Y2hhbmdlLnN0b3JlO1xyXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKHN0b3JlRm4pKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBtZWFzdXJlbWVudERhdGEgPSB7fTtcclxuICAgICAgICBjb25maWd1cmF0aW9uLm1lYXN1cmVtZW50VG9vbHMuZm9yRWFjaCh0b29sR3JvdXAgPT4ge1xyXG4gICAgICAgICAgICB0b29sR3JvdXAuY2hpbGRUb29scy5mb3JFYWNoKHRvb2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtZWFzdXJlbWVudERhdGFbdG9vbEdyb3VwLmlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50RGF0YVt0b29sR3JvdXAuaWRdID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbWVhc3VyZW1lbnREYXRhW3Rvb2xHcm91cC5pZF0gPSBtZWFzdXJlbWVudERhdGFbdG9vbEdyb3VwLmlkXS5jb25jYXQodGhpcy50b29sc1t0b29sLmlkXS5maW5kKCkuZmV0Y2goKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCB0aW1lcG9pbnRGaWx0ZXIgPSB0aW1lcG9pbnRJZCA/IHsgdGltZXBvaW50SWQgfSA6IHt9O1xyXG4gICAgICAgIGNvbnN0IHRpbWVwb2ludHMgPSB0aGlzLnRpbWVwb2ludEFwaS5hbGwodGltZXBvaW50RmlsdGVyKTtcclxuICAgICAgICBjb25zdCB0aW1lcG9pbnRJZHMgPSB0aW1lcG9pbnRzLm1hcCh0ID0+IHQudGltZXBvaW50SWQpO1xyXG4gICAgICAgIGNvbnN0IHBhdGllbnRJZCA9IHRpbWVwb2ludHNbMF0ucGF0aWVudElkO1xyXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IHtcclxuICAgICAgICAgICAgcGF0aWVudElkLFxyXG4gICAgICAgICAgICB0aW1lcG9pbnRJZDoge1xyXG4gICAgICAgICAgICAgICAgJGluOiB0aW1lcG9pbnRJZHNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIE9ISUYubG9nLmluZm8oJ1NhdmluZyBNZWFzdXJlbWVudHMgZm9yIHRpbWVwb2ludHM6JywgdGltZXBvaW50cyk7XHJcbiAgICAgICAgcmV0dXJuIHN0b3JlRm4obWVhc3VyZW1lbnREYXRhLCBmaWx0ZXIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBPSElGLmxvZy5pbmZvKCdNZWFzdXJlbWVudCBzdG9yYWdlIGNvbXBsZXRlZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlTWVhc3VyZW1lbnRzKCkge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlRm4gPSBjb25maWd1cmF0aW9uLmRhdGFWYWxpZGF0aW9uLnZhbGlkYXRlTWVhc3VyZW1lbnRzO1xyXG4gICAgICAgIGlmICh2YWxpZGF0ZUZuICYmIHZhbGlkYXRlRm4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG4gICAgICAgICAgICB2YWxpZGF0ZUZuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN5bmNNZWFzdXJlbWVudHNBbmRUb29sRGF0YSgpIHtcclxuICAgICAgICBjb25maWd1cmF0aW9uLm1lYXN1cmVtZW50VG9vbHMuZm9yRWFjaCh0b29sR3JvdXAgPT4ge1xyXG4gICAgICAgICAgICB0b29sR3JvdXAuY2hpbGRUb29scy5mb3JFYWNoKHRvb2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnRzID0gdGhpcy50b29sc1t0b29sLmlkXS5maW5kKCkuZmV0Y2goKTtcclxuICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50cy5mb3JFYWNoKG1lYXN1cmVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPSElGLm1lYXN1cmVtZW50cy5zeW5jTWVhc3VyZW1lbnRBbmRUb29sRGF0YShtZWFzdXJlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc29ydE1lYXN1cmVtZW50cyhiYXNlbGluZVRpbWVwb2ludElkKSB7XHJcbiAgICAgICAgY29uc3QgdG9vbHMgPSBjb25maWd1cmF0aW9uLm1lYXN1cmVtZW50VG9vbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY2x1ZGVkVG9vbHMgPSB0b29scy5maWx0ZXIodG9vbCA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAodG9vbC5vcHRpb25zICYmIHRvb2wub3B0aW9ucy5jYXNlUHJvZ3Jlc3MgJiYgdG9vbC5vcHRpb25zLmNhc2VQcm9ncmVzcy5pbmNsdWRlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIE1lYXN1cmVtZW50IHRoZSBkaXNwbGF5ZWQgTWVhc3VyZW1lbnRzXHJcbiAgICAgICAgaW5jbHVkZWRUb29scy5mb3JFYWNoKHRvb2wgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy50b29sc1t0b29sLmlkXTtcclxuICAgICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnRzID0gY29sbGVjdGlvbi5maW5kKCkuZmV0Y2goKTtcclxuICAgICAgICAgICAgbWVhc3VyZW1lbnRzLmZvckVhY2gobWVhc3VyZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgT0hJRi5tZWFzdXJlbWVudHMuc3luY01lYXN1cmVtZW50QW5kVG9vbERhdGEobWVhc3VyZW1lbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGVNZWFzdXJlbWVudHMobWVhc3VyZW1lbnRUeXBlSWQsIGZpbHRlcikge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwQ29sbGVjdGlvbiA9IHRoaXMudG9vbEdyb3Vwc1ttZWFzdXJlbWVudFR5cGVJZF07XHJcblxyXG4gICAgICAgIC8vIFN0b3AgaGVyZSBpZiBpdCBpcyBhIHRlbXBvcmFyeSB0b29sR3JvdXBzXHJcbiAgICAgICAgaWYgKCFncm91cENvbGxlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBlbnRyaWVzIGluZm9ybWF0aW9uIGJlZm9yZSByZW1vdmluZyB0aGVtXHJcbiAgICAgICAgY29uc3QgZ3JvdXBJdGVtcyA9IGdyb3VwQ29sbGVjdGlvbi5maW5kKGZpbHRlcikuZmV0Y2goKTtcclxuICAgICAgICBjb25zdCBlbnRyaWVzID0gW107XHJcbiAgICAgICAgZ3JvdXBJdGVtcy5mb3JFYWNoKGdyb3VwSXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZ3JvdXBJdGVtLnRvb2xJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy50b29sc1tncm91cEl0ZW0udG9vbElkXTtcclxuICAgICAgICAgICAgZW50cmllcy5wdXNoKGNvbGxlY3Rpb24uZmluZE9uZShncm91cEl0ZW0udG9vbEl0ZW1JZCkpO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnJlbW92ZShncm91cEl0ZW0udG9vbEl0ZW1JZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFN0b3AgaGVyZSBpZiBubyBlbnRyaWVzIHdlcmUgZm91bmRcclxuICAgICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBmaWx0ZXIgZG9lc24ndCBoYXZlIHRoZSBtZWFzdXJlbWVudCBudW1iZXIsIGdldCBpdCBmcm9tIHRoZSBmaXJzdCBlbnRyeVxyXG4gICAgICAgIGNvbnN0IG1lYXN1cmVtZW50TnVtYmVyID0gZmlsdGVyLm1lYXN1cmVtZW50TnVtYmVyIHx8IGVudHJpZXNbMF0ubWVhc3VyZW1lbnROdW1iZXI7XHJcblxyXG4gICAgICAgIC8vIFN5bmNocm9uaXplIHRoZSBuZXcgZGF0YSB3aXRoIGNvcm5lcnN0b25lIHRvb2xzXHJcbiAgICAgICAgY29uc3QgdG9vbFN0YXRlID0gY29ybmVyc3RvbmVUb29scy5nbG9iYWxJbWFnZUlkU3BlY2lmaWNUb29sU3RhdGVNYW5hZ2VyLnNhdmVUb29sU3RhdGUoKTtcclxuXHJcbiAgICAgICAgXy5lYWNoKGVudHJpZXMsIGVudHJ5ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnRzRGF0YSA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCB7IHRvb2wgfSA9IE9ISUYubWVhc3VyZW1lbnRzLmdldFRvb2xDb25maWd1cmF0aW9uKGVudHJ5LnRvb2xUeXBlKTtcclxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9vbC5jaGlsZFRvb2xzKSkge1xyXG4gICAgICAgICAgICAgICAgdG9vbC5jaGlsZFRvb2xzLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZE1lYXN1cmVtZW50ID0gZW50cnlba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkTWVhc3VyZW1lbnQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudHNEYXRhLnB1c2goY2hpbGRNZWFzdXJlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50c0RhdGEucHVzaChlbnRyeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1lYXN1cmVtZW50c0RhdGEuZm9yRWFjaChtZWFzdXJlbWVudERhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBpbWFnZVBhdGgsIHRvb2xUeXBlIH0gPSBtZWFzdXJlbWVudERhdGE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWFnZUlkID0gT0hJRi52aWV3ZXJiYXNlLmdldEltYWdlSWRGb3JJbWFnZVBhdGgoaW1hZ2VQYXRoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0b29sU3RhdGVbaW1hZ2VJZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sRGF0YSA9IHRvb2xTdGF0ZVtpbWFnZUlkXVt0b29sVHlwZV07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnRFbnRyaWVzID0gdG9vbERhdGEgJiYgdG9vbERhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlbWVudEVudHJ5ID0gXy5maW5kV2hlcmUobWVhc3VyZW1lbnRFbnRyaWVzLCB7IF9pZDogZW50cnkuX2lkIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlbWVudEVudHJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbWVhc3VyZW1lbnRFbnRyaWVzLmluZGV4T2YobWVhc3VyZW1lbnRFbnRyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmVtZW50RW50cmllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvcm5lcnN0b25lVG9vbHMuZ2xvYmFsSW1hZ2VJZFNwZWNpZmljVG9vbFN0YXRlTWFuYWdlci5yZXN0b3JlVG9vbFN0YXRlKHRvb2xTdGF0ZSk7XHJcblxyXG4gICAgICAgIC8vIFN5bmNocm9uaXplIHRoZSB1cGRhdGVkIG1lYXN1cmVtZW50cyB3aXRoIENvcm5lcnN0b25lIFRvb2xzXHJcbiAgICAgICAgLy8gdG9vbERhdGEgdG8gbWFrZSBzdXJlIHRoZSBkaXNwbGF5ZWQgbWVhc3VyZW1lbnRzIHNob3cgJ1RhcmdldCBYJyBjb3JyZWN0bHlcclxuICAgICAgICBjb25zdCBzeW5jRmlsdGVyID0gXy5jbG9uZShmaWx0ZXIpO1xyXG4gICAgICAgIGRlbGV0ZSBzeW5jRmlsdGVyLnRpbWVwb2ludElkO1xyXG5cclxuICAgICAgICBzeW5jRmlsdGVyLm1lYXN1cmVtZW50TnVtYmVyID0ge1xyXG4gICAgICAgICAgICAkZ3Q6IG1lYXN1cmVtZW50TnVtYmVyIC0gMVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHRvb2xUeXBlcyA9IF8udW5pcShlbnRyaWVzLm1hcChlbnRyeSA9PiBlbnRyeS50b29sVHlwZSkpO1xyXG4gICAgICAgIHRvb2xUeXBlcy5mb3JFYWNoKHRvb2xUeXBlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHRoaXMudG9vbHNbdG9vbFR5cGVdO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZpbmQoc3luY0ZpbHRlcikuZm9yRWFjaChtZWFzdXJlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBPSElGLm1lYXN1cmVtZW50cy5zeW5jTWVhc3VyZW1lbnRBbmRUb29sRGF0YShtZWFzdXJlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1lYXN1cmVtZW50QnlJZChtZWFzdXJlbWVudElkKSB7XHJcbiAgICAgICAgbGV0IGZvdW5kR3JvdXA7XHJcbiAgICAgICAgXy5maW5kKHRoaXMudG9vbEdyb3VwcywgdG9vbEdyb3VwID0+IHtcclxuICAgICAgICAgICAgZm91bmRHcm91cCA9IHRvb2xHcm91cC5maW5kT25lKHsgdG9vbEl0ZW1JZDogbWVhc3VyZW1lbnRJZCB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICEhZm91bmRHcm91cDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU3RvcCBoZXJlIGlmIG5vIGdyb3VwIHdhcyBmb3VuZCBvciBpZiB0aGUgcmVjb3JkIGlzIGEgcGxhY2Vob2xkZXJcclxuICAgICAgICBpZiAoIWZvdW5kR3JvdXAgfHwgIWZvdW5kR3JvdXAudG9vbElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnRvb2xzW2ZvdW5kR3JvdXAudG9vbElkXS5maW5kT25lKG1lYXN1cmVtZW50SWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoKHRvb2xHcm91cElkLCBzZWxlY3Rvciwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICghdGhpcy50b29sR3JvdXBzW3Rvb2xHcm91cElkXSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnTWVhc3VyZW1lbnRBcGk6IE5vIENvbGxlY3Rpb24gd2l0aCB0aGUgaWQ6ICcgKyB0b29sR3JvdXBJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwge307XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLnRvb2xHcm91cHNbdG9vbEdyb3VwSWRdLmZpbmQoc2VsZWN0b3IsIG9wdGlvbnMpLmZldGNoKCk7XHJcbiAgICAgICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0udG9vbElkKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnRvb2xzW2l0ZW0udG9vbElkXS5maW5kT25lKGl0ZW0udG9vbEl0ZW1JZCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goeyBtZWFzdXJlbWVudE51bWJlcjogaXRlbS5tZWFzdXJlbWVudE51bWJlciB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5PSElGLm1lYXN1cmVtZW50cy5NZWFzdXJlbWVudEFwaSA9IE1lYXN1cmVtZW50QXBpO1xyXG4iLCJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcbmltcG9ydCB7IF8gfSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcblxyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5pbXBvcnQgeyBzY2hlbWEgYXMgVGltZXBvaW50U2NoZW1hIH0gZnJvbSAnbWV0ZW9yL29oaWY6bWVhc3VyZW1lbnRzL2JvdGgvc2NoZW1hL3RpbWVwb2ludHMnO1xyXG5cclxuY29uc3QgY29uZmlndXJhdGlvbiA9IHt9O1xyXG5cclxuY2xhc3MgVGltZXBvaW50QXBpIHtcclxuICAgIHN0YXRpYyBzZXRDb25maWd1cmF0aW9uKGNvbmZpZykge1xyXG4gICAgICAgIF8uZXh0ZW5kKGNvbmZpZ3VyYXRpb24sIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldENvbmZpZ3VyYXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoY3VycmVudFRpbWVwb2ludElkLCBvcHRpb25zPXt9KSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lcG9pbnRJZCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lcG9pbnRJZCA9IGN1cnJlbnRUaW1lcG9pbnRJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy50aW1lcG9pbnRzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24obnVsbCk7XHJcbiAgICAgICAgdGhpcy50aW1lcG9pbnRzLmF0dGFjaFNjaGVtYShUaW1lcG9pbnRTY2hlbWEpO1xyXG4gICAgICAgIHRoaXMudGltZXBvaW50cy5fZGVidWdOYW1lID0gJ1RpbWVwb2ludHMnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHJpZXZlVGltZXBvaW50cyhmaWx0ZXIpIHtcclxuICAgICAgICBjb25zdCByZXRyaWV2YWxGbiA9IGNvbmZpZ3VyYXRpb24uZGF0YUV4Y2hhbmdlLnJldHJpZXZlO1xyXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKHJldHJpZXZhbEZuKSkge1xyXG4gICAgICAgICAgICBPSElGLmxvZy5lcnJvcignVGltZXBvaW50IHJldHJpZXZhbCBmdW5jdGlvbiBoYXMgbm90IGJlZW4gY29uZmlndXJlZC4nKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmV0cmlldmFsRm4oZmlsdGVyKS50aGVuKHRpbWVwb2ludERhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgT0hJRi5sb2cuaW5mbygnVGltZXBvaW50IGRhdGEgcmV0cmlldmFsJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgXy5lYWNoKHRpbWVwb2ludERhdGEsIHRpbWVwb2ludCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRpbWVwb2ludC5faWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVwb2ludElkOiB0aW1lcG9pbnQudGltZXBvaW50SWRcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVwb2ludHMudXBkYXRlKHF1ZXJ5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHRpbWVwb2ludFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBzZXJ0OiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pLmNhdGNoKHJlYXNvbiA9PiB7XHJcbiAgICAgICAgICAgICAgICBPSElGLmxvZy5lcnJvcihgVGltZXBvaW50IHJldHJpZXZhbCBmdW5jdGlvbiBmYWlsZWQ6ICR7cmVhc29ufWApO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3JlVGltZXBvaW50cygpIHtcclxuICAgICAgICBjb25zdCBzdG9yZUZuID0gY29uZmlndXJhdGlvbi5kYXRhRXhjaGFuZ2Uuc3RvcmU7XHJcbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oc3RvcmVGbikpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGltZXBvaW50RGF0YSA9IHRoaXMudGltZXBvaW50cy5maW5kKCkuZmV0Y2goKTtcclxuICAgICAgICBPSElGLmxvZy5pbmZvKCdQcmVwYXJpbmcgdG8gc3RvcmUgdGltZXBvaW50cycpO1xyXG4gICAgICAgIE9ISUYubG9nLmluZm8oSlNPTi5zdHJpbmdpZnkodGltZXBvaW50RGF0YSwgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICBzdG9yZUZuKHRpbWVwb2ludERhdGEpLnRoZW4oKCkgPT4gT0hJRi5sb2cuaW5mbygnVGltZXBvaW50IHN0b3JhZ2UgY29tcGxldGVkJykpO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc2Fzc29jaWF0ZVN0dWR5KHRpbWVwb2ludElkcywgc3R1ZHlJbnN0YW5jZVVpZCkge1xyXG4gICAgICAgIGNvbnN0IGRpc2Fzc29jaWF0ZUZuID0gY29uZmlndXJhdGlvbi5kYXRhRXhjaGFuZ2UuZGlzYXNzb2NpYXRlO1xyXG4gICAgICAgIGRpc2Fzc29jaWF0ZUZuKHRpbWVwb2ludElkcywgc3R1ZHlJbnN0YW5jZVVpZCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIE9ISUYubG9nLmluZm8oJ0Rpc2Fzc29jaWF0aW9uIGNvbXBsZXRlZCcpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50aW1lcG9pbnRzLnJlbW92ZSh7fSk7XHJcbiAgICAgICAgICAgIHRoaXMucmV0cmlldmVUaW1lcG9pbnRzKHt9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVUaW1lcG9pbnQodGltZXBvaW50SWQpIHtcclxuICAgICAgICBjb25zdCByZW1vdmVGbiA9IGNvbmZpZ3VyYXRpb24uZGF0YUV4Y2hhbmdlLnJlbW92ZTtcclxuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihyZW1vdmVGbikpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGltZXBvaW50RGF0YSA9IHtcclxuICAgICAgICAgICAgdGltZXBvaW50SWRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBPSElGLmxvZy5pbmZvKCdQcmVwYXJpbmcgdG8gcmVtb3ZlIHRpbWVwb2ludCcpO1xyXG4gICAgICAgIE9ISUYubG9nLmluZm8oSlNPTi5zdHJpbmdpZnkodGltZXBvaW50RGF0YSwgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICByZW1vdmVGbih0aW1lcG9pbnREYXRhKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgT0hJRi5sb2cuaW5mbygnVGltZXBvaW50IHJlbW92YWwgY29tcGxldGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXBvaW50cy5yZW1vdmUodGltZXBvaW50RGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVGltZXBvaW50KHRpbWVwb2ludElkLCBxdWVyeSkge1xyXG4gICAgICAgIGNvbnN0IHVwZGF0ZUZuID0gY29uZmlndXJhdGlvbi5kYXRhRXhjaGFuZ2UudXBkYXRlO1xyXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKHVwZGF0ZUZuKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0aW1lcG9pbnREYXRhID0ge1xyXG4gICAgICAgICAgICB0aW1lcG9pbnRJZFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIE9ISUYubG9nLmluZm8oJ1ByZXBhcmluZyB0byB1cGRhdGUgdGltZXBvaW50Jyk7XHJcbiAgICAgICAgT0hJRi5sb2cuaW5mbyhKU09OLnN0cmluZ2lmeSh0aW1lcG9pbnREYXRhLCBudWxsLCAyKSk7XHJcbiAgICAgICAgT0hJRi5sb2cuaW5mbyhKU09OLnN0cmluZ2lmeShxdWVyeSwgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICB1cGRhdGVGbih0aW1lcG9pbnREYXRhLCBxdWVyeSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIE9ISUYubG9nLmluZm8oJ1RpbWVwb2ludCB1cGRhdGVkIGNvbXBsZXRlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVwb2ludHMudXBkYXRlKHRpbWVwb2ludERhdGEsIHF1ZXJ5KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gYWxsIHRpbWVwb2ludHNcclxuICAgIGFsbChmaWx0ZXI9e30pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aW1lcG9pbnRzLmZpbmQoZmlsdGVyLCB7XHJcbiAgICAgICAgICAgIHNvcnQ6IHtcclxuICAgICAgICAgICAgICAgIGxhdGVzdERhdGU6IC0xXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSkuZmV0Y2goKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gb25seSB0aGUgY3VycmVudCB0aW1lcG9pbnRcclxuICAgIGN1cnJlbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZXBvaW50cy5maW5kT25lKHsgdGltZXBvaW50SWQ6IHRoaXMuY3VycmVudFRpbWVwb2ludElkIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2soKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMuY3VycmVudCgpO1xyXG4gICAgICAgIGlmICghY3VycmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRpbWVwb2ludHMudXBkYXRlKGN1cnJlbnQuX2lkLCB7XHJcbiAgICAgICAgICAgICRzZXQ6IHtcclxuICAgICAgICAgICAgICAgIGxvY2tlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIHRoZSBwcmlvciB0aW1lcG9pbnRcclxuICAgIHByaW9yKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmN1cnJlbnQoKTtcclxuICAgICAgICBpZiAoIWN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbGF0ZXN0RGF0ZSA9IGN1cnJlbnQubGF0ZXN0RGF0ZTtcclxuICAgICAgICByZXR1cm4gdGhpcy50aW1lcG9pbnRzLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICBsYXRlc3REYXRlOiB7ICRsdDogbGF0ZXN0RGF0ZSB9XHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBzb3J0OiB7IGxhdGVzdERhdGU6IC0xIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gb25seSB0aGUgY3VycmVudCBhbmQgcHJpb3IgdGltZXBvaW50c1xyXG4gICAgY3VycmVudEFuZFByaW9yKCkge1xyXG4gICAgICAgIGNvbnN0IHRpbWVwb2ludHMgPSBbXTtcclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMuY3VycmVudCgpO1xyXG4gICAgICAgIGlmIChjdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHRpbWVwb2ludHMucHVzaChjdXJyZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByaW9yID0gdGhpcy5wcmlvcigpO1xyXG4gICAgICAgIGlmIChjdXJyZW50ICYmIHByaW9yICYmIHByaW9yLl9pZCAhPT0gY3VycmVudC5faWQpIHtcclxuICAgICAgICAgICAgdGltZXBvaW50cy5wdXNoKHByaW9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lcG9pbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiBvbmx5IHRoZSBjb21wYXJpc29uIHRpbWVwb2ludHNcclxuICAgIGNvbXBhcmlzb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEFuZFByaW9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIG9ubHkgdGhlIGJhc2VsaW5lIHRpbWVwb2ludFxyXG4gICAgYmFzZWxpbmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZXBvaW50cy5maW5kT25lKHsgdGltZXBvaW50VHlwZTogJ2Jhc2VsaW5lJyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gb25seSB0aGUgbmFkaXIgdGltZXBvaW50XHJcbiAgICBuYWRpcigpIHtcclxuICAgICAgICBjb25zdCB0aW1lcG9pbnQgPSB0aGlzLnRpbWVwb2ludHMuZmluZE9uZSh7IHRpbWVwb2ludEtleTogJ25hZGlyJyB9KTtcclxuICAgICAgICByZXR1cm4gdGltZXBvaW50IHx8IHRoaXMuYmFzZWxpbmUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gb25seSB0aGUga2V5IHRpbWVwb2ludHMgKGN1cnJlbnQsIHByaW9yLCBuYWRpciBhbmQgYmFzZWxpbmUpXHJcbiAgICBrZXkoZmlsdGVyPXt9KSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHRpbWVwb2ludHNcclxuICAgICAgICBjb25zdCBhbGwgPSB0aGlzLmFsbChmaWx0ZXIpO1xyXG5cclxuICAgICAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCB0aW1lcG9pbnQgYW5kIGluc2VydCB0aGUga2V5IG9uZXMgaW4gdGhlIHJlc3VsdFxyXG4gICAgICAgIF8uZWFjaChhbGwsICh0aW1lcG9pbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDIgfHwgaW5kZXggPT09IChhbGwubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRpbWVwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSByZXN1bHRpbmcgdGltZXBvaW50c1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIG9ubHkgdGhlIHRpbWVwb2ludHMgZm9yIHRoZSBnaXZlbiBzdHVkeVxyXG4gICAgc3R1ZHkoc3R1ZHlJbnN0YW5jZVVpZCkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCB0aW1lcG9pbnQgYW5kIGluc2VydCB0aGUga2V5IG9uZXMgaW4gdGhlIHJlc3VsdFxyXG4gICAgICAgIF8uZWFjaCh0aGlzLmFsbCgpLCAodGltZXBvaW50LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoXy5jb250YWlucyh0aW1lcG9pbnQuc3R1ZHlJbnN0YW5jZVVpZHMsIHN0dWR5SW5zdGFuY2VVaWQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aW1lcG9pbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiB0aGUgcmVzdWx0aW5nIHRpbWVwb2ludHNcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiB0aGUgdGltZXBvaW50J3MgbmFtZVxyXG4gICAgbmFtZSh0aW1lcG9pbnQpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgQmFzZWxpbmUgdGltZXBvaW50LCBpZiBpdCBpcywgcmV0dXJuICdCYXNlbGluZSdcclxuICAgICAgICBpZiAodGltZXBvaW50LnRpbWVwb2ludFR5cGUgPT09ICdiYXNlbGluZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdCYXNlbGluZSc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aW1lcG9pbnQudmlzaXROdW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdGb2xsb3ctdXAgJyArIHRpbWVwb2ludC52aXNpdE51bWJlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJldHJpZXZlIGFsbCBvZiB0aGUgcmVsZXZhbnQgZm9sbG93LXVwIHRpbWVwb2ludHMgZm9yIHRoaXMgcGF0aWVudFxyXG4gICAgICAgIGNvbnN0IGZvbGxvd3VwVGltZXBvaW50cyA9IHRoaXMudGltZXBvaW50cy5maW5kKHtcclxuICAgICAgICAgICAgcGF0aWVudElkOiB0aW1lcG9pbnQucGF0aWVudElkLFxyXG4gICAgICAgICAgICB0aW1lcG9pbnRUeXBlOiB0aW1lcG9pbnQudGltZXBvaW50VHlwZVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgc29ydDoge1xyXG4gICAgICAgICAgICAgICAgbGF0ZXN0RGF0ZTogMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBqdXN0IHRpbWVwb2ludElkcywgc28gd2UgY2FuIHVzZSBpbmRleE9mXHJcbiAgICAgICAgLy8gb24gaXQgdG8gZmluZCB0aGUgY3VycmVudCB0aW1lcG9pbnQncyByZWxhdGl2ZSBwb3NpdGlvblxyXG4gICAgICAgIGNvbnN0IGZvbGxvd3VwVGltZXBvaW50SWRzID0gZm9sbG93dXBUaW1lcG9pbnRzLm1hcCh0aW1lcG9pbnQgPT4gdGltZXBvaW50LnRpbWVwb2ludElkKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCB0aW1lcG9pbnQgaW4gdGhlIGFycmF5IG9mIGFsbFxyXG4gICAgICAgIC8vIHJlbGV2YW50IGZvbGxvdy11cCB0aW1lcG9pbnRzXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBmb2xsb3d1cFRpbWVwb2ludElkcy5pbmRleE9mKHRpbWVwb2ludC50aW1lcG9pbnRJZCkgKyAxO1xyXG5cclxuICAgICAgICAvLyBJZiBpbmRleCBpcyAwLCBpdCBtZWFucyB0aGF0IHRoZSBjdXJyZW50IHRpbWVwb2ludCB3YXMgbm90IGluIHRoZSBsaXN0XHJcbiAgICAgICAgLy8gTG9nIGEgd2FybmluZyBhbmQgcmV0dXJuIGhlcmVcclxuICAgICAgICBpZiAoIWluZGV4KSB7XHJcbiAgICAgICAgICAgIE9ISUYubG9nLndhcm4oJ0N1cnJlbnQgZm9sbG93LXVwIHdhcyBub3QgaW4gdGhlIGxpc3Qgb2YgcmVsZXZhbnQgZm9sbG93LXVwcz8nKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSB0aW1lcG9pbnQgbmFtZSBhcyAnRm9sbG93LXVwIE4nXHJcbiAgICAgICAgcmV0dXJuICdGb2xsb3ctdXAgJyArIGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJ1aWxkIHRoZSB0aW1lcG9pbnQgdGl0bGUgYmFzZWQgb24gaXRzIGRhdGVcclxuICAgIHRpdGxlKHRpbWVwb2ludCkge1xyXG4gICAgICAgIGNvbnN0IHRpbWVwb2ludE5hbWUgPSB0aGlzLm5hbWUodGltZXBvaW50KTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsID0gXy5jbG9uZSh0aGlzLmFsbCgpKTtcclxuICAgICAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gbnVsbDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGltZXBvaW50ID0gYWxsW2ldO1xyXG5cclxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgaXRlcmF0aW9ucyB1bnRpbCB3ZSBjYW4ndCBmaW5kIHRoZSBzZWxlY3RlZCB0aW1lcG9pbnQgb24gc3R1ZHkgbGlzdFxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VGltZXBvaW50SWQgPT09IGN1cnJlbnRUaW1lcG9pbnQudGltZXBvaW50SWQpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChfLmlzTnVtYmVyKGN1cnJlbnRJbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gY3VycmVudEluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEJyZWFrIHRoZSBsb29wIGlmIHJlYWNoZWQgdGhlIHRpbWVwb2ludCB0byBnZXQgdGhlIHRpdGxlXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50VGltZXBvaW50LnRpbWVwb2ludElkID09PSB0aW1lcG9pbnQudGltZXBvaW50SWQpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZXMgPSB7XHJcbiAgICAgICAgICAgIDA6ICcoQ3VycmVudCknLFxyXG4gICAgICAgICAgICAxOiAnKFByaW9yKSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIFRPRE86IFtkZXNpZ25dIGZpbmQgb3V0IGhvdyB0byBkZWZpbmUgdGhlIG5hZGlyIHRpbWVwb2ludFxyXG4gICAgICAgIGNvbnN0IHBhcmVudGhlc2lzID0gc3RhdGVzW2luZGV4XSB8fCAnJztcclxuICAgICAgICByZXR1cm4gYCR7dGltZXBvaW50TmFtZX0gJHtwYXJlbnRoZXNpc31gO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuT0hJRi5tZWFzdXJlbWVudHMuVGltZXBvaW50QXBpID0gVGltZXBvaW50QXBpO1xyXG4iLCJpbXBvcnQgJy4vbWVhc3VyZW1lbnRzLmpzJztcclxuaW1wb3J0ICcuL3RpbWVwb2ludHMuanMnO1xyXG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICdtZXRlb3IvYWxkZWVkOnNpbXBsZS1zY2hlbWEnO1xyXG5cclxuY29uc3QgTWVhc3VyZW1lbnQgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICAgIGFkZGl0aW9uYWxEYXRhOiB7XHJcbiAgICAgICAgdHlwZTogT2JqZWN0LFxyXG4gICAgICAgIGxhYmVsOiAnQWRkaXRpb25hbCBEYXRhJyxcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHt9LFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlLFxyXG4gICAgICAgIGJsYWNrYm94OiB0cnVlXHJcbiAgICB9LFxyXG4gICAgdXNlcklkOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiAnVXNlciBJRCcsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBwYXRpZW50SWQ6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6ICdQYXRpZW50IElEJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIG1lYXN1cmVtZW50TnVtYmVyOiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnTWVhc3VyZW1lbnQgTnVtYmVyJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHRpbWVwb2ludElkOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiAnVGltZXBvaW50IElEJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIC8vIEZvcmNlIHZhbHVlIHRvIGJlIGN1cnJlbnQgZGF0ZSAob24gc2VydmVyKSB1cG9uIGluc2VydFxyXG4gICAgLy8gYW5kIHByZXZlbnQgdXBkYXRlcyB0aGVyZWFmdGVyLlxyXG4gICAgY3JlYXRlZEF0OiB7XHJcbiAgICAgICAgdHlwZTogRGF0ZSxcclxuICAgICAgICBhdXRvVmFsdWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0luc2VydCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1Vwc2VydCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgJHNldE9uSW5zZXJ0OiBuZXcgRGF0ZSgpIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBbUFdWLTE4NF0gUHJldmVudGluZyB1bnNldCBkdWUgdG8gY2hpbGQgdG9vbHMgdXBkYXRpbmdcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMudW5zZXQoKTsgLy8gUHJldmVudCB1c2VyIGZyb20gc3VwcGx5aW5nIHRoZWlyIG93biB2YWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIEZvcmNlIHZhbHVlIHRvIGJlIGN1cnJlbnQgZGF0ZSAob24gc2VydmVyKSB1cG9uIHVwZGF0ZVxyXG4gICAgdXBkYXRlZEF0OiB7XHJcbiAgICAgICAgdHlwZTogRGF0ZSxcclxuICAgICAgICBhdXRvVmFsdWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1VwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY29uc3QgU3R1ZHlMZXZlbE1lYXN1cmVtZW50ID0gbmV3IFNpbXBsZVNjaGVtYShbXHJcbiAgICBNZWFzdXJlbWVudCxcclxuICAgIHtcclxuICAgICAgICBzdHVkeUluc3RhbmNlVWlkOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICAgICAgbGFiZWw6ICdTdHVkeSBJbnN0YW5jZSBVSUQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5dKTtcclxuXHJcbmNvbnN0IFNlcmllc0xldmVsTWVhc3VyZW1lbnQgPSBuZXcgU2ltcGxlU2NoZW1hKFtcclxuICAgIFN0dWR5TGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIHtcclxuICAgICAgICBzZXJpZXNJbnN0YW5jZVVpZDoge1xyXG4gICAgICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnU2VyaWVzIEluc3RhbmNlIFVJRCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcbl0pO1xyXG5cclxuY29uc3QgQ29ybmVyc3RvbmVWT0kgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICAgIHdpbmRvd1dpZHRoOiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnV2luZG93IFdpZHRoJyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgd2luZG93Q2VudGVyOiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnV2luZG93IENlbnRlcicsXHJcbiAgICAgICAgZGVjaW1hbDogdHJ1ZSxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxufSk7XHJcblxyXG5jb25zdCBDb3JuZXJzdG9uZVZpZXdwb3J0VHJhbnNsYXRpb24gPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICAgIHg6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdYJyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgeToge1xyXG4gICAgICAgIHR5cGU6IE51bWJlcixcclxuICAgICAgICBsYWJlbDogJ1knLFxyXG4gICAgICAgIGRlY2ltYWw6IHRydWUsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgQ29ybmVyc3RvbmVWaWV3cG9ydCA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgc2NhbGU6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdTY2FsZScsXHJcbiAgICAgICAgZGVjaW1hbDogdHJ1ZSxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHRyYW5zbGF0aW9uOiB7XHJcbiAgICAgICAgdHlwZTogQ29ybmVyc3RvbmVWaWV3cG9ydFRyYW5zbGF0aW9uLFxyXG4gICAgICAgIGxhYmVsOiAnVHJhbnNsYXRpb24nLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgdm9pOiB7XHJcbiAgICAgICAgdHlwZTogQ29ybmVyc3RvbmVWT0ksXHJcbiAgICAgICAgbGFiZWw6ICdWT0knLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgaW52ZXJ0OiB7XHJcbiAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICBsYWJlbDogJ0ludmVydCcsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBwaXhlbFJlcGxpY2F0aW9uOiB7XHJcbiAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICBsYWJlbDogJ1BpeGVsIFJlcGxpY2F0aW9uJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIGhGbGlwOiB7XHJcbiAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICBsYWJlbDogJ0hvcml6b250YWwgRmxpcCcsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICB2RmxpcDoge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdWZXJ0aWNhbCBGbGlwJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHJvdGF0aW9uOiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnUm90YXRpb24gKGRlZ3JlZXMpJyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY29uc3QgSW5zdGFuY2VMZXZlbE1lYXN1cmVtZW50ID0gbmV3IFNpbXBsZVNjaGVtYShbXHJcbiAgICBTdHVkeUxldmVsTWVhc3VyZW1lbnQsXHJcbiAgICBTZXJpZXNMZXZlbE1lYXN1cmVtZW50LFxyXG4gICAge1xyXG4gICAgICAgIHNvcEluc3RhbmNlVWlkOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICAgICAgbGFiZWw6ICdTT1AgSW5zdGFuY2UgVUlEJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmlld3BvcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogQ29ybmVyc3RvbmVWaWV3cG9ydCxcclxuICAgICAgICAgICAgbGFiZWw6ICdWaWV3cG9ydCBQYXJhbWV0ZXJzJyxcclxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbl0pO1xyXG5cclxuY29uc3QgRnJhbWVMZXZlbE1lYXN1cmVtZW50ID0gbmV3IFNpbXBsZVNjaGVtYShbXHJcbiAgICBTdHVkeUxldmVsTWVhc3VyZW1lbnQsXHJcbiAgICBTZXJpZXNMZXZlbE1lYXN1cmVtZW50LFxyXG4gICAgSW5zdGFuY2VMZXZlbE1lYXN1cmVtZW50LFxyXG4gICAge1xyXG4gICAgICAgIGZyYW1lSW5kZXg6IHtcclxuICAgICAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnRnJhbWUgaW5kZXggaW4gSW5zdGFuY2UnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZVBhdGg6IHtcclxuICAgICAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0lkZW50aWZpZXIgZm9yIHRoZSBtZWFzdXJlbWVudFxcJ3MgaW1hZ2UnIC8vIHN0dWR5SW5zdGFuY2VVaWRfc2VyaWVzSW5zdGFuY2VVaWRfc29wSW5zdGFuY2VVaWRfZnJhbWVJbmRleFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXSk7XHJcblxyXG5jb25zdCBDb3JuZXJzdG9uZVRvb2xNZWFzdXJlbWVudCA9IG5ldyBTaW1wbGVTY2hlbWEoW1xyXG4gICAgU3R1ZHlMZXZlbE1lYXN1cmVtZW50LFxyXG4gICAgU2VyaWVzTGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIEluc3RhbmNlTGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIEZyYW1lTGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIHtcclxuICAgICAgICB0b29sVHlwZToge1xyXG4gICAgICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnQ29ybmVyc3RvbmUgVG9vbCBUeXBlJyxcclxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZpc2libGU6IHtcclxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICAgICAgbGFiZWw6ICdWaXNpYmxlJyxcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY3RpdmU6IHtcclxuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICAgICAgbGFiZWw6ICdBY3RpdmUnLFxyXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbnZhbGlkYXRlZDoge1xyXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0ludmFsaWRhdGVkJyxcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbl0pO1xyXG5cclxuY29uc3QgQ29ybmVyc3RvbmVIYW5kbGVCb3VuZGluZ0JveFNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgd2lkdGg6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdXaWR0aCcsXHJcbiAgICAgICAgZGVjaW1hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIGhlaWdodDoge1xyXG4gICAgICAgIHR5cGU6IE51bWJlcixcclxuICAgICAgICBsYWJlbDogJ0hlaWdodCcsXHJcbiAgICAgICAgZGVjaW1hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIGxlZnQ6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdMZWZ0JyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgdG9wOiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnVG9wJyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY29uc3QgQ29ybmVyc3RvbmVIYW5kbGVTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICAgIHg6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdYJyxcclxuICAgICAgICBkZWNpbWFsOiB0cnVlLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlIC8vIE5vdCBhY3R1YWxseSBvcHRpb25hbCwgYnV0IHNvbWV0aW1lcyB2YWx1ZXMgbGlrZSB4L3kgcG9zaXRpb24gYXJlIG1pc3NpbmdcclxuICAgIH0sXHJcbiAgICB5OiB7XHJcbiAgICAgICAgdHlwZTogTnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiAnWScsXHJcbiAgICAgICAgZGVjaW1hbDogdHJ1ZSxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZSAvLyBOb3QgYWN0dWFsbHkgb3B0aW9uYWwsIGJ1dCBzb21ldGltZXMgdmFsdWVzIGxpa2UgeC95IHBvc2l0aW9uIGFyZSBtaXNzaW5nXHJcbiAgICB9LFxyXG4gICAgaGlnaGxpZ2h0OiB7XHJcbiAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICBsYWJlbDogJ0hpZ2hsaWdodCcsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZVxyXG4gICAgfSxcclxuICAgIGFjdGl2ZToge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdBY3RpdmUnLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBkcmF3bkluZGVwZW5kZW50bHk6IHtcclxuICAgICAgICB0eXBlOiBCb29sZWFuLFxyXG4gICAgICAgIGxhYmVsOiAnRHJhd24gSW5kZXBlbmRlbnRseScsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIG1vdmVzSW5kZXBlbmRlbnRseToge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdNb3ZlcyBJbmRlcGVuZGVudGx5JyxcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgYWxsb3dlZE91dHNpZGVJbWFnZToge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdBbGxvd2VkIE91dHNpZGUgSW1hZ2UnLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBoYXNNb3ZlZDoge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdIYXMgQWxyZWFkeSBNb3ZlZCcsXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIGhhc0JvdW5kaW5nQm94OiB7XHJcbiAgICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgICBsYWJlbDogJ0hhcyBCb3VuZGluZyBCb3gnLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBib3VuZGluZ0JveDoge1xyXG4gICAgICAgIHR5cGU6IENvcm5lcnN0b25lSGFuZGxlQm91bmRpbmdCb3hTY2hlbWEsXHJcbiAgICAgICAgbGFiZWw6ICdCb3VuZGluZyBCb3gnLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgaW5kZXg6IHsgLy8gVE9ETzogUmVtb3ZlICdpbmRleCcgZnJvbSBiaWRpcmVjdGlvbmFsVG9vbCBzaW5jZSBpdCdzIHVzZWxlc3NcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgb3B0aW9uYWw6IHRydWVcclxuICAgIH0sXHJcbiAgICBsb2NrZWQ6IHtcclxuICAgICAgICB0eXBlOiBCb29sZWFuLFxyXG4gICAgICAgIGxhYmVsOiAnTG9ja2VkJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZSxcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1lYXN1cmVtZW50U2NoZW1hVHlwZXMgPSB7XHJcbiAgICBNZWFzdXJlbWVudDogTWVhc3VyZW1lbnQsXHJcbiAgICBTdHVkeUxldmVsTWVhc3VyZW1lbnQ6IFN0dWR5TGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIFNlcmllc0xldmVsTWVhc3VyZW1lbnQ6IFNlcmllc0xldmVsTWVhc3VyZW1lbnQsXHJcbiAgICBJbnN0YW5jZUxldmVsTWVhc3VyZW1lbnQ6IEluc3RhbmNlTGV2ZWxNZWFzdXJlbWVudCxcclxuICAgIEZyYW1lTGV2ZWxNZWFzdXJlbWVudDogRnJhbWVMZXZlbE1lYXN1cmVtZW50LFxyXG4gICAgQ29ybmVyc3RvbmVUb29sTWVhc3VyZW1lbnQ6IENvcm5lcnN0b25lVG9vbE1lYXN1cmVtZW50LFxyXG4gICAgQ29ybmVyc3RvbmVIYW5kbGVTY2hlbWE6IENvcm5lcnN0b25lSGFuZGxlU2NoZW1hXHJcbn07XHJcbiIsImltcG9ydCB7IFNpbXBsZVNjaGVtYSB9IGZyb20gJ21ldGVvci9hbGRlZWQ6c2ltcGxlLXNjaGVtYSc7XHJcblxyXG5leHBvcnQgY29uc3Qgc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBwYXRpZW50SWQ6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6ICdQYXRpZW50IElEJyxcclxuICAgICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgfSxcclxuICAgIHRpbWVwb2ludElkOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiAnVGltZXBvaW50IElEJ1xyXG4gICAgfSxcclxuICAgIHRpbWVwb2ludFR5cGU6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6ICdUaW1lcG9pbnQgVHlwZScsXHJcbiAgICAgICAgYWxsb3dlZFZhbHVlczogWydiYXNlbGluZScsICdmb2xsb3d1cCddLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ2Jhc2VsaW5lJyxcclxuICAgIH0sXHJcbiAgICBpc0xvY2tlZDoge1xyXG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXHJcbiAgICAgICAgbGFiZWw6ICdUaW1lcG9pbnQgTG9ja2VkJ1xyXG4gICAgfSxcclxuICAgIHN0dWR5SW5zdGFuY2VVaWRzOiB7XHJcbiAgICAgICAgdHlwZTogW1N0cmluZ10sXHJcbiAgICAgICAgbGFiZWw6ICdTdHVkeSBJbnN0YW5jZSBVaWRzJyxcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IFtdXHJcbiAgICB9LFxyXG4gICAgZWFybGllc3REYXRlOiB7XHJcbiAgICAgICAgdHlwZTogRGF0ZSxcclxuICAgICAgICBsYWJlbDogJ0VhcmxpZXN0IFN0dWR5IERhdGUgZnJvbSBhc3NvY2lhdGVkIHN0dWRpZXMnLFxyXG4gICAgfSxcclxuICAgIGxhdGVzdERhdGU6IHtcclxuICAgICAgICB0eXBlOiBEYXRlLFxyXG4gICAgICAgIGxhYmVsOiAnTW9zdCByZWNlbnQgU3R1ZHkgRGF0ZSBmcm9tIGFzc29jaWF0ZWQgc3R1ZGllcycsXHJcbiAgICB9LFxyXG4gICAgdmlzaXROdW1iZXI6IHtcclxuICAgICAgICB0eXBlOiBOdW1iZXIsXHJcbiAgICAgICAgbGFiZWw6ICdOdW1iZXIgb2YgcGF0aWVudFxcJ3MgdmlzaXQnLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgc3R1ZGllc0RhdGE6IHtcclxuICAgICAgICB0eXBlOiBbT2JqZWN0XSxcclxuICAgICAgICBsYWJlbDogJ1N0dWRpZXMgZGF0YSB0byBhbGxvdyBsYXp5IGxvYWRpbmcnLFxyXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlLFxyXG4gICAgICAgIGJsYWNrYm94OiB0cnVlXHJcbiAgICB9XHJcbn0pO1xyXG4iXX0=
