FindingBug = function(options) {
  var results   = [];
  var subject   = options.subject;
  var quantity  = parseInt(options.quantity) || 5;
  var increment = parseInt(options.speed) || 1;
  var invert    = options.invert || false;
  var time      = options.time || 30;
  var currentTest;

  var onImageLoaded = function(canvas, callback, poc) {
    var controller = new TestController(canvas);
    controller.start(callback, poc, {
      results:   results,
      quantity:  quantity,
      increment: increment,
      invert:    invert,
      time:      time,
      test:      currentTest,
    });
  };

  this.newTest = function(callback, poc) {
    if(tests.length > 0) {
      currentTest = tests.shift();
      runTest(callback, poc);
    } else {
      callback('finish');
    }
  };

  this.restartTest = function(callback, poc) {
    this.eraseLastResult();
    runTest(callback, poc);
  };

  var runTest = function(callback, poc) {
    var canvas = CanvasFactory.create('container');
    canvas.setBackgroundImage('images/Grass.jpg', onImageLoaded(canvas, callback, poc));
    canvas.defaultCursor = 'none';
  };

  this.getResults = function() {
    return results;
  };

  this.eraseLastResult = function() {
    results.pop();
  };

  this.showResults = function(tableId) {
    var numberOfSucceded = 0;
    var body = [];
    var headers = ['Subject', 'Condicion', 'Intento', 'Obstaculo', 'Resultado', 'Tiempo'];

    body.push(headers);

    results.forEach(function(result, index) {
      var attemptNumber = index + 1;

      var resultClass = 'danger';
      var resultValue = 'Fallo';
      if(result.result === 'succeeded') {
        resultClass = 'success';
        resultValue = 'Acierto';
        numberOfSucceded += 1;
      } else if(result.result === 'time out') {
        resultValue = 'Time out';
      }

      var obstacle = 'Ausente';
      if(result.obstacle) {
        obstacle = 'Presente';
      }

      body.push([subject, result.type, attemptNumber, obstacle, resultValue, result.time]);
    });

    var resultTable = document.getElementById(tableId);
    var tableBuilder = new TableBuilder(headers, body, resultTable);
    tableBuilder.asHtml();
    tableBuilder.asCSV(subject, 'finding_bug');

    return numberOfSucceded;
  };

  var tests = [
    { obstacle: false, type: 'self' },
    { obstacle: false, type: 'self' },
    { obstacle: false, type: 'self' },
    { obstacle: true, type: 'self' },
    { obstacle: true, type: 'self' },
    { obstacle: true, type: 'self' },
    { obstacle: false, type: 'other' },
    { obstacle: false, type: 'other' },
    { obstacle: false, type: 'other' },
    { obstacle: true, type: 'other' },
    { obstacle: true, type: 'other' },
    { obstacle: true, type: 'other' },
  ];
};
