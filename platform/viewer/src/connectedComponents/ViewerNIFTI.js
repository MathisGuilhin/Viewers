import React, { Component } from 'react';
//import OHIF from 'ohif-core';
//import { CineDialog } from 'react-viewerbase';

import WhiteLabellingContext from '../WhiteLabellingContext.js';
import ConnectedHeader from './ConnectedHeader.js';
import ConnectedToolbarRow from './ConnectedToolbarRow.js';
import ConnectedLabellingOverlay from './ConnectedLabellingOverlay';
import nifti from 'nifti-reader-js';
import './Viewer.css';

class ViewerNIFTI extends Component {
  readNIFTI = (name, data) => {
    var canvas = this.refs.canvas;
    var slider = this.refs.range;
    var niftiHeader, niftiImage;
    // parse nifti
    if (nifti.isCompressed(data)) {
      data = nifti.decompress(data);
    }
    if (nifti.isNIFTI(data)) {
      niftiHeader = nifti.readHeader(data);
      niftiImage = nifti.readImage(niftiHeader, data);
    }
    // set up slider
    console.log('niftiHeader', niftiHeader);
    var slices = niftiHeader.dims[3];
    slider.max = slices - 1;
    slider.value = Math.round(slices / 2);
    slider.oninput = () => {
      this.drawCanvas(canvas, slider.value, niftiHeader, niftiImage);
    };
    // draw slice
    this.drawCanvas(canvas, slider.value, niftiHeader, niftiImage);
  };

  drawCanvas = (canvas, slice, niftiHeader, niftiImage) => {
    // get nifti dimensions
    var cols = niftiHeader.dims[1];
    var rows = niftiHeader.dims[2];
    // set canvas dimensions to nifti slice dimensions
    canvas.width = cols;
    canvas.height = rows;
    // make canvas image data
    var ctx = canvas.getContext('2d');
    var canvasImageData = ctx.createImageData(canvas.width, canvas.height);
    // convert raw data to typed array based on nifti datatype
    var typedData;
    if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
      typedData = new Uint8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
      typedData = new Int16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
      typedData = new Int32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
      typedData = new Float32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
      typedData = new Float64Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
      typedData = new Int8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
      typedData = new Uint16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
      typedData = new Uint32Array(niftiImage);
    } else {
      return;
    }
    // offset to specified slice
    var sliceSize = cols * rows;
    var sliceOffset = sliceSize * slice;
    // draw pixels
    for (var row = 0; row < rows; row++) {
      var rowOffset = row * cols;
      for (var col = 0; col < cols; col++) {
        var offset = sliceOffset + rowOffset + col;
        var value = typedData[offset];
        /* 
               Assumes data is 8-bit, otherwise you would need to first convert 
               to 0-255 range based on datatype range, data range (iterate through
               data to find), or display range (cal_min/max).
               
               Other things to take into consideration:
                 - data scale: scl_slope and scl_inter, apply to raw value before 
                   applying display range
                 - orientation: displays in raw orientation, see nifti orientation 
                   info for how to orient data
                 - assumes voxel shape (pixDims) is isometric, if not, you'll need 
                   to apply transform to the canvas
                 - byte order: see littleEndian flag
            */
        canvasImageData.data[(rowOffset + col) * 4] = value & 0xff;
        canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xff;
        canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xff;
        canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xff;
      }
    }
    ctx.putImageData(canvasImageData, 0, 0);
  };

  makeSlice = (file, start, length) => {
    var fileType = typeof File;
    if (fileType === 'undefined') {
      return function() {};
    }
    if (File.prototype.slice) {
      return file.slice(start, start + length);
    }
    if (File.prototype.mozSlice) {
      return file.mozSlice(start, length);
    }
    if (File.prototype.webkitSlice) {
      return file.webkitSlice(start, length);
    }
    return null;
  };

  readFile = () => {
    if (this.refs.test1.files[0]) {
      var file = this.refs.test1.files[0];
      var blob = this.makeSlice(file, 0, file.size);
      var reader = new FileReader();
      reader.onloadend = evt => {
        if (evt.target.readyState === FileReader.DONE) {
          this.readNIFTI(file.name, evt.target.result);
        }
      };
      reader.readAsArrayBuffer(blob);
    }
  };

  sleep = (miliseconds) => {
    var currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
  }

  logout = () => {
    window.location = ('http://127.0.0.1/auth/realms/ohif/protocol/openid-connect/logout?redirect_uri=');
  }

  render() {
    return (
      <>
        <WhiteLabellingContext.Consumer>
          {whiteLabelling => (
            <ConnectedHeader home={false} logout={this.logout}>
              {whiteLabelling.logoComponent}
            </ConnectedHeader>
          )}
        </WhiteLabellingContext.Consumer>
        <div id="viewer" className="Viewer">
          <ConnectedToolbarRow
          //Filled because otherwise throw warnings
          isLeftSidePanelOpen={false}
          isRightSidePanelOpen={false}
          selectedLeftSidePanel={'false'}
          selectedRightSidePanel={'false'}
        />
          <input
            type="file"
            id="files"
            name="files[]"
            ref="test1"
            multiple
            className="button"
          />
          <button onClick={this.readFile} className="button">
            Display Nifti Data
          </button>
          <div id="results">
            <canvas
              id="myCanvas"
              width="500"
              height="500"
              ref="canvas"
            ></canvas>
            <br />
            <input
              type="range"
              min="1"
              max="100"
              className="slider"
              ref="range"
              id="myRange"
            />
          </div>
          <ConnectedLabellingOverlay />
        </div>
      </>
    );
  }
}

export default ViewerNIFTI;
