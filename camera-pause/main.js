/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var errorElement = document.querySelector('#errorMsg');
var getUserMediaButton = document.querySelector('#getUserMedia');
var disableButton = document.querySelector('#disable');
var enableButton = document.querySelector('#enable');
var stopButton = document.querySelector('#stop');
var statusSpan = document.querySelector('#status');
var video = document.querySelector('video');

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

function updateState() {
  var stream = window.stream;
  var videoTrack = stream ? stream.getVideoTracks()[0] : null;
  if (!videoTrack) {
    disableButton.disabled = true;
    enableButton.disabled = true;
    stopButton.disabled = true;
    statusSpan.innerText = '';
    return;
  }
  stopButton.disabled = false;
  var status = '';
  status += videoTrack.label;
  if (stream.active) {
    status += ' active';
  } else {
    status += ' inactive';
  }
  if (videoTrack.enabled) {
    disableButton.disabled = false;
    enableButton.disabled = true;
    status += ' enabled';
  } else {
    disableButton.disabled = true;
    enableButton.disabled = false;
    status += ' disabled';
  }
  statusSpan.innerText = status;
}


function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

getUserMediaButton.addEventListener('click', event => {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      var videoTracks = stream.getVideoTracks();
      console.log('Got stream with constraints:', constraints);
      console.log('Using video device: ' + videoTracks[0].label);
      stream.oninactive = function() {
        console.log('Stream inactive');
        updateState();
      };
      window.stream = stream; // make variable available to browser console
      video.srcObject = stream;
    })
    .catch(handleError)
    .then(() => updateState());
});

enableButton.addEventListener('click', event => {
  window.stream.getVideoTracks()[0].enabled = true;
  updateState();
});

disableButton.addEventListener('click', event => {
  window.stream.getVideoTracks()[0].enabled = false;
  updateState();
});

stopButton.addEventListener('click', event => {
  window.stream.getVideoTracks()[0].stop();
  updateState();
});

updateState();
