(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var Router = Package['clinical:router'].Router;
var RouteController = Package['clinical:router'].RouteController;
var moment = Package['momentjs:moment'].moment;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Iron = Package['iron:core'].Iron;
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
var HP, HangingProtocols, indexToRemove;

var require = meteorInstall({"node_modules":{"meteor":{"ohif:hanging-protocols":{"both":{"namespace.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/namespace.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
HP = {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collections.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/collections.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
HangingProtocols = new Meteor.Collection('hangingprotocols');
HangingProtocols._debugName = 'HangingProtocols';
HangingProtocols.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
}); // @TODO: Remove this after stabilizing ProtocolEngine

if (Meteor.isDevelopment && Meteor.isServer) {
  Meteor.startup(() => {
    HangingProtocols.remove({});
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"schema.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/schema.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.watch(require("./classes/Protocol"));
module.watch(require("./classes/Stage"));
module.watch(require("./classes/Viewport"));
module.watch(require("./classes/ViewportStructure"));
module.watch(require("./classes/rules/ProtocolMatchingRule"));
module.watch(require("./classes/rules/StudyMatchingRule"));
module.watch(require("./classes/rules/SeriesMatchingRule"));
module.watch(require("./classes/rules/ImageMatchingRule"));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hardcodedData.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/hardcodedData.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
HP.attributeDefaults = {
  abstractPriorValue: 0
};
HP.displaySettings = {
  invert: {
    id: 'invert',
    text: 'Show Grayscale Inverted',
    defaultValue: 'NO',
    options: ['YES', 'NO']
  }
}; // @TODO Fix abstractPriorValue comparison

HP.studyAttributes = [{
  id: 'x00100020',
  text: '(x00100020) Patient ID'
}, {
  id: 'x0020000d',
  text: '(x0020000d) Study Instance UID'
}, {
  id: 'x00080020',
  text: '(x00080020) Study Date'
}, {
  id: 'x00080030',
  text: '(x00080030) Study Time'
}, {
  id: 'x00081030',
  text: '(x00081030) Study Description'
}, {
  id: 'abstractPriorValue',
  text: 'Abstract Prior Value'
}];
HP.protocolAttributes = [{
  id: 'x00100020',
  text: '(x00100020) Patient ID'
}, {
  id: 'x0020000d',
  text: '(x0020000d) Study Instance UID'
}, {
  id: 'x00080020',
  text: '(x00080020) Study Date'
}, {
  id: 'x00080030',
  text: '(x00080030) Study Time'
}, {
  id: 'x00081030',
  text: '(x00081030) Study Description'
}, {
  id: 'anatomicRegion',
  text: 'Anatomic Region'
}];
HP.seriesAttributes = [{
  id: 'x0020000e',
  text: '(x0020000e) Series Instance UID'
}, {
  id: 'x00080060',
  text: '(x00080060) Modality'
}, {
  id: 'x00200011',
  text: '(x00200011) Series Number'
}, {
  id: 'x0008103e',
  text: '(x0008103e) Series Description'
}, {
  id: 'numImages',
  text: 'Number of Images'
}];
HP.instanceAttributes = [{
  id: 'x00080016',
  text: '(x00080016) SOP Class UID'
}, {
  id: 'x00080018',
  text: '(x00080018) SOP Instance UID'
}, {
  id: 'x00185101',
  text: '(x00185101) View Position'
}, {
  id: 'x00200013',
  text: '(x00200013) Instance Number'
}, {
  id: 'x00080008',
  text: '(x00080008) Image Type'
}, {
  id: 'x00181063',
  text: '(x00181063) Frame Time'
}, {
  id: 'x00200060',
  text: '(x00200060) Laterality'
}, {
  id: 'x00541330',
  text: '(x00541330) Image Index'
}, {
  id: 'x00280004',
  text: '(x00280004) Photometric Interpretation'
}, {
  id: 'x00180050',
  text: '(x00180050) Slice Thickness'
}];
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"testData.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/testData.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
function getDefaultProtocol() {
  var protocol = new HP.Protocol('Default');
  protocol.id = 'defaultProtocol';
  protocol.locked = true;
  var oneByOne = new HP.ViewportStructure('grid', {
    rows: 1,
    columns: 1
  });
  var viewport = new HP.Viewport();
  var first = new HP.Stage(oneByOne, 'oneByOne');
  first.viewports.push(viewport);
  protocol.stages.push(first);
  HP.defaultProtocol = protocol;
  return HP.defaultProtocol;
}

function getMRTwoByTwoTest() {
  var proto = new HP.Protocol('MR_TwoByTwo');
  proto.id = 'MR_TwoByTwo';
  proto.locked = true; // Use http://localhost:3000/viewer/1.2.840.113619.2.5.1762583153.215519.978957063.78

  var studyInstanceUid = new HP.ProtocolMatchingRule('studyInstanceUid', {
    equals: {
      value: '1.2.840.113619.2.5.1762583153.215519.978957063.78'
    }
  }, true);
  proto.addProtocolMatchingRule(studyInstanceUid);
  var oneByTwo = new HP.ViewportStructure('grid', {
    rows: 1,
    columns: 2
  }); // Stage 1

  var left = new HP.Viewport();
  var right = new HP.Viewport();
  var firstSeries = new HP.SeriesMatchingRule('seriesNumber', {
    equals: {
      value: 1
    }
  });
  var secondSeries = new HP.SeriesMatchingRule('seriesNumber', {
    equals: {
      value: 2
    }
  });
  var thirdImage = new HP.ImageMatchingRule('instanceNumber', {
    equals: {
      value: 3
    }
  });
  left.seriesMatchingRules.push(firstSeries);
  left.imageMatchingRules.push(thirdImage);
  right.seriesMatchingRules.push(secondSeries);
  right.imageMatchingRules.push(thirdImage);
  var first = new HP.Stage(oneByTwo, 'oneByTwo');
  first.viewports.push(left);
  first.viewports.push(right);
  proto.stages.push(first); // Stage 2

  var twoByOne = new HP.ViewportStructure('grid', {
    rows: 2,
    columns: 1
  });
  var left2 = new HP.Viewport();
  var right2 = new HP.Viewport();
  var fourthSeries = new HP.SeriesMatchingRule('seriesNumber', {
    equals: {
      value: 4
    }
  });
  var fifthSeries = new HP.SeriesMatchingRule('seriesNumber', {
    equals: {
      value: 5
    }
  });
  left2.seriesMatchingRules.push(fourthSeries);
  left2.imageMatchingRules.push(thirdImage);
  right2.seriesMatchingRules.push(fifthSeries);
  right2.imageMatchingRules.push(thirdImage);
  var second = new HP.Stage(twoByOne, 'twoByOne');
  second.viewports.push(left2);
  second.viewports.push(right2);
  proto.stages.push(second);
  HP.testProtocol = proto;
  return HP.testProtocol;
}

function getDemoProtocols() {
  HP.demoProtocols = [];
  /**
   * Demo #1
   */

  HP.demoProtocols.push({
    "id": "demoProtocol1",
    "locked": false,
    "name": "DFCI-CT-CHEST-COMPARE",
    "createdDate": "2017-02-14T16:07:09.033Z",
    "modifiedDate": "2017-02-14T16:18:43.930Z",
    "availableTo": {},
    "editableBy": {},
    "protocolMatchingRules": [{
      "id": "7tmuq7KzDMCWFeapc",
      "weight": 2,
      "required": false,
      "attribute": "x00081030",
      "constraint": {
        "contains": {
          "value": "DFCI CT CHEST"
        }
      }
    }],
    "stages": [{
      "id": "v5PfGt9F6mffZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "2.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "2.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "XTzu8HB3feep3HYKs",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "3.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "3.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:12.085Z"
    }, {
      "id": "3yPYNaeFtr76Qz3jq",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 2,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {
          "wlPreset": "Lung"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 3.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "6vdBRZYnqmmosipph",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "SxfTyhGcMhr56PtPM",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }, {
        "viewportSettings": {
          "wlPreset": "Lung"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "FTAyChZCPW68yJjXD",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 3.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "gMJjfrbsqYNbErPx5",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:11:40.489Z"
    }],
    "numberOfPriorsReferenced": 4
  });
  /**
   * Demo #2
   */

  HP.demoProtocols.push({
    "id": "demoProtocol2",
    "locked": false,
    "name": "DFCI-CT-CHEST-COMPARE-2",
    "createdDate": "2017-02-14T16:07:09.033Z",
    "modifiedDate": "2017-02-14T16:18:43.930Z",
    "availableTo": {},
    "editableBy": {},
    "protocolMatchingRules": [{
      "id": "7tmuq7KzDMCWFeapc",
      "weight": 2,
      "required": false,
      "attribute": "x00081030",
      "constraint": {
        "contains": {
          "value": "DFCI CT CHEST"
        }
      }
    }],
    "stages": [{
      "id": "v5PfGt9F6mffZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mac",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "2.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYc",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "2.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnXTByWnPt",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "XTzu8HB3feep3HYKs",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }, {
          "id": "mYnsCcNwZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 5.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }, {
          "id": "ygz4nb29iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 5.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:12.085Z"
    }, {
      "id": "3yPYNaeFtr76Qz3jq",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 2,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7mtr",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }, {
          "id": "jXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 5.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {
          "wlPreset": "Lung"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "ygz4nb28iJZcJhnYb",
          "weight": 2,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 3.0"
            }
          }
        }, {
          "id": "ycz4nb28iJZcJhnYa",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 5.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "6vdBRZYnqmmosipph",
          "weight": 2,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }, {
          "id": "6vdBRFYnqmmosipph",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 5.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "SxfTyhGcMhr56PtPM",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }, {
        "viewportSettings": {
          "wlPreset": "Lung"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "FTAyChZCPW68yJjXD",
          "weight": 2,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 3.0"
            }
          }
        }, {
          "id": "DTAyChZCPW68yJjXD",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 5.0"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "gMJjfrbsqYNbErPx5",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:11:40.489Z"
    }],
    "numberOfPriorsReferenced": 1
  });
  /**
   * Demo: screenCT
   */

  HP.demoProtocols.push({
    "id": "screenCT",
    "locked": false,
    "name": "DFCI-CT-CHEST-SCREEN",
    "createdDate": "2017-02-14T16:07:09.033Z",
    "modifiedDate": "2017-02-14T16:18:43.930Z",
    "availableTo": {},
    "editableBy": {},
    "protocolMatchingRules": [{
      "id": "7tmuq7KzDMCWFeapc",
      "weight": 2,
      "required": false,
      "attribute": "x00081030",
      "constraint": {
        "contains": {
          "value": "DFCI CT CHEST"
        }
      }
    }],
    "stages": [{
      "id": "v5PfGt9F6mffZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 1
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL55z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "2.0"
            }
          }
        }],
        "studyMatchingRules": []
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F4mffZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 2,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7nTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 5.0"
            }
          }
        }, {
          "id": "mXnsCcNzZL56z7rTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 3.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56r7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 5.0"
            }
          }
        }, {
          "id": "mXnsCcNzZL56a7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Lung 3.0"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcRzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 4.0"
            }
          }
        }, {
          "id": "mXnsCcNzTL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Coronal"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcMzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Body 4.0"
            }
          }
        }, {
          "id": "mXnsCcAzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Sagittal"
            }
          }
        }],
        "studyMatchingRules": []
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }],
    "numberOfPriorsReferenced": 0
  });
  /**
   * Demo: PETCTSCREEN
   */

  HP.demoProtocols.push({
    "id": "PETCTSCREEN",
    "locked": false,
    "name": "PETCT-SCREEN",
    "createdDate": "2017-02-14T16:07:09.033Z",
    "modifiedDate": "2017-02-14T16:18:43.930Z",
    "availableTo": {},
    "editableBy": {},
    "protocolMatchingRules": [{
      "id": "7tmuqgKzDMCWFeapc",
      "weight": 5,
      "required": false,
      "attribute": "x00081030",
      "constraint": {
        "contains": {
          "value": "PETCT"
        }
      }
    }],
    "stages": [{
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcAzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZR56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }, {
          "id": "mRnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x00200011",
          "constraint": {
            "numericality": {
              "greaterThanOrEqualTo": 2
            }
          }
        }],
        "studyMatchingRules": []
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsGcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Corrected"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsHcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT WB"
            }
          }
        }],
        "studyMatchingRules": []
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {
          "invert": "YES"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXneCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Uncorrected"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCuNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT Nk"
            }
          }
        }],
        "studyMatchingRules": []
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }],
    "numberOfPriorsReferenced": 0
  });
  /**
   * Demo: PETCTCOMPARE
   */

  HP.demoProtocols.push({
    "id": "PETCTCOMPARE",
    "locked": false,
    "name": "PETCT-COMPARE",
    "createdDate": "2017-02-14T16:07:09.033Z",
    "modifiedDate": "2017-02-14T16:18:43.930Z",
    "availableTo": {},
    "editableBy": {},
    "protocolMatchingRules": [{
      "id": "7tmuqgKzDMCWFeapc",
      "weight": 5,
      "required": false,
      "attribute": "x00081030",
      "constraint": {
        "contains": {
          "value": "PETCT"
        }
      }
    }],
    "stages": [{
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL59z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7lTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTbnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 1,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNjZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }, {
          "id": "mXnsCcNzZL56z7gTZ",
          "weight": 1,
          "required": false,
          "attribute": "x00200011",
          "constraint": {
            "numericality": {
              "greaterThanOrEqualTo": 2
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcCzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "Topogram"
            }
          }
        }, {
          "id": "mXnsCcNzZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x00200011",
          "constraint": {
            "numericality": {
              "greaterThanOrEqualTo": 2
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvn1TByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 2,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL26z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Corrected"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL46z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT WB"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL57z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Corrected"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnYTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZQ56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT WB"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgLTvnKTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }, {
      "id": "v5PfGt9F6mFgZPif5",
      "name": "oneByOne",
      "viewportStructure": {
        "type": "grid",
        "properties": {
          "rows": 2,
          "columns": 2
        },
        "layoutTemplateName": "gridLayout"
      },
      "viewports": [{
        "viewportSettings": {
          "invert": "YES"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZL56z7nTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Uncorrected"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNxZL56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT Nk"
            }
          }
        }],
        "studyMatchingRules": []
      }, {
        "viewportSettings": {
          "invert": "YES"
        },
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZA56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "PET WB Uncorrected"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgHTvnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }, {
        "viewportSettings": {},
        "imageMatchingRules": [],
        "seriesMatchingRules": [{
          "id": "mXnsCcNzZP56z7mTZ",
          "weight": 1,
          "required": false,
          "attribute": "x0008103e",
          "constraint": {
            "contains": {
              "value": "CT Nk"
            }
          }
        }],
        "studyMatchingRules": [{
          "id": "uDoEgITvnXTByWnPz",
          "weight": 1,
          "required": false,
          "attribute": "abstractPriorValue",
          "constraint": {
            "equals": {
              "value": 1
            }
          }
        }]
      }],
      "createdDate": "2017-02-14T16:07:09.033Z"
    }],
    "numberOfPriorsReferenced": 1
  });
}

getDefaultProtocol(); //getMRTwoByTwoTest();
//getDemoProtocols();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"classes":{"Protocol.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/Protocol.js                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Random;
module.watch(require("meteor/random"), {
  Random(v) {
    Random = v;
  }

}, 1);
let OHIF;
module.watch(require("meteor/ohif:core"), {
  OHIF(v) {
    OHIF = v;
  }

}, 2);
let removeFromArray;
module.watch(require("../lib/removeFromArray"), {
  removeFromArray(v) {
    removeFromArray = v;
  }

}, 3);

/**
 * This class represents a Hanging Protocol at the highest level
 *
 * @type {Protocol}
 */
HP.Protocol = class Protocol {
  /**
   * The Constructor for the Class to create a Protocol with the bare
   * minimum information
   *
   * @param name The desired name for the Protocol
   */
  constructor(name) {
    // Create a new UUID for this Protocol
    this.id = Random.id(); // Store a value which determines whether or not a Protocol is locked
    // This is probably temporary, since we will eventually have role / user
    // checks for editing. For now we just need it to prevent changes to the
    // default protocols.

    this.locked = false; // Boolean value to indicate if the protocol has updated priors information
    // it's set in "updateNumberOfPriorsReferenced" function

    this.hasUpdatedPriorsInformation = false; // Apply the desired name

    this.name = name; // Set the created and modified dates to Now

    this.createdDate = new Date();
    this.modifiedDate = new Date(); // If we are logged in while creating this Protocol,
    // store this information as well

    if (OHIF.user && OHIF.user.userLoggedIn && OHIF.user.userLoggedIn()) {
      this.createdBy = OHIF.user.getUserId();
      this.modifiedBy = OHIF.user.getUserId();
    } // Create two empty Sets specifying which roles
    // have read and write access to this Protocol


    this.availableTo = new Set();
    this.editableBy = new Set(); // Define empty arrays for the Protocol matching rules
    // and Stages

    this.protocolMatchingRules = [];
    this.stages = []; // Define auxiliary values for priors

    this.numberOfPriorsReferenced = -1;
  }

  getNumberOfPriorsReferenced(skipCache = false) {
    let numberOfPriorsReferenced = skipCache !== true ? this.numberOfPriorsReferenced : -1; // Check if information is cached already

    if (numberOfPriorsReferenced > -1) {
      return numberOfPriorsReferenced;
    }

    numberOfPriorsReferenced = 0; // Search each study matching rule for prior rules
    // Each stage can have many viewports that can have
    // multiple study matching rules.

    this.stages.forEach(stage => {
      if (!stage.viewports) {
        return;
      }

      stage.viewports.forEach(viewport => {
        if (!viewport.studyMatchingRules) {
          return;
        }

        viewport.studyMatchingRules.forEach(rule => {
          // If the current rule is not a priors rule, it will return -1 then numberOfPriorsReferenced will continue to be 0
          const priorsReferenced = rule.getNumberOfPriorsReferenced();

          if (priorsReferenced > numberOfPriorsReferenced) {
            numberOfPriorsReferenced = priorsReferenced;
          }
        });
      });
    });
    this.numberOfPriorsReferenced = numberOfPriorsReferenced;
    return numberOfPriorsReferenced;
  }

  updateNumberOfPriorsReferenced() {
    this.getNumberOfPriorsReferenced(true);
  }
  /**
   * Method to update the modifiedDate when the Protocol
   * has been changed
   */


  protocolWasModified() {
    // If we are logged in while modifying this Protocol,
    // store this information as well
    if (OHIF.user && OHIF.user.userLoggedIn && OHIF.user.userLoggedIn()) {
      this.modifiedBy = OHIF.user.getUserId();
    } // Protocol has been modified, so mark priors information
    // as "outdated"


    this.hasUpdatedPriorsInformation = false; // Update number of priors referenced info

    this.updateNumberOfPriorsReferenced(); // Update the modifiedDate with the current Date/Time

    this.modifiedDate = new Date();
  }
  /**
   * Occasionally the Protocol class needs to be instantiated from a JavaScript Object
   * containing the Protocol data. This function fills in a Protocol with the Object
   * data.
   *
   * @param input A Protocol as a JavaScript Object, e.g. retrieved from MongoDB or JSON
   */


  fromObject(input) {
    // Check if the input already has an ID
    // If so, keep it. It not, create a new UUID
    this.id = input.id || Random.id(); // Assign the input name to the Protocol

    this.name = input.name; // Retrieve locked status, use !! to make it truthy
    // so that undefined values will be set to false

    this.locked = !!input.locked; // TODO: Check how to regenerate Set from Object
    //this.availableTo = new Set(input.availableTo);
    //this.editableBy = new Set(input.editableBy);
    // If the input contains Protocol matching rules

    if (input.protocolMatchingRules) {
      input.protocolMatchingRules.forEach(ruleObject => {
        // Create new Rules from the stored data
        var rule = new HP.ProtocolMatchingRule();
        rule.fromObject(ruleObject); // Add them to the Protocol

        this.protocolMatchingRules.push(rule);
      });
    } // If the input contains data for various Stages in the
    // display set sequence


    if (input.stages) {
      input.stages.forEach(stageObject => {
        // Create Stages from the stored data
        var stage = new HP.Stage();
        stage.fromObject(stageObject); // Add them to the Protocol

        this.stages.push(stage);
      });
    }
  }
  /**
   * Creates a clone of the current Protocol with a new name
   *
   * @param name
   * @returns {Protocol|*}
   */


  createClone(name) {
    // Create a new JavaScript independent of the current Protocol
    var currentProtocol = Object.assign({}, this); // Create a new Protocol to return

    var clonedProtocol = new HP.Protocol(); // Apply the desired properties

    currentProtocol.id = clonedProtocol.id;
    clonedProtocol.fromObject(currentProtocol); // If we have specified a name, assign it

    if (name) {
      clonedProtocol.name = name;
    } // Unlock the clone


    clonedProtocol.locked = false; // Return the cloned Protocol

    return clonedProtocol;
  }
  /**
   * Adds a Stage to this Protocol's display set sequence
   *
   * @param stage
   */


  addStage(stage) {
    this.stages.push(stage); // Update the modifiedDate and User that last
    // modified this Protocol

    this.protocolWasModified();
  }
  /**
   * Adds a Rule to this Protocol's array of matching rules
   *
   * @param rule
   */


  addProtocolMatchingRule(rule) {
    this.protocolMatchingRules.push(rule); // Update the modifiedDate and User that last
    // modified this Protocol

    this.protocolWasModified();
  }
  /**
   * Removes a Rule from this Protocol's array of matching rules
   *
   * @param rule
   */


  removeProtocolMatchingRule(rule) {
    var wasRemoved = removeFromArray(this.protocolMatchingRules, rule); // Update the modifiedDate and User that last
    // modified this Protocol

    if (wasRemoved) {
      this.protocolWasModified();
    }
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Rule.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/Rule.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Rule: () => Rule
});
let Random;
module.watch(require("meteor/random"), {
  Random(v) {
    Random = v;
  }

}, 0);
let comparators;
module.watch(require("../lib/comparators"), {
  comparators(v) {
    comparators = v;
  }

}, 1);
const EQUALS_REGEXP = /^equals$/;
/**
 * This Class represents a Rule to be evaluated given a set of attributes
 * Rules have:
 * - An attribute (e.g. 'seriesDescription')
 * - A constraint Object, in the form required by Validate.js:
 *
 * rule.constraint = {
 *   contains: {
 *      value: 'T-1'
 *      }
 *   };
 *
 *  Note: In this example we use the 'contains' Validator, which is a custom Validator defined in Viewerbase
 *
 * - A value for whether or not they are Required to be matched (default: False)
 * - A value for their relative weighting during Protocol or Image matching (default: 1)
 */

class Rule {
  /**
   * The Constructor for the Class to create a Rule with the bare
   * minimum information
   *
   * @param name The desired name for the Rule
   */
  constructor(attribute, constraint, required, weight) {
    // Create a new UUID for this Rule
    this.id = Random.id(); // Set the Rule's weight (defaults to 1)

    this.weight = weight || 1; // If an attribute is specified, assign it

    if (attribute) {
      this.attribute = attribute;
    } // If a constraint is specified, assign it


    if (constraint) {
      this.constraint = constraint;
    } // If a value for 'required' is specified, assign it


    if (required === undefined) {
      // If no value was specified, default to False
      this.required = false;
    } else {
      this.required = required;
    } // Cache for constraint info object


    this._constraintInfo = void 0; // Cache for validator and value object

    this._validatorAndValue = void 0;
  }
  /**
   * Occasionally the Rule class needs to be instantiated from a JavaScript Object.
   * This function fills in a Protocol with the Object data.
   *
   * @param input A Rule as a JavaScript Object, e.g. retrieved from MongoDB or JSON
   */


  fromObject(input) {
    // Check if the input already has an ID
    // If so, keep it. It not, create a new UUID
    this.id = input.id || Random.id(); // Assign the specified input data to the Rule

    this.required = input.required;
    this.weight = input.weight;
    this.attribute = input.attribute;
    this.constraint = input.constraint;
  }
  /**
   * Get the constraint info object for the current constraint
   * @return {Object\undefined} Constraint object or undefined if current constraint 
   *                            is not valid or not found in comparators list
   */


  getConstraintInfo() {
    let constraintInfo = this._constraintInfo; // Check if info is cached already

    if (constraintInfo !== void 0) {
      return constraintInfo;
    }

    const ruleConstraint = Object.keys(this.constraint)[0];

    if (ruleConstraint !== void 0) {
      constraintInfo = comparators.find(comparator => ruleConstraint === comparator.id);
    } // Cache this information for later use


    this._constraintInfo = constraintInfo;
    return constraintInfo;
  }
  /**
  * Check if current rule is related to priors
  * @return {Boolean} True if a rule is related to priors or false otherwise
  */


  isRuleForPrior() {
    // @TODO: Should we check this too? this.attribute === 'relativeTime'
    return this.attribute === 'abstractPriorValue';
  }
  /**
   * If the current rule is a rule for priors, returns the number of referenced priors. Otherwise, returns -1.
   * @return {Number} The number of referenced priors or -1 if not applicable. Returns zero if the actual value could not be determined.
   */


  getNumberOfPriorsReferenced() {
    if (!this.isRuleForPrior()) {
      return -1;
    } // Get rule's validator and value


    const ruleValidatorAndValue = this.getConstraintValidatorAndValue();
    const {
      value,
      validator
    } = ruleValidatorAndValue;
    const intValue = parseInt(value, 10) || 0; // avoid possible NaN
    // "Equal to" validators

    if (EQUALS_REGEXP.test(validator)) {
      // In this case, -1 (the oldest prior) indicates that at least one study is used
      return intValue < 0 ? 1 : intValue;
    } // Default cases return value


    return 0;
  }
  /**
   * Get the constraint validator and value
   * @return {Object|undefined} Returns an object containing the validator and it's value or undefined
   */


  getConstraintValidatorAndValue() {
    let validatorAndValue = this._validatorAndValue; // Check if validator and value are cached already

    if (validatorAndValue !== void 0) {
      return validatorAndValue;
    } // Get the constraint info object


    const constraintInfo = this.getConstraintInfo(); // Constraint info object exists and is valid

    if (constraintInfo !== void 0) {
      const validator = constraintInfo.validator;
      const currentValidator = this.constraint[validator];

      if (currentValidator) {
        const constraintValidator = constraintInfo.validatorOption;
        const constraintValue = currentValidator[constraintValidator];
        validatorAndValue = {
          value: constraintValue,
          validator: constraintInfo.id
        };
        this._validatorAndValue = validatorAndValue;
      }
    }

    return validatorAndValue;
  }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Stage.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/Stage.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Random;
module.watch(require("meteor/random"), {
  Random(v) {
    Random = v;
  }

}, 0);

/**
 * A Stage is one step in the Display Set Sequence for a Hanging Protocol
 *
 * Stages are defined as a ViewportStructure and an array of Viewports
 *
 * @type {Stage}
 */
HP.Stage = class Stage {
  constructor(ViewportStructure, name) {
    // Create a new UUID for this Stage
    this.id = Random.id(); // Assign the name and ViewportStructure provided

    this.name = name;
    this.viewportStructure = ViewportStructure; // Create an empty array for the Viewports

    this.viewports = []; // Set the created date to Now

    this.createdDate = new Date();
  }
  /**
   * Creates a clone of the current Stage with a new name
   *
   * Note! This method absolutely cannot be renamed 'clone', because
   * Minimongo's insert method uses 'clone' internally and this
   * somehow causes very bizarre behaviour
   *
   * @param name
   * @returns {Stage|*}
   */


  createClone(name) {
    // Create a new JavaScript independent of the current Protocol
    var currentStage = Object.assign({}, this); // Create a new Stage to return

    var clonedStage = new HP.Stage(); // Assign the desired properties

    currentStage.id = clonedStage.id;
    clonedStage.fromObject(currentStage); // If we have specified a name, assign it

    if (name) {
      clonedStage.name = name;
    } // Return the cloned Stage


    return clonedStage;
  }
  /**
   * Occasionally the Stage class needs to be instantiated from a JavaScript Object.
   * This function fills in a Protocol with the Object data.
   *
   * @param input A Stage as a JavaScript Object, e.g. retrieved from MongoDB or JSON
   */


  fromObject(input) {
    // Check if the input already has an ID
    // If so, keep it. It not, create a new UUID
    this.id = input.id || Random.id(); // Assign the input name to the Stage

    this.name = input.name; // If a ViewportStructure is present in the input, add it from the
    // input data

    this.viewportStructure = new HP.ViewportStructure();
    this.viewportStructure.fromObject(input.viewportStructure); // If any viewports are present in the input object

    if (input.viewports) {
      input.viewports.forEach(viewportObject => {
        // Create a new Viewport with their data
        var viewport = new HP.Viewport();
        viewport.fromObject(viewportObject); // Add it to the viewports array

        this.viewports.push(viewport);
      });
    }
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Viewport.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/Viewport.js                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let removeFromArray;
module.watch(require("../lib/removeFromArray"), {
  removeFromArray(v) {
    removeFromArray = v;
  }

}, 0);

/**
 * This Class defines a Viewport in the Hanging Protocol Stage. A Viewport contains
 * arrays of Rules that are matched in the ProtocolEngine in order to determine which
 * images should be hung.
 *
 * @type {Viewport}
 */
HP.Viewport = class Viewport {
  constructor() {
    this.viewportSettings = {};
    this.imageMatchingRules = [];
    this.seriesMatchingRules = [];
    this.studyMatchingRules = [];
  }
  /**
   * Occasionally the Viewport class needs to be instantiated from a JavaScript Object.
   * This function fills in a Viewport with the Object data.
   *
   * @param input The Viewport as a JavaScript Object, e.g. retrieved from MongoDB or JSON
   */


  fromObject(input) {
    // If ImageMatchingRules exist, create them from the Object data
    // and add them to the Viewport's imageMatchingRules array
    if (input.imageMatchingRules) {
      input.imageMatchingRules.forEach(ruleObject => {
        var rule = new HP.ImageMatchingRule();
        rule.fromObject(ruleObject);
        this.imageMatchingRules.push(rule);
      });
    } // If SeriesMatchingRules exist, create them from the Object data
    // and add them to the Viewport's seriesMatchingRules array


    if (input.seriesMatchingRules) {
      input.seriesMatchingRules.forEach(ruleObject => {
        var rule = new HP.SeriesMatchingRule();
        rule.fromObject(ruleObject);
        this.seriesMatchingRules.push(rule);
      });
    } // If StudyMatchingRules exist, create them from the Object data
    // and add them to the Viewport's studyMatchingRules array


    if (input.studyMatchingRules) {
      input.studyMatchingRules.forEach(ruleObject => {
        var rule = new HP.StudyMatchingRule();
        rule.fromObject(ruleObject);
        this.studyMatchingRules.push(rule);
      });
    } // If ViewportSettings exist, add them to the current protocol


    if (input.viewportSettings) {
      this.viewportSettings = input.viewportSettings;
    }
  }
  /**
   * Finds and removes a rule from whichever array it exists in.
   * It is not required to specify if it exists in studyMatchingRules,
   * seriesMatchingRules, or imageMatchingRules
   *
   * @param rule
   */


  removeRule(rule) {
    var array;

    if (rule instanceof HP.StudyMatchingRule) {
      array = this.studyMatchingRules;
    } else if (rule instanceof HP.SeriesMatchingRule) {
      array = this.seriesMatchingRules;
    } else if (rule instanceof HP.ImageMatchingRule) {
      array = this.imageMatchingRules;
    }

    removeFromArray(array, rule);
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ViewportStructure.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/ViewportStructure.js                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/**
 * The ViewportStructure class represents the layout and layout properties that
 * Viewports are displayed in. ViewportStructure has a type, which corresponds to
 * a layout template, and a set of properties, which depend on the type.
 *
 * @type {ViewportStructure}
 */
HP.ViewportStructure = class ViewportStructure {
  constructor(type, properties) {
    this.type = type;
    this.properties = properties;
  }
  /**
   * Occasionally the ViewportStructure class needs to be instantiated from a JavaScript Object.
   * This function fills in a ViewportStructure with the Object data.
   *
   * @param input The ViewportStructure as a JavaScript Object, e.g. retrieved from MongoDB or JSON
   */


  fromObject(input) {
    this.type = input.type;
    this.properties = input.properties;
  }
  /**
   * Retrieve the layout template name based on the layout type
   *
   * @returns {string}
   */


  getLayoutTemplateName() {
    // Viewport structure can be updated later when we build more complex display layouts
    switch (this.type) {
      case 'grid':
        return 'gridLayout';
    }
  }
  /**
   * Retrieve the number of Viewports required for this layout
   * given the layout type and properties
   *
   * @returns {string}
   */


  getNumViewports() {
    // Viewport structure can be updated later when we build more complex display layouts
    switch (this.type) {
      case 'grid':
        // For the typical grid layout, we only need to multiply rows by columns to
        // obtain the number of viewports
        return this.properties.rows * this.properties.columns;
    }
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"rules":{"ImageMatchingRule.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/rules/ImageMatchingRule.js                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Rule;
module.watch(require("../Rule"), {
  Rule(v) {
    Rule = v;
  }

}, 0);

/**
 * The ImageMatchingRule class extends the Rule Class.
 *
 * At present it does not add any new methods or attributes
 * @type {ImageMatchingRule}
 */
HP.ImageMatchingRule = class ImageMatchingRule extends Rule {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ProtocolMatchingRule.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/rules/ProtocolMatchingRule.js                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Rule;
module.watch(require("../Rule"), {
  Rule(v) {
    Rule = v;
  }

}, 0);

/**
 * The ProtocolMatchingRule Class extends the Rule Class.
 *
 * At present it does not add any new methods or attributes
 * @type {ProtocolMatchingRule}
 */
HP.ProtocolMatchingRule = class ProtocolMatchingRule extends Rule {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SeriesMatchingRule.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/rules/SeriesMatchingRule.js                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Rule;
module.watch(require("../Rule"), {
  Rule(v) {
    Rule = v;
  }

}, 0);

/**
 * The SeriesMatchingRule Class extends the Rule Class.
 *
 * At present it does not add any new methods or attributes
 * @type {SeriesMatchingRule}
 */
HP.SeriesMatchingRule = class SeriesMatchingRule extends Rule {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"StudyMatchingRule.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/classes/rules/StudyMatchingRule.js                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Rule;
module.watch(require("../Rule"), {
  Rule(v) {
    Rule = v;
  }

}, 0);

/**
 * The StudyMatchingRule Class extends the Rule Class.
 *
 * At present it does not add any new methods or attributes
 * @type {StudyMatchingRule}
 */
HP.StudyMatchingRule = class StudyMatchingRule extends Rule {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"lib":{"comparators.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/lib/comparators.js                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  comparators: () => comparators
});
const comparators = [{
  id: 'equals',
  name: '= (Equals)',
  validator: 'equals',
  validatorOption: 'value',
  description: 'The attribute must equal this value.'
}, {
  id: 'doesNotEqual',
  name: '!= (Does not equal)',
  validator: 'doesNotEqual',
  validatorOption: 'value',
  description: 'The attribute must not equal this value.'
}, {
  id: 'contains',
  name: 'Contains',
  validator: 'contains',
  validatorOption: 'value',
  description: 'The attribute must contain this value.'
}, {
  id: 'doesNotContain',
  name: 'Does not contain',
  validator: 'doesNotContain',
  validatorOption: 'value',
  description: 'The attribute must not contain this value.'
}, {
  id: 'startsWith',
  name: 'Starts with',
  validator: 'startsWith',
  validatorOption: 'value',
  description: 'The attribute must start with this value.'
}, {
  id: 'endsWith',
  name: 'Ends with',
  validator: 'endsWith',
  validatorOption: 'value',
  description: 'The attribute must end with this value.'
}, {
  id: 'onlyInteger',
  name: 'Only Integers',
  validator: 'numericality',
  validatorOption: 'onlyInteger',
  description: "Real numbers won't be allowed."
}, {
  id: 'greaterThan',
  name: '> (Greater than)',
  validator: 'numericality',
  validatorOption: 'greaterThan',
  description: 'The attribute has to be greater than this value.'
}, {
  id: 'greaterThanOrEqualTo',
  name: '>= (Greater than or equal to)',
  validator: 'numericality',
  validatorOption: 'greaterThanOrEqualTo',
  description: 'The attribute has to be at least this value.'
}, {
  id: 'lessThanOrEqualTo',
  name: '<= (Less than or equal to)',
  validator: 'numericality',
  validatorOption: 'lessThanOrEqualTo',
  description: 'The attribute can be this value at the most.'
}, {
  id: 'lessThan',
  name: '< (Less than)',
  validator: 'numericality',
  validatorOption: 'lessThan',
  description: 'The attribute has to be less than this value.'
}, {
  id: 'odd',
  name: 'Odd',
  validator: 'numericality',
  validatorOption: 'odd',
  description: 'The attribute has to be odd.'
}, {
  id: 'even',
  name: 'Even',
  validator: 'numericality',
  validatorOption: 'even',
  description: 'The attribute has to be even.'
}]; // Immutable object

Object.freeze(comparators);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"removeFromArray.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/both/lib/removeFromArray.js                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  removeFromArray: () => removeFromArray
});

let _;

module.watch(require("meteor/underscore"), {
  _(v) {
    _ = v;
  }

}, 0);

/**
 * Removes the first instance of an element from an array, if an equal value exists
 *
 * @param array
 * @param input
 *
 * @returns {boolean} Whether or not the element was found and removed
 */
const removeFromArray = (array, input) => {
  // If the array is empty, stop here
  if (!array || !array.length) {
    return false;
  }

  array.forEach((value, index) => {
    if (_.isEqual(value, input)) {
      indexToRemove = index;
      return false;
    }
  });

  if (indexToRemove === void 0) {
    return false;
  }

  array.splice(indexToRemove, 1);
  return true;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"collections.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ohif_hanging-protocols/server/collections.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Meteor.publish('hangingprotocols', function () {
  // TODO: filter by availableTo user
  return HangingProtocols.find();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/node_modules/meteor/ohif:hanging-protocols/both/namespace.js");
require("/node_modules/meteor/ohif:hanging-protocols/both/collections.js");
require("/node_modules/meteor/ohif:hanging-protocols/both/schema.js");
require("/node_modules/meteor/ohif:hanging-protocols/both/hardcodedData.js");
require("/node_modules/meteor/ohif:hanging-protocols/both/testData.js");
require("/node_modules/meteor/ohif:hanging-protocols/server/collections.js");

/* Exports */
Package._define("ohif:hanging-protocols", {
  HP: HP
});

})();

//# sourceURL=meteor://💻app/packages/ohif_hanging-protocols.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL25hbWVzcGFjZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL2NvbGxlY3Rpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvc2NoZW1hLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvaGFyZGNvZGVkRGF0YS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL3Rlc3REYXRhLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvY2xhc3Nlcy9Qcm90b2NvbC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL2NsYXNzZXMvUnVsZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL2NsYXNzZXMvU3RhZ2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6aGFuZ2luZy1wcm90b2NvbHMvYm90aC9jbGFzc2VzL1ZpZXdwb3J0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvY2xhc3Nlcy9WaWV3cG9ydFN0cnVjdHVyZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9ib3RoL2NsYXNzZXMvcnVsZXMvSW1hZ2VNYXRjaGluZ1J1bGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6aGFuZ2luZy1wcm90b2NvbHMvYm90aC9jbGFzc2VzL3J1bGVzL1Byb3RvY29sTWF0Y2hpbmdSdWxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvY2xhc3Nlcy9ydWxlcy9TZXJpZXNNYXRjaGluZ1J1bGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29oaWY6aGFuZ2luZy1wcm90b2NvbHMvYm90aC9jbGFzc2VzL3J1bGVzL1N0dWR5TWF0Y2hpbmdSdWxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvbGliL2NvbXBhcmF0b3JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vaGlmOmhhbmdpbmctcHJvdG9jb2xzL2JvdGgvbGliL3JlbW92ZUZyb21BcnJheS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2hpZjpoYW5naW5nLXByb3RvY29scy9zZXJ2ZXIvY29sbGVjdGlvbnMuanMiXSwibmFtZXMiOlsiSFAiLCJIYW5naW5nUHJvdG9jb2xzIiwiTWV0ZW9yIiwiQ29sbGVjdGlvbiIsIl9kZWJ1Z05hbWUiLCJhbGxvdyIsImluc2VydCIsInVwZGF0ZSIsInJlbW92ZSIsImlzRGV2ZWxvcG1lbnQiLCJpc1NlcnZlciIsInN0YXJ0dXAiLCJtb2R1bGUiLCJ3YXRjaCIsInJlcXVpcmUiLCJhdHRyaWJ1dGVEZWZhdWx0cyIsImFic3RyYWN0UHJpb3JWYWx1ZSIsImRpc3BsYXlTZXR0aW5ncyIsImludmVydCIsImlkIiwidGV4dCIsImRlZmF1bHRWYWx1ZSIsIm9wdGlvbnMiLCJzdHVkeUF0dHJpYnV0ZXMiLCJwcm90b2NvbEF0dHJpYnV0ZXMiLCJzZXJpZXNBdHRyaWJ1dGVzIiwiaW5zdGFuY2VBdHRyaWJ1dGVzIiwiZ2V0RGVmYXVsdFByb3RvY29sIiwicHJvdG9jb2wiLCJQcm90b2NvbCIsImxvY2tlZCIsIm9uZUJ5T25lIiwiVmlld3BvcnRTdHJ1Y3R1cmUiLCJyb3dzIiwiY29sdW1ucyIsInZpZXdwb3J0IiwiVmlld3BvcnQiLCJmaXJzdCIsIlN0YWdlIiwidmlld3BvcnRzIiwicHVzaCIsInN0YWdlcyIsImRlZmF1bHRQcm90b2NvbCIsImdldE1SVHdvQnlUd29UZXN0IiwicHJvdG8iLCJzdHVkeUluc3RhbmNlVWlkIiwiUHJvdG9jb2xNYXRjaGluZ1J1bGUiLCJlcXVhbHMiLCJ2YWx1ZSIsImFkZFByb3RvY29sTWF0Y2hpbmdSdWxlIiwib25lQnlUd28iLCJsZWZ0IiwicmlnaHQiLCJmaXJzdFNlcmllcyIsIlNlcmllc01hdGNoaW5nUnVsZSIsInNlY29uZFNlcmllcyIsInRoaXJkSW1hZ2UiLCJJbWFnZU1hdGNoaW5nUnVsZSIsInNlcmllc01hdGNoaW5nUnVsZXMiLCJpbWFnZU1hdGNoaW5nUnVsZXMiLCJ0d29CeU9uZSIsImxlZnQyIiwicmlnaHQyIiwiZm91cnRoU2VyaWVzIiwiZmlmdGhTZXJpZXMiLCJzZWNvbmQiLCJ0ZXN0UHJvdG9jb2wiLCJnZXREZW1vUHJvdG9jb2xzIiwiZGVtb1Byb3RvY29scyIsInYiLCJSYW5kb20iLCJPSElGIiwicmVtb3ZlRnJvbUFycmF5IiwiY29uc3RydWN0b3IiLCJuYW1lIiwiaGFzVXBkYXRlZFByaW9yc0luZm9ybWF0aW9uIiwiY3JlYXRlZERhdGUiLCJEYXRlIiwibW9kaWZpZWREYXRlIiwidXNlciIsInVzZXJMb2dnZWRJbiIsImNyZWF0ZWRCeSIsImdldFVzZXJJZCIsIm1vZGlmaWVkQnkiLCJhdmFpbGFibGVUbyIsIlNldCIsImVkaXRhYmxlQnkiLCJwcm90b2NvbE1hdGNoaW5nUnVsZXMiLCJudW1iZXJPZlByaW9yc1JlZmVyZW5jZWQiLCJnZXROdW1iZXJPZlByaW9yc1JlZmVyZW5jZWQiLCJza2lwQ2FjaGUiLCJmb3JFYWNoIiwic3RhZ2UiLCJzdHVkeU1hdGNoaW5nUnVsZXMiLCJydWxlIiwicHJpb3JzUmVmZXJlbmNlZCIsInVwZGF0ZU51bWJlck9mUHJpb3JzUmVmZXJlbmNlZCIsInByb3RvY29sV2FzTW9kaWZpZWQiLCJmcm9tT2JqZWN0IiwiaW5wdXQiLCJydWxlT2JqZWN0Iiwic3RhZ2VPYmplY3QiLCJjcmVhdGVDbG9uZSIsImN1cnJlbnRQcm90b2NvbCIsIk9iamVjdCIsImFzc2lnbiIsImNsb25lZFByb3RvY29sIiwiYWRkU3RhZ2UiLCJyZW1vdmVQcm90b2NvbE1hdGNoaW5nUnVsZSIsIndhc1JlbW92ZWQiLCJleHBvcnQiLCJSdWxlIiwiY29tcGFyYXRvcnMiLCJFUVVBTFNfUkVHRVhQIiwiYXR0cmlidXRlIiwiY29uc3RyYWludCIsInJlcXVpcmVkIiwid2VpZ2h0IiwidW5kZWZpbmVkIiwiX2NvbnN0cmFpbnRJbmZvIiwiX3ZhbGlkYXRvckFuZFZhbHVlIiwiZ2V0Q29uc3RyYWludEluZm8iLCJjb25zdHJhaW50SW5mbyIsInJ1bGVDb25zdHJhaW50Iiwia2V5cyIsImZpbmQiLCJjb21wYXJhdG9yIiwiaXNSdWxlRm9yUHJpb3IiLCJydWxlVmFsaWRhdG9yQW5kVmFsdWUiLCJnZXRDb25zdHJhaW50VmFsaWRhdG9yQW5kVmFsdWUiLCJ2YWxpZGF0b3IiLCJpbnRWYWx1ZSIsInBhcnNlSW50IiwidGVzdCIsInZhbGlkYXRvckFuZFZhbHVlIiwiY3VycmVudFZhbGlkYXRvciIsImNvbnN0cmFpbnRWYWxpZGF0b3IiLCJ2YWxpZGF0b3JPcHRpb24iLCJjb25zdHJhaW50VmFsdWUiLCJ2aWV3cG9ydFN0cnVjdHVyZSIsImN1cnJlbnRTdGFnZSIsImNsb25lZFN0YWdlIiwidmlld3BvcnRPYmplY3QiLCJ2aWV3cG9ydFNldHRpbmdzIiwiU3R1ZHlNYXRjaGluZ1J1bGUiLCJyZW1vdmVSdWxlIiwiYXJyYXkiLCJ0eXBlIiwicHJvcGVydGllcyIsImdldExheW91dFRlbXBsYXRlTmFtZSIsImdldE51bVZpZXdwb3J0cyIsImRlc2NyaXB0aW9uIiwiZnJlZXplIiwiXyIsImxlbmd0aCIsImluZGV4IiwiaXNFcXVhbCIsImluZGV4VG9SZW1vdmUiLCJzcGxpY2UiLCJwdWJsaXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7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Sjs7QUFBTTdJLE9BQU9DLEtBQVAsQ0FBYUMsUUFBUSxtQkFBUixDQUFiLEVBQTBDO0FBQUMySSxJQUFFcEYsQ0FBRixFQUFJO0FBQUNvRixRQUFFcEYsQ0FBRjtBQUFJOztBQUFWLENBQTFDLEVBQXNELENBQXREOztBQUUzRDs7Ozs7Ozs7QUFRQSxNQUFNRyxrQkFBa0IsQ0FBQzBFLEtBQUQsRUFBUS9DLEtBQVIsS0FBa0I7QUFDdEM7QUFDQSxNQUFJLENBQUMrQyxLQUFELElBQ0EsQ0FBQ0EsTUFBTVEsTUFEWCxFQUNtQjtBQUNmLFdBQU8sS0FBUDtBQUNIOztBQUVEUixRQUFNdkQsT0FBTixDQUFjLENBQUMzQyxLQUFELEVBQVEyRyxLQUFSLEtBQWtCO0FBQzVCLFFBQUlGLEVBQUVHLE9BQUYsQ0FBVTVHLEtBQVYsRUFBaUJtRCxLQUFqQixDQUFKLEVBQTZCO0FBQ3pCMEQsc0JBQWdCRixLQUFoQjtBQUNBLGFBQU8sS0FBUDtBQUNIO0FBQ0osR0FMRDs7QUFPQSxNQUFJRSxrQkFBa0IsS0FBSyxDQUEzQixFQUE4QjtBQUMxQixXQUFPLEtBQVA7QUFDSDs7QUFFRFgsUUFBTVksTUFBTixDQUFhRCxhQUFiLEVBQTRCLENBQTVCO0FBQ0EsU0FBTyxJQUFQO0FBQ0gsQ0FwQkQsQzs7Ozs7Ozs7Ozs7QUNWQTNKLE9BQU82SixPQUFQLENBQWUsa0JBQWYsRUFBbUMsWUFBVztBQUMxQztBQUNBLFNBQU85SixpQkFBaUI0SCxJQUFqQixFQUFQO0FBQ0gsQ0FIRCxFIiwiZmlsZSI6Ii9wYWNrYWdlcy9vaGlmX2hhbmdpbmctcHJvdG9jb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiSFAgPSB7fTtcclxuIiwiSGFuZ2luZ1Byb3RvY29scyA9IG5ldyBNZXRlb3IuQ29sbGVjdGlvbignaGFuZ2luZ3Byb3RvY29scycpO1xyXG5IYW5naW5nUHJvdG9jb2xzLl9kZWJ1Z05hbWUgPSAnSGFuZ2luZ1Byb3RvY29scyc7XHJcblxyXG5IYW5naW5nUHJvdG9jb2xzLmFsbG93KHtcclxuICAgIGluc2VydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIEBUT0RPOiBSZW1vdmUgdGhpcyBhZnRlciBzdGFiaWxpemluZyBQcm90b2NvbEVuZ2luZVxyXG5pZiAoTWV0ZW9yLmlzRGV2ZWxvcG1lbnQgJiYgTWV0ZW9yLmlzU2VydmVyKSB7XHJcbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XHJcbiAgICAgICAgSGFuZ2luZ1Byb3RvY29scy5yZW1vdmUoe30pO1xyXG4gICAgfSk7XHJcbn1cclxuIiwiLy8gQFRPRE8gc3RhcnQgdXNpbmcgbmFtZXNwYWNlIGluc3RlYWRcclxuXHJcbi8vIEJhc2UgY2xhc3Nlc1xyXG5pbXBvcnQgJy4vY2xhc3Nlcy9Qcm90b2NvbCc7XHJcbmltcG9ydCAnLi9jbGFzc2VzL1N0YWdlJztcclxuaW1wb3J0ICcuL2NsYXNzZXMvVmlld3BvcnQnO1xyXG5pbXBvcnQgJy4vY2xhc3Nlcy9WaWV3cG9ydFN0cnVjdHVyZSc7XHJcblxyXG4vLyBTcGVjaWFsaXplZCBSdWxlIGNsYXNzZXNcclxuaW1wb3J0ICcuL2NsYXNzZXMvcnVsZXMvUHJvdG9jb2xNYXRjaGluZ1J1bGUnO1xyXG5pbXBvcnQgJy4vY2xhc3Nlcy9ydWxlcy9TdHVkeU1hdGNoaW5nUnVsZSc7XHJcbmltcG9ydCAnLi9jbGFzc2VzL3J1bGVzL1Nlcmllc01hdGNoaW5nUnVsZSc7XHJcbmltcG9ydCAnLi9jbGFzc2VzL3J1bGVzL0ltYWdlTWF0Y2hpbmdSdWxlJztcclxuIiwiSFAuYXR0cmlidXRlRGVmYXVsdHMgPSB7XHJcbiAgICBhYnN0cmFjdFByaW9yVmFsdWU6IDBcclxufTtcclxuXHJcbkhQLmRpc3BsYXlTZXR0aW5ncyA9IHtcclxuICAgIGludmVydDoge1xyXG4gICAgICAgIGlkOiAnaW52ZXJ0JyxcclxuICAgICAgICB0ZXh0OiAnU2hvdyBHcmF5c2NhbGUgSW52ZXJ0ZWQnLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ05PJyxcclxuICAgICAgICBvcHRpb25zOiBbJ1lFUycsICdOTyddXHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBAVE9ETyBGaXggYWJzdHJhY3RQcmlvclZhbHVlIGNvbXBhcmlzb25cclxuSFAuc3R1ZHlBdHRyaWJ1dGVzID0gW3tcclxuICAgIGlkOiAneDAwMTAwMDIwJyxcclxuICAgIHRleHQ6ICcoeDAwMTAwMDIwKSBQYXRpZW50IElEJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDIwMDAwZCcsXHJcbiAgICB0ZXh0OiAnKHgwMDIwMDAwZCkgU3R1ZHkgSW5zdGFuY2UgVUlEJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDA4MDAyMCcsXHJcbiAgICB0ZXh0OiAnKHgwMDA4MDAyMCkgU3R1ZHkgRGF0ZSdcclxufSwge1xyXG4gICAgaWQ6ICd4MDAwODAwMzAnLFxyXG4gICAgdGV4dDogJyh4MDAwODAwMzApIFN0dWR5IFRpbWUnXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMDgxMDMwJyxcclxuICAgIHRleHQ6ICcoeDAwMDgxMDMwKSBTdHVkeSBEZXNjcmlwdGlvbidcclxufSwge1xyXG4gICAgaWQ6ICdhYnN0cmFjdFByaW9yVmFsdWUnLFxyXG4gICAgdGV4dDogJ0Fic3RyYWN0IFByaW9yIFZhbHVlJ1xyXG59XTtcclxuXHJcbkhQLnByb3RvY29sQXR0cmlidXRlcyA9IFt7XHJcbiAgICBpZDogJ3gwMDEwMDAyMCcsXHJcbiAgICB0ZXh0OiAnKHgwMDEwMDAyMCkgUGF0aWVudCBJRCdcclxufSwge1xyXG4gICAgaWQ6ICd4MDAyMDAwMGQnLFxyXG4gICAgdGV4dDogJyh4MDAyMDAwMGQpIFN0dWR5IEluc3RhbmNlIFVJRCdcclxufSwge1xyXG4gICAgaWQ6ICd4MDAwODAwMjAnLFxyXG4gICAgdGV4dDogJyh4MDAwODAwMjApIFN0dWR5IERhdGUnXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMDgwMDMwJyxcclxuICAgIHRleHQ6ICcoeDAwMDgwMDMwKSBTdHVkeSBUaW1lJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDA4MTAzMCcsXHJcbiAgICB0ZXh0OiAnKHgwMDA4MTAzMCkgU3R1ZHkgRGVzY3JpcHRpb24nXHJcbn0sIHtcclxuICAgIGlkOiAnYW5hdG9taWNSZWdpb24nLFxyXG4gICAgdGV4dDogJ0FuYXRvbWljIFJlZ2lvbidcclxufV07XHJcblxyXG5IUC5zZXJpZXNBdHRyaWJ1dGVzID0gW3tcclxuICAgIGlkOiAneDAwMjAwMDBlJyxcclxuICAgIHRleHQ6ICcoeDAwMjAwMDBlKSBTZXJpZXMgSW5zdGFuY2UgVUlEJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDA4MDA2MCcsXHJcbiAgICB0ZXh0OiAnKHgwMDA4MDA2MCkgTW9kYWxpdHknXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMjAwMDExJyxcclxuICAgIHRleHQ6ICcoeDAwMjAwMDExKSBTZXJpZXMgTnVtYmVyJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDA4MTAzZScsXHJcbiAgICB0ZXh0OiAnKHgwMDA4MTAzZSkgU2VyaWVzIERlc2NyaXB0aW9uJ1xyXG59LCB7XHJcbiAgICBpZDogJ251bUltYWdlcycsXHJcbiAgICB0ZXh0OiAnTnVtYmVyIG9mIEltYWdlcydcclxufV07XHJcblxyXG5IUC5pbnN0YW5jZUF0dHJpYnV0ZXMgPSBbe1xyXG4gICAgaWQ6ICd4MDAwODAwMTYnLFxyXG4gICAgdGV4dDogJyh4MDAwODAwMTYpIFNPUCBDbGFzcyBVSUQnXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMDgwMDE4JyxcclxuICAgIHRleHQ6ICcoeDAwMDgwMDE4KSBTT1AgSW5zdGFuY2UgVUlEJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDE4NTEwMScsXHJcbiAgICB0ZXh0OiAnKHgwMDE4NTEwMSkgVmlldyBQb3NpdGlvbidcclxufSwge1xyXG4gICAgaWQ6ICd4MDAyMDAwMTMnLFxyXG4gICAgdGV4dDogJyh4MDAyMDAwMTMpIEluc3RhbmNlIE51bWJlcidcclxufSwge1xyXG4gICAgaWQ6ICd4MDAwODAwMDgnLFxyXG4gICAgdGV4dDogJyh4MDAwODAwMDgpIEltYWdlIFR5cGUnXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMTgxMDYzJyxcclxuICAgIHRleHQ6ICcoeDAwMTgxMDYzKSBGcmFtZSBUaW1lJ1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDIwMDA2MCcsXHJcbiAgICB0ZXh0OiAnKHgwMDIwMDA2MCkgTGF0ZXJhbGl0eSdcclxufSwge1xyXG4gICAgaWQ6ICd4MDA1NDEzMzAnLFxyXG4gICAgdGV4dDogJyh4MDA1NDEzMzApIEltYWdlIEluZGV4J1xyXG59LCB7XHJcbiAgICBpZDogJ3gwMDI4MDAwNCcsXHJcbiAgICB0ZXh0OiAnKHgwMDI4MDAwNCkgUGhvdG9tZXRyaWMgSW50ZXJwcmV0YXRpb24nXHJcbn0sIHtcclxuICAgIGlkOiAneDAwMTgwMDUwJyxcclxuICAgIHRleHQ6ICcoeDAwMTgwMDUwKSBTbGljZSBUaGlja25lc3MnXHJcbn1dO1xyXG4iLCJmdW5jdGlvbiBnZXREZWZhdWx0UHJvdG9jb2woKSB7XHJcbiAgICB2YXIgcHJvdG9jb2wgPSBuZXcgSFAuUHJvdG9jb2woJ0RlZmF1bHQnKTtcclxuICAgIHByb3RvY29sLmlkID0gJ2RlZmF1bHRQcm90b2NvbCc7XHJcbiAgICBwcm90b2NvbC5sb2NrZWQgPSB0cnVlO1xyXG5cclxuICAgIHZhciBvbmVCeU9uZSA9IG5ldyBIUC5WaWV3cG9ydFN0cnVjdHVyZSgnZ3JpZCcsIHtcclxuICAgICAgICByb3dzOiAxLFxyXG4gICAgICAgIGNvbHVtbnM6IDFcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciB2aWV3cG9ydCA9IG5ldyBIUC5WaWV3cG9ydCgpO1xyXG4gICAgdmFyIGZpcnN0ID0gbmV3IEhQLlN0YWdlKG9uZUJ5T25lLCAnb25lQnlPbmUnKTtcclxuICAgIGZpcnN0LnZpZXdwb3J0cy5wdXNoKHZpZXdwb3J0KTtcclxuXHJcbiAgICBwcm90b2NvbC5zdGFnZXMucHVzaChmaXJzdCk7XHJcblxyXG4gICAgSFAuZGVmYXVsdFByb3RvY29sID0gcHJvdG9jb2w7XHJcbiAgICByZXR1cm4gSFAuZGVmYXVsdFByb3RvY29sO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNUlR3b0J5VHdvVGVzdCgpIHtcclxuICAgIHZhciBwcm90byA9IG5ldyBIUC5Qcm90b2NvbCgnTVJfVHdvQnlUd28nKTtcclxuICAgIHByb3RvLmlkID0gJ01SX1R3b0J5VHdvJztcclxuICAgIHByb3RvLmxvY2tlZCA9IHRydWU7XHJcbiAgICAvLyBVc2UgaHR0cDovL2xvY2FsaG9zdDozMDAwL3ZpZXdlci8xLjIuODQwLjExMzYxOS4yLjUuMTc2MjU4MzE1My4yMTU1MTkuOTc4OTU3MDYzLjc4XHJcblxyXG4gICAgdmFyIHN0dWR5SW5zdGFuY2VVaWQgPSBuZXcgSFAuUHJvdG9jb2xNYXRjaGluZ1J1bGUoJ3N0dWR5SW5zdGFuY2VVaWQnLCB7XHJcbiAgICAgICAgZXF1YWxzOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnMS4yLjg0MC4xMTM2MTkuMi41LjE3NjI1ODMxNTMuMjE1NTE5Ljk3ODk1NzA2My43OCdcclxuICAgICAgICB9XHJcbiAgICB9LCB0cnVlKTtcclxuXHJcbiAgICBwcm90by5hZGRQcm90b2NvbE1hdGNoaW5nUnVsZShzdHVkeUluc3RhbmNlVWlkKTtcclxuXHJcbiAgICB2YXIgb25lQnlUd28gPSBuZXcgSFAuVmlld3BvcnRTdHJ1Y3R1cmUoJ2dyaWQnLCB7XHJcbiAgICAgICAgcm93czogMSxcclxuICAgICAgICBjb2x1bW5zOiAyXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdGFnZSAxXHJcbiAgICB2YXIgbGVmdCA9IG5ldyBIUC5WaWV3cG9ydCgpO1xyXG4gICAgdmFyIHJpZ2h0ID0gbmV3IEhQLlZpZXdwb3J0KCk7XHJcblxyXG4gICAgdmFyIGZpcnN0U2VyaWVzID0gbmV3IEhQLlNlcmllc01hdGNoaW5nUnVsZSgnc2VyaWVzTnVtYmVyJywge1xyXG4gICAgICAgIGVxdWFsczoge1xyXG4gICAgICAgICAgICB2YWx1ZTogMVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBzZWNvbmRTZXJpZXMgPSBuZXcgSFAuU2VyaWVzTWF0Y2hpbmdSdWxlKCdzZXJpZXNOdW1iZXInLCB7XHJcbiAgICAgICAgZXF1YWxzOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAyXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIHRoaXJkSW1hZ2UgPSBuZXcgSFAuSW1hZ2VNYXRjaGluZ1J1bGUoJ2luc3RhbmNlTnVtYmVyJywge1xyXG4gICAgICAgIGVxdWFsczoge1xyXG4gICAgICAgICAgICB2YWx1ZTogM1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGxlZnQuc2VyaWVzTWF0Y2hpbmdSdWxlcy5wdXNoKGZpcnN0U2VyaWVzKTtcclxuICAgIGxlZnQuaW1hZ2VNYXRjaGluZ1J1bGVzLnB1c2godGhpcmRJbWFnZSk7XHJcblxyXG4gICAgcmlnaHQuc2VyaWVzTWF0Y2hpbmdSdWxlcy5wdXNoKHNlY29uZFNlcmllcyk7XHJcbiAgICByaWdodC5pbWFnZU1hdGNoaW5nUnVsZXMucHVzaCh0aGlyZEltYWdlKTtcclxuXHJcbiAgICB2YXIgZmlyc3QgPSBuZXcgSFAuU3RhZ2Uob25lQnlUd28sICdvbmVCeVR3bycpO1xyXG4gICAgZmlyc3Qudmlld3BvcnRzLnB1c2gobGVmdCk7XHJcbiAgICBmaXJzdC52aWV3cG9ydHMucHVzaChyaWdodCk7XHJcblxyXG4gICAgcHJvdG8uc3RhZ2VzLnB1c2goZmlyc3QpO1xyXG5cclxuICAgIC8vIFN0YWdlIDJcclxuICAgIHZhciB0d29CeU9uZSA9IG5ldyBIUC5WaWV3cG9ydFN0cnVjdHVyZSgnZ3JpZCcsIHtcclxuICAgICAgICByb3dzOiAyLFxyXG4gICAgICAgIGNvbHVtbnM6IDFcclxuICAgIH0pO1xyXG4gICAgdmFyIGxlZnQyID0gbmV3IEhQLlZpZXdwb3J0KCk7XHJcbiAgICB2YXIgcmlnaHQyID0gbmV3IEhQLlZpZXdwb3J0KCk7XHJcblxyXG4gICAgdmFyIGZvdXJ0aFNlcmllcyA9IG5ldyBIUC5TZXJpZXNNYXRjaGluZ1J1bGUoJ3Nlcmllc051bWJlcicsIHtcclxuICAgICAgICBlcXVhbHM6IHtcclxuICAgICAgICAgICAgdmFsdWU6IDRcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZmlmdGhTZXJpZXMgPSBuZXcgSFAuU2VyaWVzTWF0Y2hpbmdSdWxlKCdzZXJpZXNOdW1iZXInLCB7XHJcbiAgICAgICAgZXF1YWxzOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiA1XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGVmdDIuc2VyaWVzTWF0Y2hpbmdSdWxlcy5wdXNoKGZvdXJ0aFNlcmllcyk7XHJcbiAgICBsZWZ0Mi5pbWFnZU1hdGNoaW5nUnVsZXMucHVzaCh0aGlyZEltYWdlKTtcclxuICAgIHJpZ2h0Mi5zZXJpZXNNYXRjaGluZ1J1bGVzLnB1c2goZmlmdGhTZXJpZXMpO1xyXG4gICAgcmlnaHQyLmltYWdlTWF0Y2hpbmdSdWxlcy5wdXNoKHRoaXJkSW1hZ2UpO1xyXG5cclxuICAgIHZhciBzZWNvbmQgPSBuZXcgSFAuU3RhZ2UodHdvQnlPbmUsICd0d29CeU9uZScpO1xyXG4gICAgc2Vjb25kLnZpZXdwb3J0cy5wdXNoKGxlZnQyKTtcclxuICAgIHNlY29uZC52aWV3cG9ydHMucHVzaChyaWdodDIpO1xyXG5cclxuICAgIHByb3RvLnN0YWdlcy5wdXNoKHNlY29uZCk7XHJcblxyXG4gICAgSFAudGVzdFByb3RvY29sID0gcHJvdG87XHJcbiAgICByZXR1cm4gSFAudGVzdFByb3RvY29sO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREZW1vUHJvdG9jb2xzKCkge1xyXG5cclxuICAgIEhQLmRlbW9Qcm90b2NvbHMgPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbW8gIzFcclxuICAgICAqL1xyXG4gICAgSFAuZGVtb1Byb3RvY29scy5wdXNoKHtcclxuICAgICAgICBcImlkXCI6IFwiZGVtb1Byb3RvY29sMVwiLFxyXG4gICAgICAgIFwibG9ja2VkXCI6IGZhbHNlLFxyXG4gICAgICAgIFwibmFtZVwiOiBcIkRGQ0ktQ1QtQ0hFU1QtQ09NUEFSRVwiLFxyXG4gICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjA3OjA5LjAzM1pcIixcclxuICAgICAgICBcIm1vZGlmaWVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MTg6NDMuOTMwWlwiLFxyXG4gICAgICAgIFwiYXZhaWxhYmxlVG9cIjoge30sXHJcbiAgICAgICAgXCJlZGl0YWJsZUJ5XCI6IHt9LFxyXG4gICAgICAgIFwicHJvdG9jb2xNYXRjaGluZ1J1bGVzXCI6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjd0bXVxN0t6RE1DV0ZlYXBjXCIsXHJcbiAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAyLFxyXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDMwXCIsXHJcbiAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiREZDSSBDVCBDSEVTVFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBcInN0YWdlc1wiOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ2NVBmR3Q5RjZtZmZaUGlmNVwiLFxyXG4gICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwib25lQnlPbmVcIixcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydHNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCIyLjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ5Z3o0bmIyOGlKWmNKaG5ZYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjIuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidURvRWdMVHZuWFRCeVduUHpcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJhYnN0cmFjdFByaW9yVmFsdWVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIlhUenU4SEIzZmVlcDNIWUtzXCIsXHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJncmlkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29sdW1uc1wiOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY056Wkw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwieWd6NG5iMjhpSlpjSmhuWWFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCIzLjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInVEb0VnTFR2blhUQnlXblB6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MTIuMDg1WlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzeVBZTmFlRnRyNzZRejNqcVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFN0cnVjdHVyZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicm93c1wiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJsYXlvdXRUZW1wbGF0ZU5hbWVcIjogXCJncmlkTGF5b3V0XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2xQcmVzZXRcIjogXCJMdW5nXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInlnejRuYjI4aUpaY0pobllhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiTHVuZyAzLjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI2dmRCUlpZbnFtbW9zaXBwaFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJTeGZUeWhHY01ocjU2UHRQTVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcImFic3RyYWN0UHJpb3JWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXF1YWxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndsUHJlc2V0XCI6IFwiTHVuZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJGVEF5Q2haQ1BXNjh5SmpYRFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkx1bmcgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJnTUpqZnJic3FZTmJFclB4NVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcImFic3RyYWN0UHJpb3JWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXF1YWxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjExOjQwLjQ4OVpcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBcIm51bWJlck9mUHJpb3JzUmVmZXJlbmNlZFwiOiA0XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbW8gIzJcclxuICAgICAqL1xyXG5cclxuICAgIEhQLmRlbW9Qcm90b2NvbHMucHVzaCh7XHJcbiAgICAgICAgXCJpZFwiOiBcImRlbW9Qcm90b2NvbDJcIixcclxuICAgICAgICBcImxvY2tlZFwiOiBmYWxzZSxcclxuICAgICAgICBcIm5hbWVcIjogXCJERkNJLUNULUNIRVNULUNPTVBBUkUtMlwiLFxyXG4gICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjA3OjA5LjAzM1pcIixcclxuICAgICAgICBcIm1vZGlmaWVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MTg6NDMuOTMwWlwiLFxyXG4gICAgICAgIFwiYXZhaWxhYmxlVG9cIjoge30sXHJcbiAgICAgICAgXCJlZGl0YWJsZUJ5XCI6IHt9LFxyXG4gICAgICAgIFwicHJvdG9jb2xNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCI3dG11cTdLekRNQ1dGZWFwY1wiLFxyXG4gICAgICAgICAgICBcIndlaWdodFwiOiAyLFxyXG4gICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzMFwiLFxyXG4gICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkRGQ0kgQ1QgQ0hFU1RcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJzdGFnZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcInY1UGZHdDlGNm1mZlpQaWY1XCIsXHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIm9uZUJ5T25lXCIsXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTZ6N21hY1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjIuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInlnejRuYjI4aUpaY0poblljXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiMi4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidURvRWdMVHZuWFRCeVduUHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJhYnN0cmFjdFByaW9yVmFsdWVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCJYVHp1OEhCM2ZlZXAzSFlLc1wiLFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJCb2R5IDMuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1ZbnNDY053Wkw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiQm9keSA1LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ5Z3o0bmIyOGlKWmNKaG5ZYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwieWd6NG5iMjlpSlpjSmhuWWFcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJCb2R5IDUuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInVEb0VnTFR2blhUQnlXblB6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MTIuMDg1WlwiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImlkXCI6IFwiM3lQWU5hZUZ0cjc2UXozanFcIixcclxuICAgICAgICAgICAgXCJ2aWV3cG9ydFN0cnVjdHVyZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJncmlkXCIsXHJcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicm93c1wiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sdW1uc1wiOiAyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJsYXlvdXRUZW1wbGF0ZU5hbWVcIjogXCJncmlkTGF5b3V0XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ2aWV3cG9ydHNcIjogW3tcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY056Wkw1Nno3bXRyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiQm9keSAzLjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJqWG5zQ2NOelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgNS4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIndsUHJlc2V0XCI6IFwiTHVuZ1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwieWd6NG5iMjhpSlpjSmhuWWJcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJMdW5nIDMuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInljejRuYjI4aUpaY0pobllhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiTHVuZyA1LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI2dmRCUlpZbnFtbW9zaXBwaFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiNnZkQlJGWW5xbW1vc2lwcGhcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJCb2R5IDUuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIlN4ZlR5aEdjTWhyNTZQdFBNXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwid2xQcmVzZXRcIjogXCJMdW5nXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJGVEF5Q2haQ1BXNjh5SmpYRFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkx1bmcgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiRFRBeUNoWkNQVzY4eUpqWERcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJMdW5nIDUuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImdNSmpmcmJzcVlOYkVyUHg1XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MTE6NDAuNDg5WlwiXHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJudW1iZXJPZlByaW9yc1JlZmVyZW5jZWRcIjogMVxyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZW1vOiBzY3JlZW5DVFxyXG4gICAgICovXHJcblxyXG4gICAgSFAuZGVtb1Byb3RvY29scy5wdXNoKHtcclxuICAgICAgICBcImlkXCI6IFwic2NyZWVuQ1RcIixcclxuICAgICAgICBcImxvY2tlZFwiOiBmYWxzZSxcclxuICAgICAgICBcIm5hbWVcIjogXCJERkNJLUNULUNIRVNULVNDUkVFTlwiLFxyXG4gICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjA3OjA5LjAzM1pcIixcclxuICAgICAgICBcIm1vZGlmaWVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MTg6NDMuOTMwWlwiLFxyXG4gICAgICAgIFwiYXZhaWxhYmxlVG9cIjoge30sXHJcbiAgICAgICAgXCJlZGl0YWJsZUJ5XCI6IHt9LFxyXG4gICAgICAgIFwicHJvdG9jb2xNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCI3dG11cTdLekRNQ1dGZWFwY1wiLFxyXG4gICAgICAgICAgICBcIndlaWdodFwiOiAyLFxyXG4gICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzMFwiLFxyXG4gICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkRGQ0kgQ1QgQ0hFU1RcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJzdGFnZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcInY1UGZHdDlGNm1mZlpQaWY1XCIsXHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIm9uZUJ5T25lXCIsXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTV6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjIuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJpZFwiOiBcInY1UGZHdDlGNG1mZlpQaWY1XCIsXHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIm9uZUJ5T25lXCIsXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTZ6N25UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkJvZHkgNS4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejdyVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJCb2R5IDMuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY056Wkw1NnI3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiTHVuZyA1LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTZhN21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkx1bmcgMy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjUnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJCb2R5IDQuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY056VEw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiQ29yb25hbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY016Wkw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiQm9keSA0LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NBelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlNhZ2l0dGFsXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjA3OjA5LjAzM1pcIlxyXG4gICAgICAgIH1dLFxyXG4gICAgICAgIFwibnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkXCI6IDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVtbzogUEVUQ1RTQ1JFRU5cclxuICAgICAqL1xyXG5cclxuICAgIEhQLmRlbW9Qcm90b2NvbHMucHVzaCh7XHJcbiAgICAgICAgXCJpZFwiOiBcIlBFVENUU0NSRUVOXCIsXHJcbiAgICAgICAgXCJsb2NrZWRcIjogZmFsc2UsXHJcbiAgICAgICAgXCJuYW1lXCI6IFwiUEVUQ1QtU0NSRUVOXCIsXHJcbiAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MDkuMDMzWlwiLFxyXG4gICAgICAgIFwibW9kaWZpZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjoxODo0My45MzBaXCIsXHJcbiAgICAgICAgXCJhdmFpbGFibGVUb1wiOiB7fSxcclxuICAgICAgICBcImVkaXRhYmxlQnlcIjoge30sXHJcbiAgICAgICAgXCJwcm90b2NvbE1hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcIjd0bXVxZ0t6RE1DV0ZlYXBjXCIsXHJcbiAgICAgICAgICAgIFwid2VpZ2h0XCI6IDUsXHJcbiAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDMwXCIsXHJcbiAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiUEVUQ1RcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJzdGFnZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcInY1UGZHdDlGNm1GZ1pQaWY1XCIsXHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIm9uZUJ5T25lXCIsXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NBelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlRvcG9ncmFtXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaUjU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJUb3BvZ3JhbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1SbnNDY056Wkw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMjAwMDExXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJudW1lcmljYWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJncmVhdGVyVGhhbk9yRXF1YWxUb1wiOiAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCJ2NVBmR3Q5RjZtRmdaUGlmNVwiLFxyXG4gICAgICAgICAgICBcIm5hbWVcIjogXCJvbmVCeU9uZVwiLFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0djTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJQRVQgV0IgQ29ycmVjdGVkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0hjTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJDVCBXQlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCJ2NVBmR3Q5RjZtRmdaUGlmNVwiLFxyXG4gICAgICAgICAgICBcIm5hbWVcIjogXCJvbmVCeU9uZVwiLFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcImludmVydFwiOiBcIllFU1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuZUNjTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJQRVQgV0IgVW5jb3JyZWN0ZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ3VOelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkNUIE5rXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIFwiY3JlYXRlZERhdGVcIjogXCIyMDE3LTAyLTE0VDE2OjA3OjA5LjAzM1pcIlxyXG4gICAgICAgIH1dLFxyXG4gICAgICAgIFwibnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkXCI6IDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVtbzogUEVUQ1RDT01QQVJFXHJcbiAgICAgKi9cclxuXHJcbiAgICBIUC5kZW1vUHJvdG9jb2xzLnB1c2goe1xyXG4gICAgICAgIFwiaWRcIjogXCJQRVRDVENPTVBBUkVcIixcclxuICAgICAgICBcImxvY2tlZFwiOiBmYWxzZSxcclxuICAgICAgICBcIm5hbWVcIjogXCJQRVRDVC1DT01QQVJFXCIsXHJcbiAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MDkuMDMzWlwiLFxyXG4gICAgICAgIFwibW9kaWZpZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjoxODo0My45MzBaXCIsXHJcbiAgICAgICAgXCJhdmFpbGFibGVUb1wiOiB7fSxcclxuICAgICAgICBcImVkaXRhYmxlQnlcIjoge30sXHJcbiAgICAgICAgXCJwcm90b2NvbE1hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcIjd0bXVxZ0t6RE1DV0ZlYXBjXCIsXHJcbiAgICAgICAgICAgIFwid2VpZ2h0XCI6IDUsXHJcbiAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDMwXCIsXHJcbiAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiUEVUQ1RcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJzdGFnZXNcIjogW3tcclxuICAgICAgICAgICAgXCJpZFwiOiBcInY1UGZHdDlGNm1GZ1pQaWY1XCIsXHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIm9uZUJ5T25lXCIsXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRTdHJ1Y3R1cmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZ3JpZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvd3NcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNvbHVtbnNcIjogMlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwibGF5b3V0VGVtcGxhdGVOYW1lXCI6IFwiZ3JpZExheW91dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmlld3BvcnRzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTl6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlRvcG9ncmFtXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejdsVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJUb3BvZ3JhbVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInVEb0VnTFRiblhUQnlXblB6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MDkuMDMzWlwiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImlkXCI6IFwidjVQZkd0OUY2bUZnWlBpZjVcIixcclxuICAgICAgICAgICAgXCJuYW1lXCI6IFwib25lQnlPbmVcIixcclxuICAgICAgICAgICAgXCJ2aWV3cG9ydFN0cnVjdHVyZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJncmlkXCIsXHJcbiAgICAgICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicm93c1wiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sdW1uc1wiOiAyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJsYXlvdXRUZW1wbGF0ZU5hbWVcIjogXCJncmlkTGF5b3V0XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ2aWV3cG9ydHNcIjogW3tcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY05qWkw1Nno3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiVG9wb2dyYW1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpMNTZ6N2dUWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDIwMDAxMVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibnVtZXJpY2FsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsVG9cIjogMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NDelpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlRvcG9ncmFtXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAyMDAwMTFcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm51bWVyaWNhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImdyZWF0ZXJUaGFuT3JFcXVhbFRvXCI6IDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidURvRWdMVHZuMVRCeVduUHpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJhYnN0cmFjdFByaW9yVmFsdWVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCJ2NVBmR3Q5RjZtRmdaUGlmNVwiLFxyXG4gICAgICAgICAgICBcIm5hbWVcIjogXCJvbmVCeU9uZVwiLFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDI2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJQRVQgV0IgQ29ycmVjdGVkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDQ2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJDVCBXQlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFtdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIFwidmlld3BvcnRTZXR0aW5nc1wiOiB7fSxcclxuICAgICAgICAgICAgICAgIFwiaW1hZ2VNYXRjaGluZ1J1bGVzXCI6IFtdLFxyXG4gICAgICAgICAgICAgICAgXCJzZXJpZXNNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm1YbnNDY056Wkw1N3o3bVRaXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwieDAwMDgxMDNlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiUEVUIFdCIENvcnJlY3RlZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInVEb0VnTFR2bllUQnlXblB6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOelpRNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkNUIFdCXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidURvRWdMVHZuS1RCeVduUHpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJhYnN0cmFjdFByaW9yVmFsdWVcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImVxdWFsc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBcImNyZWF0ZWREYXRlXCI6IFwiMjAxNy0wMi0xNFQxNjowNzowOS4wMzNaXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogXCJ2NVBmR3Q5RjZtRmdaUGlmNVwiLFxyXG4gICAgICAgICAgICBcIm5hbWVcIjogXCJvbmVCeU9uZVwiLFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0U3RydWN0dXJlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImdyaWRcIixcclxuICAgICAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3dzXCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2x1bW5zXCI6IDJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImxheW91dFRlbXBsYXRlTmFtZVwiOiBcImdyaWRMYXlvdXRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZpZXdwb3J0c1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcImludmVydFwiOiBcIllFU1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaTDU2ejduVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJQRVQgV0IgVW5jb3JyZWN0ZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBcInZpZXdwb3J0U2V0dGluZ3NcIjoge30sXHJcbiAgICAgICAgICAgICAgICBcImltYWdlTWF0Y2hpbmdSdWxlc1wiOiBbXSxcclxuICAgICAgICAgICAgICAgIFwic2VyaWVzTWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJtWG5zQ2NOeFpMNTZ6N21UWlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcIngwMDA4MTAzZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbnNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkNUIE5rXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgXCJzdHVkeU1hdGNoaW5nUnVsZXNcIjogW11cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcImludmVydFwiOiBcIllFU1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaQTU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJQRVQgV0IgVW5jb3JyZWN0ZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICBcInN0dWR5TWF0Y2hpbmdSdWxlc1wiOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ1RG9FZ0hUdm5YVEJ5V25QelwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwid2VpZ2h0XCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZVwiOiBcImFic3RyYWN0UHJpb3JWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29uc3RyYWludFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZXF1YWxzXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgXCJ2aWV3cG9ydFNldHRpbmdzXCI6IHt9LFxyXG4gICAgICAgICAgICAgICAgXCJpbWFnZU1hdGNoaW5nUnVsZXNcIjogW10sXHJcbiAgICAgICAgICAgICAgICBcInNlcmllc01hdGNoaW5nUnVsZXNcIjogW3tcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibVhuc0NjTnpaUDU2ejdtVFpcIixcclxuICAgICAgICAgICAgICAgICAgICBcIndlaWdodFwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVcIjogXCJ4MDAwODEwM2VcIixcclxuICAgICAgICAgICAgICAgICAgICBcImNvbnN0cmFpbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJDVCBOa1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIFwic3R1ZHlNYXRjaGluZ1J1bGVzXCI6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInVEb0VnSVR2blhUQnlXblB6XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWlnaHRcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCI6IFwiYWJzdHJhY3RQcmlvclZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb25zdHJhaW50XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJlcXVhbHNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgXCJjcmVhdGVkRGF0ZVwiOiBcIjIwMTctMDItMTRUMTY6MDc6MDkuMDMzWlwiXHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgXCJudW1iZXJPZlByaW9yc1JlZmVyZW5jZWRcIjogMVxyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5nZXREZWZhdWx0UHJvdG9jb2woKTtcclxuLy9nZXRNUlR3b0J5VHdvVGVzdCgpO1xyXG4vL2dldERlbW9Qcm90b2NvbHMoKTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IFJhbmRvbSB9IGZyb20gJ21ldGVvci9yYW5kb20nO1xyXG5pbXBvcnQgeyBPSElGIH0gZnJvbSAnbWV0ZW9yL29oaWY6Y29yZSc7XHJcblxyXG4vLyBMb2NhbCBpbXBvcnRzXHJcbmltcG9ydCB7IHJlbW92ZUZyb21BcnJheSB9IGZyb20gJy4uL2xpYi9yZW1vdmVGcm9tQXJyYXknO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIEhhbmdpbmcgUHJvdG9jb2wgYXQgdGhlIGhpZ2hlc3QgbGV2ZWxcclxuICpcclxuICogQHR5cGUge1Byb3RvY29sfVxyXG4gKi9cclxuSFAuUHJvdG9jb2wgPSBjbGFzcyBQcm90b2NvbCB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBDb25zdHJ1Y3RvciBmb3IgdGhlIENsYXNzIHRvIGNyZWF0ZSBhIFByb3RvY29sIHdpdGggdGhlIGJhcmVcclxuICAgICAqIG1pbmltdW0gaW5mb3JtYXRpb25cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbmFtZSBUaGUgZGVzaXJlZCBuYW1lIGZvciB0aGUgUHJvdG9jb2xcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBVVUlEIGZvciB0aGlzIFByb3RvY29sXHJcbiAgICAgICAgdGhpcy5pZCA9IFJhbmRvbS5pZCgpO1xyXG5cclxuICAgICAgICAvLyBTdG9yZSBhIHZhbHVlIHdoaWNoIGRldGVybWluZXMgd2hldGhlciBvciBub3QgYSBQcm90b2NvbCBpcyBsb2NrZWRcclxuICAgICAgICAvLyBUaGlzIGlzIHByb2JhYmx5IHRlbXBvcmFyeSwgc2luY2Ugd2Ugd2lsbCBldmVudHVhbGx5IGhhdmUgcm9sZSAvIHVzZXJcclxuICAgICAgICAvLyBjaGVja3MgZm9yIGVkaXRpbmcuIEZvciBub3cgd2UganVzdCBuZWVkIGl0IHRvIHByZXZlbnQgY2hhbmdlcyB0byB0aGVcclxuICAgICAgICAvLyBkZWZhdWx0IHByb3RvY29scy5cclxuICAgICAgICB0aGlzLmxvY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBCb29sZWFuIHZhbHVlIHRvIGluZGljYXRlIGlmIHRoZSBwcm90b2NvbCBoYXMgdXBkYXRlZCBwcmlvcnMgaW5mb3JtYXRpb25cclxuICAgICAgICAvLyBpdCdzIHNldCBpbiBcInVwZGF0ZU51bWJlck9mUHJpb3JzUmVmZXJlbmNlZFwiIGZ1bmN0aW9uXHJcbiAgICAgICAgdGhpcy5oYXNVcGRhdGVkUHJpb3JzSW5mb3JtYXRpb24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gQXBwbHkgdGhlIGRlc2lyZWQgbmFtZVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgY3JlYXRlZCBhbmQgbW9kaWZpZWQgZGF0ZXMgdG8gTm93XHJcbiAgICAgICAgdGhpcy5jcmVhdGVkRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZERhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBhcmUgbG9nZ2VkIGluIHdoaWxlIGNyZWF0aW5nIHRoaXMgUHJvdG9jb2wsXHJcbiAgICAgICAgLy8gc3RvcmUgdGhpcyBpbmZvcm1hdGlvbiBhcyB3ZWxsXHJcbiAgICAgICAgaWYgKE9ISUYudXNlciAmJiBPSElGLnVzZXIudXNlckxvZ2dlZEluICYmIE9ISUYudXNlci51c2VyTG9nZ2VkSW4oKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZWRCeSA9IE9ISUYudXNlci5nZXRVc2VySWQoKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RpZmllZEJ5ID0gT0hJRi51c2VyLmdldFVzZXJJZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHR3byBlbXB0eSBTZXRzIHNwZWNpZnlpbmcgd2hpY2ggcm9sZXNcclxuICAgICAgICAvLyBoYXZlIHJlYWQgYW5kIHdyaXRlIGFjY2VzcyB0byB0aGlzIFByb3RvY29sXHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVUbyA9IG5ldyBTZXQoKTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlQnkgPSBuZXcgU2V0KCk7XHJcblxyXG4gICAgICAgIC8vIERlZmluZSBlbXB0eSBhcnJheXMgZm9yIHRoZSBQcm90b2NvbCBtYXRjaGluZyBydWxlc1xyXG4gICAgICAgIC8vIGFuZCBTdGFnZXNcclxuICAgICAgICB0aGlzLnByb3RvY29sTWF0Y2hpbmdSdWxlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhZ2VzID0gW107XHJcblxyXG4gICAgICAgIC8vIERlZmluZSBhdXhpbGlhcnkgdmFsdWVzIGZvciBwcmlvcnNcclxuICAgICAgICB0aGlzLm51bWJlck9mUHJpb3JzUmVmZXJlbmNlZCA9IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE51bWJlck9mUHJpb3JzUmVmZXJlbmNlZChza2lwQ2FjaGUgPSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBudW1iZXJPZlByaW9yc1JlZmVyZW5jZWQgPSBza2lwQ2FjaGUgIT09IHRydWUgPyB0aGlzLm51bWJlck9mUHJpb3JzUmVmZXJlbmNlZCA6IC0xO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBpbmZvcm1hdGlvbiBpcyBjYWNoZWQgYWxyZWFkeVxyXG4gICAgICAgIGlmIChudW1iZXJPZlByaW9yc1JlZmVyZW5jZWQgPiAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkID0gMDtcclxuXHJcbiAgICAgICAgLy8gU2VhcmNoIGVhY2ggc3R1ZHkgbWF0Y2hpbmcgcnVsZSBmb3IgcHJpb3IgcnVsZXNcclxuICAgICAgICAvLyBFYWNoIHN0YWdlIGNhbiBoYXZlIG1hbnkgdmlld3BvcnRzIHRoYXQgY2FuIGhhdmVcclxuICAgICAgICAvLyBtdWx0aXBsZSBzdHVkeSBtYXRjaGluZyBydWxlcy5cclxuICAgICAgICB0aGlzLnN0YWdlcy5mb3JFYWNoKHN0YWdlID0+IHtcclxuICAgICAgICAgICAgaWYgKCFzdGFnZS52aWV3cG9ydHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhZ2Uudmlld3BvcnRzLmZvckVhY2godmlld3BvcnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2aWV3cG9ydC5zdHVkeU1hdGNoaW5nUnVsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmlld3BvcnQuc3R1ZHlNYXRjaGluZ1J1bGVzLmZvckVhY2gocnVsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgcnVsZSBpcyBub3QgYSBwcmlvcnMgcnVsZSwgaXQgd2lsbCByZXR1cm4gLTEgdGhlbiBudW1iZXJPZlByaW9yc1JlZmVyZW5jZWQgd2lsbCBjb250aW51ZSB0byBiZSAwXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJpb3JzUmVmZXJlbmNlZCA9IHJ1bGUuZ2V0TnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByaW9yc1JlZmVyZW5jZWQgPiBudW1iZXJPZlByaW9yc1JlZmVyZW5jZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkID0gcHJpb3JzUmVmZXJlbmNlZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkID0gbnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkO1xyXG5cclxuICAgICAgICByZXR1cm4gbnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlTnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0TnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWV0aG9kIHRvIHVwZGF0ZSB0aGUgbW9kaWZpZWREYXRlIHdoZW4gdGhlIFByb3RvY29sXHJcbiAgICAgKiBoYXMgYmVlbiBjaGFuZ2VkXHJcbiAgICAgKi9cclxuICAgIHByb3RvY29sV2FzTW9kaWZpZWQoKSB7XHJcbiAgICAgICAgLy8gSWYgd2UgYXJlIGxvZ2dlZCBpbiB3aGlsZSBtb2RpZnlpbmcgdGhpcyBQcm90b2NvbCxcclxuICAgICAgICAvLyBzdG9yZSB0aGlzIGluZm9ybWF0aW9uIGFzIHdlbGxcclxuICAgICAgICBpZiAoT0hJRi51c2VyICYmIE9ISUYudXNlci51c2VyTG9nZ2VkSW4gJiYgT0hJRi51c2VyLnVzZXJMb2dnZWRJbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kaWZpZWRCeSA9IE9ISUYudXNlci5nZXRVc2VySWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByb3RvY29sIGhhcyBiZWVuIG1vZGlmaWVkLCBzbyBtYXJrIHByaW9ycyBpbmZvcm1hdGlvblxyXG4gICAgICAgIC8vIGFzIFwib3V0ZGF0ZWRcIlxyXG4gICAgICAgIHRoaXMuaGFzVXBkYXRlZFByaW9yc0luZm9ybWF0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBudW1iZXIgb2YgcHJpb3JzIHJlZmVyZW5jZWQgaW5mb1xyXG4gICAgICAgIHRoaXMudXBkYXRlTnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkKCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgbW9kaWZpZWREYXRlIHdpdGggdGhlIGN1cnJlbnQgRGF0ZS9UaW1lXHJcbiAgICAgICAgdGhpcy5tb2RpZmllZERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT2NjYXNpb25hbGx5IHRoZSBQcm90b2NvbCBjbGFzcyBuZWVkcyB0byBiZSBpbnN0YW50aWF0ZWQgZnJvbSBhIEphdmFTY3JpcHQgT2JqZWN0XHJcbiAgICAgKiBjb250YWluaW5nIHRoZSBQcm90b2NvbCBkYXRhLiBUaGlzIGZ1bmN0aW9uIGZpbGxzIGluIGEgUHJvdG9jb2wgd2l0aCB0aGUgT2JqZWN0XHJcbiAgICAgKiBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBpbnB1dCBBIFByb3RvY29sIGFzIGEgSmF2YVNjcmlwdCBPYmplY3QsIGUuZy4gcmV0cmlldmVkIGZyb20gTW9uZ29EQiBvciBKU09OXHJcbiAgICAgKi9cclxuICAgIGZyb21PYmplY3QoaW5wdXQpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgaW5wdXQgYWxyZWFkeSBoYXMgYW4gSURcclxuICAgICAgICAvLyBJZiBzbywga2VlcCBpdC4gSXQgbm90LCBjcmVhdGUgYSBuZXcgVVVJRFxyXG4gICAgICAgIHRoaXMuaWQgPSBpbnB1dC5pZCB8fCBSYW5kb20uaWQoKTtcclxuXHJcbiAgICAgICAgLy8gQXNzaWduIHRoZSBpbnB1dCBuYW1lIHRvIHRoZSBQcm90b2NvbFxyXG4gICAgICAgIHRoaXMubmFtZSA9IGlucHV0Lm5hbWU7XHJcblxyXG4gICAgICAgIC8vIFJldHJpZXZlIGxvY2tlZCBzdGF0dXMsIHVzZSAhISB0byBtYWtlIGl0IHRydXRoeVxyXG4gICAgICAgIC8vIHNvIHRoYXQgdW5kZWZpbmVkIHZhbHVlcyB3aWxsIGJlIHNldCB0byBmYWxzZVxyXG4gICAgICAgIHRoaXMubG9ja2VkID0gISFpbnB1dC5sb2NrZWQ7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IENoZWNrIGhvdyB0byByZWdlbmVyYXRlIFNldCBmcm9tIE9iamVjdFxyXG4gICAgICAgIC8vdGhpcy5hdmFpbGFibGVUbyA9IG5ldyBTZXQoaW5wdXQuYXZhaWxhYmxlVG8pO1xyXG4gICAgICAgIC8vdGhpcy5lZGl0YWJsZUJ5ID0gbmV3IFNldChpbnB1dC5lZGl0YWJsZUJ5KTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGlucHV0IGNvbnRhaW5zIFByb3RvY29sIG1hdGNoaW5nIHJ1bGVzXHJcbiAgICAgICAgaWYgKGlucHV0LnByb3RvY29sTWF0Y2hpbmdSdWxlcykge1xyXG4gICAgICAgICAgICBpbnB1dC5wcm90b2NvbE1hdGNoaW5nUnVsZXMuZm9yRWFjaChydWxlT2JqZWN0ID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgUnVsZXMgZnJvbSB0aGUgc3RvcmVkIGRhdGFcclxuICAgICAgICAgICAgICAgIHZhciBydWxlID0gbmV3IEhQLlByb3RvY29sTWF0Y2hpbmdSdWxlKCk7XHJcbiAgICAgICAgICAgICAgICBydWxlLmZyb21PYmplY3QocnVsZU9iamVjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZW0gdG8gdGhlIFByb3RvY29sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3RvY29sTWF0Y2hpbmdSdWxlcy5wdXNoKHJ1bGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBpbnB1dCBjb250YWlucyBkYXRhIGZvciB2YXJpb3VzIFN0YWdlcyBpbiB0aGVcclxuICAgICAgICAvLyBkaXNwbGF5IHNldCBzZXF1ZW5jZVxyXG4gICAgICAgIGlmIChpbnB1dC5zdGFnZXMpIHtcclxuICAgICAgICAgICAgaW5wdXQuc3RhZ2VzLmZvckVhY2goc3RhZ2VPYmplY3QgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIFN0YWdlcyBmcm9tIHRoZSBzdG9yZWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgdmFyIHN0YWdlID0gbmV3IEhQLlN0YWdlKCk7XHJcbiAgICAgICAgICAgICAgICBzdGFnZS5mcm9tT2JqZWN0KHN0YWdlT2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlbSB0byB0aGUgUHJvdG9jb2xcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2VzLnB1c2goc3RhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhlIGN1cnJlbnQgUHJvdG9jb2wgd2l0aCBhIG5ldyBuYW1lXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqIEByZXR1cm5zIHtQcm90b2NvbHwqfVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVDbG9uZShuYW1lKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IEphdmFTY3JpcHQgaW5kZXBlbmRlbnQgb2YgdGhlIGN1cnJlbnQgUHJvdG9jb2xcclxuICAgICAgICB2YXIgY3VycmVudFByb3RvY29sID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBQcm90b2NvbCB0byByZXR1cm5cclxuICAgICAgICB2YXIgY2xvbmVkUHJvdG9jb2wgPSBuZXcgSFAuUHJvdG9jb2woKTtcclxuXHJcbiAgICAgICAgLy8gQXBwbHkgdGhlIGRlc2lyZWQgcHJvcGVydGllc1xyXG4gICAgICAgIGN1cnJlbnRQcm90b2NvbC5pZCA9IGNsb25lZFByb3RvY29sLmlkO1xyXG4gICAgICAgIGNsb25lZFByb3RvY29sLmZyb21PYmplY3QoY3VycmVudFByb3RvY29sKTtcclxuXHJcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBzcGVjaWZpZWQgYSBuYW1lLCBhc3NpZ24gaXRcclxuICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICBjbG9uZWRQcm90b2NvbC5uYW1lID0gbmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVubG9jayB0aGUgY2xvbmVcclxuICAgICAgICBjbG9uZWRQcm90b2NvbC5sb2NrZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBjbG9uZWQgUHJvdG9jb2xcclxuICAgICAgICByZXR1cm4gY2xvbmVkUHJvdG9jb2w7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgU3RhZ2UgdG8gdGhpcyBQcm90b2NvbCdzIGRpc3BsYXkgc2V0IHNlcXVlbmNlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHN0YWdlXHJcbiAgICAgKi9cclxuICAgIGFkZFN0YWdlKHN0YWdlKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZXMucHVzaChzdGFnZSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgbW9kaWZpZWREYXRlIGFuZCBVc2VyIHRoYXQgbGFzdFxyXG4gICAgICAgIC8vIG1vZGlmaWVkIHRoaXMgUHJvdG9jb2xcclxuICAgICAgICB0aGlzLnByb3RvY29sV2FzTW9kaWZpZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBSdWxlIHRvIHRoaXMgUHJvdG9jb2wncyBhcnJheSBvZiBtYXRjaGluZyBydWxlc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlXHJcbiAgICAgKi9cclxuICAgIGFkZFByb3RvY29sTWF0Y2hpbmdSdWxlKHJ1bGUpIHtcclxuICAgICAgICB0aGlzLnByb3RvY29sTWF0Y2hpbmdSdWxlcy5wdXNoKHJ1bGUpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIG1vZGlmaWVkRGF0ZSBhbmQgVXNlciB0aGF0IGxhc3RcclxuICAgICAgICAvLyBtb2RpZmllZCB0aGlzIFByb3RvY29sXHJcbiAgICAgICAgdGhpcy5wcm90b2NvbFdhc01vZGlmaWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGEgUnVsZSBmcm9tIHRoaXMgUHJvdG9jb2wncyBhcnJheSBvZiBtYXRjaGluZyBydWxlc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVByb3RvY29sTWF0Y2hpbmdSdWxlKHJ1bGUpIHtcclxuICAgICAgICB2YXIgd2FzUmVtb3ZlZCA9IHJlbW92ZUZyb21BcnJheSh0aGlzLnByb3RvY29sTWF0Y2hpbmdSdWxlcywgcnVsZSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgbW9kaWZpZWREYXRlIGFuZCBVc2VyIHRoYXQgbGFzdFxyXG4gICAgICAgIC8vIG1vZGlmaWVkIHRoaXMgUHJvdG9jb2xcclxuICAgICAgICBpZiAod2FzUmVtb3ZlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3RvY29sV2FzTW9kaWZpZWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCB7IFJhbmRvbSB9IGZyb20gJ21ldGVvci9yYW5kb20nO1xyXG5cclxuaW1wb3J0IHsgY29tcGFyYXRvcnMgfSBmcm9tICcuLi9saWIvY29tcGFyYXRvcnMnO1xyXG5cclxuY29uc3QgRVFVQUxTX1JFR0VYUCA9IC9eZXF1YWxzJC87XHJcblxyXG4vKipcclxuICogVGhpcyBDbGFzcyByZXByZXNlbnRzIGEgUnVsZSB0byBiZSBldmFsdWF0ZWQgZ2l2ZW4gYSBzZXQgb2YgYXR0cmlidXRlc1xyXG4gKiBSdWxlcyBoYXZlOlxyXG4gKiAtIEFuIGF0dHJpYnV0ZSAoZS5nLiAnc2VyaWVzRGVzY3JpcHRpb24nKVxyXG4gKiAtIEEgY29uc3RyYWludCBPYmplY3QsIGluIHRoZSBmb3JtIHJlcXVpcmVkIGJ5IFZhbGlkYXRlLmpzOlxyXG4gKlxyXG4gKiBydWxlLmNvbnN0cmFpbnQgPSB7XHJcbiAqICAgY29udGFpbnM6IHtcclxuICogICAgICB2YWx1ZTogJ1QtMSdcclxuICogICAgICB9XHJcbiAqICAgfTtcclxuICpcclxuICogIE5vdGU6IEluIHRoaXMgZXhhbXBsZSB3ZSB1c2UgdGhlICdjb250YWlucycgVmFsaWRhdG9yLCB3aGljaCBpcyBhIGN1c3RvbSBWYWxpZGF0b3IgZGVmaW5lZCBpbiBWaWV3ZXJiYXNlXHJcbiAqXHJcbiAqIC0gQSB2YWx1ZSBmb3Igd2hldGhlciBvciBub3QgdGhleSBhcmUgUmVxdWlyZWQgdG8gYmUgbWF0Y2hlZCAoZGVmYXVsdDogRmFsc2UpXHJcbiAqIC0gQSB2YWx1ZSBmb3IgdGhlaXIgcmVsYXRpdmUgd2VpZ2h0aW5nIGR1cmluZyBQcm90b2NvbCBvciBJbWFnZSBtYXRjaGluZyAoZGVmYXVsdDogMSlcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdWxlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIENvbnN0cnVjdG9yIGZvciB0aGUgQ2xhc3MgdG8gY3JlYXRlIGEgUnVsZSB3aXRoIHRoZSBiYXJlXHJcbiAgICAgKiBtaW5pbXVtIGluZm9ybWF0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWUgVGhlIGRlc2lyZWQgbmFtZSBmb3IgdGhlIFJ1bGVcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlLCBjb25zdHJhaW50LCByZXF1aXJlZCwgd2VpZ2h0KSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IFVVSUQgZm9yIHRoaXMgUnVsZVxyXG4gICAgICAgIHRoaXMuaWQgPSBSYW5kb20uaWQoKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBSdWxlJ3Mgd2VpZ2h0IChkZWZhdWx0cyB0byAxKVxyXG4gICAgICAgIHRoaXMud2VpZ2h0ID0gd2VpZ2h0IHx8IDE7XHJcblxyXG4gICAgICAgIC8vIElmIGFuIGF0dHJpYnV0ZSBpcyBzcGVjaWZpZWQsIGFzc2lnbiBpdFxyXG4gICAgICAgIGlmIChhdHRyaWJ1dGUpIHtcclxuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGUgPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhIGNvbnN0cmFpbnQgaXMgc3BlY2lmaWVkLCBhc3NpZ24gaXRcclxuICAgICAgICBpZiAoY29uc3RyYWludCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnN0cmFpbnQgPSBjb25zdHJhaW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYSB2YWx1ZSBmb3IgJ3JlcXVpcmVkJyBpcyBzcGVjaWZpZWQsIGFzc2lnbiBpdFxyXG4gICAgICAgIGlmIChyZXF1aXJlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vIElmIG5vIHZhbHVlIHdhcyBzcGVjaWZpZWQsIGRlZmF1bHQgdG8gRmFsc2VcclxuICAgICAgICAgICAgdGhpcy5yZXF1aXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZWQgPSByZXF1aXJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhY2hlIGZvciBjb25zdHJhaW50IGluZm8gb2JqZWN0XHJcbiAgICAgICAgdGhpcy5fY29uc3RyYWludEluZm8gPSB2b2lkIDA7XHJcblxyXG4gICAgICAgIC8vIENhY2hlIGZvciB2YWxpZGF0b3IgYW5kIHZhbHVlIG9iamVjdFxyXG4gICAgICAgIHRoaXMuX3ZhbGlkYXRvckFuZFZhbHVlID0gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT2NjYXNpb25hbGx5IHRoZSBSdWxlIGNsYXNzIG5lZWRzIHRvIGJlIGluc3RhbnRpYXRlZCBmcm9tIGEgSmF2YVNjcmlwdCBPYmplY3QuXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGZpbGxzIGluIGEgUHJvdG9jb2wgd2l0aCB0aGUgT2JqZWN0IGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGlucHV0IEEgUnVsZSBhcyBhIEphdmFTY3JpcHQgT2JqZWN0LCBlLmcuIHJldHJpZXZlZCBmcm9tIE1vbmdvREIgb3IgSlNPTlxyXG4gICAgICovXHJcbiAgICBmcm9tT2JqZWN0KGlucHV0KSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGlucHV0IGFscmVhZHkgaGFzIGFuIElEXHJcbiAgICAgICAgLy8gSWYgc28sIGtlZXAgaXQuIEl0IG5vdCwgY3JlYXRlIGEgbmV3IFVVSURcclxuICAgICAgICB0aGlzLmlkID0gaW5wdXQuaWQgfHwgUmFuZG9tLmlkKCk7XHJcblxyXG4gICAgICAgIC8vIEFzc2lnbiB0aGUgc3BlY2lmaWVkIGlucHV0IGRhdGEgdG8gdGhlIFJ1bGVcclxuICAgICAgICB0aGlzLnJlcXVpcmVkID0gaW5wdXQucmVxdWlyZWQ7XHJcbiAgICAgICAgdGhpcy53ZWlnaHQgPSBpbnB1dC53ZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUgPSBpbnB1dC5hdHRyaWJ1dGU7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW50ID0gaW5wdXQuY29uc3RyYWludDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgY29uc3RyYWludCBpbmZvIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgY29uc3RyYWludFxyXG4gICAgICogQHJldHVybiB7T2JqZWN0XFx1bmRlZmluZWR9IENvbnN0cmFpbnQgb2JqZWN0IG9yIHVuZGVmaW5lZCBpZiBjdXJyZW50IGNvbnN0cmFpbnQgXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBub3QgdmFsaWQgb3Igbm90IGZvdW5kIGluIGNvbXBhcmF0b3JzIGxpc3RcclxuICAgICAqL1xyXG4gICAgZ2V0Q29uc3RyYWludEluZm8oKSB7XHJcbiAgICAgICAgbGV0IGNvbnN0cmFpbnRJbmZvID0gdGhpcy5fY29uc3RyYWludEluZm87XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaW5mbyBpcyBjYWNoZWQgYWxyZWFkeVxyXG4gICAgICAgIGlmIChjb25zdHJhaW50SW5mbyAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25zdHJhaW50SW5mbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJ1bGVDb25zdHJhaW50ID0gT2JqZWN0LmtleXModGhpcy5jb25zdHJhaW50KVswXTtcclxuXHJcbiAgICAgICAgaWYgKHJ1bGVDb25zdHJhaW50ICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgY29uc3RyYWludEluZm8gPSBjb21wYXJhdG9ycy5maW5kKGNvbXBhcmF0b3IgPT4gcnVsZUNvbnN0cmFpbnQgPT09IGNvbXBhcmF0b3IuaWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWNoZSB0aGlzIGluZm9ybWF0aW9uIGZvciBsYXRlciB1c2VcclxuICAgICAgICB0aGlzLl9jb25zdHJhaW50SW5mbyA9IGNvbnN0cmFpbnRJbmZvO1xyXG5cclxuICAgICAgICByZXR1cm4gY29uc3RyYWludEluZm87XHJcbiAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgY3VycmVudCBydWxlIGlzIHJlbGF0ZWQgdG8gcHJpb3JzXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIGEgcnVsZSBpcyByZWxhdGVkIHRvIHByaW9ycyBvciBmYWxzZSBvdGhlcndpc2VcclxuICAgICAqL1xyXG4gICAgaXNSdWxlRm9yUHJpb3IoKSB7XHJcbiAgICAgICAgLy8gQFRPRE86IFNob3VsZCB3ZSBjaGVjayB0aGlzIHRvbz8gdGhpcy5hdHRyaWJ1dGUgPT09ICdyZWxhdGl2ZVRpbWUnXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlID09PSAnYWJzdHJhY3RQcmlvclZhbHVlJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRoZSBjdXJyZW50IHJ1bGUgaXMgYSBydWxlIGZvciBwcmlvcnMsIHJldHVybnMgdGhlIG51bWJlciBvZiByZWZlcmVuY2VkIHByaW9ycy4gT3RoZXJ3aXNlLCByZXR1cm5zIC0xLlxyXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgbnVtYmVyIG9mIHJlZmVyZW5jZWQgcHJpb3JzIG9yIC0xIGlmIG5vdCBhcHBsaWNhYmxlLiBSZXR1cm5zIHplcm8gaWYgdGhlIGFjdHVhbCB2YWx1ZSBjb3VsZCBub3QgYmUgZGV0ZXJtaW5lZC5cclxuICAgICAqL1xyXG4gICAgZ2V0TnVtYmVyT2ZQcmlvcnNSZWZlcmVuY2VkKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1J1bGVGb3JQcmlvcigpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCBydWxlJ3MgdmFsaWRhdG9yIGFuZCB2YWx1ZVxyXG4gICAgICAgIGNvbnN0IHJ1bGVWYWxpZGF0b3JBbmRWYWx1ZSA9IHRoaXMuZ2V0Q29uc3RyYWludFZhbGlkYXRvckFuZFZhbHVlKCk7XHJcbiAgICAgICAgY29uc3QgeyB2YWx1ZSwgdmFsaWRhdG9yIH0gPSBydWxlVmFsaWRhdG9yQW5kVmFsdWU7XHJcbiAgICAgICAgY29uc3QgaW50VmFsdWUgPSBwYXJzZUludCh2YWx1ZSwgMTApIHx8IDA7IC8vIGF2b2lkIHBvc3NpYmxlIE5hTlxyXG5cclxuICAgICAgICAvLyBcIkVxdWFsIHRvXCIgdmFsaWRhdG9yc1xyXG4gICAgICAgIGlmIChFUVVBTFNfUkVHRVhQLnRlc3QodmFsaWRhdG9yKSkge1xyXG4gICAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIC0xICh0aGUgb2xkZXN0IHByaW9yKSBpbmRpY2F0ZXMgdGhhdCBhdCBsZWFzdCBvbmUgc3R1ZHkgaXMgdXNlZFxyXG4gICAgICAgICAgICByZXR1cm4gaW50VmFsdWUgPCAwID8gMSA6IGludFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCBjYXNlcyByZXR1cm4gdmFsdWVcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgY29uc3RyYWludCB2YWxpZGF0b3IgYW5kIHZhbHVlXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R8dW5kZWZpbmVkfSBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB2YWxpZGF0b3IgYW5kIGl0J3MgdmFsdWUgb3IgdW5kZWZpbmVkXHJcbiAgICAgKi9cclxuICAgIGdldENvbnN0cmFpbnRWYWxpZGF0b3JBbmRWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgdmFsaWRhdG9yQW5kVmFsdWUgPSB0aGlzLl92YWxpZGF0b3JBbmRWYWx1ZTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBDaGVjayBpZiB2YWxpZGF0b3IgYW5kIHZhbHVlIGFyZSBjYWNoZWQgYWxyZWFkeVxyXG4gICAgICAgIGlmICh2YWxpZGF0b3JBbmRWYWx1ZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3JBbmRWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgY29uc3RyYWludCBpbmZvIG9iamVjdFxyXG4gICAgICAgIGNvbnN0IGNvbnN0cmFpbnRJbmZvID0gdGhpcy5nZXRDb25zdHJhaW50SW5mbygpO1xyXG5cclxuICAgICAgICAvLyBDb25zdHJhaW50IGluZm8gb2JqZWN0IGV4aXN0cyBhbmQgaXMgdmFsaWRcclxuICAgICAgICBpZiAoY29uc3RyYWludEluZm8gIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSBjb25zdHJhaW50SW5mby52YWxpZGF0b3I7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRWYWxpZGF0b3IgPSB0aGlzLmNvbnN0cmFpbnRbdmFsaWRhdG9yXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50VmFsaWRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb25zdHJhaW50VmFsaWRhdG9yID0gY29uc3RyYWludEluZm8udmFsaWRhdG9yT3B0aW9uO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29uc3RyYWludFZhbHVlID0gY3VycmVudFZhbGlkYXRvcltjb25zdHJhaW50VmFsaWRhdG9yXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JBbmRWYWx1ZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29uc3RyYWludFZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcjogY29uc3RyYWludEluZm8uaWRcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9yQW5kVmFsdWUgPSB2YWxpZGF0b3JBbmRWYWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvckFuZFZhbHVlO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IFJhbmRvbSB9IGZyb20gJ21ldGVvci9yYW5kb20nO1xyXG5cclxuLyoqXHJcbiAqIEEgU3RhZ2UgaXMgb25lIHN0ZXAgaW4gdGhlIERpc3BsYXkgU2V0IFNlcXVlbmNlIGZvciBhIEhhbmdpbmcgUHJvdG9jb2xcclxuICpcclxuICogU3RhZ2VzIGFyZSBkZWZpbmVkIGFzIGEgVmlld3BvcnRTdHJ1Y3R1cmUgYW5kIGFuIGFycmF5IG9mIFZpZXdwb3J0c1xyXG4gKlxyXG4gKiBAdHlwZSB7U3RhZ2V9XHJcbiAqL1xyXG5IUC5TdGFnZSA9IGNsYXNzIFN0YWdlIHtcclxuICAgIGNvbnN0cnVjdG9yKFZpZXdwb3J0U3RydWN0dXJlLCBuYW1lKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IFVVSUQgZm9yIHRoaXMgU3RhZ2VcclxuICAgICAgICB0aGlzLmlkID0gUmFuZG9tLmlkKCk7XHJcblxyXG4gICAgICAgIC8vIEFzc2lnbiB0aGUgbmFtZSBhbmQgVmlld3BvcnRTdHJ1Y3R1cmUgcHJvdmlkZWRcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudmlld3BvcnRTdHJ1Y3R1cmUgPSBWaWV3cG9ydFN0cnVjdHVyZTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGVtcHR5IGFycmF5IGZvciB0aGUgVmlld3BvcnRzXHJcbiAgICAgICAgdGhpcy52aWV3cG9ydHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBjcmVhdGVkIGRhdGUgdG8gTm93XHJcbiAgICAgICAgdGhpcy5jcmVhdGVkRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhlIGN1cnJlbnQgU3RhZ2Ugd2l0aCBhIG5ldyBuYW1lXHJcbiAgICAgKlxyXG4gICAgICogTm90ZSEgVGhpcyBtZXRob2QgYWJzb2x1dGVseSBjYW5ub3QgYmUgcmVuYW1lZCAnY2xvbmUnLCBiZWNhdXNlXHJcbiAgICAgKiBNaW5pbW9uZ28ncyBpbnNlcnQgbWV0aG9kIHVzZXMgJ2Nsb25lJyBpbnRlcm5hbGx5IGFuZCB0aGlzXHJcbiAgICAgKiBzb21laG93IGNhdXNlcyB2ZXJ5IGJpemFycmUgYmVoYXZpb3VyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqIEByZXR1cm5zIHtTdGFnZXwqfVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVDbG9uZShuYW1lKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IEphdmFTY3JpcHQgaW5kZXBlbmRlbnQgb2YgdGhlIGN1cnJlbnQgUHJvdG9jb2xcclxuICAgICAgICB2YXIgY3VycmVudFN0YWdlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBTdGFnZSB0byByZXR1cm5cclxuICAgICAgICB2YXIgY2xvbmVkU3RhZ2UgPSBuZXcgSFAuU3RhZ2UoKTtcclxuXHJcbiAgICAgICAgLy8gQXNzaWduIHRoZSBkZXNpcmVkIHByb3BlcnRpZXNcclxuICAgICAgICBjdXJyZW50U3RhZ2UuaWQgPSBjbG9uZWRTdGFnZS5pZDtcclxuICAgICAgICBjbG9uZWRTdGFnZS5mcm9tT2JqZWN0KGN1cnJlbnRTdGFnZSk7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgc3BlY2lmaWVkIGEgbmFtZSwgYXNzaWduIGl0XHJcbiAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgY2xvbmVkU3RhZ2UubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGNsb25lZCBTdGFnZVxyXG4gICAgICAgIHJldHVybiBjbG9uZWRTdGFnZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9jY2FzaW9uYWxseSB0aGUgU3RhZ2UgY2xhc3MgbmVlZHMgdG8gYmUgaW5zdGFudGlhdGVkIGZyb20gYSBKYXZhU2NyaXB0IE9iamVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gZmlsbHMgaW4gYSBQcm90b2NvbCB3aXRoIHRoZSBPYmplY3QgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gaW5wdXQgQSBTdGFnZSBhcyBhIEphdmFTY3JpcHQgT2JqZWN0LCBlLmcuIHJldHJpZXZlZCBmcm9tIE1vbmdvREIgb3IgSlNPTlxyXG4gICAgICovXHJcbiAgICBmcm9tT2JqZWN0KGlucHV0KSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGlucHV0IGFscmVhZHkgaGFzIGFuIElEXHJcbiAgICAgICAgLy8gSWYgc28sIGtlZXAgaXQuIEl0IG5vdCwgY3JlYXRlIGEgbmV3IFVVSURcclxuICAgICAgICB0aGlzLmlkID0gaW5wdXQuaWQgfHwgUmFuZG9tLmlkKCk7XHJcblxyXG4gICAgICAgIC8vIEFzc2lnbiB0aGUgaW5wdXQgbmFtZSB0byB0aGUgU3RhZ2VcclxuICAgICAgICB0aGlzLm5hbWUgPSBpbnB1dC5uYW1lO1xyXG5cclxuICAgICAgICAvLyBJZiBhIFZpZXdwb3J0U3RydWN0dXJlIGlzIHByZXNlbnQgaW4gdGhlIGlucHV0LCBhZGQgaXQgZnJvbSB0aGVcclxuICAgICAgICAvLyBpbnB1dCBkYXRhXHJcbiAgICAgICAgdGhpcy52aWV3cG9ydFN0cnVjdHVyZSA9IG5ldyBIUC5WaWV3cG9ydFN0cnVjdHVyZSgpO1xyXG4gICAgICAgIHRoaXMudmlld3BvcnRTdHJ1Y3R1cmUuZnJvbU9iamVjdChpbnB1dC52aWV3cG9ydFN0cnVjdHVyZSk7XHJcblxyXG4gICAgICAgIC8vIElmIGFueSB2aWV3cG9ydHMgYXJlIHByZXNlbnQgaW4gdGhlIGlucHV0IG9iamVjdFxyXG4gICAgICAgIGlmIChpbnB1dC52aWV3cG9ydHMpIHtcclxuICAgICAgICAgICAgaW5wdXQudmlld3BvcnRzLmZvckVhY2godmlld3BvcnRPYmplY3QgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IFZpZXdwb3J0IHdpdGggdGhlaXIgZGF0YVxyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXdwb3J0ID0gbmV3IEhQLlZpZXdwb3J0KCk7XHJcbiAgICAgICAgICAgICAgICB2aWV3cG9ydC5mcm9tT2JqZWN0KHZpZXdwb3J0T2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgaXQgdG8gdGhlIHZpZXdwb3J0cyBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3cG9ydHMucHVzaCh2aWV3cG9ydCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCIvLyBMb2NhbCBpbXBvcnRzXHJcbmltcG9ydCB7IHJlbW92ZUZyb21BcnJheSB9IGZyb20gJy4uL2xpYi9yZW1vdmVGcm9tQXJyYXknO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgQ2xhc3MgZGVmaW5lcyBhIFZpZXdwb3J0IGluIHRoZSBIYW5naW5nIFByb3RvY29sIFN0YWdlLiBBIFZpZXdwb3J0IGNvbnRhaW5zXHJcbiAqIGFycmF5cyBvZiBSdWxlcyB0aGF0IGFyZSBtYXRjaGVkIGluIHRoZSBQcm90b2NvbEVuZ2luZSBpbiBvcmRlciB0byBkZXRlcm1pbmUgd2hpY2hcclxuICogaW1hZ2VzIHNob3VsZCBiZSBodW5nLlxyXG4gKlxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5IUC5WaWV3cG9ydCA9IGNsYXNzIFZpZXdwb3J0IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmlld3BvcnRTZXR0aW5ncyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW1hZ2VNYXRjaGluZ1J1bGVzID0gW107XHJcbiAgICAgICAgdGhpcy5zZXJpZXNNYXRjaGluZ1J1bGVzID0gW107XHJcbiAgICAgICAgdGhpcy5zdHVkeU1hdGNoaW5nUnVsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9jY2FzaW9uYWxseSB0aGUgVmlld3BvcnQgY2xhc3MgbmVlZHMgdG8gYmUgaW5zdGFudGlhdGVkIGZyb20gYSBKYXZhU2NyaXB0IE9iamVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gZmlsbHMgaW4gYSBWaWV3cG9ydCB3aXRoIHRoZSBPYmplY3QgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gaW5wdXQgVGhlIFZpZXdwb3J0IGFzIGEgSmF2YVNjcmlwdCBPYmplY3QsIGUuZy4gcmV0cmlldmVkIGZyb20gTW9uZ29EQiBvciBKU09OXHJcbiAgICAgKi9cclxuICAgIGZyb21PYmplY3QoaW5wdXQpIHtcclxuICAgICAgICAvLyBJZiBJbWFnZU1hdGNoaW5nUnVsZXMgZXhpc3QsIGNyZWF0ZSB0aGVtIGZyb20gdGhlIE9iamVjdCBkYXRhXHJcbiAgICAgICAgLy8gYW5kIGFkZCB0aGVtIHRvIHRoZSBWaWV3cG9ydCdzIGltYWdlTWF0Y2hpbmdSdWxlcyBhcnJheVxyXG4gICAgICAgIGlmIChpbnB1dC5pbWFnZU1hdGNoaW5nUnVsZXMpIHtcclxuICAgICAgICAgICAgaW5wdXQuaW1hZ2VNYXRjaGluZ1J1bGVzLmZvckVhY2gocnVsZU9iamVjdCA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IG5ldyBIUC5JbWFnZU1hdGNoaW5nUnVsZSgpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5mcm9tT2JqZWN0KHJ1bGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZU1hdGNoaW5nUnVsZXMucHVzaChydWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBTZXJpZXNNYXRjaGluZ1J1bGVzIGV4aXN0LCBjcmVhdGUgdGhlbSBmcm9tIHRoZSBPYmplY3QgZGF0YVxyXG4gICAgICAgIC8vIGFuZCBhZGQgdGhlbSB0byB0aGUgVmlld3BvcnQncyBzZXJpZXNNYXRjaGluZ1J1bGVzIGFycmF5XHJcbiAgICAgICAgaWYgKGlucHV0LnNlcmllc01hdGNoaW5nUnVsZXMpIHtcclxuICAgICAgICAgICAgaW5wdXQuc2VyaWVzTWF0Y2hpbmdSdWxlcy5mb3JFYWNoKHJ1bGVPYmplY3QgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBuZXcgSFAuU2VyaWVzTWF0Y2hpbmdSdWxlKCk7XHJcbiAgICAgICAgICAgICAgICBydWxlLmZyb21PYmplY3QocnVsZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcmllc01hdGNoaW5nUnVsZXMucHVzaChydWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBTdHVkeU1hdGNoaW5nUnVsZXMgZXhpc3QsIGNyZWF0ZSB0aGVtIGZyb20gdGhlIE9iamVjdCBkYXRhXHJcbiAgICAgICAgLy8gYW5kIGFkZCB0aGVtIHRvIHRoZSBWaWV3cG9ydCdzIHN0dWR5TWF0Y2hpbmdSdWxlcyBhcnJheVxyXG4gICAgICAgIGlmIChpbnB1dC5zdHVkeU1hdGNoaW5nUnVsZXMpIHtcclxuICAgICAgICAgICAgaW5wdXQuc3R1ZHlNYXRjaGluZ1J1bGVzLmZvckVhY2gocnVsZU9iamVjdCA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IG5ldyBIUC5TdHVkeU1hdGNoaW5nUnVsZSgpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5mcm9tT2JqZWN0KHJ1bGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdHVkeU1hdGNoaW5nUnVsZXMucHVzaChydWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBWaWV3cG9ydFNldHRpbmdzIGV4aXN0LCBhZGQgdGhlbSB0byB0aGUgY3VycmVudCBwcm90b2NvbFxyXG4gICAgICAgIGlmIChpbnB1dC52aWV3cG9ydFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlld3BvcnRTZXR0aW5ncyA9IGlucHV0LnZpZXdwb3J0U2V0dGluZ3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgYW5kIHJlbW92ZXMgYSBydWxlIGZyb20gd2hpY2hldmVyIGFycmF5IGl0IGV4aXN0cyBpbi5cclxuICAgICAqIEl0IGlzIG5vdCByZXF1aXJlZCB0byBzcGVjaWZ5IGlmIGl0IGV4aXN0cyBpbiBzdHVkeU1hdGNoaW5nUnVsZXMsXHJcbiAgICAgKiBzZXJpZXNNYXRjaGluZ1J1bGVzLCBvciBpbWFnZU1hdGNoaW5nUnVsZXNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcnVsZVxyXG4gICAgICovXHJcbiAgICByZW1vdmVSdWxlKHJ1bGUpIHtcclxuICAgICAgICB2YXIgYXJyYXk7XHJcbiAgICAgICAgaWYgKHJ1bGUgaW5zdGFuY2VvZiBIUC5TdHVkeU1hdGNoaW5nUnVsZSkge1xyXG4gICAgICAgICAgICBhcnJheSA9IHRoaXMuc3R1ZHlNYXRjaGluZ1J1bGVzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocnVsZSBpbnN0YW5jZW9mIEhQLlNlcmllc01hdGNoaW5nUnVsZSkge1xyXG4gICAgICAgICAgICBhcnJheSA9IHRoaXMuc2VyaWVzTWF0Y2hpbmdSdWxlcztcclxuICAgICAgICB9IGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBIUC5JbWFnZU1hdGNoaW5nUnVsZSkge1xyXG4gICAgICAgICAgICBhcnJheSA9IHRoaXMuaW1hZ2VNYXRjaGluZ1J1bGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVtb3ZlRnJvbUFycmF5KGFycmF5LCBydWxlKTtcclxuICAgIH1cclxufTsiLCIvKipcclxuICogVGhlIFZpZXdwb3J0U3RydWN0dXJlIGNsYXNzIHJlcHJlc2VudHMgdGhlIGxheW91dCBhbmQgbGF5b3V0IHByb3BlcnRpZXMgdGhhdFxyXG4gKiBWaWV3cG9ydHMgYXJlIGRpc3BsYXllZCBpbi4gVmlld3BvcnRTdHJ1Y3R1cmUgaGFzIGEgdHlwZSwgd2hpY2ggY29ycmVzcG9uZHMgdG9cclxuICogYSBsYXlvdXQgdGVtcGxhdGUsIGFuZCBhIHNldCBvZiBwcm9wZXJ0aWVzLCB3aGljaCBkZXBlbmQgb24gdGhlIHR5cGUuXHJcbiAqXHJcbiAqIEB0eXBlIHtWaWV3cG9ydFN0cnVjdHVyZX1cclxuICovXHJcbkhQLlZpZXdwb3J0U3RydWN0dXJlID0gY2xhc3MgVmlld3BvcnRTdHJ1Y3R1cmUge1xyXG4gICAgY29uc3RydWN0b3IodHlwZSwgcHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9jY2FzaW9uYWxseSB0aGUgVmlld3BvcnRTdHJ1Y3R1cmUgY2xhc3MgbmVlZHMgdG8gYmUgaW5zdGFudGlhdGVkIGZyb20gYSBKYXZhU2NyaXB0IE9iamVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gZmlsbHMgaW4gYSBWaWV3cG9ydFN0cnVjdHVyZSB3aXRoIHRoZSBPYmplY3QgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gaW5wdXQgVGhlIFZpZXdwb3J0U3RydWN0dXJlIGFzIGEgSmF2YVNjcmlwdCBPYmplY3QsIGUuZy4gcmV0cmlldmVkIGZyb20gTW9uZ29EQiBvciBKU09OXHJcbiAgICAgKi9cclxuICAgIGZyb21PYmplY3QoaW5wdXQpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSBpbnB1dC50eXBlO1xyXG4gICAgICAgIHRoaXMucHJvcGVydGllcyA9IGlucHV0LnByb3BlcnRpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgbGF5b3V0IHRlbXBsYXRlIG5hbWUgYmFzZWQgb24gdGhlIGxheW91dCB0eXBlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2V0TGF5b3V0VGVtcGxhdGVOYW1lKCkge1xyXG4gICAgICAgIC8vIFZpZXdwb3J0IHN0cnVjdHVyZSBjYW4gYmUgdXBkYXRlZCBsYXRlciB3aGVuIHdlIGJ1aWxkIG1vcmUgY29tcGxleCBkaXNwbGF5IGxheW91dHNcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlICdncmlkJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnZ3JpZExheW91dCc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgdGhlIG51bWJlciBvZiBWaWV3cG9ydHMgcmVxdWlyZWQgZm9yIHRoaXMgbGF5b3V0XHJcbiAgICAgKiBnaXZlbiB0aGUgbGF5b3V0IHR5cGUgYW5kIHByb3BlcnRpZXNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXROdW1WaWV3cG9ydHMoKSB7XHJcbiAgICAgICAgLy8gVmlld3BvcnQgc3RydWN0dXJlIGNhbiBiZSB1cGRhdGVkIGxhdGVyIHdoZW4gd2UgYnVpbGQgbW9yZSBjb21wbGV4IGRpc3BsYXkgbGF5b3V0c1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2dyaWQnOlxyXG4gICAgICAgICAgICAgICAgLy8gRm9yIHRoZSB0eXBpY2FsIGdyaWQgbGF5b3V0LCB3ZSBvbmx5IG5lZWQgdG8gbXVsdGlwbHkgcm93cyBieSBjb2x1bW5zIHRvXHJcbiAgICAgICAgICAgICAgICAvLyBvYnRhaW4gdGhlIG51bWJlciBvZiB2aWV3cG9ydHNcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMucm93cyAqIHRoaXMucHJvcGVydGllcy5jb2x1bW5zO1xyXG4gICAgICAgIH0gICBcclxuICAgIH1cclxufTsiLCJpbXBvcnQgeyBSdWxlIH0gZnJvbSAnLi4vUnVsZSc7XHJcblxyXG4vKipcclxuICogVGhlIEltYWdlTWF0Y2hpbmdSdWxlIGNsYXNzIGV4dGVuZHMgdGhlIFJ1bGUgQ2xhc3MuXHJcbiAqXHJcbiAqIEF0IHByZXNlbnQgaXQgZG9lcyBub3QgYWRkIGFueSBuZXcgbWV0aG9kcyBvciBhdHRyaWJ1dGVzXHJcbiAqIEB0eXBlIHtJbWFnZU1hdGNoaW5nUnVsZX1cclxuICovXHJcbkhQLkltYWdlTWF0Y2hpbmdSdWxlID0gY2xhc3MgSW1hZ2VNYXRjaGluZ1J1bGUgZXh0ZW5kcyBSdWxlIHt9OyIsImltcG9ydCB7IFJ1bGUgfSBmcm9tICcuLi9SdWxlJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgUHJvdG9jb2xNYXRjaGluZ1J1bGUgQ2xhc3MgZXh0ZW5kcyB0aGUgUnVsZSBDbGFzcy5cclxuICpcclxuICogQXQgcHJlc2VudCBpdCBkb2VzIG5vdCBhZGQgYW55IG5ldyBtZXRob2RzIG9yIGF0dHJpYnV0ZXNcclxuICogQHR5cGUge1Byb3RvY29sTWF0Y2hpbmdSdWxlfVxyXG4gKi9cclxuSFAuUHJvdG9jb2xNYXRjaGluZ1J1bGUgPSBjbGFzcyBQcm90b2NvbE1hdGNoaW5nUnVsZSBleHRlbmRzIFJ1bGUge307IiwiaW1wb3J0IHsgUnVsZSB9IGZyb20gJy4uL1J1bGUnO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBTZXJpZXNNYXRjaGluZ1J1bGUgQ2xhc3MgZXh0ZW5kcyB0aGUgUnVsZSBDbGFzcy5cclxuICpcclxuICogQXQgcHJlc2VudCBpdCBkb2VzIG5vdCBhZGQgYW55IG5ldyBtZXRob2RzIG9yIGF0dHJpYnV0ZXNcclxuICogQHR5cGUge1Nlcmllc01hdGNoaW5nUnVsZX1cclxuICovXHJcbkhQLlNlcmllc01hdGNoaW5nUnVsZSA9IGNsYXNzIFNlcmllc01hdGNoaW5nUnVsZSBleHRlbmRzIFJ1bGUge307IiwiaW1wb3J0IHsgUnVsZSB9IGZyb20gJy4uL1J1bGUnO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBTdHVkeU1hdGNoaW5nUnVsZSBDbGFzcyBleHRlbmRzIHRoZSBSdWxlIENsYXNzLlxyXG4gKlxyXG4gKiBBdCBwcmVzZW50IGl0IGRvZXMgbm90IGFkZCBhbnkgbmV3IG1ldGhvZHMgb3IgYXR0cmlidXRlc1xyXG4gKiBAdHlwZSB7U3R1ZHlNYXRjaGluZ1J1bGV9XHJcbiAqL1xyXG5IUC5TdHVkeU1hdGNoaW5nUnVsZSA9IGNsYXNzIFN0dWR5TWF0Y2hpbmdSdWxlIGV4dGVuZHMgUnVsZSB7fTtcclxuIiwiY29uc3QgY29tcGFyYXRvcnMgPSBbe1xyXG4gICAgaWQ6ICdlcXVhbHMnLFxyXG4gICAgbmFtZTogJz0gKEVxdWFscyknLFxyXG4gICAgdmFsaWRhdG9yOiAnZXF1YWxzJyxcclxuICAgIHZhbGlkYXRvck9wdGlvbjogJ3ZhbHVlJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBtdXN0IGVxdWFsIHRoaXMgdmFsdWUuJ1xyXG59LCB7XHJcbiAgICBpZDogJ2RvZXNOb3RFcXVhbCcsXHJcbiAgICBuYW1lOiAnIT0gKERvZXMgbm90IGVxdWFsKScsXHJcbiAgICB2YWxpZGF0b3I6ICdkb2VzTm90RXF1YWwnLFxyXG4gICAgdmFsaWRhdG9yT3B0aW9uOiAndmFsdWUnLFxyXG4gICAgZGVzY3JpcHRpb246ICdUaGUgYXR0cmlidXRlIG11c3Qgbm90IGVxdWFsIHRoaXMgdmFsdWUuJ1xyXG59LCB7XHJcbiAgICBpZDogJ2NvbnRhaW5zJyxcclxuICAgIG5hbWU6ICdDb250YWlucycsXHJcbiAgICB2YWxpZGF0b3I6ICdjb250YWlucycsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICd2YWx1ZScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBhdHRyaWJ1dGUgbXVzdCBjb250YWluIHRoaXMgdmFsdWUuJ1xyXG59LCB7XHJcbiAgICBpZDogJ2RvZXNOb3RDb250YWluJyxcclxuICAgIG5hbWU6ICdEb2VzIG5vdCBjb250YWluJyxcclxuICAgIHZhbGlkYXRvcjogJ2RvZXNOb3RDb250YWluJyxcclxuICAgIHZhbGlkYXRvck9wdGlvbjogJ3ZhbHVlJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBtdXN0IG5vdCBjb250YWluIHRoaXMgdmFsdWUuJ1xyXG59LCB7XHJcbiAgICBpZDogJ3N0YXJ0c1dpdGgnLFxyXG4gICAgbmFtZTogJ1N0YXJ0cyB3aXRoJyxcclxuICAgIHZhbGlkYXRvcjogJ3N0YXJ0c1dpdGgnLFxyXG4gICAgdmFsaWRhdG9yT3B0aW9uOiAndmFsdWUnLFxyXG4gICAgZGVzY3JpcHRpb246ICdUaGUgYXR0cmlidXRlIG11c3Qgc3RhcnQgd2l0aCB0aGlzIHZhbHVlLidcclxufSwge1xyXG4gICAgaWQ6ICdlbmRzV2l0aCcsXHJcbiAgICBuYW1lOiAnRW5kcyB3aXRoJyxcclxuICAgIHZhbGlkYXRvcjogJ2VuZHNXaXRoJyxcclxuICAgIHZhbGlkYXRvck9wdGlvbjogJ3ZhbHVlJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBtdXN0IGVuZCB3aXRoIHRoaXMgdmFsdWUuJ1xyXG59LCB7XHJcbiAgICBpZDogJ29ubHlJbnRlZ2VyJyxcclxuICAgIG5hbWU6ICdPbmx5IEludGVnZXJzJyxcclxuICAgIHZhbGlkYXRvcjogJ251bWVyaWNhbGl0eScsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICdvbmx5SW50ZWdlcicsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJSZWFsIG51bWJlcnMgd29uJ3QgYmUgYWxsb3dlZC5cIlxyXG59LCB7XHJcbiAgICBpZDogJ2dyZWF0ZXJUaGFuJyxcclxuICAgIG5hbWU6ICc+IChHcmVhdGVyIHRoYW4pJyxcclxuICAgIHZhbGlkYXRvcjogJ251bWVyaWNhbGl0eScsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICdncmVhdGVyVGhhbicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBhdHRyaWJ1dGUgaGFzIHRvIGJlIGdyZWF0ZXIgdGhhbiB0aGlzIHZhbHVlLidcclxufSwge1xyXG4gICAgaWQ6ICdncmVhdGVyVGhhbk9yRXF1YWxUbycsXHJcbiAgICBuYW1lOiAnPj0gKEdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byknLFxyXG4gICAgdmFsaWRhdG9yOiAnbnVtZXJpY2FsaXR5JyxcclxuICAgIHZhbGlkYXRvck9wdGlvbjogJ2dyZWF0ZXJUaGFuT3JFcXVhbFRvJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBoYXMgdG8gYmUgYXQgbGVhc3QgdGhpcyB2YWx1ZS4nXHJcbn0sIHtcclxuICAgIGlkOiAnbGVzc1RoYW5PckVxdWFsVG8nLFxyXG4gICAgbmFtZTogJzw9IChMZXNzIHRoYW4gb3IgZXF1YWwgdG8pJyxcclxuICAgIHZhbGlkYXRvcjogJ251bWVyaWNhbGl0eScsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICdsZXNzVGhhbk9yRXF1YWxUbycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBhdHRyaWJ1dGUgY2FuIGJlIHRoaXMgdmFsdWUgYXQgdGhlIG1vc3QuJ1xyXG59LCB7XHJcbiAgICBpZDogJ2xlc3NUaGFuJyxcclxuICAgIG5hbWU6ICc8IChMZXNzIHRoYW4pJyxcclxuICAgIHZhbGlkYXRvcjogJ251bWVyaWNhbGl0eScsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICdsZXNzVGhhbicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBhdHRyaWJ1dGUgaGFzIHRvIGJlIGxlc3MgdGhhbiB0aGlzIHZhbHVlLidcclxufSwge1xyXG4gICAgaWQ6ICdvZGQnLFxyXG4gICAgbmFtZTogJ09kZCcsXHJcbiAgICB2YWxpZGF0b3I6ICdudW1lcmljYWxpdHknLFxyXG4gICAgdmFsaWRhdG9yT3B0aW9uOiAnb2RkJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBoYXMgdG8gYmUgb2RkLidcclxufSwge1xyXG4gICAgaWQ6ICdldmVuJyxcclxuICAgIG5hbWU6ICdFdmVuJyxcclxuICAgIHZhbGlkYXRvcjogJ251bWVyaWNhbGl0eScsXHJcbiAgICB2YWxpZGF0b3JPcHRpb246ICdldmVuJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGF0dHJpYnV0ZSBoYXMgdG8gYmUgZXZlbi4nXHJcbn1dO1xyXG5cclxuLy8gSW1tdXRhYmxlIG9iamVjdFxyXG5PYmplY3QuZnJlZXplKGNvbXBhcmF0b3JzKTtcclxuXHJcbmV4cG9ydCB7IGNvbXBhcmF0b3JzIH0iLCJpbXBvcnQgeyBfIH0gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZXMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFuIGVsZW1lbnQgZnJvbSBhbiBhcnJheSwgaWYgYW4gZXF1YWwgdmFsdWUgZXhpc3RzXHJcbiAqXHJcbiAqIEBwYXJhbSBhcnJheVxyXG4gKiBAcGFyYW0gaW5wdXRcclxuICpcclxuICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBlbGVtZW50IHdhcyBmb3VuZCBhbmQgcmVtb3ZlZFxyXG4gKi9cclxuY29uc3QgcmVtb3ZlRnJvbUFycmF5ID0gKGFycmF5LCBpbnB1dCkgPT4ge1xyXG4gICAgLy8gSWYgdGhlIGFycmF5IGlzIGVtcHR5LCBzdG9wIGhlcmVcclxuICAgIGlmICghYXJyYXkgfHxcclxuICAgICAgICAhYXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFycmF5LmZvckVhY2goKHZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChfLmlzRXF1YWwodmFsdWUsIGlucHV0KSkge1xyXG4gICAgICAgICAgICBpbmRleFRvUmVtb3ZlID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoaW5kZXhUb1JlbW92ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFycmF5LnNwbGljZShpbmRleFRvUmVtb3ZlLCAxKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuZXhwb3J0IHsgcmVtb3ZlRnJvbUFycmF5IH07IiwiTWV0ZW9yLnB1Ymxpc2goJ2hhbmdpbmdwcm90b2NvbHMnLCBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGZpbHRlciBieSBhdmFpbGFibGVUbyB1c2VyXHJcbiAgICByZXR1cm4gSGFuZ2luZ1Byb3RvY29scy5maW5kKCk7XHJcbn0pO1xyXG4iXX0=
