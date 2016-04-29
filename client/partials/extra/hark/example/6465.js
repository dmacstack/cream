(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
localStorage.debug = true;

var hark = require('../hark.js');
var bows = require('bows');

(function() {
  //Audio Tag Demo
  var stream = document.querySelector('audio');
  var speechEvents = hark(stream);
  var notification = document.querySelector('#mlkSpeaking');
  var log = bows('MLK Demo');

  speechEvents.on('speaking', function() {
    log('speaking');
    notification.style.display = 'block';
  });

  speechEvents.on('volume_change', function(volume, threshold) {
    //log('volume change', volume, threshold);
  });

  speechEvents.on('stopped_speaking', function() {
    log('stopped_speaking');
    notification.style.display = 'none';
  });
})();


(function() {
  //Microphone demo
  var getUserMedia = require('getusermedia');
  var attachmediastream = require('attachmediastream');
  var notification = document.querySelector('#userSpeaking');
  var log = bows('Microphone Demo');

  getUserMedia(function(err, stream) {
    if (err) throw err

    attachmediastream(stream, document.querySelector('video'));
    var speechEvents = hark(stream);

    speechEvents.on('speaking', function() {
      notification.style.display = 'block';
      log('speaking');
    });

    speechEvents.on('volume_change', function(volume, threshold) {
      //log(volume, threshold)
    });

    speechEvents.on('stopped_speaking', function() {
      notification.style.display = 'none';
      log('stopped_speaking');
    });
  });
})();

},{"../hark.js":2,"attachmediastream":3,"bows":4,"getusermedia":6}],2:[function(require,module,exports){
var WildEmitter = require('wildemitter');

// taken from http://chimera.labs.oreilly.com/books/1234000001552/ch05.html
function draw(analyser) {
    var canvas = document.getElementById('canvas');
    var drawContext = canvas.getContext('2d');
    drawContext.clearRect (0, 0, canvas.width, canvas.height);
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = freqDomain[i];
        var percent = value / 256;
        var height = canvas.height * percent;
        var offset = canvas.height - height - 1;
        var barWidth = canvas.width/analyser.frequencyBinCount;
        var hue = i/analyser.frequencyBinCount * 360;
        drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.fillRect(i * barWidth, offset, barWidth, height);
    }

    var timeDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = timeDomain[i];
      var percent = value / 256;
      var height = canvas.height * percent;
      var offset = canvas.height - height - 1;
      var barWidth = canvas.width/analyser.frequencyBinCount;
      drawContext.fillStyle = 'black';
      drawContext.fillRect(i * barWidth, offset, 1, 1);
    }

    /*
    var rms = 0;
    var sample;
    for(var j=0; j < timeBins.length; j++) {
        sample = timeBins[j];
        // sample /= overload
        sample -= 128;
        sample /= 128;
        rms += sample * sample;
    }
    rms = (timeBins.length == 0) ? 0 : Math.sqrt(rms / timeBins.length);
    var db = 0;
    if (rms > 0) {
        db = 20 * Math.log(rms) / Math.LN10;
        db = Math.round(db);
        drawContext.fillStyle = 'blue';
        drawContext.fillRect(0, canvas.height+db, canvas.width, 1);
        console.log('db', db, rms);
    }
    */
}

function draw2() {
    var canvas = document.getElementById('canvas');
    var drawContext = canvas.getContext('2d');
    drawContext.clearRect (0, 0, canvas.width, canvas.height);

    drawContext.beginPath();
    drawContext.moveTo(0,0);
    drawContext.strokeStyle = 'black';
    for (var i = 0; i < rmsVals.length; i++) {
      var value = rmsVals[i];
      var percent = -value / 256;
      var height = canvas.height * percent;
      var offset = canvas.height - height - 1;
      var barWidth = canvas.width/100.0;
      drawContext.lineTo(i*barWidth, offset);
    }
    drawContext.stroke();

    drawContext.beginPath();
    drawContext.moveTo(0,0);
    drawContext.strokeStyle = 'green';
    for (var i = 0; i < fftVals.length; i++) {
      var value = fftVals[i];
      var percent = -value / 256;
      var height = canvas.height * percent;
      var offset = canvas.height - height - 1;
      var barWidth = canvas.width/100.0;
      drawContext.lineTo(i*barWidth, offset);
    }
    drawContext.stroke();
}

function getMaxVolume (analyser, fftBins, timeBins) {
  var maxVolume = -Infinity;
  analyser.getFloatFrequencyData(fftBins);
  analyser.getByteTimeDomainData(timeBins);


  for(var i=0/*fftBins.length/16*/, ii=fftBins.length; i < ii; i++) {
    if (fftBins[i] > maxVolume && fftBins[i] < 0) {
      maxVolume = fftBins[i];
    }
  };

  var rms = 0;
  var sample;
  for(var j=0; j < timeBins.length; j++) {
    sample = timeBins[j];
    // sample /= overload
    sample -= 128;
    sample /= 128;
    rms += sample * sample;
  }
  rms = (timeBins.length == 0) ? 0 : Math.sqrt(rms / timeBins.length);
  var db = 0;
  if (rms > 0) {
    db = 20 * Math.log(rms) / Math.LN10;
    db = Math.round(db);
  }
  //draw(analyser);
  //return db;
  if (maxVolume > -100) {
      fftVals.push(maxVolume);
      if (fftVals.length > 100) fftVals.shift();
      rmsVals.push(db);
      if (rmsVals.length > 100) rmsVals.shift();
  }

  return maxVolume;
}

rmsVals = [];
fftVals = [];

var audioContextType = window.webkitAudioContext || window.AudioContext;
// use a single audio context due to hardware limits
var audioContext = null;
module.exports = function(stream, options) {
  var harker = new WildEmitter();


  // make it not break in non-supported browsers
  if (!audioContextType) return harker;

  //Config
  var options = options || {},
      smoothing = (options.smoothing || 0.1),
      interval = (options.interval || 1000),
      threshold = options.threshold,
      play = options.play;

  //Setup Audio Context
  if (!audioContext) {
    audioContext = new audioContextType();
  }
  var sourceNode, fftBins, analyser;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0; //smoothing;
  fftBins = new Float32Array(analyser.fftSize);
  timeBins = new Uint8Array(analyser.frequencyBinCount);

  if (stream.jquery) stream = stream[0];
  if (stream instanceof HTMLAudioElement) {
    //Audio Tag
    sourceNode = audioContext.createMediaElementSource(stream);
    if (typeof play === 'undefined') play = true;
    threshold = threshold || -65;
  } else {
    //WebRTC Stream
    sourceNode = audioContext.createMediaStreamSource(stream);
    threshold = threshold || -45;
  }

  sourceNode.connect(analyser);
  if (play) analyser.connect(audioContext.destination);

  harker.speaking = false;

  harker.setThreshold = function(t) {
    threshold = t;
  };

  harker.setInterval = function(i) {
    interval = i;
  };

  // Poll the analyser node to determine if speaking
  // and emit events if changed
  harker.speakingHistory = [];
  for (var i = 0; i < 10; i++) {
      harker.speakingHistory.push(0);
  }
  var looper = function() {
    setTimeout(function() {
      var currentVolume = getMaxVolume(analyser, fftBins, timeBins);

      harker.emit('volume_change', currentVolume, threshold);

      var history = 0;
      if (currentVolume > threshold && !harker.speaking) {
          // trigger quickly, short history
          for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
            history += harker.speakingHistory[i];
          }
          if (history >= 2) {
              harker.speaking = true;
              harker.emit('speaking');
          }
      } else if (currentVolume < threshold && harker.speaking) {
          for (var i = 0; i < harker.speakingHistory.length; i++) {
            history += harker.speakingHistory[i];
          }
          if (history == 0) {
            harker.speaking = false;
            harker.emit('stopped_speaking');
          }
      }
      //console.log((new Date()).getTime(), history, harker.speakingHistory);
      harker.speakingHistory.shift();
      harker.speakingHistory.push(0 + (currentVolume > threshold));

      looper();
    }, 50);
  };
  looper();

  /*
  var cb = function (ts) {
    draw2();
    window.requestAnimationFrame(cb);
  };
  window.requestAnimationFrame(cb);
  */

  return harker;
}

},{"wildemitter":7}],3:[function(require,module,exports){
module.exports = function (stream, el, options) {
    var URL = window.URL;
    var opts = {
        autoplay: true,
        mirror: false,
        muted: false
    };
    var element = el || document.createElement('video');
    var item;

    if (options) {
        for (item in options) {
            opts[item] = options[item];
        }
    }

    if (opts.autoplay) element.autoplay = 'autoplay';
    if (opts.muted) element.muted = true;
    if (opts.mirror) {
        ['', 'moz', 'webkit', 'o', 'ms'].forEach(function (prefix) {
            var styleName = prefix ? prefix + 'Transform' : 'transform';
            element.style[styleName] = 'scaleX(-1)';
        });
    }

    // this first one should work most everywhere now
    // but we have a few fallbacks just in case.
    if (URL && URL.createObjectURL) {
        element.src = URL.createObjectURL(stream);
    } else if (element.srcObject) {
        element.srcObject = stream;
    } else if (element.mozSrcObject) {
        element.mozSrcObject = stream;
    } else {
        return false;
    }

    return element;
};

},{}],4:[function(require,module,exports){
(function() {
  function checkColorSupport() {
    var chrome = !!window.chrome,
        firefox = /firefox/i.test(navigator.userAgent),
        firebug = firefox && !!window.console.exception;

    return chrome || firebug;
  }

  var inNode = typeof window === 'undefined',
      ls = !inNode && window.localStorage,
      debug = ls.debug,
      logger = require('andlog'),
      hue = 0,
      padLength = 15,
      noop = function() {},
      colorsSupported = ls.debugColors || checkColorSupport(),
      yieldColor,
      bows,
      debugRegex;

  yieldColor = function() {
    var goldenRatio = 0.618033988749895;
    hue += goldenRatio;
    hue = hue % 1;
    return hue * 360;
  };

  debugRegex = debug && debug[0]==='/' && new RegExp(debug.substring(1,debug.length-1));

  bows = function(str) {
    var msg, colorString, logfn;
    msg = (str.slice(0, padLength));
    msg += Array(padLength + 3 - msg.length).join(' ') + '|';

    if (debugRegex && !str.match(debugRegex)) return noop;

    if (colorsSupported) {
      var color = yieldColor();
      msg = "%c" + msg;
      colorString = "color: hsl(" + (color) + ",99%,40%); font-weight: bold";

      logfn = logger.log.bind(logger, msg, colorString);
      ['log', 'debug', 'warn', 'error', 'info'].forEach(function (f) {
        logfn[f] = logger[f].bind(logger, msg, colorString);
      });
    } else {
      logfn = logger.log.bind(logger, msg);
      ['log', 'debug', 'warn', 'error', 'info'].forEach(function (f) {
        logfn[f] = logger[f].bind(logger, msg);
      });
    }

    return logfn;
  };

  bows.config = function(config) {
    if (config.padLength) {
      this.padLength = config.padLength;
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = bows;
  } else {
    window.bows = bows;
  }
}).call();

},{"andlog":5}],5:[function(require,module,exports){
// follow @HenrikJoreteg and @andyet if you like this ;)
(function () {
    var inNode = typeof window === 'undefined',
        ls = !inNode && window.localStorage,
        out = {};

    if (inNode) {
        module.exports = console;
        return;
    }

    if (ls && ls.debug && window.console) {
        out = window.console;
    } else {
        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
            l = methods.length,
            fn = function () {};

        while (l--) {
            out[methods[l]] = fn;
        }
    }
    if (typeof exports !== 'undefined') {
        module.exports = out;
    } else {
        window.console = out;
    }
})();

},{}],6:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};
    var error;
    var denied = 'PERMISSION_DENIED';
    var notSatified = 'CONSTRAINT_NOT_SATISFIED';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('NavigatorUserMediaError');
        error.name = 'NOT_SUPPORTED_ERROR';
        return cb(error);
    }

    func.call(navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('NavigatorUserMediaError');
            if (err === denied) {
                error.name = denied;
            } else {
                error.name = notSatified;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatified;
                }
            }
        }

        cb(error);
    });
};

},{}],7:[function(require,module,exports){
/*
WildEmitter.js is a slim little event emitter by @henrikjoreteg largely based 
on @visionmedia's Emitter from UI Kit.

Why? I wanted it standalone.

I also wanted support for wildcard emitters like this:

emitter.on('*', function (eventName, other, event, payloads) {
    
});

emitter.on('somenamespace*', function (eventName, payloads) {
    
});

Please note that callbacks triggered by wildcard registered events also get 
the event name as the first argument.
*/
module.exports = WildEmitter;

function WildEmitter() {
    this.callbacks = {};
}

// Listen on the given `event` with `fn`. Store a group name if present.
WildEmitter.prototype.on = function (event, groupName, fn) {
    var hasGroup = (arguments.length === 3),
        group = hasGroup ? arguments[1] : undefined, 
        func = hasGroup ? arguments[2] : arguments[1];
    func._groupName = group;
    (this.callbacks[event] = this.callbacks[event] || []).push(func);
    return this;
};

// Adds an `event` listener that will be invoked a single
// time then automatically removed.
WildEmitter.prototype.once = function (event, groupName, fn) {
    var self = this,
        hasGroup = (arguments.length === 3),
        group = hasGroup ? arguments[1] : undefined, 
        func = hasGroup ? arguments[2] : arguments[1];
    function on() {
        self.off(event, on);
        func.apply(this, arguments);
    }
    this.on(event, group, on);
    return this;
};

// Unbinds an entire group
WildEmitter.prototype.releaseGroup = function (groupName) {
    var item, i, len, handlers;
    for (item in this.callbacks) {
        handlers = this.callbacks[item];
        for (i = 0, len = handlers.length; i < len; i++) {
            if (handlers[i]._groupName === groupName) {
                //console.log('removing');
                // remove it and shorten the array we're looping through
                handlers.splice(i, 1);
                i--;
                len--;
            }
        }
    }
    return this;
};

// Remove the given callback for `event` or all
// registered callbacks.
WildEmitter.prototype.off = function (event, fn) {
    var callbacks = this.callbacks[event],
        i;
    
    if (!callbacks) return this;

    // remove all handlers
    if (arguments.length === 1) {
        delete this.callbacks[event];
        return this;
    }

    // remove specific handler
    i = callbacks.indexOf(fn);
    callbacks.splice(i, 1);
    return this;
};

// Emit `event` with the given args.
// also calls any `*` handlers
WildEmitter.prototype.emit = function (event) {
    var args = [].slice.call(arguments, 1),
        callbacks = this.callbacks[event],
        specialCallbacks = this.getWildcardCallbacks(event),
        i,
        len,
        item;

    if (callbacks) {
        for (i = 0, len = callbacks.length; i < len; ++i) {
            if (callbacks[i]) {
                callbacks[i].apply(this, args);
            } else {
                break;
            }
        }
    }

    if (specialCallbacks) {
        for (i = 0, len = specialCallbacks.length; i < len; ++i) {
            if (specialCallbacks[i]) {
                specialCallbacks[i].apply(this, [event].concat(args));
            } else {
                break;
            }
        }
    }

    return this;
};

// Helper for for finding special wildcard event handlers that match the event
WildEmitter.prototype.getWildcardCallbacks = function (eventName) {
    var item,
        split,
        result = [];

    for (item in this.callbacks) {
        split = item.split('*');
        if (item === '*' || (split.length === 2 && eventName.slice(0, split[1].length) === split[1])) {
            result = result.concat(this.callbacks[item]);
        }
    }
    return result;
};

},{}]},{},[1])

