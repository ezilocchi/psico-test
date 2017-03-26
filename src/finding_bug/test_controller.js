TestController = function(canvas) {
  this.start = function(callback, poc, options) {
    var finished = false;
    var ended = false;
    var hasShownCorrectResult = false;
    var durationLastTest;

    var markAsSuccess = function() {
      options.results.push({
        time: durationLastTest,
        result: 'succeeded',
        type: options.test.type,
        obstacle: options.test.obstacle,
      });
    };

    var markAsFailure = function() {
      options.results.push({
        time: durationLastTest,
        result: 'failed',
        type: options.test.type,
        obstacle: options.test.obstacle,
      });
    };

    var markAsTimedOut = function() {
      options.results.push({
        time: options.time,
        result: 'time out',
        type: options.test.type,
        obstacle: options.test.obstacle,
      });
    };

    var finishTest = function(timeout) {
      durationLastTest = test.duration();

      if(timeout) {
        if(!poc) {
          markAsTimedOut();
          test.finish();
        }
        callback('time out');
      } else if(test.hasSucceed()) {
        if(!poc) markAsSuccess();
        callback('success');
      } else {
        if(!poc) markAsFailure();
        callback('failure');
      }
    };

    document.onkeypress = function(event) {
      if(event.keyCode == 32) { // Space key
        if(!finished) {
          clearTimeout(timeout);
          finished = true;
          test.finish();
        } else if(test.selectedBug) {
          var failed = test.hasFailed();

          if(!ended) {
            if(!failed || hasShownCorrectResult) {
              finishTest();
              ended = true;
            }

            if(failed) {
              test.showBugToBeFound();
              hasShownCorrectResult = true;
            }
          }
        }
      }
    };

    var test = new Test(canvas);
    test.start(poc, options);

    var timeout = setTimeout(function() {
      finishTest(true);
    }, options.time * 1000);
  };
};
