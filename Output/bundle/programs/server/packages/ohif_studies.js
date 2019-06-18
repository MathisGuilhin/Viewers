(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var WADOProxy = Package['ohif:wadoproxy'].WADOProxy;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var entry;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:studies":{"both":{"main.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/both/main.js                                                                               //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.studies = {};

require('../imports/both');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"main.js":function(require){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/server/main.js                                                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
require('../imports/server');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"imports":{"both":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/index.js                                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./lib"));
module.watch(require("./services"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/lib/index.js                                                                  //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./parseFloatArray.js"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parseFloatArray.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/lib/parseFloatArray.js                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.export({
  parseFloatArray: () => parseFloatArray
});

const parseFloatArray = function (obj) {
  var result = [];

  if (!obj) {
    return result;
  }

  var objs = obj.split("\\");

  for (var i = 0; i < objs.length; i++) {
    result.push(parseFloat(objs[i]));
  }

  return result;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"services":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/index.js                                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./namespace"));
module.watch(require("./qido/instances.js"));
module.watch(require("./qido/studies.js"));
module.watch(require("./qido/retrieveMetadata.js"));
module.watch(require("./wado/retrieveMetadata.js"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/namespace.js                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.studies.services = {
  QIDO: {},
  WADO: {}
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"qido":{"instances.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/qido/instances.js                                                    //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let DICOMwebClient;
module.watch(require("dicomweb-client"), {
  default(v) {
    DICOMwebClient = v;
  }

}, 1);
const {
  DICOMWeb
} = OHIF;
/**
 * Parses data returned from a QIDO search and transforms it into
 * an array of series that are present in the study
 *
 * @param server The DICOM server
 * @param studyInstanceUid
 * @param resultData
 * @returns {Array} Series List
 */

function resultDataToStudyMetadata(server, studyInstanceUid, resultData) {
  var seriesMap = {};
  var seriesList = [];
  resultData.forEach(function (instance) {
    // Use seriesMap to cache series data
    // If the series instance UID has already been used to
    // process series data, continue using that series
    var seriesInstanceUid = DICOMWeb.getString(instance['0020000E']);
    var series = seriesMap[seriesInstanceUid]; // If no series data exists in the seriesMap cache variable,
    // process any available series data

    if (!series) {
      series = {
        seriesInstanceUid: seriesInstanceUid,
        seriesNumber: DICOMWeb.getString(instance['00200011']),
        instances: []
      }; // Save this data in the seriesMap cache variable

      seriesMap[seriesInstanceUid] = series;
      seriesList.push(series);
    } // The uri for the dicomweb
    // NOTE: DCM4CHEE seems to return the data zipped
    // NOTE: Orthanc returns the data with multi-part mime which cornerstoneWADOImageLoader doesn't
    //       know how to parse yet
    //var uri = DICOMWeb.getString(instance['00081190']);
    //uri = uri.replace('wado-rs', 'dicom-web');
    // manually create a WADO-URI from the UIDs
    // NOTE: Haven't been able to get Orthanc's WADO-URI to work yet - maybe its not configured?


    var sopInstanceUid = DICOMWeb.getString(instance['00080018']);
    var uri = server.wadoUriRoot + '?requestType=WADO&studyUID=' + studyInstanceUid + '&seriesUID=' + seriesInstanceUid + '&objectUID=' + sopInstanceUid + '&contentType=application%2Fdicom'; // Add this instance to the current series

    series.instances.push({
      sopClassUid: DICOMWeb.getString(instance['00080016']),
      sopInstanceUid: sopInstanceUid,
      uri: uri,
      instanceNumber: DICOMWeb.getString(instance['00200013'])
    });
  });
  return seriesList;
}
/**
 * Retrieve a set of instances using a QIDO call
 * @param server
 * @param studyInstanceUid
 * @throws ECONNREFUSED
 * @returns {{wadoUriRoot: String, studyInstanceUid: String, seriesList: Array}}
 */


OHIF.studies.services.QIDO.Instances = function (server, studyInstanceUid) {
  // TODO: Are we using this function anywhere?? Can we remove it?
  const config = {
    url: server.qidoRoot,
    headers: OHIF.DICOMWeb.getAuthorizationHeader()
  };
  const dicomWeb = new DICOMwebClient.api.DICOMwebClient(config);
  const queryParams = getQIDOQueryParams(filter, server.qidoSupportsIncludeField);
  const options = {
    studyInstanceUID: studyInstanceUid
  };
  return dicomWeb.searchForInstances(options).then(result => {
    return {
      wadoUriRoot: server.wadoUriRoot,
      studyInstanceUid: studyInstanceUid,
      seriesList: resultDataToStudyMetadata(server, studyInstanceUid, result.data)
    };
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"retrieveMetadata.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/qido/retrieveMetadata.js                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let DICOMwebClient;
module.watch(require("dicomweb-client"), {
  default(v) {
    DICOMwebClient = v;
  }

}, 1);
const {
  DICOMWeb
} = OHIF;
/**
 * Creates a URL for a WADO search
 *
 * @param server
 * @param studyInstanceUid
 * @returns {string}
 */

function buildUrl(server, studyInstanceUid) {
  return server.wadoRoot + '/studies?includefield=all&StudyInstanceUID=' + studyInstanceUid;
}

function buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid) {
  return `${server.wadoRoot}/studies/${studyInstanceUid}/series/${seriesInstanceUid}/instances/${sopInstanceUid}`;
}

function buildInstanceFrameWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid, frame) {
  const baseWadoRsUri = buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
  frame = frame != null || 1;
  return `${baseWadoRsUri}/frames/${frame}`;
}
/**
 * Parses result data from a QIDO search into Study MetaData
 * Returns an object populated with study metadata, including the
 * series list.
 *
 * @param server
 * @param studyInstanceUid
 * @param resultData
 * @returns {{seriesList: Array, patientName: *, patientId: *, accessionNumber: *, studyDate: *, modalities: *, studyDescription: *, imageCount: *, studyInstanceUid: *}}
 */


function resultDataToStudyMetadata(server, studyInstanceUid, resultData, instancesIn) {
  return Promise.asyncApply(() => {
    const seriesList = [];

    if (!resultData.length) {
      return;
    }

    const anInstance = resultData[0];

    if (!anInstance) {
      return;
    }

    const studyData = {
      seriesList,
      patientName: DICOMWeb.getName(anInstance['00100010']),
      patientId: DICOMWeb.getString(anInstance['00100020']),
      patientAge: DICOMWeb.getNumber(anInstance['00101010']),
      patientSize: DICOMWeb.getNumber(anInstance['00101020']),
      patientWeight: DICOMWeb.getNumber(anInstance['00101030']),
      accessionNumber: DICOMWeb.getString(anInstance['00080050']),
      studyDate: DICOMWeb.getString(anInstance['00080020']),
      modalities: DICOMWeb.getString(anInstance['00080061']),
      studyDescription: DICOMWeb.getString(anInstance['00081030']),
      imageCount: DICOMWeb.getString(anInstance['00201208']),
      studyInstanceUid: DICOMWeb.getString(anInstance['0020000D']),
      institutionName: DICOMWeb.getString(anInstance['00080080'])
    };
    Promise.await(Promise.all(instancesIn.seriesList.map(function (seriesMap) {
      return Promise.asyncApply(() => {
        var instance = seriesMap.instances[0];
        var seriesInstanceUid = instance.seriesInstanceUid;
        var series = seriesMap[seriesInstanceUid];

        if (!series) {
          series = seriesMap;
          series.instances = [];
          seriesMap[seriesInstanceUid] = series;
          seriesList.push(series);
        }

        const sopInstanceUid = instance.sopInstanceUid;
        const wadouri = buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const baseWadoRsUri = buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const wadorsuri = buildInstanceFrameWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const instanceSummary = instance;
        instanceSummary.baseWadoRsUri = baseWadoRsUri;
        instanceSummary.wadouri = WADOProxy.convertURL(wadouri, server);
        instanceSummary.wadorsuri = WADOProxy.convertURL(wadorsuri, server);
        instanceSummary.imageRendering = server.imageRendering;
        instanceSummary.thumbnailRendering = server.thumbnailRendering;
        series.instances.push(instanceSummary);
      });
    })));
    return studyData;
  });
}
/**
 * Retrieved Study MetaData from a DICOM server using a WADO call
 * @param server
 * @param studyInstanceUid
 * @returns {Promise}
 */


OHIF.studies.services.QIDO.RetrieveMetadata = function (server, studyInstanceUid) {
  return Promise.asyncApply(() => {
    const url = buildUrl(server, studyInstanceUid);
    return new Promise((resolve, reject) => {
      DICOMWeb.getJSON(url, server.requestOptions).then(result => {
        OHIF.studies.services.QIDO.Instances(server, studyInstanceUid).then(instances => {
          resultDataToStudyMetadata(server, studyInstanceUid, result, instances).then(study => {
            study.wadoUriRoot = server.wadoUriRoot;
            study.studyInstanceUid = studyInstanceUid;
            resolve(study);
          }, reject);
        }, reject);
      }, reject);
    });
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"studies.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/qido/studies.js                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let DICOMwebClient;
module.watch(require("dicomweb-client"), {
  default(v) {
    DICOMwebClient = v;
  }

}, 1);
const {
  DICOMWeb
} = OHIF; // TODO: Is there an easier way to do this?

if (Meteor.isServer) {
  var XMLHttpRequest = require('xhr2');

  global.XMLHttpRequest = XMLHttpRequest;
}
/**
 * Creates a QIDO date string for a date range query
 * Assumes the year is positive, at most 4 digits long.
 *
 * @param date The Date object to be formatted
 * @returns {string} The formatted date string
 */


function dateToString(date) {
  if (!date) return '';
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  year = '0'.repeat(4 - year.length).concat(year);
  month = '0'.repeat(2 - month.length).concat(month);
  day = '0'.repeat(2 - day.length).concat(day);
  return ''.concat(year, month, day);
}
/**
 * Produces a QIDO URL given server details and a set of specified search filter
 * items
 *
 * @param filter
 * @param serverSupportsQIDOIncludeField
 * @returns {string} The URL with encoded filter query data
 */


function getQIDOQueryParams(filter, serverSupportsQIDOIncludeField) {
  const commaSeparatedFields = [// this is temp  '00081030', // Study Description
    //   '00080060' //Modality
    // Add more fields here if you want them in the result
  ].join(',');
  const parameters = {
    PatientName: filter.patientName,
    PatientID: filter.patientId,
    AccessionNumber: filter.accessionNumber,
    StudyDescription: filter.studyDescription,
    ModalitiesInStudy: filter.modalitiesInStudy,
    limit: filter.limit,
    offset: filter.offset,
    includefield: serverSupportsQIDOIncludeField ? commaSeparatedFields : 'all'
  }; // build the StudyDate range parameter

  if (filter.studyDateFrom || filter.studyDateTo) {
    const dateFrom = dateToString(new Date(filter.studyDateFrom));
    const dateTo = dateToString(new Date(filter.studyDateTo));
    parameters.StudyDate = `${dateFrom}-${dateTo}`;
  } // Build the StudyInstanceUID parameter


  if (filter.studyInstanceUid) {
    let studyUids = filter.studyInstanceUid;
    studyUids = Array.isArray(studyUids) ? studyUids.join() : studyUids;
    studyUids = studyUids.replace(/[^0-9.]+/g, '\\');
    parameters.StudyInstanceUID = studyUids;
  } // Clean query params of undefined values.


  const params = {};
  Object.keys(parameters).forEach(key => {
    if (parameters[key] !== undefined && parameters[key] !== "") {
      params[key] = parameters[key];
    }
  });
  return params;
}
/**
 * Parses resulting data from a QIDO call into a set of Study MetaData
 *
 * @param resultData
 * @returns {Array} An array of Study MetaData objects
 */


function resultDataToStudies(resultData) {
  const studies = [];
  if (!resultData || !resultData.length) return;
  resultData.forEach(study => studies.push({
    studyInstanceUid: DICOMWeb.getString(study['0020000D']),
    // 00080005 = SpecificCharacterSet
    studyDate: DICOMWeb.getString(study['00080020']),
    studyTime: DICOMWeb.getString(study['00080030']),
    accessionNumber: DICOMWeb.getString(study['00080050']),
    referringPhysicianName: DICOMWeb.getString(study['00080090']),
    // 00081190 = URL
    patientName: DICOMWeb.getName(study['00100010']),
    patientId: DICOMWeb.getString(study['00100020']),
    patientBirthdate: DICOMWeb.getString(study['00100030']),
    patientSex: DICOMWeb.getString(study['00100040']),
    studyId: DICOMWeb.getString(study['00200010']),
    numberOfStudyRelatedSeries: DICOMWeb.getString(study['00201206']),
    numberOfStudyRelatedInstances: DICOMWeb.getString(study['00201208']),
    studyDescription: DICOMWeb.getString(study['00081030']),
    // modality: DICOMWeb.getString(study['00080060']),
    // modalitiesInStudy: DICOMWeb.getString(study['00080061']),
    modalities: DICOMWeb.getString(DICOMWeb.getModalities(study['00080060'], study['00080061']))
  }));
  return studies;
}

OHIF.studies.services.QIDO.Studies = (server, filter) => {
  const config = {
    url: server.qidoRoot,
    headers: OHIF.DICOMWeb.getAuthorizationHeader()
  };
  const dicomWeb = new DICOMwebClient.api.DICOMwebClient(config);
  const queryParams = getQIDOQueryParams(filter, server.qidoSupportsIncludeField);
  const options = {
    queryParams
  };
  return dicomWeb.searchForStudies(options).then(resultDataToStudies);
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"wado":{"retrieveMetadata.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/both/services/wado/retrieveMetadata.js                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let DICOMwebClient;
module.watch(require("dicomweb-client"), {
  default(v) {
    DICOMwebClient = v;
  }

}, 1);
let parseFloatArray;
module.watch(require("../../lib/parseFloatArray"), {
  parseFloatArray(v) {
    parseFloatArray = v;
  }

}, 2);
const {
  DICOMWeb
} = OHIF;
/**
 * Simple cache schema for retrieved color palettes.
 */

const paletteColorCache = {
  count: 0,
  maxAge: 24 * 60 * 60 * 1000,
  // 24h cache?
  entries: {},
  isValidUID: function (paletteUID) {
    return typeof paletteUID === 'string' && paletteUID.length > 0;
  },
  get: function (paletteUID) {
    let entry = null;

    if (this.entries.hasOwnProperty(paletteUID)) {
      entry = this.entries[paletteUID]; // check how the entry is...

      if (Date.now() - entry.time > this.maxAge) {
        // entry is too old... remove entry.
        delete this.entries[paletteUID];
        this.count--;
        entry = null;
      }
    }

    return entry;
  },
  add: function (entry) {
    if (this.isValidUID(entry.uid)) {
      let paletteUID = entry.uid;

      if (this.entries.hasOwnProperty(paletteUID) !== true) {
        this.count++; // increment cache entry count...
      }

      entry.time = Date.now();
      this.entries[paletteUID] = entry; // @TODO: Add logic to get rid of old entries and reduce memory usage...
    }
  }
};
/** Returns a WADO url for an instance
 *
 * @param studyInstanceUid
 * @param seriesInstanceUid
 * @param sopInstanceUid
 * @returns  {string}
 */

function buildInstanceWadoUrl(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid) {
  // TODO: This can be removed, since DICOMWebClient has the same function. Not urgent, though
  const params = [];
  params.push('requestType=WADO');
  params.push(`studyUID=${studyInstanceUid}`);
  params.push(`seriesUID=${seriesInstanceUid}`);
  params.push(`objectUID=${sopInstanceUid}`);
  params.push('contentType=application/dicom');
  params.push('transferSyntax=*');
  const paramString = params.join('&');
  return `${server.wadoUriRoot}?${paramString}`;
}

function buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid) {
  return `${server.wadoRoot}/studies/${studyInstanceUid}/series/${seriesInstanceUid}/instances/${sopInstanceUid}`;
}

function buildInstanceFrameWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid, frame) {
  const baseWadoRsUri = buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
  frame = frame != null || 1;
  return `${baseWadoRsUri}/frames/${frame}`;
}
/**
 * Parses the SourceImageSequence, if it exists, in order
 * to return a ReferenceSOPInstanceUID. The ReferenceSOPInstanceUID
 * is used to refer to this image in any accompanying DICOM-SR documents.
 *
 * @param instance
 * @returns {String} The ReferenceSOPInstanceUID
 */


function getSourceImageInstanceUid(instance) {
  // TODO= Parse the whole Source Image Sequence
  // This is a really poor workaround for now.
  // Later we should probably parse the whole sequence.
  var SourceImageSequence = instance['00082112'];

  if (SourceImageSequence && SourceImageSequence.Value && SourceImageSequence.Value.length) {
    return SourceImageSequence.Value[0]['00081155'].Value[0];
  }
}

function getPaletteColor(server, instance, tag, lutDescriptor) {
  const numLutEntries = lutDescriptor[0];
  const bits = lutDescriptor[2];
  let uri = WADOProxy.convertURL(instance[tag].BulkDataURI, server); // TODO: Workaround for dcm4chee behind SSL-terminating proxy returning
  // incorrect bulk data URIs

  if (server.wadoRoot.indexOf('https') === 0 && !uri.includes('https')) {
    uri = uri.replace('http', 'https');
  }

  const config = {
    url: server.wadoRoot,
    //BulkDataURI is absolute, so this isn't used
    headers: OHIF.DICOMWeb.getAuthorizationHeader()
  };
  const dicomWeb = new DICOMwebClient.api.DICOMwebClient(config);
  const options = {
    BulkDataURI: uri
  };

  const readUInt16 = (byteArray, position) => {
    return byteArray[position] + byteArray[position + 1] * 256;
  };

  const arrayBufferToPaletteColorLUT = arraybuffer => {
    const byteArray = new Uint8Array(arraybuffer);
    const lut = [];

    for (let i = 0; i < numLutEntries; i++) {
      if (bits === 16) {
        lut[i] = readUInt16(byteArray, i * 2);
      } else {
        lut[i] = byteArray[i];
      }
    }

    return lut;
  };

  return dicomWeb.retrieveBulkData(options).then(arrayBufferToPaletteColorLUT);
}
/**
 * Fetch palette colors for instances with "PALETTE COLOR" photometricInterpretation.
 *
 * @param server {Object} Current server;
 * @param instance {Object} The retrieved instance metadata;
 * @returns {String} The ReferenceSOPInstanceUID
 */


function getPaletteColors(server, instance, lutDescriptor) {
  return Promise.asyncApply(() => {
    let paletteUID = DICOMWeb.getString(instance['00281199']);
    return new Promise((resolve, reject) => {
      if (paletteColorCache.isValidUID(paletteUID)) {
        const entry = paletteColorCache.get(paletteUID);

        if (entry) {
          return resolve(entry);
        }
      } // no entry in cache... Fetch remote data.


      const r = getPaletteColor(server, instance, '00281201', lutDescriptor);
      const g = getPaletteColor(server, instance, '00281202', lutDescriptor);
      ;
      const b = getPaletteColor(server, instance, '00281203', lutDescriptor);
      ;
      const promises = [r, g, b];
      Promise.all(promises).then(args => {
        entry = {
          red: args[0],
          green: args[1],
          blue: args[2]
        }; // when paletteUID is present, the entry can be cached...

        entry.uid = paletteUID;
        paletteColorCache.add(entry);
        resolve(entry);
      });
    });
  });
}

function getFrameIncrementPointer(element) {
  const frameIncrementPointerNames = {
    '00181065': 'frameTimeVector',
    '00181063': 'frameTime'
  };

  if (!element || !element.Value || !element.Value.length) {
    return;
  }

  const value = element.Value[0];
  return frameIncrementPointerNames[value];
}

function getRadiopharmaceuticalInfo(instance) {
  const modality = DICOMWeb.getString(instance['00080060']);

  if (modality !== 'PT') {
    return;
  }

  const radiopharmaceuticalInfo = instance['00540016'];

  if (radiopharmaceuticalInfo === undefined || !radiopharmaceuticalInfo.Value || !radiopharmaceuticalInfo.Value.length) {
    return;
  }

  const firstPetRadiopharmaceuticalInfo = radiopharmaceuticalInfo.Value[0];
  return {
    radiopharmaceuticalStartTime: DICOMWeb.getString(firstPetRadiopharmaceuticalInfo['00181072']),
    radionuclideTotalDose: DICOMWeb.getNumber(firstPetRadiopharmaceuticalInfo['00181074']),
    radionuclideHalfLife: DICOMWeb.getNumber(firstPetRadiopharmaceuticalInfo['00181075'])
  };
}

function getRelationshipString(data) {
  const relationshipType = DICOMWeb.getString(data['0040A010']);

  switch (relationshipType) {
    case 'HAS CONCEPT MOD':
      return 'Concept modifier: ';

    case 'HAS OBS CONTEXT':
      return 'Observation context: ';

    default:
      return '';
  }
}

const getNestedObject = data => data.Value[0] || {};

const getMeaningString = data => data['0040A043'] && `${DICOMWeb.getString(data['0040A043'].Value[0]['00080104'])} = ` || '';

function getValueString(data) {
  switch (DICOMWeb.getString(data['0040A040'])) {
    // ValueType
    case 'CODE':
      const conceptCode = getNestedObject(data['0040A168']);
      const conceptCodeValue = DICOMWeb.getString(conceptCode['00080100']);
      const conceptCodeMeaning = DICOMWeb.getString(conceptCode['00080104']);
      const schemeDesignator = DICOMWeb.getString(conceptCode['00080102']);
      return `${conceptCodeMeaning} (${conceptCodeValue}, ${schemeDesignator})`;

    case 'PNAME':
      return DICOMWeb.getName(data['0040A123']);

    case 'TEXT':
      return DICOMWeb.getString(data['0040A160']);

    case 'UIDREF':
      return DICOMWeb.getString(data['0040A124']);

    case 'NUM':
      const numValue = DICOMWeb.getString(getNestedObject(data['0040A300'])['0040A30A']);
      const codeValue = DICOMWeb.getString(getNestedObject(getNestedObject(data['0040A300'])['004008EA'])['00080100']);
      return `${numValue} ${codeValue}`;
  }
}

function constructPlainValue(data) {
  const value = getValueString(data);

  if (value) {
    return getRelationshipString(data) + getMeaningString(data) + value;
  }
}

function constructContentSequence(data, header) {
  if (!data['0040A730'].Value) {
    return;
  }

  const items = data['0040A730'].Value.map(item => parseContent(item)).filter(item => item);

  if (items.length) {
    const result = {
      items
    };

    if (header) {
      result.header = header;
    }

    return result;
  }
}
/**
 * Recursively parses content sequence for structured reports
 *
 * @param instance The instance
 * @returns {Array} Series List
 */


function parseContent(instance) {
  if (instance['0040A040']) {
    // ValueType
    if (DICOMWeb.getString(instance['0040A040']) === 'CONTAINER') {
      const header = DICOMWeb.getString(getNestedObject(instance['0040A043'])['00080104']); // TODO: check with real data

      return constructContentSequence(instance, header);
    }

    return constructPlainValue(instance);
  }

  if (instance['0040A730']) {
    //ContentSequence
    return constructContentSequence(instance);
  }
}

function getModality(instance) {
  const modality = DICOMWeb.getString(instance['00080060']);
  return modality || !!instance['0040A730'] && 'SR' || undefined; // FIXME: dirty, dirty hack, we use
}

function getContentDateTime(instance) {
  const date = DICOMWeb.getString(instance['00080023']);
  const time = DICOMWeb.getString(instance['00080033']);

  if (date && time) {
    return `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)} ${time.substr(0, 2)}:${time.substr(2, 2)}:${time.substr(4, 2)}`;
  }
}
/**
 * Parses result data from a WADO search into Study MetaData
 * Returns an object populated with study metadata, including the
 * series list.
 *
 * @param server
 * @param studyInstanceUid
 * @param resultData
 * @returns {{seriesList: Array, patientName: *, patientId: *, accessionNumber: *, studyDate: *, modalities: *, studyDescription: *, imageCount: *, studyInstanceUid: *}}
 */


function resultDataToStudyMetadata(server, studyInstanceUid, resultData) {
  return Promise.asyncApply(() => {
    if (!resultData.length) {
      return;
    }

    const anInstance = resultData[0];

    if (!anInstance) {
      return;
    }

    const studyData = {
      seriesList: [],
      studyInstanceUid,
      wadoUriRoot: server.wadoUriRoot,
      patientName: DICOMWeb.getName(anInstance['00100010']),
      patientId: DICOMWeb.getString(anInstance['00100020']),
      patientAge: DICOMWeb.getNumber(anInstance['00101010']),
      patientSize: DICOMWeb.getNumber(anInstance['00101020']),
      patientWeight: DICOMWeb.getNumber(anInstance['00101030']),
      accessionNumber: DICOMWeb.getString(anInstance['00080050']),
      studyDate: DICOMWeb.getString(anInstance['00080020']),
      modalities: DICOMWeb.getString(anInstance['00080061']),
      studyDescription: DICOMWeb.getString(anInstance['00081030']),
      imageCount: DICOMWeb.getString(anInstance['00201208']),
      studyInstanceUid: DICOMWeb.getString(anInstance['0020000D']),
      institutionName: DICOMWeb.getString(anInstance['00080080'])
    };
    const seriesMap = {};
    Promise.await(Promise.all(resultData.map(function (instance) {
      return Promise.asyncApply(() => {
        const seriesInstanceUid = DICOMWeb.getString(instance['0020000E']);
        let series = seriesMap[seriesInstanceUid];
        const modality = getModality(instance);

        if (!series) {
          series = {
            seriesDescription: DICOMWeb.getString(instance['0008103E']),
            modality,
            seriesInstanceUid: seriesInstanceUid,
            seriesNumber: DICOMWeb.getNumber(instance['00200011']),
            seriesDate: DICOMWeb.getString(instance['00080021']),
            seriesTime: DICOMWeb.getString(instance['00080031']),
            instances: []
          };
          seriesMap[seriesInstanceUid] = series;
          studyData.seriesList.push(series);
        }

        const sopInstanceUid = DICOMWeb.getString(instance['00080018']);
        const wadouri = buildInstanceWadoUrl(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const baseWadoRsUri = buildInstanceWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const wadorsuri = buildInstanceFrameWadoRsUri(server, studyInstanceUid, seriesInstanceUid, sopInstanceUid);
        const instanceSummary = {
          contentSequence: parseContent(instance),
          completionFlag: DICOMWeb.getString(instance['0040A491']),
          manufacturer: DICOMWeb.getString(instance['00080070']),
          verificationFlag: DICOMWeb.getString(instance['0040A493']),
          contentDateTime: getContentDateTime(instance),
          imageType: DICOMWeb.getString(instance['00080008']),
          sopClassUid: DICOMWeb.getString(instance['00080016']),
          modality,
          sopInstanceUid,
          instanceNumber: DICOMWeb.getNumber(instance['00200013']),
          imagePositionPatient: DICOMWeb.getString(instance['00200032']),
          imageOrientationPatient: DICOMWeb.getString(instance['00200037']),
          frameOfReferenceUID: DICOMWeb.getString(instance['00200052']),
          sliceLocation: DICOMWeb.getNumber(instance['00201041']),
          samplesPerPixel: DICOMWeb.getNumber(instance['00280002']),
          photometricInterpretation: DICOMWeb.getString(instance['00280004']),
          planarConfiguration: DICOMWeb.getNumber(instance['00280006']),
          rows: DICOMWeb.getNumber(instance['00280010']),
          columns: DICOMWeb.getNumber(instance['00280011']),
          pixelSpacing: DICOMWeb.getString(instance['00280030']),
          pixelAspectRatio: DICOMWeb.getString(instance['00280034']),
          bitsAllocated: DICOMWeb.getNumber(instance['00280100']),
          bitsStored: DICOMWeb.getNumber(instance['00280101']),
          highBit: DICOMWeb.getNumber(instance['00280102']),
          pixelRepresentation: DICOMWeb.getNumber(instance['00280103']),
          smallestPixelValue: DICOMWeb.getNumber(instance['00280106']),
          largestPixelValue: DICOMWeb.getNumber(instance['00280107']),
          windowCenter: DICOMWeb.getString(instance['00281050']),
          windowWidth: DICOMWeb.getString(instance['00281051']),
          rescaleIntercept: DICOMWeb.getNumber(instance['00281052']),
          rescaleSlope: DICOMWeb.getNumber(instance['00281053']),
          rescaleType: DICOMWeb.getNumber(instance['00281054']),
          sourceImageInstanceUid: getSourceImageInstanceUid(instance),
          laterality: DICOMWeb.getString(instance['00200062']),
          viewPosition: DICOMWeb.getString(instance['00185101']),
          acquisitionDateTime: DICOMWeb.getString(instance['0008002A']),
          numberOfFrames: DICOMWeb.getNumber(instance['00280008']),
          frameIncrementPointer: getFrameIncrementPointer(instance['00280009']),
          frameTime: DICOMWeb.getNumber(instance['00181063']),
          frameTimeVector: parseFloatArray(DICOMWeb.getString(instance['00181065'])),
          sliceThickness: DICOMWeb.getNumber(instance['00180050']),
          lossyImageCompression: DICOMWeb.getString(instance['00282110']),
          derivationDescription: DICOMWeb.getString(instance['00282111']),
          lossyImageCompressionRatio: DICOMWeb.getString(instance['00282112']),
          lossyImageCompressionMethod: DICOMWeb.getString(instance['00282114']),
          echoNumber: DICOMWeb.getString(instance['00180086']),
          contrastBolusAgent: DICOMWeb.getString(instance['00180010']),
          radiopharmaceuticalInfo: getRadiopharmaceuticalInfo(instance),
          baseWadoRsUri: baseWadoRsUri,
          wadouri: WADOProxy.convertURL(wadouri, server),
          wadorsuri: WADOProxy.convertURL(wadorsuri, server),
          imageRendering: server.imageRendering,
          thumbnailRendering: server.thumbnailRendering
        }; // Get additional information if the instance uses "PALETTE COLOR" photometric interpretation

        if (instanceSummary.photometricInterpretation === 'PALETTE COLOR') {
          const redPaletteColorLookupTableDescriptor = parseFloatArray(DICOMWeb.getString(instance['00281101']));
          const greenPaletteColorLookupTableDescriptor = parseFloatArray(DICOMWeb.getString(instance['00281102']));
          const bluePaletteColorLookupTableDescriptor = parseFloatArray(DICOMWeb.getString(instance['00281103']));
          const palettes = Promise.await(getPaletteColors(server, instance, redPaletteColorLookupTableDescriptor));

          if (palettes) {
            if (palettes.uid) {
              instanceSummary.paletteColorLookupTableUID = palettes.uid;
            }

            instanceSummary.redPaletteColorLookupTableData = palettes.red;
            instanceSummary.greenPaletteColorLookupTableData = palettes.green;
            instanceSummary.bluePaletteColorLookupTableData = palettes.blue;
            instanceSummary.redPaletteColorLookupTableDescriptor = redPaletteColorLookupTableDescriptor;
            instanceSummary.greenPaletteColorLookupTableDescriptor = greenPaletteColorLookupTableDescriptor;
            instanceSummary.bluePaletteColorLookupTableDescriptor = bluePaletteColorLookupTableDescriptor;
          }
        }

        series.instances.push(instanceSummary);
      });
    })));
    return studyData;
  });
}
/**
 * Retrieve Study MetaData from a DICOM server using a WADO call
 *
 * @param server
 * @param studyInstanceUid
 * @returns {Promise}
 */


OHIF.studies.services.WADO.RetrieveMetadata = function (server, studyInstanceUid) {
  return Promise.asyncApply(() => {
    const config = {
      url: server.wadoRoot,
      headers: OHIF.DICOMWeb.getAuthorizationHeader()
    };
    const dicomWeb = new DICOMwebClient.api.DICOMwebClient(config);
    const options = {
      studyInstanceUID: studyInstanceUid
    };
    return dicomWeb.retrieveStudyMetadata(options).then(result => {
      return resultDataToStudyMetadata(server, studyInstanceUid, result);
    });
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/index.js                                                                    //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./methods"));
module.watch(require("./services"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods":{"getStudyMetadata.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/methods/getStudyMetadata.js                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  /**
   * Retrieves Study metadata given a Study Instance UID
   * This Meteor method is available from both the client and the server
   */
  GetStudyMetadata: function (studyInstanceUid) {
    OHIF.log.info('GetStudyMetadata(%s)', studyInstanceUid); // Get the server data. This is user-defined in the config.json files or through servers
    // configuration modal

    const server = OHIF.servers.getCurrentServer();

    if (!server) {
      throw new Meteor.Error('improper-server-config', 'No properly configured server was available over DICOMWeb or DIMSE.');
    }

    try {
      if (server.type === 'dicomWeb') {
        if (server.metadataSource === 'qido') {
          return OHIF.studies.services.QIDO.RetrieveMetadata(server, studyInstanceUid);
        } else {
          return OHIF.studies.services.WADO.RetrieveMetadata(server, studyInstanceUid);
        }
      } else if (server.type === 'dimse') {
        return OHIF.studies.services.DIMSE.RetrieveMetadata(studyInstanceUid);
      }
    } catch (error) {
      OHIF.log.trace();
      throw error;
    }
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/methods/index.js                                                            //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./getStudyMetadata.js"));
module.watch(require("./studylistSearch.js"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"studylistSearch.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/methods/studylistSearch.js                                                  //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  /**
   * Use the specified filter to conduct a search from the DICOM server
   *
   * @param filter
   */
  StudyListSearch(filter) {
    // Get the server data. This is user-defined in the config.json files or through servers
    // configuration modal
    const server = OHIF.servers.getCurrentServer();

    if (!server) {
      throw new Meteor.Error('improper-server-config', 'No properly configured server was available over DICOMWeb or DIMSE.');
    }

    try {
      if (server.type === 'dicomWeb') {
        return OHIF.studies.services.QIDO.Studies(server, filter);
      } else if (server.type === 'dimse') {
        return OHIF.studies.services.DIMSE.Studies(filter);
      }
    } catch (error) {
      OHIF.log.trace();
      throw error;
    }
  }

});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"services":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/index.js                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.watch(require("./namespace.js"));
module.watch(require("./dimse/instances.js"));
module.watch(require("./dimse/studies.js"));
module.watch(require("./dimse/retrieveMetadata.js"));
module.watch(require("./dimse/setup.js"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/namespace.js                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
OHIF.studies.services.DIMSE = {};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dimse":{"instances.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/dimse/instances.js                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let DIMSE;
module.watch(require("dimse"), {
  default(v) {
    DIMSE = v;
  }

}, 1);

/**
 * Parses data returned from a study search and transforms it into
 * an array of series that are present in the study
 *
 * @param resultData
 * @param studyInstanceUid
 * @returns {Array} Series List
 */
function resultDataToStudyMetadata(resultData, studyInstanceUid) {
  const seriesMap = {};
  const seriesList = [];
  resultData.forEach(function (instanceRaw) {
    const instance = instanceRaw.toObject(); // Use seriesMap to cache series data
    // If the series instance UID has already been used to
    // process series data, continue using that series

    const seriesInstanceUid = instance[0x0020000E];
    let series = seriesMap[seriesInstanceUid]; // If no series data exists in the seriesMap cache variable,
    // process any available series data

    if (!series) {
      series = {
        seriesInstanceUid: seriesInstanceUid,
        seriesNumber: instance[0x00200011],
        instances: []
      }; // Save this data in the seriesMap cache variable

      seriesMap[seriesInstanceUid] = series;
      seriesList.push(series);
    } // TODO: Check which peer it should point to


    const server = OHIF.servers.getCurrentServer().peers[0];
    const serverRoot = server.host + ':' + server.port;
    const sopInstanceUid = instance[0x00080018];
    const uri = serverRoot + '/studies/' + studyInstanceUid + '/series/' + seriesInstanceUid + '/instances/' + sopInstanceUid + '/frames/1'; // Add this instance to the current series

    series.instances.push({
      sopClassUid: instance[0x00080016],
      sopInstanceUid,
      uri,
      instanceNumber: instance[0x00200013]
    });
  });
  return seriesList;
}
/**
 * Retrieve a set of instances using a DIMSE call
 * @param studyInstanceUid
 * @returns {{wadoUriRoot: String, studyInstanceUid: String, seriesList: Array}}
 */


OHIF.studies.services.DIMSE.Instances = function (studyInstanceUid) {
  //var url = buildUrl(server, studyInstanceUid);
  const result = DIMSE.retrieveInstances(studyInstanceUid);
  return {
    studyInstanceUid: studyInstanceUid,
    seriesList: resultDataToStudyMetadata(result, studyInstanceUid)
  };
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"retrieveMetadata.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/dimse/retrieveMetadata.js                                          //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 0);
let parseFloatArray;
module.watch(require("meteor/ohif:studies/imports/both/lib/parseFloatArray"), {
  parseFloatArray(v) {
    parseFloatArray = v;
  }

}, 1);
let DIMSE;
module.watch(require("dimse"), {
  default(v) {
    DIMSE = v;
  }

}, 2);

/**
 * Returns the value of the element (e.g. '00280009')
 *
 * @param element - The group/element of the element (e.g. '00280009')
 * @param defaultValue - The default value to return if the element does not exist
 * @returns {*}
 */
function getValue(element, defaultValue) {
  if (!element || !element.value) {
    return defaultValue;
  }

  return element.value;
}
/**
 * Parses the SourceImageSequence, if it exists, in order
 * to return a ReferenceSOPInstanceUID. The ReferenceSOPInstanceUID
 * is used to refer to this image in any accompanying DICOM-SR documents.
 *
 * @param instance
 * @returns {String} The ReferenceSOPInstanceUID
 */


function getSourceImageInstanceUid(instance) {
  // TODO= Parse the whole Source Image Sequence
  // This is a really poor workaround for now.
  // Later we should probably parse the whole sequence.
  const SourceImageSequence = instance[0x00082112];

  if (SourceImageSequence && SourceImageSequence.length) {
    return SourceImageSequence[0][0x00081155];
  }
}
/**
 * Parses result data from a DIMSE search into Study MetaData
 * Returns an object populated with study metadata, including the
 * series list.
 *
 * @param studyInstanceUid
 * @param resultData
 * @returns {{seriesList: Array, patientName: *, patientId: *, accessionNumber: *, studyDate: *, modalities: *, studyDescription: *, imageCount: *, studyInstanceUid: *}}
 */


function resultDataToStudyMetadata(studyInstanceUid, resultData) {
  OHIF.log.info('resultDataToStudyMetadata');
  const seriesMap = {};
  const seriesList = [];

  if (!resultData.length) {
    return;
  }

  const anInstance = resultData[0].toObject();

  if (!anInstance) {
    return;
  }

  const studyData = {
    seriesList: seriesList,
    patientName: anInstance[0x00100010],
    patientId: anInstance[0x00100020],
    patientBirthDate: anInstance[0x00100030],
    patientSex: anInstance[0x00100040],
    accessionNumber: anInstance[0x00080050],
    studyDate: anInstance[0x00080020],
    modalities: anInstance[0x00080061],
    studyDescription: anInstance[0x00081030],
    imageCount: anInstance[0x00201208],
    studyInstanceUid: anInstance[0x0020000D],
    institutionName: anInstance[0x00080080]
  };
  resultData.forEach(function (instanceRaw) {
    const instance = instanceRaw.toObject();
    const seriesInstanceUid = instance[0x0020000E];
    let series = seriesMap[seriesInstanceUid];

    if (!series) {
      series = {
        seriesDescription: instance[0x0008103E],
        modality: instance[0x00080060],
        seriesInstanceUid: seriesInstanceUid,
        seriesNumber: parseFloat(instance[0x00200011]),
        instances: []
      };
      seriesMap[seriesInstanceUid] = series;
      seriesList.push(series);
    }

    const sopInstanceUid = instance[0x00080018];
    const instanceSummary = {
      imageType: instance[0x00080008],
      sopClassUid: instance[0x00080016],
      modality: instance[0x00080060],
      sopInstanceUid: sopInstanceUid,
      instanceNumber: parseFloat(instance[0x00200013]),
      imagePositionPatient: instance[0x00200032],
      imageOrientationPatient: instance[0x00200037],
      frameOfReferenceUID: instance[0x00200052],
      sliceThickness: parseFloat(instance[0x00180050]),
      sliceLocation: parseFloat(instance[0x00201041]),
      tablePosition: parseFloat(instance[0x00189327]),
      samplesPerPixel: parseFloat(instance[0x00280002]),
      photometricInterpretation: instance[0x00280004],
      planarConfiguration: parseFloat(instance[0x00280006]),
      rows: parseFloat(instance[0x00280010]),
      columns: parseFloat(instance[0x00280011]),
      pixelSpacing: instance[0x00280030],
      bitsAllocated: parseFloat(instance[0x00280100]),
      bitsStored: parseFloat(instance[0x00280101]),
      highBit: parseFloat(instance[0x00280102]),
      pixelRepresentation: parseFloat(instance[0x00280103]),
      windowCenter: instance[0x00281050],
      windowWidth: instance[0x00281051],
      rescaleIntercept: parseFloat(instance[0x00281052]),
      rescaleSlope: parseFloat(instance[0x00281053]),
      sourceImageInstanceUid: getSourceImageInstanceUid(instance),
      laterality: instance[0x00200062],
      viewPosition: instance[0x00185101],
      acquisitionDateTime: instance[0x0008002A],
      numberOfFrames: parseFloat(instance[0x00280008]),
      frameIncrementPointer: getValue(instance[0x00280009]),
      frameTime: parseFloat(instance[0x00181063]),
      frameTimeVector: parseFloatArray(instance[0x00181065]),
      lossyImageCompression: instance[0x00282110],
      derivationDescription: instance[0x00282111],
      lossyImageCompressionRatio: instance[0x00282112],
      lossyImageCompressionMethod: instance[0x00282114],
      spacingBetweenSlices: instance[0x00180088],
      echoNumber: instance[0x00180086],
      contrastBolusAgent: instance[0x00180010]
    }; // Retrieve the actual data over WADO-URI

    const server = OHIF.servers.getCurrentServer();
    const wadouri = `${server.wadoUriRoot}?requestType=WADO&studyUID=${studyInstanceUid}&seriesUID=${seriesInstanceUid}&objectUID=${sopInstanceUid}&contentType=application%2Fdicom`;
    instanceSummary.wadouri = WADOProxy.convertURL(wadouri, server);
    series.instances.push(instanceSummary);
  });
  studyData.studyInstanceUid = studyInstanceUid;
  return studyData;
}
/**
 * Retrieved Study MetaData from a DICOM server using DIMSE
 * @param studyInstanceUid
 * @returns {{seriesList: Array, patientName: *, patientId: *, accessionNumber: *, studyDate: *, modalities: *, studyDescription: *, imageCount: *, studyInstanceUid: *}}
 */


OHIF.studies.services.DIMSE.RetrieveMetadata = function (studyInstanceUid) {
  // TODO: Check which peer it should point to
  const activeServer = OHIF.servers.getCurrentServer().peers[0];
  const supportsInstanceRetrievalByStudyUid = activeServer.supportsInstanceRetrievalByStudyUid;
  let results; // Check explicitly for a value of false, since this property
  // may be left undefined in config files

  if (supportsInstanceRetrievalByStudyUid === false) {
    results = DIMSE.retrieveInstancesByStudyOnly(studyInstanceUid);
  } else {
    results = DIMSE.retrieveInstances(studyInstanceUid);
  }

  return resultDataToStudyMetadata(studyInstanceUid, results);
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setup.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/dimse/setup.js                                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
let CurrentServer;
module.watch(require("meteor/ohif:servers/both/collections"), {
  CurrentServer(v) {
    CurrentServer = v;
  }

}, 2);
let DIMSE;
module.watch(require("dimse"), {
  default(v) {
    DIMSE = v;
  }

}, 3);

const setupDIMSE = () => {
  // Terminate existing DIMSE servers and sockets and clean up the connection object
  DIMSE.connection.reset(); // Get the new server configuration

  const server = OHIF.servers.getCurrentServer(); // Stop here if the new server is not of DIMSE type

  if (server.type !== 'dimse') {
    return;
  } // Check if peers were defined in the server configuration and throw an error if not


  const peers = server.peers;

  if (!peers || !peers.length) {
    OHIF.log.error('dimse-config: ' + 'No DIMSE Peers provided.');
    throw new Meteor.Error('dimse-config', 'No DIMSE Peers provided.');
  } // Add all the DIMSE peers, establishing the connections


  OHIF.log.info('Adding DIMSE peers');

  try {
    peers.forEach(peer => DIMSE.connection.addPeer(peer));
  } catch (error) {
    OHIF.log.error('dimse-addPeers: ' + error);
    throw new Meteor.Error('dimse-addPeers', error);
  }
}; // Setup the DIMSE connections on startup or when the current server is changed


Meteor.startup(() => {
  CurrentServer.find().observe({
    added: setupDIMSE,
    changed: setupDIMSE
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"studies.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ohif_studies/imports/server/services/dimse/studies.js                                                   //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let moment;
module.watch(require("meteor/momentjs:moment"), {
  moment(v) {
    moment = v;
  }

}, 0);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 1);
let DIMSE;
module.watch(require("dimse"), {
  default(v) {
    DIMSE = v;
  }

}, 2);

/**
 * Parses resulting data from a QIDO call into a set of Study MetaData
 *
 * @param resultData
 * @returns {Array} An array of Study MetaData objects
 */
function resultDataToStudies(resultData) {
  const studies = [];
  resultData.forEach(function (studyRaw) {
    const study = studyRaw.toObject();
    studies.push({
      studyInstanceUid: study[0x0020000D],
      // 00080005 = SpecificCharacterSet
      studyDate: study[0x00080020],
      studyTime: study[0x00080030],
      accessionNumber: study[0x00080050],
      referringPhysicianName: study[0x00080090],
      // 00081190 = URL
      patientName: study[0x00100010],
      patientId: study[0x00100020],
      patientBirthdate: study[0x00100030],
      patientSex: study[0x00100040],
      imageCount: study[0x00201208],
      studyId: study[0x00200010],
      studyDescription: study[0x00081030],
      modalities: study[0x00080061]
    });
  });
  return studies;
}

OHIF.studies.services.DIMSE.Studies = function (filter) {
  OHIF.log.info('Services.DIMSE.Studies');
  let filterStudyDate = '';

  if (filter.studyDateFrom && filter.studyDateTo) {
    const convertDate = date => moment(date, 'MM/DD/YYYY').format('YYYYMMDD');

    const dateFrom = convertDate(filter.studyDateFrom);
    const dateTo = convertDate(filter.studyDateTo);
    filterStudyDate = `${dateFrom}-${dateTo}`;
  } // Build the StudyInstanceUID parameter


  let studyUids = filter.studyInstanceUid || '';

  if (studyUids) {
    studyUids = Array.isArray(studyUids) ? studyUids.join() : studyUids;
    studyUids = studyUids.replace(/[^0-9.]+/g, '\\');
  }

  const parameters = {
    0x0020000D: studyUids,
    0x00100010: filter.patientName,
    0x00100020: filter.patientId,
    0x00080050: filter.accessionNumber,
    0x00080020: filterStudyDate,
    0x00081030: filter.studyDescription,
    0x00100040: '',
    0x00201208: '',
    0x00080061: filter.modalitiesInStudy
  };
  const results = DIMSE.retrieveStudies(parameters);
  return resultDataToStudies(results);
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},"node_modules":{"dicomweb-client":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/dicomweb-client/package.json                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
exports.name = "dicomweb-client";
exports.version = "0.4.2";
exports.main = "build/dicomweb-client.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"build":{"dicomweb-client.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/dicomweb-client/build/dicomweb-client.js                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"xhr2":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/xhr2/package.json                                                  //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
exports.name = "xhr2";
exports.version = "0.1.4";
exports.main = "lib/xhr2.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"xhr2.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/xhr2/lib/xhr2.js                                                   //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"dimse":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/dimse/package.json                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
exports.name = "dimse";
exports.version = "0.0.2";
exports.main = "./dist/DIMSE.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"DIMSE.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/ohif_studies/node_modules/dimse/dist/DIMSE.js                                                //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:studies/both/main.js");
require("/node_modules/meteor/ohif:studies/server/main.js");

/* Exports */
Package._define("ohif:studies");

})();

//# sourceURL=meteor://💻app/packages/ohif_studies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2JvdGgvbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL3NlcnZlci9tYWluLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9ib3RoL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9ib3RoL2xpYi9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2ltcG9ydHMvYm90aC9saWIvcGFyc2VGbG9hdEFycmF5LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9ib3RoL3NlcnZpY2VzL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9ib3RoL3NlcnZpY2VzL25hbWVzcGFjZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2ltcG9ydHMvYm90aC9zZXJ2aWNlcy9xaWRvL2luc3RhbmNlcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2ltcG9ydHMvYm90aC9zZXJ2aWNlcy9xaWRvL3JldHJpZXZlTWV0YWRhdGEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZGllcy9pbXBvcnRzL2JvdGgvc2VydmljZXMvcWlkby9zdHVkaWVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9ib3RoL3NlcnZpY2VzL3dhZG8vcmV0cmlldmVNZXRhZGF0YS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2ltcG9ydHMvc2VydmVyL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9zZXJ2ZXIvbWV0aG9kcy9nZXRTdHVkeU1ldGFkYXRhLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9zZXJ2ZXIvbWV0aG9kcy9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpzdHVkaWVzL2ltcG9ydHMvc2VydmVyL21ldGhvZHMvc3R1ZHlsaXN0U2VhcmNoLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9zZXJ2ZXIvc2VydmljZXMvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZGllcy9pbXBvcnRzL3NlcnZlci9zZXJ2aWNlcy9uYW1lc3BhY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZGllcy9pbXBvcnRzL3NlcnZlci9zZXJ2aWNlcy9kaW1zZS9pbnN0YW5jZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZGllcy9pbXBvcnRzL3NlcnZlci9zZXJ2aWNlcy9kaW1zZS9yZXRyaWV2ZU1ldGFkYXRhLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOnN0dWRpZXMvaW1wb3J0cy9zZXJ2ZXIvc2VydmljZXMvZGltc2Uvc2V0dXAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6c3R1ZGllcy9pbXBvcnRzL3NlcnZlci9zZXJ2aWNlcy9kaW1zZS9zdHVkaWVzLmpzIl0sIm5hbWVzIjpbIk9ISUYiLCJtb2R1bGUiLCJ3YXRjaCIsInJlcXVpcmUiLCJ2Iiwic3R1ZGllcyIsImV4cG9ydCIsInBhcnNlRmxvYXRBcnJheSIsIm9iaiIsInJlc3VsdCIsIm9ianMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwdXNoIiwicGFyc2VGbG9hdCIsInNlcnZpY2VzIiwiUUlETyIsIldBRE8iLCJESUNPTXdlYkNsaWVudCIsImRlZmF1bHQiLCJESUNPTVdlYiIsInJlc3VsdERhdGFUb1N0dWR5TWV0YWRhdGEiLCJzZXJ2ZXIiLCJzdHVkeUluc3RhbmNlVWlkIiwicmVzdWx0RGF0YSIsInNlcmllc01hcCIsInNlcmllc0xpc3QiLCJmb3JFYWNoIiwiaW5zdGFuY2UiLCJzZXJpZXNJbnN0YW5jZVVpZCIsImdldFN0cmluZyIsInNlcmllcyIsInNlcmllc051bWJlciIsImluc3RhbmNlcyIsInNvcEluc3RhbmNlVWlkIiwidXJpIiwid2Fkb1VyaVJvb3QiLCJzb3BDbGFzc1VpZCIsImluc3RhbmNlTnVtYmVyIiwiSW5zdGFuY2VzIiwiY29uZmlnIiwidXJsIiwicWlkb1Jvb3QiLCJoZWFkZXJzIiwiZ2V0QXV0aG9yaXphdGlvbkhlYWRlciIsImRpY29tV2ViIiwiYXBpIiwicXVlcnlQYXJhbXMiLCJnZXRRSURPUXVlcnlQYXJhbXMiLCJmaWx0ZXIiLCJxaWRvU3VwcG9ydHNJbmNsdWRlRmllbGQiLCJvcHRpb25zIiwic3R1ZHlJbnN0YW5jZVVJRCIsInNlYXJjaEZvckluc3RhbmNlcyIsInRoZW4iLCJkYXRhIiwiYnVpbGRVcmwiLCJ3YWRvUm9vdCIsImJ1aWxkSW5zdGFuY2VXYWRvUnNVcmkiLCJidWlsZEluc3RhbmNlRnJhbWVXYWRvUnNVcmkiLCJmcmFtZSIsImJhc2VXYWRvUnNVcmkiLCJpbnN0YW5jZXNJbiIsImFuSW5zdGFuY2UiLCJzdHVkeURhdGEiLCJwYXRpZW50TmFtZSIsImdldE5hbWUiLCJwYXRpZW50SWQiLCJwYXRpZW50QWdlIiwiZ2V0TnVtYmVyIiwicGF0aWVudFNpemUiLCJwYXRpZW50V2VpZ2h0IiwiYWNjZXNzaW9uTnVtYmVyIiwic3R1ZHlEYXRlIiwibW9kYWxpdGllcyIsInN0dWR5RGVzY3JpcHRpb24iLCJpbWFnZUNvdW50IiwiaW5zdGl0dXRpb25OYW1lIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsIndhZG91cmkiLCJ3YWRvcnN1cmkiLCJpbnN0YW5jZVN1bW1hcnkiLCJXQURPUHJveHkiLCJjb252ZXJ0VVJMIiwiaW1hZ2VSZW5kZXJpbmciLCJ0aHVtYm5haWxSZW5kZXJpbmciLCJSZXRyaWV2ZU1ldGFkYXRhIiwicmVzb2x2ZSIsInJlamVjdCIsImdldEpTT04iLCJyZXF1ZXN0T3B0aW9ucyIsInN0dWR5IiwiTWV0ZW9yIiwiaXNTZXJ2ZXIiLCJYTUxIdHRwUmVxdWVzdCIsImdsb2JhbCIsImRhdGVUb1N0cmluZyIsImRhdGUiLCJ5ZWFyIiwiZ2V0RnVsbFllYXIiLCJ0b1N0cmluZyIsIm1vbnRoIiwiZ2V0TW9udGgiLCJkYXkiLCJnZXREYXRlIiwicmVwZWF0IiwiY29uY2F0Iiwic2VydmVyU3VwcG9ydHNRSURPSW5jbHVkZUZpZWxkIiwiY29tbWFTZXBhcmF0ZWRGaWVsZHMiLCJqb2luIiwicGFyYW1ldGVycyIsIlBhdGllbnROYW1lIiwiUGF0aWVudElEIiwiQWNjZXNzaW9uTnVtYmVyIiwiU3R1ZHlEZXNjcmlwdGlvbiIsIk1vZGFsaXRpZXNJblN0dWR5IiwibW9kYWxpdGllc0luU3R1ZHkiLCJsaW1pdCIsIm9mZnNldCIsImluY2x1ZGVmaWVsZCIsInN0dWR5RGF0ZUZyb20iLCJzdHVkeURhdGVUbyIsImRhdGVGcm9tIiwiRGF0ZSIsImRhdGVUbyIsIlN0dWR5RGF0ZSIsInN0dWR5VWlkcyIsIkFycmF5IiwiaXNBcnJheSIsInJlcGxhY2UiLCJTdHVkeUluc3RhbmNlVUlEIiwicGFyYW1zIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsInVuZGVmaW5lZCIsInJlc3VsdERhdGFUb1N0dWRpZXMiLCJzdHVkeVRpbWUiLCJyZWZlcnJpbmdQaHlzaWNpYW5OYW1lIiwicGF0aWVudEJpcnRoZGF0ZSIsInBhdGllbnRTZXgiLCJzdHVkeUlkIiwibnVtYmVyT2ZTdHVkeVJlbGF0ZWRTZXJpZXMiLCJudW1iZXJPZlN0dWR5UmVsYXRlZEluc3RhbmNlcyIsImdldE1vZGFsaXRpZXMiLCJTdHVkaWVzIiwic2VhcmNoRm9yU3R1ZGllcyIsInBhbGV0dGVDb2xvckNhY2hlIiwiY291bnQiLCJtYXhBZ2UiLCJlbnRyaWVzIiwiaXNWYWxpZFVJRCIsInBhbGV0dGVVSUQiLCJnZXQiLCJlbnRyeSIsImhhc093blByb3BlcnR5Iiwibm93IiwidGltZSIsImFkZCIsInVpZCIsImJ1aWxkSW5zdGFuY2VXYWRvVXJsIiwicGFyYW1TdHJpbmciLCJnZXRTb3VyY2VJbWFnZUluc3RhbmNlVWlkIiwiU291cmNlSW1hZ2VTZXF1ZW5jZSIsIlZhbHVlIiwiZ2V0UGFsZXR0ZUNvbG9yIiwidGFnIiwibHV0RGVzY3JpcHRvciIsIm51bUx1dEVudHJpZXMiLCJiaXRzIiwiQnVsa0RhdGFVUkkiLCJpbmRleE9mIiwiaW5jbHVkZXMiLCJyZWFkVUludDE2IiwiYnl0ZUFycmF5IiwicG9zaXRpb24iLCJhcnJheUJ1ZmZlclRvUGFsZXR0ZUNvbG9yTFVUIiwiYXJyYXlidWZmZXIiLCJVaW50OEFycmF5IiwibHV0IiwicmV0cmlldmVCdWxrRGF0YSIsImdldFBhbGV0dGVDb2xvcnMiLCJyIiwiZyIsImIiLCJwcm9taXNlcyIsImFyZ3MiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJnZXRGcmFtZUluY3JlbWVudFBvaW50ZXIiLCJlbGVtZW50IiwiZnJhbWVJbmNyZW1lbnRQb2ludGVyTmFtZXMiLCJ2YWx1ZSIsImdldFJhZGlvcGhhcm1hY2V1dGljYWxJbmZvIiwibW9kYWxpdHkiLCJyYWRpb3BoYXJtYWNldXRpY2FsSW5mbyIsImZpcnN0UGV0UmFkaW9waGFybWFjZXV0aWNhbEluZm8iLCJyYWRpb3BoYXJtYWNldXRpY2FsU3RhcnRUaW1lIiwicmFkaW9udWNsaWRlVG90YWxEb3NlIiwicmFkaW9udWNsaWRlSGFsZkxpZmUiLCJnZXRSZWxhdGlvbnNoaXBTdHJpbmciLCJyZWxhdGlvbnNoaXBUeXBlIiwiZ2V0TmVzdGVkT2JqZWN0IiwiZ2V0TWVhbmluZ1N0cmluZyIsImdldFZhbHVlU3RyaW5nIiwiY29uY2VwdENvZGUiLCJjb25jZXB0Q29kZVZhbHVlIiwiY29uY2VwdENvZGVNZWFuaW5nIiwic2NoZW1lRGVzaWduYXRvciIsIm51bVZhbHVlIiwiY29kZVZhbHVlIiwiY29uc3RydWN0UGxhaW5WYWx1ZSIsImNvbnN0cnVjdENvbnRlbnRTZXF1ZW5jZSIsImhlYWRlciIsIml0ZW1zIiwiaXRlbSIsInBhcnNlQ29udGVudCIsImdldE1vZGFsaXR5IiwiZ2V0Q29udGVudERhdGVUaW1lIiwic3Vic3RyIiwic2VyaWVzRGVzY3JpcHRpb24iLCJzZXJpZXNEYXRlIiwic2VyaWVzVGltZSIsImNvbnRlbnRTZXF1ZW5jZSIsImNvbXBsZXRpb25GbGFnIiwibWFudWZhY3R1cmVyIiwidmVyaWZpY2F0aW9uRmxhZyIsImNvbnRlbnREYXRlVGltZSIsImltYWdlVHlwZSIsImltYWdlUG9zaXRpb25QYXRpZW50IiwiaW1hZ2VPcmllbnRhdGlvblBhdGllbnQiLCJmcmFtZU9mUmVmZXJlbmNlVUlEIiwic2xpY2VMb2NhdGlvbiIsInNhbXBsZXNQZXJQaXhlbCIsInBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24iLCJwbGFuYXJDb25maWd1cmF0aW9uIiwicm93cyIsImNvbHVtbnMiLCJwaXhlbFNwYWNpbmciLCJwaXhlbEFzcGVjdFJhdGlvIiwiYml0c0FsbG9jYXRlZCIsImJpdHNTdG9yZWQiLCJoaWdoQml0IiwicGl4ZWxSZXByZXNlbnRhdGlvbiIsInNtYWxsZXN0UGl4ZWxWYWx1ZSIsImxhcmdlc3RQaXhlbFZhbHVlIiwid2luZG93Q2VudGVyIiwid2luZG93V2lkdGgiLCJyZXNjYWxlSW50ZXJjZXB0IiwicmVzY2FsZVNsb3BlIiwicmVzY2FsZVR5cGUiLCJzb3VyY2VJbWFnZUluc3RhbmNlVWlkIiwibGF0ZXJhbGl0eSIsInZpZXdQb3NpdGlvbiIsImFjcXVpc2l0aW9uRGF0ZVRpbWUiLCJudW1iZXJPZkZyYW1lcyIsImZyYW1lSW5jcmVtZW50UG9pbnRlciIsImZyYW1lVGltZSIsImZyYW1lVGltZVZlY3RvciIsInNsaWNlVGhpY2tuZXNzIiwibG9zc3lJbWFnZUNvbXByZXNzaW9uIiwiZGVyaXZhdGlvbkRlc2NyaXB0aW9uIiwibG9zc3lJbWFnZUNvbXByZXNzaW9uUmF0aW8iLCJsb3NzeUltYWdlQ29tcHJlc3Npb25NZXRob2QiLCJlY2hvTnVtYmVyIiwiY29udHJhc3RCb2x1c0FnZW50IiwicmVkUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yIiwiZ3JlZW5QYWxldHRlQ29sb3JMb29rdXBUYWJsZURlc2NyaXB0b3IiLCJibHVlUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yIiwicGFsZXR0ZXMiLCJwYWxldHRlQ29sb3JMb29rdXBUYWJsZVVJRCIsInJlZFBhbGV0dGVDb2xvckxvb2t1cFRhYmxlRGF0YSIsImdyZWVuUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEYXRhIiwiYmx1ZVBhbGV0dGVDb2xvckxvb2t1cFRhYmxlRGF0YSIsInJldHJpZXZlU3R1ZHlNZXRhZGF0YSIsIm1ldGhvZHMiLCJHZXRTdHVkeU1ldGFkYXRhIiwibG9nIiwiaW5mbyIsInNlcnZlcnMiLCJnZXRDdXJyZW50U2VydmVyIiwiRXJyb3IiLCJ0eXBlIiwibWV0YWRhdGFTb3VyY2UiLCJESU1TRSIsImVycm9yIiwidHJhY2UiLCJTdHVkeUxpc3RTZWFyY2giLCJpbnN0YW5jZVJhdyIsInRvT2JqZWN0IiwicGVlcnMiLCJzZXJ2ZXJSb290IiwiaG9zdCIsInBvcnQiLCJyZXRyaWV2ZUluc3RhbmNlcyIsImdldFZhbHVlIiwiZGVmYXVsdFZhbHVlIiwicGF0aWVudEJpcnRoRGF0ZSIsInRhYmxlUG9zaXRpb24iLCJzcGFjaW5nQmV0d2VlblNsaWNlcyIsImFjdGl2ZVNlcnZlciIsInN1cHBvcnRzSW5zdGFuY2VSZXRyaWV2YWxCeVN0dWR5VWlkIiwicmVzdWx0cyIsInJldHJpZXZlSW5zdGFuY2VzQnlTdHVkeU9ubHkiLCJDdXJyZW50U2VydmVyIiwic2V0dXBESU1TRSIsImNvbm5lY3Rpb24iLCJyZXNldCIsInBlZXIiLCJhZGRQZWVyIiwic3RhcnR1cCIsImZpbmQiLCJvYnNlcnZlIiwiYWRkZWQiLCJjaGFuZ2VkIiwibW9tZW50Iiwic3R1ZHlSYXciLCJmaWx0ZXJTdHVkeURhdGUiLCJjb252ZXJ0RGF0ZSIsImZvcm1hdCIsInJldHJpZXZlU3R1ZGllcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLElBQUo7QUFBU0MsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGtCQUFSLENBQWIsRUFBeUM7QUFBQ0gsT0FBS0ksQ0FBTCxFQUFPO0FBQUNKLFdBQUtJLENBQUw7QUFBTzs7QUFBaEIsQ0FBekMsRUFBMkQsQ0FBM0Q7QUFFVEosS0FBS0ssT0FBTCxHQUFlLEVBQWY7O0FBRUFGLFFBQVEsaUJBQVIsRTs7Ozs7Ozs7Ozs7QUNKQUEsUUFBUSxtQkFBUixFOzs7Ozs7Ozs7OztBQ0FBRixPQUFPQyxLQUFQLENBQWFDLFFBQVEsT0FBUixDQUFiO0FBQStCRixPQUFPQyxLQUFQLENBQWFDLFFBQVEsWUFBUixDQUFiLEU7Ozs7Ozs7Ozs7O0FDQS9CRixPQUFPQyxLQUFQLENBQWFDLFFBQVEsc0JBQVIsQ0FBYixFOzs7Ozs7Ozs7OztBQ0FBRixPQUFPSyxNQUFQLENBQWM7QUFBQ0MsbUJBQWdCLE1BQUlBO0FBQXJCLENBQWQ7O0FBQU8sTUFBTUEsa0JBQWtCLFVBQVNDLEdBQVQsRUFBYztBQUN6QyxNQUFJQyxTQUFTLEVBQWI7O0FBRUEsTUFBSSxDQUFDRCxHQUFMLEVBQVU7QUFDTixXQUFPQyxNQUFQO0FBQ0g7O0FBRUQsTUFBSUMsT0FBT0YsSUFBSUcsS0FBSixDQUFVLElBQVYsQ0FBWDs7QUFDQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsS0FBS0csTUFBekIsRUFBaUNELEdBQWpDLEVBQXNDO0FBQ2xDSCxXQUFPSyxJQUFQLENBQVlDLFdBQVdMLEtBQUtFLENBQUwsQ0FBWCxDQUFaO0FBQ0g7O0FBRUQsU0FBT0gsTUFBUDtBQUNILENBYk0sQzs7Ozs7Ozs7Ozs7QUNBUFIsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGFBQVIsQ0FBYjtBQUFxQ0YsT0FBT0MsS0FBUCxDQUFhQyxRQUFR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ZUFKSjtBQUtmLGdCQUFZd1AsZUFMRztBQU1mLGdCQUFZL1EsT0FBTzBCLGdCQU5KO0FBT2YsZ0JBQVksRUFQRztBQVFmLGdCQUFZLEVBUkc7QUFTZixnQkFBWTFCLE9BQU9xRTtBQVRKLEdBQW5CO0FBWUEsUUFBTTJMLFVBQVVsQixNQUFNb0MsZUFBTixDQUFzQm5OLFVBQXRCLENBQWhCO0FBQ0EsU0FBTzBCLG9CQUFvQnVLLE9BQXBCLENBQVA7QUFDSCxDQWhDRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX3N0dWRpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5PSElGLnN0dWRpZXMgPSB7fTtcclxuXHJcbnJlcXVpcmUoJy4uL2ltcG9ydHMvYm90aCcpO1xyXG4iLCJyZXF1aXJlKCcuLi9pbXBvcnRzL3NlcnZlcicpO1xyXG4iLCJpbXBvcnQgJy4vbGliJztcclxuaW1wb3J0ICcuL3NlcnZpY2VzJztcclxuIiwiaW1wb3J0ICcuL3BhcnNlRmxvYXRBcnJheS5qcyc7XHJcbiIsImV4cG9ydCBjb25zdCBwYXJzZUZsb2F0QXJyYXkgPSBmdW5jdGlvbihvYmopIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBpZiAoIW9iaikge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9ianMgPSBvYmouc3BsaXQoXCJcXFxcXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmpzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2gocGFyc2VGbG9hdChvYmpzW2ldKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuIiwiaW1wb3J0ICcuL25hbWVzcGFjZSc7XHJcblxyXG4vLyBESUNPTVdlYiBpbnN0YW5jZSwgc3R1ZHksIGFuZCBtZXRhZGF0YSByZXRyaWV2YWxcclxuaW1wb3J0ICcuL3FpZG8vaW5zdGFuY2VzLmpzJztcclxuaW1wb3J0ICcuL3FpZG8vc3R1ZGllcy5qcyc7XHJcbmltcG9ydCAnLi9xaWRvL3JldHJpZXZlTWV0YWRhdGEuanMnO1xyXG5pbXBvcnQgJy4vd2Fkby9yZXRyaWV2ZU1ldGFkYXRhLmpzJztcclxuIiwiaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5cclxuT0hJRi5zdHVkaWVzLnNlcnZpY2VzID0ge1xyXG4gICAgUUlETzoge30sXHJcbiAgICBXQURPOiB7fVxyXG59O1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcbmltcG9ydCBESUNPTXdlYkNsaWVudCBmcm9tICdkaWNvbXdlYi1jbGllbnQnO1xyXG5cclxuY29uc3QgeyBESUNPTVdlYiB9ID0gT0hJRjtcclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgZGF0YSByZXR1cm5lZCBmcm9tIGEgUUlETyBzZWFyY2ggYW5kIHRyYW5zZm9ybXMgaXQgaW50b1xyXG4gKiBhbiBhcnJheSBvZiBzZXJpZXMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgc3R1ZHlcclxuICpcclxuICogQHBhcmFtIHNlcnZlciBUaGUgRElDT00gc2VydmVyXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEBwYXJhbSByZXN1bHREYXRhXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gU2VyaWVzIExpc3RcclxuICovXHJcbmZ1bmN0aW9uIHJlc3VsdERhdGFUb1N0dWR5TWV0YWRhdGEoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCByZXN1bHREYXRhKSB7XHJcbiAgICB2YXIgc2VyaWVzTWFwID0ge307XHJcbiAgICB2YXIgc2VyaWVzTGlzdCA9IFtdO1xyXG5cclxuICAgIHJlc3VsdERhdGEuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgICAgIC8vIFVzZSBzZXJpZXNNYXAgdG8gY2FjaGUgc2VyaWVzIGRhdGFcclxuICAgICAgICAvLyBJZiB0aGUgc2VyaWVzIGluc3RhbmNlIFVJRCBoYXMgYWxyZWFkeSBiZWVuIHVzZWQgdG9cclxuICAgICAgICAvLyBwcm9jZXNzIHNlcmllcyBkYXRhLCBjb250aW51ZSB1c2luZyB0aGF0IHNlcmllc1xyXG4gICAgICAgIHZhciBzZXJpZXNJbnN0YW5jZVVpZCA9IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyMDAwMEUnXSk7XHJcbiAgICAgICAgdmFyIHNlcmllcyA9IHNlcmllc01hcFtzZXJpZXNJbnN0YW5jZVVpZF07XHJcblxyXG4gICAgICAgIC8vIElmIG5vIHNlcmllcyBkYXRhIGV4aXN0cyBpbiB0aGUgc2VyaWVzTWFwIGNhY2hlIHZhcmlhYmxlLFxyXG4gICAgICAgIC8vIHByb2Nlc3MgYW55IGF2YWlsYWJsZSBzZXJpZXMgZGF0YVxyXG4gICAgICAgIGlmICghc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIHNlcmllcyA9IHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0luc3RhbmNlVWlkOiBzZXJpZXNJbnN0YW5jZVVpZCxcclxuICAgICAgICAgICAgICAgIHNlcmllc051bWJlcjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDIwMDAxMSddKSxcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlczogW11cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgdGhpcyBkYXRhIGluIHRoZSBzZXJpZXNNYXAgY2FjaGUgdmFyaWFibGVcclxuICAgICAgICAgICAgc2VyaWVzTWFwW3Nlcmllc0luc3RhbmNlVWlkXSA9IHNlcmllcztcclxuICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUaGUgdXJpIGZvciB0aGUgZGljb213ZWJcclxuICAgICAgICAvLyBOT1RFOiBEQ000Q0hFRSBzZWVtcyB0byByZXR1cm4gdGhlIGRhdGEgemlwcGVkXHJcbiAgICAgICAgLy8gTk9URTogT3J0aGFuYyByZXR1cm5zIHRoZSBkYXRhIHdpdGggbXVsdGktcGFydCBtaW1lIHdoaWNoIGNvcm5lcnN0b25lV0FET0ltYWdlTG9hZGVyIGRvZXNuJ3RcclxuICAgICAgICAvLyAgICAgICBrbm93IGhvdyB0byBwYXJzZSB5ZXRcclxuICAgICAgICAvL3ZhciB1cmkgPSBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMDgxMTkwJ10pO1xyXG4gICAgICAgIC8vdXJpID0gdXJpLnJlcGxhY2UoJ3dhZG8tcnMnLCAnZGljb20td2ViJyk7XHJcblxyXG4gICAgICAgIC8vIG1hbnVhbGx5IGNyZWF0ZSBhIFdBRE8tVVJJIGZyb20gdGhlIFVJRHNcclxuICAgICAgICAvLyBOT1RFOiBIYXZlbid0IGJlZW4gYWJsZSB0byBnZXQgT3J0aGFuYydzIFdBRE8tVVJJIHRvIHdvcmsgeWV0IC0gbWF5YmUgaXRzIG5vdCBjb25maWd1cmVkP1xyXG4gICAgICAgIHZhciBzb3BJbnN0YW5jZVVpZCA9IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwMTgnXSk7XHJcbiAgICAgICAgdmFyIHVyaSA9IHNlcnZlci53YWRvVXJpUm9vdCArICc/cmVxdWVzdFR5cGU9V0FETyZzdHVkeVVJRD0nICsgc3R1ZHlJbnN0YW5jZVVpZCArICcmc2VyaWVzVUlEPScgKyBzZXJpZXNJbnN0YW5jZVVpZCArICcmb2JqZWN0VUlEPScgKyBzb3BJbnN0YW5jZVVpZCArICcmY29udGVudFR5cGU9YXBwbGljYXRpb24lMkZkaWNvbSc7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGlzIGluc3RhbmNlIHRvIHRoZSBjdXJyZW50IHNlcmllc1xyXG4gICAgICAgIHNlcmllcy5pbnN0YW5jZXMucHVzaCh7XHJcbiAgICAgICAgICAgIHNvcENsYXNzVWlkOiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMDgwMDE2J10pLFxyXG4gICAgICAgICAgICBzb3BJbnN0YW5jZVVpZDogc29wSW5zdGFuY2VVaWQsXHJcbiAgICAgICAgICAgIHVyaTogdXJpLFxyXG4gICAgICAgICAgICBpbnN0YW5jZU51bWJlcjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDIwMDAxMyddKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2VyaWVzTGlzdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlIGEgc2V0IG9mIGluc3RhbmNlcyB1c2luZyBhIFFJRE8gY2FsbFxyXG4gKiBAcGFyYW0gc2VydmVyXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEB0aHJvd3MgRUNPTk5SRUZVU0VEXHJcbiAqIEByZXR1cm5zIHt7d2Fkb1VyaVJvb3Q6IFN0cmluZywgc3R1ZHlJbnN0YW5jZVVpZDogU3RyaW5nLCBzZXJpZXNMaXN0OiBBcnJheX19XHJcbiAqL1xyXG5PSElGLnN0dWRpZXMuc2VydmljZXMuUUlETy5JbnN0YW5jZXMgPSBmdW5jdGlvbihzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQpIHtcclxuICAgIC8vIFRPRE86IEFyZSB3ZSB1c2luZyB0aGlzIGZ1bmN0aW9uIGFueXdoZXJlPz8gQ2FuIHdlIHJlbW92ZSBpdD9cclxuXHJcbiAgICBjb25zdCBjb25maWcgPSB7XHJcbiAgICAgICAgdXJsOiBzZXJ2ZXIucWlkb1Jvb3QsXHJcbiAgICAgICAgaGVhZGVyczogT0hJRi5ESUNPTVdlYi5nZXRBdXRob3JpemF0aW9uSGVhZGVyKClcclxuICAgIH07XHJcbiAgICBjb25zdCBkaWNvbVdlYiA9IG5ldyBESUNPTXdlYkNsaWVudC5hcGkuRElDT013ZWJDbGllbnQoY29uZmlnKTtcclxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gZ2V0UUlET1F1ZXJ5UGFyYW1zKGZpbHRlciwgc2VydmVyLnFpZG9TdXBwb3J0c0luY2x1ZGVGaWVsZCk7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgIHN0dWR5SW5zdGFuY2VVSUQ6IHN0dWR5SW5zdGFuY2VVaWRcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGRpY29tV2ViLnNlYXJjaEZvckluc3RhbmNlcyhvcHRpb25zKS50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2Fkb1VyaVJvb3Q6IHNlcnZlci53YWRvVXJpUm9vdCxcclxuICAgICAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogc3R1ZHlJbnN0YW5jZVVpZCxcclxuICAgICAgICAgICAgc2VyaWVzTGlzdDogcmVzdWx0RGF0YVRvU3R1ZHlNZXRhZGF0YShzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHJlc3VsdC5kYXRhKVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxufTtcclxuIiwiXHJcbmltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IERJQ09Nd2ViQ2xpZW50IGZyb20gJ2RpY29td2ViLWNsaWVudCc7XHJcbmNvbnN0IHsgRElDT01XZWIgfSA9IE9ISUY7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIFVSTCBmb3IgYSBXQURPIHNlYXJjaFxyXG4gKlxyXG4gKiBAcGFyYW0gc2VydmVyXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZFVybChzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQpIHtcclxuICAgIHJldHVybiBzZXJ2ZXIud2Fkb1Jvb3QgKyAnL3N0dWRpZXM/aW5jbHVkZWZpZWxkPWFsbCZTdHVkeUluc3RhbmNlVUlEPScgKyBzdHVkeUluc3RhbmNlVWlkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEluc3RhbmNlV2Fkb1JzVXJpKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCwgc2VyaWVzSW5zdGFuY2VVaWQsIHNvcEluc3RhbmNlVWlkKSB7XHJcbiAgICByZXR1cm4gYCR7c2VydmVyLndhZG9Sb290fS9zdHVkaWVzLyR7c3R1ZHlJbnN0YW5jZVVpZH0vc2VyaWVzLyR7c2VyaWVzSW5zdGFuY2VVaWR9L2luc3RhbmNlcy8ke3NvcEluc3RhbmNlVWlkfWBcclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRJbnN0YW5jZUZyYW1lV2Fkb1JzVXJpKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCwgc2VyaWVzSW5zdGFuY2VVaWQsIHNvcEluc3RhbmNlVWlkLCBmcmFtZSkge1xyXG4gICAgY29uc3QgYmFzZVdhZG9Sc1VyaSA9IGJ1aWxkSW5zdGFuY2VXYWRvUnNVcmkoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQpO1xyXG4gICAgZnJhbWUgPSBmcmFtZSAhPSBudWxsIHx8IDE7XHJcblxyXG4gICAgcmV0dXJuIGAke2Jhc2VXYWRvUnNVcml9L2ZyYW1lcy8ke2ZyYW1lfWBcclxufVxyXG4vKipcclxuICogUGFyc2VzIHJlc3VsdCBkYXRhIGZyb20gYSBRSURPIHNlYXJjaCBpbnRvIFN0dWR5IE1ldGFEYXRhXHJcbiAqIFJldHVybnMgYW4gb2JqZWN0IHBvcHVsYXRlZCB3aXRoIHN0dWR5IG1ldGFkYXRhLCBpbmNsdWRpbmcgdGhlXHJcbiAqIHNlcmllcyBsaXN0LlxyXG4gKlxyXG4gKiBAcGFyYW0gc2VydmVyXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEBwYXJhbSByZXN1bHREYXRhXHJcbiAqIEByZXR1cm5zIHt7c2VyaWVzTGlzdDogQXJyYXksIHBhdGllbnROYW1lOiAqLCBwYXRpZW50SWQ6ICosIGFjY2Vzc2lvbk51bWJlcjogKiwgc3R1ZHlEYXRlOiAqLCBtb2RhbGl0aWVzOiAqLCBzdHVkeURlc2NyaXB0aW9uOiAqLCBpbWFnZUNvdW50OiAqLCBzdHVkeUluc3RhbmNlVWlkOiAqfX1cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHJlc3VsdERhdGFUb1N0dWR5TWV0YWRhdGEoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCByZXN1bHREYXRhLCBpbnN0YW5jZXNJbikge1xyXG5cclxuICAgIGNvbnN0IHNlcmllc0xpc3QgPSBbXTtcclxuXHJcbiAgICBpZiAoIXJlc3VsdERhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFuSW5zdGFuY2UgPSByZXN1bHREYXRhWzBdO1xyXG4gICAgaWYgKCFhbkluc3RhbmNlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0dWR5RGF0YSA9IHtcclxuICAgICAgICBzZXJpZXNMaXN0LFxyXG4gICAgICAgIHBhdGllbnROYW1lOiBESUNPTVdlYi5nZXROYW1lKGFuSW5zdGFuY2VbJzAwMTAwMDEwJ10pLFxyXG4gICAgICAgIHBhdGllbnRJZDogRElDT01XZWIuZ2V0U3RyaW5nKGFuSW5zdGFuY2VbJzAwMTAwMDIwJ10pLFxyXG4gICAgICAgIHBhdGllbnRBZ2U6IERJQ09NV2ViLmdldE51bWJlcihhbkluc3RhbmNlWycwMDEwMTAxMCddKSxcclxuICAgICAgICBwYXRpZW50U2l6ZTogRElDT01XZWIuZ2V0TnVtYmVyKGFuSW5zdGFuY2VbJzAwMTAxMDIwJ10pLFxyXG4gICAgICAgIHBhdGllbnRXZWlnaHQ6IERJQ09NV2ViLmdldE51bWJlcihhbkluc3RhbmNlWycwMDEwMTAzMCddKSxcclxuICAgICAgICBhY2Nlc3Npb25OdW1iZXI6IERJQ09NV2ViLmdldFN0cmluZyhhbkluc3RhbmNlWycwMDA4MDA1MCddKSxcclxuICAgICAgICBzdHVkeURhdGU6IERJQ09NV2ViLmdldFN0cmluZyhhbkluc3RhbmNlWycwMDA4MDAyMCddKSxcclxuICAgICAgICBtb2RhbGl0aWVzOiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAwODAwNjEnXSksXHJcbiAgICAgICAgc3R1ZHlEZXNjcmlwdGlvbjogRElDT01XZWIuZ2V0U3RyaW5nKGFuSW5zdGFuY2VbJzAwMDgxMDMwJ10pLFxyXG4gICAgICAgIGltYWdlQ291bnQ6IERJQ09NV2ViLmdldFN0cmluZyhhbkluc3RhbmNlWycwMDIwMTIwOCddKSxcclxuICAgICAgICBzdHVkeUluc3RhbmNlVWlkOiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAyMDAwMEQnXSksXHJcbiAgICAgICAgaW5zdGl0dXRpb25OYW1lOiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAwODAwODAnXSlcclxuICAgIH07XHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChpbnN0YW5jZXNJbi5zZXJpZXNMaXN0Lm1hcChhc3luYyBmdW5jdGlvbihzZXJpZXNNYXApIHtcclxuICAgICAgICB2YXIgaW5zdGFuY2UgPSBzZXJpZXNNYXAuaW5zdGFuY2VzWzBdO1xyXG4gICAgICAgIHZhciBzZXJpZXNJbnN0YW5jZVVpZCA9IGluc3RhbmNlLnNlcmllc0luc3RhbmNlVWlkO1xyXG4gICAgICAgIHZhciBzZXJpZXMgPSBzZXJpZXNNYXBbc2VyaWVzSW5zdGFuY2VVaWRdO1xyXG4gICAgICAgIGlmICghc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIHNlcmllcyA9IHNlcmllc01hcDtcclxuICAgICAgICAgICAgc2VyaWVzLmluc3RhbmNlcyA9IFtdO1xyXG4gICAgICAgICAgICBzZXJpZXNNYXBbc2VyaWVzSW5zdGFuY2VVaWRdID0gc2VyaWVzO1xyXG4gICAgICAgICAgICBzZXJpZXNMaXN0LnB1c2goc2VyaWVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc29wSW5zdGFuY2VVaWQgPSBpbnN0YW5jZS5zb3BJbnN0YW5jZVVpZDtcclxuICAgICAgICBjb25zdCB3YWRvdXJpID0gYnVpbGRJbnN0YW5jZVdhZG9Sc1VyaShzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHNlcmllc0luc3RhbmNlVWlkLCBzb3BJbnN0YW5jZVVpZCk7XHJcbiAgICAgICAgY29uc3QgYmFzZVdhZG9Sc1VyaSA9IGJ1aWxkSW5zdGFuY2VXYWRvUnNVcmkoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQpO1xyXG4gICAgICAgIGNvbnN0IHdhZG9yc3VyaSA9IGJ1aWxkSW5zdGFuY2VGcmFtZVdhZG9Sc1VyaShzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHNlcmllc0luc3RhbmNlVWlkLCBzb3BJbnN0YW5jZVVpZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlU3VtbWFyeSA9IGluc3RhbmNlO1xyXG4gICAgICAgIGluc3RhbmNlU3VtbWFyeS5iYXNlV2Fkb1JzVXJpPWJhc2VXYWRvUnNVcmk7XHJcbiAgICAgICAgaW5zdGFuY2VTdW1tYXJ5LndhZG91cmk9V0FET1Byb3h5LmNvbnZlcnRVUkwod2Fkb3VyaSwgc2VydmVyKTtcclxuICAgICAgICBpbnN0YW5jZVN1bW1hcnkud2Fkb3JzdXJpPVdBRE9Qcm94eS5jb252ZXJ0VVJMKHdhZG9yc3VyaSwgc2VydmVyKTtcclxuICAgICAgICBpbnN0YW5jZVN1bW1hcnkuaW1hZ2VSZW5kZXJpbmc9c2VydmVyLmltYWdlUmVuZGVyaW5nO1xyXG4gICAgICAgIGluc3RhbmNlU3VtbWFyeS50aHVtYm5haWxSZW5kZXJpbmc9c2VydmVyLnRodW1ibmFpbFJlbmRlcmluZztcclxuICAgICAgICBzZXJpZXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2VTdW1tYXJ5KTtcclxuICAgIH0pKTtcclxuICAgIHJldHVybiBzdHVkeURhdGE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZWQgU3R1ZHkgTWV0YURhdGEgZnJvbSBhIERJQ09NIHNlcnZlciB1c2luZyBhIFdBRE8gY2FsbFxyXG4gKiBAcGFyYW0gc2VydmVyXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gKi9cclxuT0hJRi5zdHVkaWVzLnNlcnZpY2VzLlFJRE8uUmV0cmlldmVNZXRhZGF0YSA9IGFzeW5jIGZ1bmN0aW9uKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCkge1xyXG4gICAgY29uc3QgdXJsID0gYnVpbGRVcmwoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgRElDT01XZWIuZ2V0SlNPTih1cmwsIHNlcnZlci5yZXF1ZXN0T3B0aW9ucykudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICBPSElGLnN0dWRpZXMuc2VydmljZXMuUUlETy5JbnN0YW5jZXMoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkKS50aGVuKGluc3RhbmNlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHREYXRhVG9TdHVkeU1ldGFkYXRhKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCwgcmVzdWx0LCBpbnN0YW5jZXMpLnRoZW4oKHN0dWR5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZHkud2Fkb1VyaVJvb3QgPSBzZXJ2ZXIud2Fkb1VyaVJvb3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZHkuc3R1ZHlJbnN0YW5jZVVpZCA9IHN0dWR5SW5zdGFuY2VVaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdHVkeSk7XHJcbiAgICAgICAgICAgICAgICB9LCByZWplY3QpXHJcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XHJcbiAgICAgICAgfSwgcmVqZWN0KTtcclxuICAgIH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcbmltcG9ydCBESUNPTXdlYkNsaWVudCBmcm9tICdkaWNvbXdlYi1jbGllbnQnO1xyXG5cclxuY29uc3QgeyBESUNPTVdlYiB9ID0gT0hJRjtcclxuXHJcbi8vIFRPRE86IElzIHRoZXJlIGFuIGVhc2llciB3YXkgdG8gZG8gdGhpcz9cclxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gICAgdmFyIFhNTEh0dHBSZXF1ZXN0ID0gcmVxdWlyZSgneGhyMicpO1xyXG5cclxuICAgIGdsb2JhbC5YTUxIdHRwUmVxdWVzdCA9IFhNTEh0dHBSZXF1ZXN0O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIFFJRE8gZGF0ZSBzdHJpbmcgZm9yIGEgZGF0ZSByYW5nZSBxdWVyeVxyXG4gKiBBc3N1bWVzIHRoZSB5ZWFyIGlzIHBvc2l0aXZlLCBhdCBtb3N0IDQgZGlnaXRzIGxvbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlIFRoZSBEYXRlIG9iamVjdCB0byBiZSBmb3JtYXR0ZWRcclxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZGF0ZVRvU3RyaW5nKGRhdGUpIHtcclxuICAgIGlmICghZGF0ZSkgcmV0dXJuICcnO1xyXG4gICAgbGV0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcclxuICAgIGxldCBtb250aCA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xyXG4gICAgbGV0IGRheSA9IGRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICB5ZWFyID0gJzAnLnJlcGVhdCg0IC0geWVhci5sZW5ndGgpLmNvbmNhdCh5ZWFyKTtcclxuICAgIG1vbnRoID0gJzAnLnJlcGVhdCgyIC0gbW9udGgubGVuZ3RoKS5jb25jYXQobW9udGgpO1xyXG4gICAgZGF5ID0gJzAnLnJlcGVhdCgyIC0gZGF5Lmxlbmd0aCkuY29uY2F0KGRheSk7XHJcbiAgICByZXR1cm4gJycuY29uY2F0KHllYXIsIG1vbnRoLCBkYXkpO1xyXG59XHJcblxyXG4vKipcclxuICogUHJvZHVjZXMgYSBRSURPIFVSTCBnaXZlbiBzZXJ2ZXIgZGV0YWlscyBhbmQgYSBzZXQgb2Ygc3BlY2lmaWVkIHNlYXJjaCBmaWx0ZXJcclxuICogaXRlbXNcclxuICpcclxuICogQHBhcmFtIGZpbHRlclxyXG4gKiBAcGFyYW0gc2VydmVyU3VwcG9ydHNRSURPSW5jbHVkZUZpZWxkXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBVUkwgd2l0aCBlbmNvZGVkIGZpbHRlciBxdWVyeSBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRRSURPUXVlcnlQYXJhbXMoZmlsdGVyLCBzZXJ2ZXJTdXBwb3J0c1FJRE9JbmNsdWRlRmllbGQpIHtcclxuICAgIGNvbnN0IGNvbW1hU2VwYXJhdGVkRmllbGRzID0gW1xyXG4gICAgIC8vIHRoaXMgaXMgdGVtcCAgJzAwMDgxMDMwJywgLy8gU3R1ZHkgRGVzY3JpcHRpb25cclxuICAgICAvLyAgICcwMDA4MDA2MCcgLy9Nb2RhbGl0eVxyXG4gICAgICAgIC8vIEFkZCBtb3JlIGZpZWxkcyBoZXJlIGlmIHlvdSB3YW50IHRoZW0gaW4gdGhlIHJlc3VsdFxyXG4gICAgXS5qb2luKCcsJyk7XHJcblxyXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHtcclxuICAgICAgICBQYXRpZW50TmFtZTogZmlsdGVyLnBhdGllbnROYW1lLFxyXG4gICAgICAgIFBhdGllbnRJRDogZmlsdGVyLnBhdGllbnRJZCxcclxuICAgICAgICBBY2Nlc3Npb25OdW1iZXI6IGZpbHRlci5hY2Nlc3Npb25OdW1iZXIsXHJcbiAgICAgICAgU3R1ZHlEZXNjcmlwdGlvbjogZmlsdGVyLnN0dWR5RGVzY3JpcHRpb24sXHJcbiAgICAgICAgTW9kYWxpdGllc0luU3R1ZHk6IGZpbHRlci5tb2RhbGl0aWVzSW5TdHVkeSxcclxuICAgICAgICBsaW1pdDogZmlsdGVyLmxpbWl0LFxyXG4gICAgICAgIG9mZnNldDogZmlsdGVyLm9mZnNldCxcclxuICAgICAgICBpbmNsdWRlZmllbGQ6IHNlcnZlclN1cHBvcnRzUUlET0luY2x1ZGVGaWVsZCA/IGNvbW1hU2VwYXJhdGVkRmllbGRzIDogJ2FsbCdcclxuICAgIH07XHJcblxyXG4gICAgLy8gYnVpbGQgdGhlIFN0dWR5RGF0ZSByYW5nZSBwYXJhbWV0ZXJcclxuICAgIGlmIChmaWx0ZXIuc3R1ZHlEYXRlRnJvbSB8fCBmaWx0ZXIuc3R1ZHlEYXRlVG8pIHtcclxuICAgICAgICBjb25zdCBkYXRlRnJvbSA9IGRhdGVUb1N0cmluZyhuZXcgRGF0ZShmaWx0ZXIuc3R1ZHlEYXRlRnJvbSkpO1xyXG4gICAgICAgIGNvbnN0IGRhdGVUbyA9IGRhdGVUb1N0cmluZyhuZXcgRGF0ZShmaWx0ZXIuc3R1ZHlEYXRlVG8pKTtcclxuICAgICAgICBwYXJhbWV0ZXJzLlN0dWR5RGF0ZSA9IGAke2RhdGVGcm9tfS0ke2RhdGVUb31gO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJ1aWxkIHRoZSBTdHVkeUluc3RhbmNlVUlEIHBhcmFtZXRlclxyXG4gICAgaWYgKGZpbHRlci5zdHVkeUluc3RhbmNlVWlkKSB7XHJcbiAgICAgICAgbGV0IHN0dWR5VWlkcyA9IGZpbHRlci5zdHVkeUluc3RhbmNlVWlkO1xyXG4gICAgICAgIHN0dWR5VWlkcyA9IEFycmF5LmlzQXJyYXkoc3R1ZHlVaWRzKSA/IHN0dWR5VWlkcy5qb2luKCkgOiBzdHVkeVVpZHM7XHJcbiAgICAgICAgc3R1ZHlVaWRzID0gc3R1ZHlVaWRzLnJlcGxhY2UoL1teMC05Ll0rL2csICdcXFxcJyk7XHJcbiAgICAgICAgcGFyYW1ldGVycy5TdHVkeUluc3RhbmNlVUlEID0gc3R1ZHlVaWRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsZWFuIHF1ZXJ5IHBhcmFtcyBvZiB1bmRlZmluZWQgdmFsdWVzLlxyXG4gICAgY29uc3QgcGFyYW1zID0ge307XHJcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgaWYgKHBhcmFtZXRlcnNba2V5XSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgIHBhcmFtZXRlcnNba2V5XSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBwYXJhbXNba2V5XSA9IHBhcmFtZXRlcnNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcGFyYW1zO1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2VzIHJlc3VsdGluZyBkYXRhIGZyb20gYSBRSURPIGNhbGwgaW50byBhIHNldCBvZiBTdHVkeSBNZXRhRGF0YVxyXG4gKlxyXG4gKiBAcGFyYW0gcmVzdWx0RGF0YVxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IG9mIFN0dWR5IE1ldGFEYXRhIG9iamVjdHNcclxuICovXHJcbmZ1bmN0aW9uIHJlc3VsdERhdGFUb1N0dWRpZXMocmVzdWx0RGF0YSkge1xyXG4gICAgY29uc3Qgc3R1ZGllcyA9IFtdO1xyXG5cclxuICAgIGlmICghcmVzdWx0RGF0YSB8fCAhcmVzdWx0RGF0YS5sZW5ndGgpIHJldHVybjtcclxuXHJcbiAgICByZXN1bHREYXRhLmZvckVhY2goc3R1ZHkgPT4gc3R1ZGllcy5wdXNoKHtcclxuICAgICAgICBzdHVkeUluc3RhbmNlVWlkOiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMjAwMDBEJ10pLFxyXG4gICAgICAgIC8vIDAwMDgwMDA1ID0gU3BlY2lmaWNDaGFyYWN0ZXJTZXRcclxuICAgICAgICBzdHVkeURhdGU6IERJQ09NV2ViLmdldFN0cmluZyhzdHVkeVsnMDAwODAwMjAnXSksXHJcbiAgICAgICAgc3R1ZHlUaW1lOiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMDgwMDMwJ10pLFxyXG4gICAgICAgIGFjY2Vzc2lvbk51bWJlcjogRElDT01XZWIuZ2V0U3RyaW5nKHN0dWR5WycwMDA4MDA1MCddKSxcclxuICAgICAgICByZWZlcnJpbmdQaHlzaWNpYW5OYW1lOiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMDgwMDkwJ10pLFxyXG4gICAgICAgIC8vIDAwMDgxMTkwID0gVVJMXHJcbiAgICAgICAgcGF0aWVudE5hbWU6IERJQ09NV2ViLmdldE5hbWUoc3R1ZHlbJzAwMTAwMDEwJ10pLFxyXG4gICAgICAgIHBhdGllbnRJZDogRElDT01XZWIuZ2V0U3RyaW5nKHN0dWR5WycwMDEwMDAyMCddKSxcclxuICAgICAgICBwYXRpZW50QmlydGhkYXRlOiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMTAwMDMwJ10pLFxyXG4gICAgICAgIHBhdGllbnRTZXg6IERJQ09NV2ViLmdldFN0cmluZyhzdHVkeVsnMDAxMDAwNDAnXSksXHJcbiAgICAgICAgc3R1ZHlJZDogRElDT01XZWIuZ2V0U3RyaW5nKHN0dWR5WycwMDIwMDAxMCddKSxcclxuICAgICAgICBudW1iZXJPZlN0dWR5UmVsYXRlZFNlcmllczogRElDT01XZWIuZ2V0U3RyaW5nKHN0dWR5WycwMDIwMTIwNiddKSxcclxuICAgICAgICBudW1iZXJPZlN0dWR5UmVsYXRlZEluc3RhbmNlczogRElDT01XZWIuZ2V0U3RyaW5nKHN0dWR5WycwMDIwMTIwOCddKSxcclxuICAgICAgICBzdHVkeURlc2NyaXB0aW9uOiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMDgxMDMwJ10pLFxyXG4gICAgICAgIC8vIG1vZGFsaXR5OiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMDgwMDYwJ10pLFxyXG4gICAgICAgIC8vIG1vZGFsaXRpZXNJblN0dWR5OiBESUNPTVdlYi5nZXRTdHJpbmcoc3R1ZHlbJzAwMDgwMDYxJ10pLFxyXG4gICAgICAgIG1vZGFsaXRpZXM6IERJQ09NV2ViLmdldFN0cmluZyhESUNPTVdlYi5nZXRNb2RhbGl0aWVzKHN0dWR5WycwMDA4MDA2MCddLCBzdHVkeVsnMDAwODAwNjEnXSkpXHJcbiAgICB9KSk7XHJcblxyXG4gICAgcmV0dXJuIHN0dWRpZXM7XHJcbn1cclxuXHJcbk9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5RSURPLlN0dWRpZXMgPSAoc2VydmVyLCBmaWx0ZXIpID0+IHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICB1cmw6IHNlcnZlci5xaWRvUm9vdCxcclxuICAgICAgICBoZWFkZXJzOiBPSElGLkRJQ09NV2ViLmdldEF1dGhvcml6YXRpb25IZWFkZXIoKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkaWNvbVdlYiA9IG5ldyBESUNPTXdlYkNsaWVudC5hcGkuRElDT013ZWJDbGllbnQoY29uZmlnKTtcclxuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gZ2V0UUlET1F1ZXJ5UGFyYW1zKGZpbHRlciwgc2VydmVyLnFpZG9TdXBwb3J0c0luY2x1ZGVGaWVsZCk7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgIHF1ZXJ5UGFyYW1zXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBkaWNvbVdlYi5zZWFyY2hGb3JTdHVkaWVzKG9wdGlvbnMpLnRoZW4ocmVzdWx0RGF0YVRvU3R1ZGllcyk7XHJcbn07XHJcbiIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IERJQ09Nd2ViQ2xpZW50IGZyb20gJ2RpY29td2ViLWNsaWVudCc7XHJcblxyXG5pbXBvcnQgeyBwYXJzZUZsb2F0QXJyYXkgfSBmcm9tICcuLi8uLi9saWIvcGFyc2VGbG9hdEFycmF5JztcclxuXHJcbmNvbnN0IHsgRElDT01XZWIgfSA9IE9ISUY7XHJcblxyXG4vKipcclxuICogU2ltcGxlIGNhY2hlIHNjaGVtYSBmb3IgcmV0cmlldmVkIGNvbG9yIHBhbGV0dGVzLlxyXG4gKi9cclxuY29uc3QgcGFsZXR0ZUNvbG9yQ2FjaGUgPSB7XHJcbiAgICBjb3VudDogMCxcclxuICAgIG1heEFnZTogMjQgKiA2MCAqIDYwICogMTAwMCwgLy8gMjRoIGNhY2hlP1xyXG4gICAgZW50cmllczoge30sXHJcbiAgICBpc1ZhbGlkVUlEOiBmdW5jdGlvbiAocGFsZXR0ZVVJRCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgcGFsZXR0ZVVJRCA9PT0gJ3N0cmluZycgJiYgcGFsZXR0ZVVJRC5sZW5ndGggPiAwO1xyXG4gICAgfSxcclxuICAgIGdldDogZnVuY3Rpb24gKHBhbGV0dGVVSUQpIHtcclxuICAgICAgICBsZXQgZW50cnkgPSBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLmVudHJpZXMuaGFzT3duUHJvcGVydHkocGFsZXR0ZVVJRCkpIHtcclxuICAgICAgICAgICAgZW50cnkgPSB0aGlzLmVudHJpZXNbcGFsZXR0ZVVJRF07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGhvdyB0aGUgZW50cnkgaXMuLi5cclxuICAgICAgICAgICAgaWYgKChEYXRlLm5vdygpIC0gZW50cnkudGltZSkgPiB0aGlzLm1heEFnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZW50cnkgaXMgdG9vIG9sZC4uLiByZW1vdmUgZW50cnkuXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5lbnRyaWVzW3BhbGV0dGVVSURdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudC0tO1xyXG4gICAgICAgICAgICAgICAgZW50cnkgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbnRyeTtcclxuICAgIH0sXHJcbiAgICBhZGQ6IGZ1bmN0aW9uIChlbnRyeSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRVSUQoZW50cnkudWlkKSkge1xyXG4gICAgICAgICAgICBsZXQgcGFsZXR0ZVVJRCA9IGVudHJ5LnVpZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW50cmllcy5oYXNPd25Qcm9wZXJ0eShwYWxldHRlVUlEKSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudCsrOyAvLyBpbmNyZW1lbnQgY2FjaGUgZW50cnkgY291bnQuLi5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbnRyeS50aW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRyaWVzW3BhbGV0dGVVSURdID0gZW50cnk7XHJcbiAgICAgICAgICAgIC8vIEBUT0RPOiBBZGQgbG9naWMgdG8gZ2V0IHJpZCBvZiBvbGQgZW50cmllcyBhbmQgcmVkdWNlIG1lbW9yeSB1c2FnZS4uLlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKiBSZXR1cm5zIGEgV0FETyB1cmwgZm9yIGFuIGluc3RhbmNlXHJcbiAqXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEBwYXJhbSBzZXJpZXNJbnN0YW5jZVVpZFxyXG4gKiBAcGFyYW0gc29wSW5zdGFuY2VVaWRcclxuICogQHJldHVybnMgIHtzdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEluc3RhbmNlV2Fkb1VybChzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHNlcmllc0luc3RhbmNlVWlkLCBzb3BJbnN0YW5jZVVpZCkge1xyXG4gICAgLy8gVE9ETzogVGhpcyBjYW4gYmUgcmVtb3ZlZCwgc2luY2UgRElDT01XZWJDbGllbnQgaGFzIHRoZSBzYW1lIGZ1bmN0aW9uLiBOb3QgdXJnZW50LCB0aG91Z2hcclxuICAgIGNvbnN0IHBhcmFtcyA9IFtdO1xyXG5cclxuICAgIHBhcmFtcy5wdXNoKCdyZXF1ZXN0VHlwZT1XQURPJyk7XHJcbiAgICBwYXJhbXMucHVzaChgc3R1ZHlVSUQ9JHtzdHVkeUluc3RhbmNlVWlkfWApO1xyXG4gICAgcGFyYW1zLnB1c2goYHNlcmllc1VJRD0ke3Nlcmllc0luc3RhbmNlVWlkfWApO1xyXG4gICAgcGFyYW1zLnB1c2goYG9iamVjdFVJRD0ke3NvcEluc3RhbmNlVWlkfWApO1xyXG4gICAgcGFyYW1zLnB1c2goJ2NvbnRlbnRUeXBlPWFwcGxpY2F0aW9uL2RpY29tJyk7XHJcbiAgICBwYXJhbXMucHVzaCgndHJhbnNmZXJTeW50YXg9KicpO1xyXG5cclxuICAgIGNvbnN0IHBhcmFtU3RyaW5nID0gcGFyYW1zLmpvaW4oJyYnKTtcclxuXHJcbiAgICByZXR1cm4gYCR7c2VydmVyLndhZG9VcmlSb290fT8ke3BhcmFtU3RyaW5nfWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkSW5zdGFuY2VXYWRvUnNVcmkoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQpIHtcclxuICAgIHJldHVybiBgJHtzZXJ2ZXIud2Fkb1Jvb3R9L3N0dWRpZXMvJHtzdHVkeUluc3RhbmNlVWlkfS9zZXJpZXMvJHtzZXJpZXNJbnN0YW5jZVVpZH0vaW5zdGFuY2VzLyR7c29wSW5zdGFuY2VVaWR9YFxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEluc3RhbmNlRnJhbWVXYWRvUnNVcmkoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQsIGZyYW1lKSB7XHJcbiAgICBjb25zdCBiYXNlV2Fkb1JzVXJpID0gYnVpbGRJbnN0YW5jZVdhZG9Sc1VyaShzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHNlcmllc0luc3RhbmNlVWlkLCBzb3BJbnN0YW5jZVVpZCk7XHJcbiAgICBmcmFtZSA9IGZyYW1lICE9IG51bGwgfHwgMTtcclxuXHJcbiAgICByZXR1cm4gYCR7YmFzZVdhZG9Sc1VyaX0vZnJhbWVzLyR7ZnJhbWV9YFxyXG59XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSBTb3VyY2VJbWFnZVNlcXVlbmNlLCBpZiBpdCBleGlzdHMsIGluIG9yZGVyXHJcbiAqIHRvIHJldHVybiBhIFJlZmVyZW5jZVNPUEluc3RhbmNlVUlELiBUaGUgUmVmZXJlbmNlU09QSW5zdGFuY2VVSURcclxuICogaXMgdXNlZCB0byByZWZlciB0byB0aGlzIGltYWdlIGluIGFueSBhY2NvbXBhbnlpbmcgRElDT00tU1IgZG9jdW1lbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0gaW5zdGFuY2VcclxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFJlZmVyZW5jZVNPUEluc3RhbmNlVUlEXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTb3VyY2VJbWFnZUluc3RhbmNlVWlkKGluc3RhbmNlKSB7XHJcbiAgICAvLyBUT0RPPSBQYXJzZSB0aGUgd2hvbGUgU291cmNlIEltYWdlIFNlcXVlbmNlXHJcbiAgICAvLyBUaGlzIGlzIGEgcmVhbGx5IHBvb3Igd29ya2Fyb3VuZCBmb3Igbm93LlxyXG4gICAgLy8gTGF0ZXIgd2Ugc2hvdWxkIHByb2JhYmx5IHBhcnNlIHRoZSB3aG9sZSBzZXF1ZW5jZS5cclxuICAgIHZhciBTb3VyY2VJbWFnZVNlcXVlbmNlID0gaW5zdGFuY2VbJzAwMDgyMTEyJ107XHJcbiAgICBpZiAoU291cmNlSW1hZ2VTZXF1ZW5jZSAmJiBTb3VyY2VJbWFnZVNlcXVlbmNlLlZhbHVlICYmIFNvdXJjZUltYWdlU2VxdWVuY2UuVmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIFNvdXJjZUltYWdlU2VxdWVuY2UuVmFsdWVbMF1bJzAwMDgxMTU1J10uVmFsdWVbMF07XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBhbGV0dGVDb2xvcihzZXJ2ZXIsIGluc3RhbmNlLCB0YWcsIGx1dERlc2NyaXB0b3IpIHtcclxuICAgIGNvbnN0IG51bUx1dEVudHJpZXMgPSBsdXREZXNjcmlwdG9yWzBdO1xyXG4gICAgY29uc3QgYml0cyA9IGx1dERlc2NyaXB0b3JbMl07XHJcblxyXG4gICAgbGV0IHVyaSA9IFdBRE9Qcm94eS5jb252ZXJ0VVJMKGluc3RhbmNlW3RhZ10uQnVsa0RhdGFVUkksIHNlcnZlcilcclxuXHJcbiAgICAvLyBUT0RPOiBXb3JrYXJvdW5kIGZvciBkY200Y2hlZSBiZWhpbmQgU1NMLXRlcm1pbmF0aW5nIHByb3h5IHJldHVybmluZ1xyXG4gICAgLy8gaW5jb3JyZWN0IGJ1bGsgZGF0YSBVUklzXHJcbiAgICBpZiAoc2VydmVyLndhZG9Sb290LmluZGV4T2YoJ2h0dHBzJykgPT09IDAgJiZcclxuICAgICAgICAhdXJpLmluY2x1ZGVzKCdodHRwcycpKSB7XHJcbiAgICAgICAgdXJpID0gdXJpLnJlcGxhY2UoJ2h0dHAnLCAnaHR0cHMnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maWcgPSB7XHJcbiAgICAgICAgdXJsOiBzZXJ2ZXIud2Fkb1Jvb3QsIC8vQnVsa0RhdGFVUkkgaXMgYWJzb2x1dGUsIHNvIHRoaXMgaXNuJ3QgdXNlZFxyXG4gICAgICAgIGhlYWRlcnM6IE9ISUYuRElDT01XZWIuZ2V0QXV0aG9yaXphdGlvbkhlYWRlcigpXHJcbiAgICB9O1xyXG4gICAgY29uc3QgZGljb21XZWIgPSBuZXcgRElDT013ZWJDbGllbnQuYXBpLkRJQ09Nd2ViQ2xpZW50KGNvbmZpZyk7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgIEJ1bGtEYXRhVVJJOiB1cmlcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcmVhZFVJbnQxNiA9IChieXRlQXJyYXksIHBvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGJ5dGVBcnJheVtwb3NpdGlvbl0gKyAoYnl0ZUFycmF5W3Bvc2l0aW9uICsgMV0gKiAyNTYpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFycmF5QnVmZmVyVG9QYWxldHRlQ29sb3JMVVQgPSAoYXJyYXlidWZmZXIpID0+e1xyXG4gICAgICAgIGNvbnN0IGJ5dGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtcclxuICAgICAgICBjb25zdCBsdXQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1MdXRFbnRyaWVzOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGJpdHMgPT09IDE2KSB7XHJcbiAgICAgICAgICAgICAgICBsdXRbaV0gPSByZWFkVUludDE2KGJ5dGVBcnJheSwgaSAqIDIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbHV0W2ldID0gYnl0ZUFycmF5W2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbHV0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkaWNvbVdlYi5yZXRyaWV2ZUJ1bGtEYXRhKG9wdGlvbnMpLnRoZW4oYXJyYXlCdWZmZXJUb1BhbGV0dGVDb2xvckxVVClcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoIHBhbGV0dGUgY29sb3JzIGZvciBpbnN0YW5jZXMgd2l0aCBcIlBBTEVUVEUgQ09MT1JcIiBwaG90b21ldHJpY0ludGVycHJldGF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0gc2VydmVyIHtPYmplY3R9IEN1cnJlbnQgc2VydmVyO1xyXG4gKiBAcGFyYW0gaW5zdGFuY2Uge09iamVjdH0gVGhlIHJldHJpZXZlZCBpbnN0YW5jZSBtZXRhZGF0YTtcclxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFJlZmVyZW5jZVNPUEluc3RhbmNlVUlEXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRQYWxldHRlQ29sb3JzKHNlcnZlciwgaW5zdGFuY2UsIGx1dERlc2NyaXB0b3IpIHtcclxuICAgIGxldCBwYWxldHRlVUlEID0gRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDI4MTE5OSddKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGlmIChwYWxldHRlQ29sb3JDYWNoZS5pc1ZhbGlkVUlEKHBhbGV0dGVVSUQpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gcGFsZXR0ZUNvbG9yQ2FjaGUuZ2V0KHBhbGV0dGVVSUQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShlbnRyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG5vIGVudHJ5IGluIGNhY2hlLi4uIEZldGNoIHJlbW90ZSBkYXRhLlxyXG4gICAgICAgIGNvbnN0IHIgPSBnZXRQYWxldHRlQ29sb3Ioc2VydmVyLCBpbnN0YW5jZSwgJzAwMjgxMjAxJywgbHV0RGVzY3JpcHRvcik7XHJcbiAgICAgICAgY29uc3QgZyA9IGdldFBhbGV0dGVDb2xvcihzZXJ2ZXIsIGluc3RhbmNlLCAnMDAyODEyMDInLCBsdXREZXNjcmlwdG9yKTs7XHJcbiAgICAgICAgY29uc3QgYiA9IGdldFBhbGV0dGVDb2xvcihzZXJ2ZXIsIGluc3RhbmNlLCAnMDAyODEyMDMnLCBsdXREZXNjcmlwdG9yKTs7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW3IsIGcsIGJdO1xyXG5cclxuICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoYXJncykgPT4ge1xyXG4gICAgICAgICAgICBlbnRyeSA9IHtcclxuICAgICAgICAgICAgICAgIHJlZDogYXJnc1swXSxcclxuICAgICAgICAgICAgICAgIGdyZWVuOiBhcmdzWzFdLFxyXG4gICAgICAgICAgICAgICAgYmx1ZTogYXJnc1syXVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gd2hlbiBwYWxldHRlVUlEIGlzIHByZXNlbnQsIHRoZSBlbnRyeSBjYW4gYmUgY2FjaGVkLi4uXHJcbiAgICAgICAgICAgIGVudHJ5LnVpZCA9IHBhbGV0dGVVSUQ7XHJcbiAgICAgICAgICAgIHBhbGV0dGVDb2xvckNhY2hlLmFkZChlbnRyeSk7XHJcblxyXG4gICAgICAgICAgICByZXNvbHZlKGVudHJ5KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGcmFtZUluY3JlbWVudFBvaW50ZXIoZWxlbWVudCkge1xyXG4gICAgY29uc3QgZnJhbWVJbmNyZW1lbnRQb2ludGVyTmFtZXMgPSB7XHJcbiAgICAgICAgJzAwMTgxMDY1JzogJ2ZyYW1lVGltZVZlY3RvcicsXHJcbiAgICAgICAgJzAwMTgxMDYzJzogJ2ZyYW1lVGltZSdcclxuICAgIH07XHJcblxyXG4gICAgaWYoIWVsZW1lbnQgfHwgIWVsZW1lbnQuVmFsdWUgfHwgIWVsZW1lbnQuVmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZWxlbWVudC5WYWx1ZVswXTtcclxuICAgIHJldHVybiBmcmFtZUluY3JlbWVudFBvaW50ZXJOYW1lc1t2YWx1ZV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJhZGlvcGhhcm1hY2V1dGljYWxJbmZvKGluc3RhbmNlKSB7XHJcbiAgICBjb25zdCBtb2RhbGl0eSA9IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwNjAnXSk7XHJcblxyXG4gICAgaWYgKG1vZGFsaXR5ICE9PSAnUFQnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJhZGlvcGhhcm1hY2V1dGljYWxJbmZvID0gaW5zdGFuY2VbJzAwNTQwMDE2J107XHJcbiAgICBpZiAoKHJhZGlvcGhhcm1hY2V1dGljYWxJbmZvID09PSB1bmRlZmluZWQpIHx8ICFyYWRpb3BoYXJtYWNldXRpY2FsSW5mby5WYWx1ZSB8fCAhcmFkaW9waGFybWFjZXV0aWNhbEluZm8uVmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpcnN0UGV0UmFkaW9waGFybWFjZXV0aWNhbEluZm8gPSByYWRpb3BoYXJtYWNldXRpY2FsSW5mby5WYWx1ZVswXTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmFkaW9waGFybWFjZXV0aWNhbFN0YXJ0VGltZTogRElDT01XZWIuZ2V0U3RyaW5nKGZpcnN0UGV0UmFkaW9waGFybWFjZXV0aWNhbEluZm9bJzAwMTgxMDcyJ10pLFxyXG4gICAgICAgIHJhZGlvbnVjbGlkZVRvdGFsRG9zZTogRElDT01XZWIuZ2V0TnVtYmVyKGZpcnN0UGV0UmFkaW9waGFybWFjZXV0aWNhbEluZm9bJzAwMTgxMDc0J10pLFxyXG4gICAgICAgIHJhZGlvbnVjbGlkZUhhbGZMaWZlOiBESUNPTVdlYi5nZXROdW1iZXIoZmlyc3RQZXRSYWRpb3BoYXJtYWNldXRpY2FsSW5mb1snMDAxODEwNzUnXSlcclxuICAgIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJlbGF0aW9uc2hpcFN0cmluZyAoZGF0YSkge1xyXG4gICAgY29uc3QgcmVsYXRpb25zaGlwVHlwZSA9IERJQ09NV2ViLmdldFN0cmluZyhkYXRhWycwMDQwQTAxMCddKTtcclxuXHJcbiAgICBzd2l0Y2ggKHJlbGF0aW9uc2hpcFR5cGUpIHtcclxuICAgICAgICBjYXNlICdIQVMgQ09OQ0VQVCBNT0QnOlxyXG4gICAgICAgICAgICByZXR1cm4gJ0NvbmNlcHQgbW9kaWZpZXI6ICc7XHJcbiAgICAgICAgY2FzZSAnSEFTIE9CUyBDT05URVhUJzpcclxuICAgICAgICAgICByZXR1cm4gJ09ic2VydmF0aW9uIGNvbnRleHQ6ICc7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBnZXROZXN0ZWRPYmplY3QgPSAoZGF0YSkgPT4gZGF0YS5WYWx1ZVswXSB8fCB7fTtcclxuXHJcbmNvbnN0IGdldE1lYW5pbmdTdHJpbmcgPSAoZGF0YSkgPT4gKGRhdGFbJzAwNDBBMDQzJ10gJiYgYCR7RElDT01XZWIuZ2V0U3RyaW5nKGRhdGFbJzAwNDBBMDQzJ10uVmFsdWVbMF1bJzAwMDgwMTA0J10pfSA9IGApIHx8ICcnO1xyXG5cclxuZnVuY3Rpb24gZ2V0VmFsdWVTdHJpbmcgKGRhdGEpIHtcclxuICAgIHN3aXRjaCAoRElDT01XZWIuZ2V0U3RyaW5nKGRhdGFbJzAwNDBBMDQwJ10pKSB7IC8vIFZhbHVlVHlwZVxyXG4gICAgICAgIGNhc2UgJ0NPREUnOlxyXG4gICAgICAgICAgICBjb25zdCBjb25jZXB0Q29kZSA9IGdldE5lc3RlZE9iamVjdChkYXRhWycwMDQwQTE2OCddKTtcclxuICAgICAgICAgICAgY29uc3QgY29uY2VwdENvZGVWYWx1ZSA9IERJQ09NV2ViLmdldFN0cmluZyhjb25jZXB0Q29kZVsnMDAwODAxMDAnXSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmNlcHRDb2RlTWVhbmluZyA9IERJQ09NV2ViLmdldFN0cmluZyhjb25jZXB0Q29kZVsnMDAwODAxMDQnXSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtZURlc2lnbmF0b3IgPSBESUNPTVdlYi5nZXRTdHJpbmcoY29uY2VwdENvZGVbJzAwMDgwMTAyJ10pO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7Y29uY2VwdENvZGVNZWFuaW5nfSAoJHtjb25jZXB0Q29kZVZhbHVlfSwgJHtzY2hlbWVEZXNpZ25hdG9yfSlgO1xyXG5cclxuICAgICAgICBjYXNlICdQTkFNRSc6XHJcbiAgICAgICAgICAgIHJldHVybiBESUNPTVdlYi5nZXROYW1lKGRhdGFbJzAwNDBBMTIzJ10pO1xyXG5cclxuICAgICAgICBjYXNlICdURVhUJzpcclxuICAgICAgICAgICAgcmV0dXJuIERJQ09NV2ViLmdldFN0cmluZyhkYXRhWycwMDQwQTE2MCddKTtcclxuXHJcbiAgICAgICAgY2FzZSAnVUlEUkVGJzpcclxuICAgICAgICAgICAgcmV0dXJuIERJQ09NV2ViLmdldFN0cmluZyhkYXRhWycwMDQwQTEyNCddKTtcclxuXHJcbiAgICAgICAgY2FzZSAnTlVNJzpcclxuICAgICAgICAgICAgY29uc3QgbnVtVmFsdWUgPSBESUNPTVdlYi5nZXRTdHJpbmcoZ2V0TmVzdGVkT2JqZWN0KGRhdGFbJzAwNDBBMzAwJ10pWycwMDQwQTMwQSddKTtcclxuICAgICAgICAgICAgY29uc3QgY29kZVZhbHVlID0gRElDT01XZWIuZ2V0U3RyaW5nKGdldE5lc3RlZE9iamVjdChnZXROZXN0ZWRPYmplY3QoZGF0YVsnMDA0MEEzMDAnXSlbJzAwNDAwOEVBJ10pWycwMDA4MDEwMCddKTtcclxuICAgICAgICAgICAgcmV0dXJuIGAke251bVZhbHVlfSAke2NvZGVWYWx1ZX1gO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb25zdHJ1Y3RQbGFpblZhbHVlKGRhdGEpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gZ2V0VmFsdWVTdHJpbmcoZGF0YSk7XHJcblxyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFJlbGF0aW9uc2hpcFN0cmluZyhkYXRhKSArIGdldE1lYW5pbmdTdHJpbmcoZGF0YSkgKyB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29uc3RydWN0Q29udGVudFNlcXVlbmNlKGRhdGEsIGhlYWRlcikge1xyXG4gICAgaWYgKCFkYXRhWycwMDQwQTczMCddLlZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGl0ZW1zID0gZGF0YVsnMDA0MEE3MzAnXS5WYWx1ZS5tYXAoaXRlbSA9PiBwYXJzZUNvbnRlbnQoaXRlbSkpLmZpbHRlcihpdGVtID0+IGl0ZW0pO1xyXG5cclxuICAgIGlmIChpdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKGhlYWRlcikge1xyXG4gICAgICAgICAgICByZXN1bHQuaGVhZGVyID0gaGVhZGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlY3Vyc2l2ZWx5IHBhcnNlcyBjb250ZW50IHNlcXVlbmNlIGZvciBzdHJ1Y3R1cmVkIHJlcG9ydHNcclxuICpcclxuICogQHBhcmFtIGluc3RhbmNlIFRoZSBpbnN0YW5jZVxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IFNlcmllcyBMaXN0XHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gcGFyc2VDb250ZW50KGluc3RhbmNlKSB7XHJcbiAgICBpZiAoaW5zdGFuY2VbJzAwNDBBMDQwJ10pIHsgLy8gVmFsdWVUeXBlXHJcbiAgICAgICAgaWYgKERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDA0MEEwNDAnXSkgPT09ICdDT05UQUlORVInKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IERJQ09NV2ViLmdldFN0cmluZyhnZXROZXN0ZWRPYmplY3QoaW5zdGFuY2VbJzAwNDBBMDQzJ10pWycwMDA4MDEwNCddKTsgLy8gVE9ETzogY2hlY2sgd2l0aCByZWFsIGRhdGFcclxuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdENvbnRlbnRTZXF1ZW5jZShpbnN0YW5jZSwgaGVhZGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3RQbGFpblZhbHVlKGluc3RhbmNlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5zdGFuY2VbJzAwNDBBNzMwJ10pIHsgLy9Db250ZW50U2VxdWVuY2VcclxuICAgICAgICByZXR1cm4gY29uc3RydWN0Q29udGVudFNlcXVlbmNlKGluc3RhbmNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TW9kYWxpdHkoaW5zdGFuY2UpIHtcclxuICAgIGNvbnN0IG1vZGFsaXR5ID0gRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MDA2MCddKTtcclxuICAgIHJldHVybiBtb2RhbGl0eSB8fCAoISFpbnN0YW5jZVsnMDA0MEE3MzAnXSAmJiAnU1InKSB8fCB1bmRlZmluZWQ7IC8vIEZJWE1FOiBkaXJ0eSwgZGlydHkgaGFjaywgd2UgdXNlXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENvbnRlbnREYXRlVGltZShpbnN0YW5jZSkge1xyXG4gICAgY29uc3QgZGF0ZSA9IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwMjMnXSk7XHJcbiAgICBjb25zdCB0aW1lID0gRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MDAzMyddKTtcclxuXHJcbiAgICBpZiAoZGF0ZSAmJiB0aW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke2RhdGUuc3Vic3RyKDAsIDQpfS0ke2RhdGUuc3Vic3RyKDQsIDIpfS0ke2RhdGUuc3Vic3RyKDYsIDIpfSAke3RpbWUuc3Vic3RyKDAsIDIpfToke3RpbWUuc3Vic3RyKDIsIDIpfToke3RpbWUuc3Vic3RyKDQsIDIpfWA7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgcmVzdWx0IGRhdGEgZnJvbSBhIFdBRE8gc2VhcmNoIGludG8gU3R1ZHkgTWV0YURhdGFcclxuICogUmV0dXJucyBhbiBvYmplY3QgcG9wdWxhdGVkIHdpdGggc3R1ZHkgbWV0YWRhdGEsIGluY2x1ZGluZyB0aGVcclxuICogc2VyaWVzIGxpc3QuXHJcbiAqXHJcbiAqIEBwYXJhbSBzZXJ2ZXJcclxuICogQHBhcmFtIHN0dWR5SW5zdGFuY2VVaWRcclxuICogQHBhcmFtIHJlc3VsdERhdGFcclxuICogQHJldHVybnMge3tzZXJpZXNMaXN0OiBBcnJheSwgcGF0aWVudE5hbWU6ICosIHBhdGllbnRJZDogKiwgYWNjZXNzaW9uTnVtYmVyOiAqLCBzdHVkeURhdGU6ICosIG1vZGFsaXRpZXM6ICosIHN0dWR5RGVzY3JpcHRpb246ICosIGltYWdlQ291bnQ6ICosIHN0dWR5SW5zdGFuY2VVaWQ6ICp9fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcmVzdWx0RGF0YVRvU3R1ZHlNZXRhZGF0YShzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQsIHJlc3VsdERhdGEpIHtcclxuICAgIGlmICghcmVzdWx0RGF0YS5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYW5JbnN0YW5jZSA9IHJlc3VsdERhdGFbMF07XHJcbiAgICBpZiAoIWFuSW5zdGFuY2UpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3R1ZHlEYXRhID0ge1xyXG4gICAgICAgIHNlcmllc0xpc3Q6IFtdLFxyXG4gICAgICAgIHN0dWR5SW5zdGFuY2VVaWQsXHJcbiAgICAgICAgd2Fkb1VyaVJvb3Q6IHNlcnZlci53YWRvVXJpUm9vdCxcclxuICAgICAgICBwYXRpZW50TmFtZTogRElDT01XZWIuZ2V0TmFtZShhbkluc3RhbmNlWycwMDEwMDAxMCddKSxcclxuICAgICAgICBwYXRpZW50SWQ6IERJQ09NV2ViLmdldFN0cmluZyhhbkluc3RhbmNlWycwMDEwMDAyMCddKSxcclxuICAgICAgICBwYXRpZW50QWdlOiBESUNPTVdlYi5nZXROdW1iZXIoYW5JbnN0YW5jZVsnMDAxMDEwMTAnXSksXHJcbiAgICAgICAgcGF0aWVudFNpemU6IERJQ09NV2ViLmdldE51bWJlcihhbkluc3RhbmNlWycwMDEwMTAyMCddKSxcclxuICAgICAgICBwYXRpZW50V2VpZ2h0OiBESUNPTVdlYi5nZXROdW1iZXIoYW5JbnN0YW5jZVsnMDAxMDEwMzAnXSksXHJcbiAgICAgICAgYWNjZXNzaW9uTnVtYmVyOiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAwODAwNTAnXSksXHJcbiAgICAgICAgc3R1ZHlEYXRlOiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAwODAwMjAnXSksXHJcbiAgICAgICAgbW9kYWxpdGllczogRElDT01XZWIuZ2V0U3RyaW5nKGFuSW5zdGFuY2VbJzAwMDgwMDYxJ10pLFxyXG4gICAgICAgIHN0dWR5RGVzY3JpcHRpb246IERJQ09NV2ViLmdldFN0cmluZyhhbkluc3RhbmNlWycwMDA4MTAzMCddKSxcclxuICAgICAgICBpbWFnZUNvdW50OiBESUNPTVdlYi5nZXRTdHJpbmcoYW5JbnN0YW5jZVsnMDAyMDEyMDgnXSksXHJcbiAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogRElDT01XZWIuZ2V0U3RyaW5nKGFuSW5zdGFuY2VbJzAwMjAwMDBEJ10pLFxyXG4gICAgICAgIGluc3RpdHV0aW9uTmFtZTogRElDT01XZWIuZ2V0U3RyaW5nKGFuSW5zdGFuY2VbJzAwMDgwMDgwJ10pXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNlcmllc01hcCA9IHt9O1xyXG5cclxuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlc3VsdERhdGEubWFwKGFzeW5jIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzSW5zdGFuY2VVaWQgPSBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMjAwMDBFJ10pO1xyXG4gICAgICAgIGxldCBzZXJpZXMgPSBzZXJpZXNNYXBbc2VyaWVzSW5zdGFuY2VVaWRdO1xyXG4gICAgICAgIGNvbnN0IG1vZGFsaXR5ID0gZ2V0TW9kYWxpdHkoaW5zdGFuY2UpO1xyXG5cclxuICAgICAgICBpZiAoIXNlcmllcykge1xyXG4gICAgICAgICAgICBzZXJpZXMgPSB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNEZXNjcmlwdGlvbjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MTAzRSddKSxcclxuICAgICAgICAgICAgICAgIG1vZGFsaXR5LFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzSW5zdGFuY2VVaWQ6IHNlcmllc0luc3RhbmNlVWlkLFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzTnVtYmVyOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjAwMDExJ10pLFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzRGF0ZTogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MDAyMSddKSxcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpbWU6IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwMzEnXSksXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZXM6IFtdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNlcmllc01hcFtzZXJpZXNJbnN0YW5jZVVpZF0gPSBzZXJpZXM7XHJcbiAgICAgICAgICAgIHN0dWR5RGF0YS5zZXJpZXNMaXN0LnB1c2goc2VyaWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNvcEluc3RhbmNlVWlkID0gRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MDAxOCddKTtcclxuICAgICAgICBjb25zdCB3YWRvdXJpID0gYnVpbGRJbnN0YW5jZVdhZG9Vcmwoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQpO1xyXG4gICAgICAgIGNvbnN0IGJhc2VXYWRvUnNVcmkgPSBidWlsZEluc3RhbmNlV2Fkb1JzVXJpKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCwgc2VyaWVzSW5zdGFuY2VVaWQsIHNvcEluc3RhbmNlVWlkKTtcclxuICAgICAgICBjb25zdCB3YWRvcnN1cmkgPSBidWlsZEluc3RhbmNlRnJhbWVXYWRvUnNVcmkoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkLCBzZXJpZXNJbnN0YW5jZVVpZCwgc29wSW5zdGFuY2VVaWQpO1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlU3VtbWFyeSA9IHtcclxuICAgICAgICAgICAgY29udGVudFNlcXVlbmNlOiBwYXJzZUNvbnRlbnQoaW5zdGFuY2UpLFxyXG4gICAgICAgICAgICBjb21wbGV0aW9uRmxhZzogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDQwQTQ5MSddKSxcclxuICAgICAgICAgICAgbWFudWZhY3R1cmVyOiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMDgwMDcwJ10pLFxyXG4gICAgICAgICAgICB2ZXJpZmljYXRpb25GbGFnOiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwNDBBNDkzJ10pLFxyXG4gICAgICAgICAgICBjb250ZW50RGF0ZVRpbWU6IGdldENvbnRlbnREYXRlVGltZShpbnN0YW5jZSksXHJcbiAgICAgICAgICAgIGltYWdlVHlwZTogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDA4MDAwOCddKSxcclxuICAgICAgICAgICAgc29wQ2xhc3NVaWQ6IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwMTYnXSksXHJcbiAgICAgICAgICAgIG1vZGFsaXR5LFxyXG4gICAgICAgICAgICBzb3BJbnN0YW5jZVVpZCxcclxuICAgICAgICAgICAgaW5zdGFuY2VOdW1iZXI6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyMDAwMTMnXSksXHJcbiAgICAgICAgICAgIGltYWdlUG9zaXRpb25QYXRpZW50OiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMjAwMDMyJ10pLFxyXG4gICAgICAgICAgICBpbWFnZU9yaWVudGF0aW9uUGF0aWVudDogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDIwMDAzNyddKSxcclxuICAgICAgICAgICAgZnJhbWVPZlJlZmVyZW5jZVVJRDogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDIwMDA1MiddKSxcclxuICAgICAgICAgICAgc2xpY2VMb2NhdGlvbjogRElDT01XZWIuZ2V0TnVtYmVyKGluc3RhbmNlWycwMDIwMTA0MSddKSxcclxuICAgICAgICAgICAgc2FtcGxlc1BlclBpeGVsOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjgwMDAyJ10pLFxyXG4gICAgICAgICAgICBwaG90b21ldHJpY0ludGVycHJldGF0aW9uOiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMjgwMDA0J10pLFxyXG4gICAgICAgICAgICBwbGFuYXJDb25maWd1cmF0aW9uOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjgwMDA2J10pLFxyXG4gICAgICAgICAgICByb3dzOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjgwMDEwJ10pLFxyXG4gICAgICAgICAgICBjb2x1bW5zOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjgwMDExJ10pLFxyXG4gICAgICAgICAgICBwaXhlbFNwYWNpbmc6IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODAwMzAnXSksXHJcbiAgICAgICAgICAgIHBpeGVsQXNwZWN0UmF0aW86IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODAwMzQnXSksXHJcbiAgICAgICAgICAgIGJpdHNBbGxvY2F0ZWQ6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODAxMDAnXSksXHJcbiAgICAgICAgICAgIGJpdHNTdG9yZWQ6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODAxMDEnXSksXHJcbiAgICAgICAgICAgIGhpZ2hCaXQ6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODAxMDInXSksXHJcbiAgICAgICAgICAgIHBpeGVsUmVwcmVzZW50YXRpb246IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODAxMDMnXSksXHJcbiAgICAgICAgICAgIHNtYWxsZXN0UGl4ZWxWYWx1ZTogRElDT01XZWIuZ2V0TnVtYmVyKGluc3RhbmNlWycwMDI4MDEwNiddKSxcclxuICAgICAgICAgICAgbGFyZ2VzdFBpeGVsVmFsdWU6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODAxMDcnXSksXHJcbiAgICAgICAgICAgIHdpbmRvd0NlbnRlcjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDI4MTA1MCddKSxcclxuICAgICAgICAgICAgd2luZG93V2lkdGg6IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODEwNTEnXSksXHJcbiAgICAgICAgICAgIHJlc2NhbGVJbnRlcmNlcHQ6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODEwNTInXSksXHJcbiAgICAgICAgICAgIHJlc2NhbGVTbG9wZTogRElDT01XZWIuZ2V0TnVtYmVyKGluc3RhbmNlWycwMDI4MTA1MyddKSxcclxuICAgICAgICAgICAgcmVzY2FsZVR5cGU6IERJQ09NV2ViLmdldE51bWJlcihpbnN0YW5jZVsnMDAyODEwNTQnXSksXHJcbiAgICAgICAgICAgIHNvdXJjZUltYWdlSW5zdGFuY2VVaWQ6IGdldFNvdXJjZUltYWdlSW5zdGFuY2VVaWQoaW5zdGFuY2UpLFxyXG4gICAgICAgICAgICBsYXRlcmFsaXR5OiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMjAwMDYyJ10pLFxyXG4gICAgICAgICAgICB2aWV3UG9zaXRpb246IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAxODUxMDEnXSksXHJcbiAgICAgICAgICAgIGFjcXVpc2l0aW9uRGF0ZVRpbWU6IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAwODAwMkEnXSksXHJcbiAgICAgICAgICAgIG51bWJlck9mRnJhbWVzOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMjgwMDA4J10pLFxyXG4gICAgICAgICAgICBmcmFtZUluY3JlbWVudFBvaW50ZXI6IGdldEZyYW1lSW5jcmVtZW50UG9pbnRlcihpbnN0YW5jZVsnMDAyODAwMDknXSksXHJcbiAgICAgICAgICAgIGZyYW1lVGltZTogRElDT01XZWIuZ2V0TnVtYmVyKGluc3RhbmNlWycwMDE4MTA2MyddKSxcclxuICAgICAgICAgICAgZnJhbWVUaW1lVmVjdG9yOiBwYXJzZUZsb2F0QXJyYXkoRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDE4MTA2NSddKSksXHJcbiAgICAgICAgICAgIHNsaWNlVGhpY2tuZXNzOiBESUNPTVdlYi5nZXROdW1iZXIoaW5zdGFuY2VbJzAwMTgwMDUwJ10pLFxyXG4gICAgICAgICAgICBsb3NzeUltYWdlQ29tcHJlc3Npb246IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODIxMTAnXSksXHJcbiAgICAgICAgICAgIGRlcml2YXRpb25EZXNjcmlwdGlvbjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDI4MjExMSddKSxcclxuICAgICAgICAgICAgbG9zc3lJbWFnZUNvbXByZXNzaW9uUmF0aW86IERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODIxMTInXSksXHJcbiAgICAgICAgICAgIGxvc3N5SW1hZ2VDb21wcmVzc2lvbk1ldGhvZDogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDI4MjExNCddKSxcclxuICAgICAgICAgICAgZWNob051bWJlcjogRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDE4MDA4NiddKSxcclxuICAgICAgICAgICAgY29udHJhc3RCb2x1c0FnZW50OiBESUNPTVdlYi5nZXRTdHJpbmcoaW5zdGFuY2VbJzAwMTgwMDEwJ10pLFxyXG4gICAgICAgICAgICByYWRpb3BoYXJtYWNldXRpY2FsSW5mbzogZ2V0UmFkaW9waGFybWFjZXV0aWNhbEluZm8oaW5zdGFuY2UpLFxyXG4gICAgICAgICAgICBiYXNlV2Fkb1JzVXJpOiBiYXNlV2Fkb1JzVXJpLFxyXG4gICAgICAgICAgICB3YWRvdXJpOiBXQURPUHJveHkuY29udmVydFVSTCh3YWRvdXJpLCBzZXJ2ZXIpLFxyXG4gICAgICAgICAgICB3YWRvcnN1cmk6IFdBRE9Qcm94eS5jb252ZXJ0VVJMKHdhZG9yc3VyaSwgc2VydmVyKSxcclxuICAgICAgICAgICAgaW1hZ2VSZW5kZXJpbmc6IHNlcnZlci5pbWFnZVJlbmRlcmluZyxcclxuICAgICAgICAgICAgdGh1bWJuYWlsUmVuZGVyaW5nOiBzZXJ2ZXIudGh1bWJuYWlsUmVuZGVyaW5nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gR2V0IGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gaWYgdGhlIGluc3RhbmNlIHVzZXMgXCJQQUxFVFRFIENPTE9SXCIgcGhvdG9tZXRyaWMgaW50ZXJwcmV0YXRpb25cclxuICAgICAgICBpZiAoaW5zdGFuY2VTdW1tYXJ5LnBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24gPT09ICdQQUxFVFRFIENPTE9SJykge1xyXG4gICAgICAgICAgICBjb25zdCByZWRQYWxldHRlQ29sb3JMb29rdXBUYWJsZURlc2NyaXB0b3IgPSBwYXJzZUZsb2F0QXJyYXkoRElDT01XZWIuZ2V0U3RyaW5nKGluc3RhbmNlWycwMDI4MTEwMSddKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGdyZWVuUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yID0gcGFyc2VGbG9hdEFycmF5KERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODExMDInXSkpO1xyXG4gICAgICAgICAgICBjb25zdCBibHVlUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yID0gcGFyc2VGbG9hdEFycmF5KERJQ09NV2ViLmdldFN0cmluZyhpbnN0YW5jZVsnMDAyODExMDMnXSkpO1xyXG4gICAgICAgICAgICBjb25zdCBwYWxldHRlcyA9IGF3YWl0IGdldFBhbGV0dGVDb2xvcnMoc2VydmVyLCBpbnN0YW5jZSwgcmVkUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYWxldHRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhbGV0dGVzLnVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlU3VtbWFyeS5wYWxldHRlQ29sb3JMb29rdXBUYWJsZVVJRCA9IHBhbGV0dGVzLnVpZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVN1bW1hcnkucmVkUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEYXRhID0gcGFsZXR0ZXMucmVkO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VTdW1tYXJ5LmdyZWVuUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEYXRhID0gcGFsZXR0ZXMuZ3JlZW47XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVN1bW1hcnkuYmx1ZVBhbGV0dGVDb2xvckxvb2t1cFRhYmxlRGF0YSA9IHBhbGV0dGVzLmJsdWU7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVN1bW1hcnkucmVkUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yID0gcmVkUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VTdW1tYXJ5LmdyZWVuUGFsZXR0ZUNvbG9yTG9va3VwVGFibGVEZXNjcmlwdG9yID0gZ3JlZW5QYWxldHRlQ29sb3JMb29rdXBUYWJsZURlc2NyaXB0b3I7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVN1bW1hcnkuYmx1ZVBhbGV0dGVDb2xvckxvb2t1cFRhYmxlRGVzY3JpcHRvciA9IGJsdWVQYWxldHRlQ29sb3JMb29rdXBUYWJsZURlc2NyaXB0b3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlcmllcy5pbnN0YW5jZXMucHVzaChpbnN0YW5jZVN1bW1hcnkpO1xyXG4gICAgfSkpO1xyXG4gICAgcmV0dXJuIHN0dWR5RGF0YTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlIFN0dWR5IE1ldGFEYXRhIGZyb20gYSBESUNPTSBzZXJ2ZXIgdXNpbmcgYSBXQURPIGNhbGxcclxuICpcclxuICogQHBhcmFtIHNlcnZlclxyXG4gKiBAcGFyYW0gc3R1ZHlJbnN0YW5jZVVpZFxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbk9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5XQURPLlJldHJpZXZlTWV0YWRhdGEgPSBhc3luYyBmdW5jdGlvbihzZXJ2ZXIsIHN0dWR5SW5zdGFuY2VVaWQpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHtcclxuICAgICAgICB1cmw6IHNlcnZlci53YWRvUm9vdCxcclxuICAgICAgICBoZWFkZXJzOiBPSElGLkRJQ09NV2ViLmdldEF1dGhvcml6YXRpb25IZWFkZXIoKVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGRpY29tV2ViID0gbmV3IERJQ09Nd2ViQ2xpZW50LmFwaS5ESUNPTXdlYkNsaWVudChjb25maWcpO1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICBzdHVkeUluc3RhbmNlVUlEOiBzdHVkeUluc3RhbmNlVWlkXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBkaWNvbVdlYi5yZXRyaWV2ZVN0dWR5TWV0YWRhdGEob3B0aW9ucykudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgIHJldHVybiByZXN1bHREYXRhVG9TdHVkeU1ldGFkYXRhKHNlcnZlciwgc3R1ZHlJbnN0YW5jZVVpZCwgcmVzdWx0KTtcclxuICAgIH0pO1xyXG59O1xyXG4iLCJpbXBvcnQgJy4vbWV0aG9kcyc7XHJcbmltcG9ydCAnLi9zZXJ2aWNlcyc7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5NZXRlb3IubWV0aG9kcyh7XHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBTdHVkeSBtZXRhZGF0YSBnaXZlbiBhIFN0dWR5IEluc3RhbmNlIFVJRFxyXG4gICAgICogVGhpcyBNZXRlb3IgbWV0aG9kIGlzIGF2YWlsYWJsZSBmcm9tIGJvdGggdGhlIGNsaWVudCBhbmQgdGhlIHNlcnZlclxyXG4gICAgICovXHJcbiAgICBHZXRTdHVkeU1ldGFkYXRhOiBmdW5jdGlvbihzdHVkeUluc3RhbmNlVWlkKSB7XHJcbiAgICAgICAgT0hJRi5sb2cuaW5mbygnR2V0U3R1ZHlNZXRhZGF0YSglcyknLCBzdHVkeUluc3RhbmNlVWlkKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBzZXJ2ZXIgZGF0YS4gVGhpcyBpcyB1c2VyLWRlZmluZWQgaW4gdGhlIGNvbmZpZy5qc29uIGZpbGVzIG9yIHRocm91Z2ggc2VydmVyc1xyXG4gICAgICAgIC8vIGNvbmZpZ3VyYXRpb24gbW9kYWxcclxuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBPSElGLnNlcnZlcnMuZ2V0Q3VycmVudFNlcnZlcigpO1xyXG4gICAgICAgIGlmICghc2VydmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ltcHJvcGVyLXNlcnZlci1jb25maWcnLCAnTm8gcHJvcGVybHkgY29uZmlndXJlZCBzZXJ2ZXIgd2FzIGF2YWlsYWJsZSBvdmVyIERJQ09NV2ViIG9yIERJTVNFLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHNlcnZlci50eXBlID09PSAnZGljb21XZWInKSB7XHJcbiAgICAgICAgICAgICAgICBpZihzZXJ2ZXIubWV0YWRhdGFTb3VyY2UgPT09J3FpZG8nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5RSURPLlJldHJpZXZlTWV0YWRhdGEoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5XQURPLlJldHJpZXZlTWV0YWRhdGEoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzZXJ2ZXIudHlwZSA9PT0gJ2RpbXNlJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5ESU1TRS5SZXRyaWV2ZU1ldGFkYXRhKHN0dWR5SW5zdGFuY2VVaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgT0hJRi5sb2cudHJhY2UoKTtcclxuXHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsImltcG9ydCAnLi9nZXRTdHVkeU1ldGFkYXRhLmpzJztcclxuaW1wb3J0ICcuL3N0dWR5bGlzdFNlYXJjaC5qcyc7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5NZXRlb3IubWV0aG9kcyh7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSB0aGUgc3BlY2lmaWVkIGZpbHRlciB0byBjb25kdWN0IGEgc2VhcmNoIGZyb20gdGhlIERJQ09NIHNlcnZlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmaWx0ZXJcclxuICAgICAqL1xyXG4gICAgU3R1ZHlMaXN0U2VhcmNoKGZpbHRlcikge1xyXG4gICAgICAgIC8vIEdldCB0aGUgc2VydmVyIGRhdGEuIFRoaXMgaXMgdXNlci1kZWZpbmVkIGluIHRoZSBjb25maWcuanNvbiBmaWxlcyBvciB0aHJvdWdoIHNlcnZlcnNcclxuICAgICAgICAvLyBjb25maWd1cmF0aW9uIG1vZGFsXHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gT0hJRi5zZXJ2ZXJzLmdldEN1cnJlbnRTZXJ2ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKCFzZXJ2ZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW1wcm9wZXItc2VydmVyLWNvbmZpZycsICdObyBwcm9wZXJseSBjb25maWd1cmVkIHNlcnZlciB3YXMgYXZhaWxhYmxlIG92ZXIgRElDT01XZWIgb3IgRElNU0UuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoc2VydmVyLnR5cGUgPT09ICdkaWNvbVdlYicpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBPSElGLnN0dWRpZXMuc2VydmljZXMuUUlETy5TdHVkaWVzKHNlcnZlciwgZmlsdGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzZXJ2ZXIudHlwZSA9PT0gJ2RpbXNlJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9ISUYuc3R1ZGllcy5zZXJ2aWNlcy5ESU1TRS5TdHVkaWVzKGZpbHRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBPSElGLmxvZy50cmFjZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiaW1wb3J0ICcuL25hbWVzcGFjZS5qcyc7XHJcblxyXG4vLyBESU1TRSBpbnN0YW5jZSwgc3R1ZHksIGFuZCBtZXRhZGF0YSByZXRyaWV2YWxcclxuaW1wb3J0ICcuL2RpbXNlL2luc3RhbmNlcy5qcyc7XHJcbmltcG9ydCAnLi9kaW1zZS9zdHVkaWVzLmpzJztcclxuaW1wb3J0ICcuL2RpbXNlL3JldHJpZXZlTWV0YWRhdGEuanMnO1xyXG5pbXBvcnQgJy4vZGltc2Uvc2V0dXAuanMnO1xyXG4iLCJpbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG5PSElGLnN0dWRpZXMuc2VydmljZXMuRElNU0UgPSB7fTtcclxuIiwiaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5pbXBvcnQgRElNU0UgZnJvbSAnZGltc2UnO1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyBkYXRhIHJldHVybmVkIGZyb20gYSBzdHVkeSBzZWFyY2ggYW5kIHRyYW5zZm9ybXMgaXQgaW50b1xyXG4gKiBhbiBhcnJheSBvZiBzZXJpZXMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgc3R1ZHlcclxuICpcclxuICogQHBhcmFtIHJlc3VsdERhdGFcclxuICogQHBhcmFtIHN0dWR5SW5zdGFuY2VVaWRcclxuICogQHJldHVybnMge0FycmF5fSBTZXJpZXMgTGlzdFxyXG4gKi9cclxuZnVuY3Rpb24gcmVzdWx0RGF0YVRvU3R1ZHlNZXRhZGF0YShyZXN1bHREYXRhLCBzdHVkeUluc3RhbmNlVWlkKSB7XHJcbiAgICBjb25zdCBzZXJpZXNNYXAgPSB7fTtcclxuICAgIGNvbnN0IHNlcmllc0xpc3QgPSBbXTtcclxuXHJcbiAgICByZXN1bHREYXRhLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2VSYXcpIHtcclxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGluc3RhbmNlUmF3LnRvT2JqZWN0KCk7XHJcbiAgICAgICAgLy8gVXNlIHNlcmllc01hcCB0byBjYWNoZSBzZXJpZXMgZGF0YVxyXG4gICAgICAgIC8vIElmIHRoZSBzZXJpZXMgaW5zdGFuY2UgVUlEIGhhcyBhbHJlYWR5IGJlZW4gdXNlZCB0b1xyXG4gICAgICAgIC8vIHByb2Nlc3Mgc2VyaWVzIGRhdGEsIGNvbnRpbnVlIHVzaW5nIHRoYXQgc2VyaWVzXHJcbiAgICAgICAgY29uc3Qgc2VyaWVzSW5zdGFuY2VVaWQgPSBpbnN0YW5jZVsweDAwMjAwMDBFXTtcclxuICAgICAgICBsZXQgc2VyaWVzID0gc2VyaWVzTWFwW3Nlcmllc0luc3RhbmNlVWlkXTtcclxuXHJcbiAgICAgICAgLy8gSWYgbm8gc2VyaWVzIGRhdGEgZXhpc3RzIGluIHRoZSBzZXJpZXNNYXAgY2FjaGUgdmFyaWFibGUsXHJcbiAgICAgICAgLy8gcHJvY2VzcyBhbnkgYXZhaWxhYmxlIHNlcmllcyBkYXRhXHJcbiAgICAgICAgaWYgKCFzZXJpZXMpIHtcclxuICAgICAgICAgICAgc2VyaWVzID0ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzSW5zdGFuY2VVaWQ6IHNlcmllc0luc3RhbmNlVWlkLFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzTnVtYmVyOiBpbnN0YW5jZVsweDAwMjAwMDExXSxcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlczogW11cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgdGhpcyBkYXRhIGluIHRoZSBzZXJpZXNNYXAgY2FjaGUgdmFyaWFibGVcclxuICAgICAgICAgICAgc2VyaWVzTWFwW3Nlcmllc0luc3RhbmNlVWlkXSA9IHNlcmllcztcclxuICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBDaGVjayB3aGljaCBwZWVyIGl0IHNob3VsZCBwb2ludCB0b1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IE9ISUYuc2VydmVycy5nZXRDdXJyZW50U2VydmVyKCkucGVlcnNbMF07XHJcblxyXG4gICAgICAgIGNvbnN0IHNlcnZlclJvb3QgPSBzZXJ2ZXIuaG9zdCArICc6JyArIHNlcnZlci5wb3J0O1xyXG5cclxuICAgICAgICBjb25zdCBzb3BJbnN0YW5jZVVpZCA9IGluc3RhbmNlWzB4MDAwODAwMThdO1xyXG4gICAgICAgIGNvbnN0IHVyaSA9IHNlcnZlclJvb3QgKyAnL3N0dWRpZXMvJyArIHN0dWR5SW5zdGFuY2VVaWQgKyAnL3Nlcmllcy8nICsgc2VyaWVzSW5zdGFuY2VVaWQgKyAnL2luc3RhbmNlcy8nICsgc29wSW5zdGFuY2VVaWQgKyAnL2ZyYW1lcy8xJztcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGN1cnJlbnQgc2VyaWVzXHJcbiAgICAgICAgc2VyaWVzLmluc3RhbmNlcy5wdXNoKHtcclxuICAgICAgICAgICAgc29wQ2xhc3NVaWQ6IGluc3RhbmNlWzB4MDAwODAwMTZdLFxyXG4gICAgICAgICAgICBzb3BJbnN0YW5jZVVpZCxcclxuICAgICAgICAgICAgdXJpLFxyXG4gICAgICAgICAgICBpbnN0YW5jZU51bWJlcjogaW5zdGFuY2VbMHgwMDIwMDAxM11cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZSBhIHNldCBvZiBpbnN0YW5jZXMgdXNpbmcgYSBESU1TRSBjYWxsXHJcbiAqIEBwYXJhbSBzdHVkeUluc3RhbmNlVWlkXHJcbiAqIEByZXR1cm5zIHt7d2Fkb1VyaVJvb3Q6IFN0cmluZywgc3R1ZHlJbnN0YW5jZVVpZDogU3RyaW5nLCBzZXJpZXNMaXN0OiBBcnJheX19XHJcbiAqL1xyXG5PSElGLnN0dWRpZXMuc2VydmljZXMuRElNU0UuSW5zdGFuY2VzID0gZnVuY3Rpb24oc3R1ZHlJbnN0YW5jZVVpZCkge1xyXG4gICAgLy92YXIgdXJsID0gYnVpbGRVcmwoc2VydmVyLCBzdHVkeUluc3RhbmNlVWlkKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IERJTVNFLnJldHJpZXZlSW5zdGFuY2VzKHN0dWR5SW5zdGFuY2VVaWQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogc3R1ZHlJbnN0YW5jZVVpZCxcclxuICAgICAgICBzZXJpZXNMaXN0OiByZXN1bHREYXRhVG9TdHVkeU1ldGFkYXRhKHJlc3VsdCwgc3R1ZHlJbnN0YW5jZVVpZClcclxuICAgIH07XHJcbn07XHJcbiIsImltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgcGFyc2VGbG9hdEFycmF5IH0gZnJvbSAnbWV0ZW9yL29oaWY6c3R1ZGllcy9pbXBvcnRzL2JvdGgvbGliL3BhcnNlRmxvYXRBcnJheSc7XHJcbmltcG9ydCBESU1TRSBmcm9tICdkaW1zZSc7XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgKGUuZy4gJzAwMjgwMDA5JylcclxuICpcclxuICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgZ3JvdXAvZWxlbWVudCBvZiB0aGUgZWxlbWVudCAoZS5nLiAnMDAyODAwMDknKVxyXG4gKiBAcGFyYW0gZGVmYXVsdFZhbHVlIC0gVGhlIGRlZmF1bHQgdmFsdWUgdG8gcmV0dXJuIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0XHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0VmFsdWUoZWxlbWVudCwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQudmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2VzIHRoZSBTb3VyY2VJbWFnZVNlcXVlbmNlLCBpZiBpdCBleGlzdHMsIGluIG9yZGVyXHJcbiAqIHRvIHJldHVybiBhIFJlZmVyZW5jZVNPUEluc3RhbmNlVUlELiBUaGUgUmVmZXJlbmNlU09QSW5zdGFuY2VVSURcclxuICogaXMgdXNlZCB0byByZWZlciB0byB0aGlzIGltYWdlIGluIGFueSBhY2NvbXBhbnlpbmcgRElDT00tU1IgZG9jdW1lbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0gaW5zdGFuY2VcclxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFJlZmVyZW5jZVNPUEluc3RhbmNlVUlEXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTb3VyY2VJbWFnZUluc3RhbmNlVWlkKGluc3RhbmNlKSB7XHJcbiAgICAvLyBUT0RPPSBQYXJzZSB0aGUgd2hvbGUgU291cmNlIEltYWdlIFNlcXVlbmNlXHJcbiAgICAvLyBUaGlzIGlzIGEgcmVhbGx5IHBvb3Igd29ya2Fyb3VuZCBmb3Igbm93LlxyXG4gICAgLy8gTGF0ZXIgd2Ugc2hvdWxkIHByb2JhYmx5IHBhcnNlIHRoZSB3aG9sZSBzZXF1ZW5jZS5cclxuICAgIGNvbnN0IFNvdXJjZUltYWdlU2VxdWVuY2UgPSBpbnN0YW5jZVsweDAwMDgyMTEyXTtcclxuICAgIGlmIChTb3VyY2VJbWFnZVNlcXVlbmNlICYmIFNvdXJjZUltYWdlU2VxdWVuY2UubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIFNvdXJjZUltYWdlU2VxdWVuY2VbMF1bMHgwMDA4MTE1NV07XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgcmVzdWx0IGRhdGEgZnJvbSBhIERJTVNFIHNlYXJjaCBpbnRvIFN0dWR5IE1ldGFEYXRhXHJcbiAqIFJldHVybnMgYW4gb2JqZWN0IHBvcHVsYXRlZCB3aXRoIHN0dWR5IG1ldGFkYXRhLCBpbmNsdWRpbmcgdGhlXHJcbiAqIHNlcmllcyBsaXN0LlxyXG4gKlxyXG4gKiBAcGFyYW0gc3R1ZHlJbnN0YW5jZVVpZFxyXG4gKiBAcGFyYW0gcmVzdWx0RGF0YVxyXG4gKiBAcmV0dXJucyB7e3Nlcmllc0xpc3Q6IEFycmF5LCBwYXRpZW50TmFtZTogKiwgcGF0aWVudElkOiAqLCBhY2Nlc3Npb25OdW1iZXI6ICosIHN0dWR5RGF0ZTogKiwgbW9kYWxpdGllczogKiwgc3R1ZHlEZXNjcmlwdGlvbjogKiwgaW1hZ2VDb3VudDogKiwgc3R1ZHlJbnN0YW5jZVVpZDogKn19XHJcbiAqL1xyXG5mdW5jdGlvbiByZXN1bHREYXRhVG9TdHVkeU1ldGFkYXRhKHN0dWR5SW5zdGFuY2VVaWQsIHJlc3VsdERhdGEpIHtcclxuICAgIE9ISUYubG9nLmluZm8oJ3Jlc3VsdERhdGFUb1N0dWR5TWV0YWRhdGEnKTtcclxuICAgIGNvbnN0IHNlcmllc01hcCA9IHt9O1xyXG4gICAgY29uc3Qgc2VyaWVzTGlzdCA9IFtdO1xyXG5cclxuICAgIGlmICghcmVzdWx0RGF0YS5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYW5JbnN0YW5jZSA9IHJlc3VsdERhdGFbMF0udG9PYmplY3QoKTtcclxuICAgIGlmICghYW5JbnN0YW5jZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdHVkeURhdGEgPSB7XHJcbiAgICAgICAgc2VyaWVzTGlzdDogc2VyaWVzTGlzdCxcclxuICAgICAgICBwYXRpZW50TmFtZTogYW5JbnN0YW5jZVsweDAwMTAwMDEwXSxcclxuICAgICAgICBwYXRpZW50SWQ6IGFuSW5zdGFuY2VbMHgwMDEwMDAyMF0sXHJcbiAgICAgICAgcGF0aWVudEJpcnRoRGF0ZTogYW5JbnN0YW5jZVsweDAwMTAwMDMwXSxcclxuICAgICAgICBwYXRpZW50U2V4OiBhbkluc3RhbmNlWzB4MDAxMDAwNDBdLFxyXG4gICAgICAgIGFjY2Vzc2lvbk51bWJlcjogYW5JbnN0YW5jZVsweDAwMDgwMDUwXSxcclxuICAgICAgICBzdHVkeURhdGU6IGFuSW5zdGFuY2VbMHgwMDA4MDAyMF0sXHJcbiAgICAgICAgbW9kYWxpdGllczogYW5JbnN0YW5jZVsweDAwMDgwMDYxXSxcclxuICAgICAgICBzdHVkeURlc2NyaXB0aW9uOiBhbkluc3RhbmNlWzB4MDAwODEwMzBdLFxyXG4gICAgICAgIGltYWdlQ291bnQ6IGFuSW5zdGFuY2VbMHgwMDIwMTIwOF0sXHJcbiAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogYW5JbnN0YW5jZVsweDAwMjAwMDBEXSxcclxuICAgICAgICBpbnN0aXR1dGlvbk5hbWU6IGFuSW5zdGFuY2VbMHgwMDA4MDA4MF1cclxuICAgIH07XHJcblxyXG4gICAgcmVzdWx0RGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlUmF3KSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBpbnN0YW5jZVJhdy50b09iamVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0luc3RhbmNlVWlkID0gaW5zdGFuY2VbMHgwMDIwMDAwRV07XHJcbiAgICAgICAgbGV0IHNlcmllcyA9IHNlcmllc01hcFtzZXJpZXNJbnN0YW5jZVVpZF07XHJcbiAgICAgICAgaWYgKCFzZXJpZXMpIHtcclxuICAgICAgICAgICAgc2VyaWVzID0ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzRGVzY3JpcHRpb246IGluc3RhbmNlWzB4MDAwODEwM0VdLFxyXG4gICAgICAgICAgICAgICAgbW9kYWxpdHk6IGluc3RhbmNlWzB4MDAwODAwNjBdLFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzSW5zdGFuY2VVaWQ6IHNlcmllc0luc3RhbmNlVWlkLFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzTnVtYmVyOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAyMDAwMTFdKSxcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlczogW11cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2VyaWVzTWFwW3Nlcmllc0luc3RhbmNlVWlkXSA9IHNlcmllcztcclxuICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzb3BJbnN0YW5jZVVpZCA9IGluc3RhbmNlWzB4MDAwODAwMThdO1xyXG5cclxuICAgICAgICBjb25zdCBpbnN0YW5jZVN1bW1hcnkgPSB7XHJcbiAgICAgICAgICAgIGltYWdlVHlwZTogaW5zdGFuY2VbMHgwMDA4MDAwOF0sXHJcbiAgICAgICAgICAgIHNvcENsYXNzVWlkOiBpbnN0YW5jZVsweDAwMDgwMDE2XSxcclxuICAgICAgICAgICAgbW9kYWxpdHk6IGluc3RhbmNlWzB4MDAwODAwNjBdLFxyXG4gICAgICAgICAgICBzb3BJbnN0YW5jZVVpZDogc29wSW5zdGFuY2VVaWQsXHJcbiAgICAgICAgICAgIGluc3RhbmNlTnVtYmVyOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAyMDAwMTNdKSxcclxuICAgICAgICAgICAgaW1hZ2VQb3NpdGlvblBhdGllbnQ6IGluc3RhbmNlWzB4MDAyMDAwMzJdLFxyXG4gICAgICAgICAgICBpbWFnZU9yaWVudGF0aW9uUGF0aWVudDogaW5zdGFuY2VbMHgwMDIwMDAzN10sXHJcbiAgICAgICAgICAgIGZyYW1lT2ZSZWZlcmVuY2VVSUQ6IGluc3RhbmNlWzB4MDAyMDAwNTJdLFxyXG4gICAgICAgICAgICBzbGljZVRoaWNrbmVzczogcGFyc2VGbG9hdChpbnN0YW5jZVsweDAwMTgwMDUwXSksXHJcbiAgICAgICAgICAgIHNsaWNlTG9jYXRpb246IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDIwMTA0MV0pLFxyXG4gICAgICAgICAgICB0YWJsZVBvc2l0aW9uOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAxODkzMjddKSxcclxuICAgICAgICAgICAgc2FtcGxlc1BlclBpeGVsOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAyODAwMDJdKSxcclxuICAgICAgICAgICAgcGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbjogaW5zdGFuY2VbMHgwMDI4MDAwNF0sXHJcbiAgICAgICAgICAgIHBsYW5hckNvbmZpZ3VyYXRpb246IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDI4MDAwNl0pLFxyXG4gICAgICAgICAgICByb3dzOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAyODAwMTBdKSxcclxuICAgICAgICAgICAgY29sdW1uczogcGFyc2VGbG9hdChpbnN0YW5jZVsweDAwMjgwMDExXSksXHJcbiAgICAgICAgICAgIHBpeGVsU3BhY2luZzogaW5zdGFuY2VbMHgwMDI4MDAzMF0sXHJcbiAgICAgICAgICAgIGJpdHNBbGxvY2F0ZWQ6IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDI4MDEwMF0pLFxyXG4gICAgICAgICAgICBiaXRzU3RvcmVkOiBwYXJzZUZsb2F0KGluc3RhbmNlWzB4MDAyODAxMDFdKSxcclxuICAgICAgICAgICAgaGlnaEJpdDogcGFyc2VGbG9hdChpbnN0YW5jZVsweDAwMjgwMTAyXSksXHJcbiAgICAgICAgICAgIHBpeGVsUmVwcmVzZW50YXRpb246IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDI4MDEwM10pLFxyXG4gICAgICAgICAgICB3aW5kb3dDZW50ZXI6IGluc3RhbmNlWzB4MDAyODEwNTBdLFxyXG4gICAgICAgICAgICB3aW5kb3dXaWR0aDogaW5zdGFuY2VbMHgwMDI4MTA1MV0sXHJcbiAgICAgICAgICAgIHJlc2NhbGVJbnRlcmNlcHQ6IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDI4MTA1Ml0pLFxyXG4gICAgICAgICAgICByZXNjYWxlU2xvcGU6IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDI4MTA1M10pLFxyXG4gICAgICAgICAgICBzb3VyY2VJbWFnZUluc3RhbmNlVWlkOiBnZXRTb3VyY2VJbWFnZUluc3RhbmNlVWlkKGluc3RhbmNlKSxcclxuICAgICAgICAgICAgbGF0ZXJhbGl0eTogaW5zdGFuY2VbMHgwMDIwMDA2Ml0sXHJcbiAgICAgICAgICAgIHZpZXdQb3NpdGlvbjogaW5zdGFuY2VbMHgwMDE4NTEwMV0sXHJcbiAgICAgICAgICAgIGFjcXVpc2l0aW9uRGF0ZVRpbWU6IGluc3RhbmNlWzB4MDAwODAwMkFdLFxyXG4gICAgICAgICAgICBudW1iZXJPZkZyYW1lczogcGFyc2VGbG9hdChpbnN0YW5jZVsweDAwMjgwMDA4XSksXHJcbiAgICAgICAgICAgIGZyYW1lSW5jcmVtZW50UG9pbnRlcjogZ2V0VmFsdWUoaW5zdGFuY2VbMHgwMDI4MDAwOV0pLFxyXG4gICAgICAgICAgICBmcmFtZVRpbWU6IHBhcnNlRmxvYXQoaW5zdGFuY2VbMHgwMDE4MTA2M10pLFxyXG4gICAgICAgICAgICBmcmFtZVRpbWVWZWN0b3I6IHBhcnNlRmxvYXRBcnJheShpbnN0YW5jZVsweDAwMTgxMDY1XSksXHJcbiAgICAgICAgICAgIGxvc3N5SW1hZ2VDb21wcmVzc2lvbjogaW5zdGFuY2VbMHgwMDI4MjExMF0sXHJcbiAgICAgICAgICAgIGRlcml2YXRpb25EZXNjcmlwdGlvbjogaW5zdGFuY2VbMHgwMDI4MjExMV0sXHJcbiAgICAgICAgICAgIGxvc3N5SW1hZ2VDb21wcmVzc2lvblJhdGlvOiBpbnN0YW5jZVsweDAwMjgyMTEyXSxcclxuICAgICAgICAgICAgbG9zc3lJbWFnZUNvbXByZXNzaW9uTWV0aG9kOiBpbnN0YW5jZVsweDAwMjgyMTE0XSxcclxuICAgICAgICAgICAgc3BhY2luZ0JldHdlZW5TbGljZXM6IGluc3RhbmNlWzB4MDAxODAwODhdLFxyXG4gICAgICAgICAgICBlY2hvTnVtYmVyOiBpbnN0YW5jZVsweDAwMTgwMDg2XSxcclxuICAgICAgICAgICAgY29udHJhc3RCb2x1c0FnZW50OiBpbnN0YW5jZVsweDAwMTgwMDEwXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBhY3R1YWwgZGF0YSBvdmVyIFdBRE8tVVJJXHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gT0hJRi5zZXJ2ZXJzLmdldEN1cnJlbnRTZXJ2ZXIoKTtcclxuICAgICAgICBjb25zdCB3YWRvdXJpID0gYCR7c2VydmVyLndhZG9VcmlSb290fT9yZXF1ZXN0VHlwZT1XQURPJnN0dWR5VUlEPSR7c3R1ZHlJbnN0YW5jZVVpZH0mc2VyaWVzVUlEPSR7c2VyaWVzSW5zdGFuY2VVaWR9Jm9iamVjdFVJRD0ke3NvcEluc3RhbmNlVWlkfSZjb250ZW50VHlwZT1hcHBsaWNhdGlvbiUyRmRpY29tYDtcclxuICAgICAgICBpbnN0YW5jZVN1bW1hcnkud2Fkb3VyaSA9IFdBRE9Qcm94eS5jb252ZXJ0VVJMKHdhZG91cmksIHNlcnZlcik7XHJcblxyXG4gICAgICAgIHNlcmllcy5pbnN0YW5jZXMucHVzaChpbnN0YW5jZVN1bW1hcnkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc3R1ZHlEYXRhLnN0dWR5SW5zdGFuY2VVaWQgPSBzdHVkeUluc3RhbmNlVWlkO1xyXG5cclxuICAgIHJldHVybiBzdHVkeURhdGE7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZWQgU3R1ZHkgTWV0YURhdGEgZnJvbSBhIERJQ09NIHNlcnZlciB1c2luZyBESU1TRVxyXG4gKiBAcGFyYW0gc3R1ZHlJbnN0YW5jZVVpZFxyXG4gKiBAcmV0dXJucyB7e3Nlcmllc0xpc3Q6IEFycmF5LCBwYXRpZW50TmFtZTogKiwgcGF0aWVudElkOiAqLCBhY2Nlc3Npb25OdW1iZXI6ICosIHN0dWR5RGF0ZTogKiwgbW9kYWxpdGllczogKiwgc3R1ZHlEZXNjcmlwdGlvbjogKiwgaW1hZ2VDb3VudDogKiwgc3R1ZHlJbnN0YW5jZVVpZDogKn19XHJcbiAqL1xyXG5PSElGLnN0dWRpZXMuc2VydmljZXMuRElNU0UuUmV0cmlldmVNZXRhZGF0YSA9IGZ1bmN0aW9uKHN0dWR5SW5zdGFuY2VVaWQpIHtcclxuICAgIC8vIFRPRE86IENoZWNrIHdoaWNoIHBlZXIgaXQgc2hvdWxkIHBvaW50IHRvXHJcbiAgICBjb25zdCBhY3RpdmVTZXJ2ZXIgPSBPSElGLnNlcnZlcnMuZ2V0Q3VycmVudFNlcnZlcigpLnBlZXJzWzBdO1xyXG4gICAgY29uc3Qgc3VwcG9ydHNJbnN0YW5jZVJldHJpZXZhbEJ5U3R1ZHlVaWQgPSBhY3RpdmVTZXJ2ZXIuc3VwcG9ydHNJbnN0YW5jZVJldHJpZXZhbEJ5U3R1ZHlVaWQ7XHJcbiAgICBsZXQgcmVzdWx0cztcclxuXHJcbiAgICAvLyBDaGVjayBleHBsaWNpdGx5IGZvciBhIHZhbHVlIG9mIGZhbHNlLCBzaW5jZSB0aGlzIHByb3BlcnR5XHJcbiAgICAvLyBtYXkgYmUgbGVmdCB1bmRlZmluZWQgaW4gY29uZmlnIGZpbGVzXHJcbiAgICBpZiAoc3VwcG9ydHNJbnN0YW5jZVJldHJpZXZhbEJ5U3R1ZHlVaWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmVzdWx0cyA9IERJTVNFLnJldHJpZXZlSW5zdGFuY2VzQnlTdHVkeU9ubHkoc3R1ZHlJbnN0YW5jZVVpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdHMgPSBESU1TRS5yZXRyaWV2ZUluc3RhbmNlcyhzdHVkeUluc3RhbmNlVWlkKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0RGF0YVRvU3R1ZHlNZXRhZGF0YShzdHVkeUluc3RhbmNlVWlkLCByZXN1bHRzKTtcclxufTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IE9ISUYgfSBmcm9tICdtZXRlb3Ivb2hpZjpjb3JlJztcclxuaW1wb3J0IHsgQ3VycmVudFNlcnZlciB9IGZyb20gJ21ldGVvci9vaGlmOnNlcnZlcnMvYm90aC9jb2xsZWN0aW9ucyc7XHJcbmltcG9ydCBESU1TRSBmcm9tICdkaW1zZSc7XHJcblxyXG5jb25zdCBzZXR1cERJTVNFID0gKCkgPT4ge1xyXG4gICAgLy8gVGVybWluYXRlIGV4aXN0aW5nIERJTVNFIHNlcnZlcnMgYW5kIHNvY2tldHMgYW5kIGNsZWFuIHVwIHRoZSBjb25uZWN0aW9uIG9iamVjdFxyXG4gICAgRElNU0UuY29ubmVjdGlvbi5yZXNldCgpO1xyXG5cclxuICAgIC8vIEdldCB0aGUgbmV3IHNlcnZlciBjb25maWd1cmF0aW9uXHJcbiAgICBjb25zdCBzZXJ2ZXIgPSBPSElGLnNlcnZlcnMuZ2V0Q3VycmVudFNlcnZlcigpO1xyXG5cclxuICAgIC8vIFN0b3AgaGVyZSBpZiB0aGUgbmV3IHNlcnZlciBpcyBub3Qgb2YgRElNU0UgdHlwZVxyXG4gICAgaWYgKHNlcnZlci50eXBlICE9PSAnZGltc2UnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHBlZXJzIHdlcmUgZGVmaW5lZCBpbiB0aGUgc2VydmVyIGNvbmZpZ3VyYXRpb24gYW5kIHRocm93IGFuIGVycm9yIGlmIG5vdFxyXG4gICAgY29uc3QgcGVlcnMgPSBzZXJ2ZXIucGVlcnM7XHJcbiAgICBpZiAoIXBlZXJzIHx8ICFwZWVycy5sZW5ndGgpIHtcclxuICAgICAgICBPSElGLmxvZy5lcnJvcignZGltc2UtY29uZmlnOiAnICsgJ05vIERJTVNFIFBlZXJzIHByb3ZpZGVkLicpO1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RpbXNlLWNvbmZpZycsICdObyBESU1TRSBQZWVycyBwcm92aWRlZC4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgYWxsIHRoZSBESU1TRSBwZWVycywgZXN0YWJsaXNoaW5nIHRoZSBjb25uZWN0aW9uc1xyXG4gICAgT0hJRi5sb2cuaW5mbygnQWRkaW5nIERJTVNFIHBlZXJzJyk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiBESU1TRS5jb25uZWN0aW9uLmFkZFBlZXIocGVlcikpO1xyXG4gICAgfSBjYXRjaChlcnJvcikge1xyXG4gICAgICAgIE9ISUYubG9nLmVycm9yKCdkaW1zZS1hZGRQZWVyczogJyArIGVycm9yKTtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkaW1zZS1hZGRQZWVycycsIGVycm9yKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIFNldHVwIHRoZSBESU1TRSBjb25uZWN0aW9ucyBvbiBzdGFydHVwIG9yIHdoZW4gdGhlIGN1cnJlbnQgc2VydmVyIGlzIGNoYW5nZWRcclxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xyXG4gICAgQ3VycmVudFNlcnZlci5maW5kKCkub2JzZXJ2ZSh7XHJcbiAgICAgICAgYWRkZWQ6IHNldHVwRElNU0UsXHJcbiAgICAgICAgY2hhbmdlZDogc2V0dXBESU1TRVxyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBtb21lbnQgfSBmcm9tICdtZXRlb3IvbW9tZW50anM6bW9tZW50JztcclxuaW1wb3J0IHsgT0hJRiB9IGZyb20gJ21ldGVvci9vaGlmOmNvcmUnO1xyXG5pbXBvcnQgRElNU0UgZnJvbSAnZGltc2UnO1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyByZXN1bHRpbmcgZGF0YSBmcm9tIGEgUUlETyBjYWxsIGludG8gYSBzZXQgb2YgU3R1ZHkgTWV0YURhdGFcclxuICpcclxuICogQHBhcmFtIHJlc3VsdERhdGFcclxuICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBTdHVkeSBNZXRhRGF0YSBvYmplY3RzXHJcbiAqL1xyXG5mdW5jdGlvbiByZXN1bHREYXRhVG9TdHVkaWVzKHJlc3VsdERhdGEpIHtcclxuICAgIGNvbnN0IHN0dWRpZXMgPSBbXTtcclxuXHJcbiAgICByZXN1bHREYXRhLmZvckVhY2goZnVuY3Rpb24oc3R1ZHlSYXcpIHtcclxuICAgICAgICBjb25zdCBzdHVkeSA9IHN0dWR5UmF3LnRvT2JqZWN0KCk7XHJcbiAgICAgICAgc3R1ZGllcy5wdXNoKHtcclxuICAgICAgICAgICAgc3R1ZHlJbnN0YW5jZVVpZDogc3R1ZHlbMHgwMDIwMDAwRF0sXHJcbiAgICAgICAgICAgIC8vIDAwMDgwMDA1ID0gU3BlY2lmaWNDaGFyYWN0ZXJTZXRcclxuICAgICAgICAgICAgc3R1ZHlEYXRlOiBzdHVkeVsweDAwMDgwMDIwXSxcclxuICAgICAgICAgICAgc3R1ZHlUaW1lOiBzdHVkeVsweDAwMDgwMDMwXSxcclxuICAgICAgICAgICAgYWNjZXNzaW9uTnVtYmVyOiBzdHVkeVsweDAwMDgwMDUwXSxcclxuICAgICAgICAgICAgcmVmZXJyaW5nUGh5c2ljaWFuTmFtZTogc3R1ZHlbMHgwMDA4MDA5MF0sXHJcbiAgICAgICAgICAgIC8vIDAwMDgxMTkwID0gVVJMXHJcbiAgICAgICAgICAgIHBhdGllbnROYW1lOiBzdHVkeVsweDAwMTAwMDEwXSxcclxuICAgICAgICAgICAgcGF0aWVudElkOiBzdHVkeVsweDAwMTAwMDIwXSxcclxuICAgICAgICAgICAgcGF0aWVudEJpcnRoZGF0ZTogc3R1ZHlbMHgwMDEwMDAzMF0sXHJcbiAgICAgICAgICAgIHBhdGllbnRTZXg6IHN0dWR5WzB4MDAxMDAwNDBdLFxyXG4gICAgICAgICAgICBpbWFnZUNvdW50OiBzdHVkeVsweDAwMjAxMjA4XSxcclxuICAgICAgICAgICAgc3R1ZHlJZDogc3R1ZHlbMHgwMDIwMDAxMF0sXHJcbiAgICAgICAgICAgIHN0dWR5RGVzY3JpcHRpb246IHN0dWR5WzB4MDAwODEwMzBdLFxyXG4gICAgICAgICAgICBtb2RhbGl0aWVzOiBzdHVkeVsweDAwMDgwMDYxXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc3R1ZGllcztcclxufVxyXG5cclxuT0hJRi5zdHVkaWVzLnNlcnZpY2VzLkRJTVNFLlN0dWRpZXMgPSBmdW5jdGlvbihmaWx0ZXIpIHtcclxuICAgIE9ISUYubG9nLmluZm8oJ1NlcnZpY2VzLkRJTVNFLlN0dWRpZXMnKTtcclxuXHJcbiAgICBsZXQgZmlsdGVyU3R1ZHlEYXRlID0gJyc7XHJcbiAgICBpZiAoZmlsdGVyLnN0dWR5RGF0ZUZyb20gJiYgZmlsdGVyLnN0dWR5RGF0ZVRvKSB7XHJcbiAgICAgICAgY29uc3QgY29udmVydERhdGUgPSBkYXRlID0+IG1vbWVudChkYXRlLCAnTU0vREQvWVlZWScpLmZvcm1hdCgnWVlZWU1NREQnKTtcclxuICAgICAgICBjb25zdCBkYXRlRnJvbSA9IGNvbnZlcnREYXRlKGZpbHRlci5zdHVkeURhdGVGcm9tKTtcclxuICAgICAgICBjb25zdCBkYXRlVG8gPSBjb252ZXJ0RGF0ZShmaWx0ZXIuc3R1ZHlEYXRlVG8pO1xyXG4gICAgICAgIGZpbHRlclN0dWR5RGF0ZSA9IGAke2RhdGVGcm9tfS0ke2RhdGVUb31gO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJ1aWxkIHRoZSBTdHVkeUluc3RhbmNlVUlEIHBhcmFtZXRlclxyXG4gICAgbGV0IHN0dWR5VWlkcyA9IGZpbHRlci5zdHVkeUluc3RhbmNlVWlkIHx8ICcnO1xyXG4gICAgaWYgKHN0dWR5VWlkcykge1xyXG4gICAgICAgIHN0dWR5VWlkcyA9IEFycmF5LmlzQXJyYXkoc3R1ZHlVaWRzKSA/IHN0dWR5VWlkcy5qb2luKCkgOiBzdHVkeVVpZHM7XHJcbiAgICAgICAgc3R1ZHlVaWRzID0gc3R1ZHlVaWRzLnJlcGxhY2UoL1teMC05Ll0rL2csICdcXFxcJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHtcclxuICAgICAgICAweDAwMjAwMDBEOiBzdHVkeVVpZHMsXHJcbiAgICAgICAgMHgwMDEwMDAxMDogZmlsdGVyLnBhdGllbnROYW1lLFxyXG4gICAgICAgIDB4MDAxMDAwMjA6IGZpbHRlci5wYXRpZW50SWQsXHJcbiAgICAgICAgMHgwMDA4MDA1MDogZmlsdGVyLmFjY2Vzc2lvbk51bWJlcixcclxuICAgICAgICAweDAwMDgwMDIwOiBmaWx0ZXJTdHVkeURhdGUsXHJcbiAgICAgICAgMHgwMDA4MTAzMDogZmlsdGVyLnN0dWR5RGVzY3JpcHRpb24sXHJcbiAgICAgICAgMHgwMDEwMDA0MDogJycsXHJcbiAgICAgICAgMHgwMDIwMTIwODogJycsXHJcbiAgICAgICAgMHgwMDA4MDA2MTogZmlsdGVyLm1vZGFsaXRpZXNJblN0dWR5XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdHMgPSBESU1TRS5yZXRyaWV2ZVN0dWRpZXMocGFyYW1ldGVycyk7XHJcbiAgICByZXR1cm4gcmVzdWx0RGF0YVRvU3R1ZGllcyhyZXN1bHRzKTtcclxufTtcclxuIl19
