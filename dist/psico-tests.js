CanvasFactory = {
  create: function(containerId) {
    var canvasContainer = document.getElementById(containerId);
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }
    var canvasElement = document.createElement('canvas');
    canvasElement.id = 'c';
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasContainer.appendChild(canvasElement);

    return new fabric.Canvas('c', { selection: false });
  }
};
;var insideBoundaries = function(limit, objectPosition, objectSize, delta) {
  var upperLimit = objectPosition + delta < limit - objectSize;
  var lowerLimit = objectPosition + delta > 0;
  return upperLimit && lowerLimit;
};

var insideBoundariesInvert = function(limit, objectPosition, objectSize, delta) {
  var upperLimit = objectPosition - delta < limit - objectSize;
  var lowerLimit = objectPosition - delta > 0;
  return upperLimit && lowerLimit;
};

var moveOnX = function() {
  if (this.left > this.canvas.width - this.width) {
    this.movingLeft = false;
  }
  if (this.left <= 0) {
    this.movingLeft = true;
  }
  if(this.movingLeft) {
    this.left += this.increment;
  } else {
    this.left -= this.increment;
  }
};

var moveOnY = function() {
  if (this.top > this.canvas.height - this.height) {
    this.movingDown = false;
  }
  if (this.top <= 0) {
    this.movingDown = true;
  }
  if(this.movingDown) {
    this.top += this.increment;
  } else {
    this.top -= this.increment;
  }
};

Bug = {
  computePositionFor: function(mouseOnX, mouseOnY, invert) {
    if(this.lastMouseOnX && this.lastMouseOnY) {
      this.movingLeft = this.lastMouseOnX > mouseOnX;

      var deltaX = mouseOnX - this.lastMouseOnX;
      var insideXlimits;
      if(invert) {
        insideXlimits = insideBoundariesInvert(this.canvas.width, this.left, this.width, deltaX);
        if(insideXlimits) this.left -= deltaX;
      } else {
        insideXlimits = insideBoundaries(this.canvas.width, this.left, this.width, deltaX);
        if(insideXlimits) this.left += deltaX;
      }

      this.movingDown = this.lastMouseOnY > mouseOnY;

      var deltaY = mouseOnY - this.lastMouseOnY;
      var insideYlimits;
      if(invert) {
        insideYlimits = insideBoundariesInvert(this.canvas.height, this.top, this.height, deltaY);
        if(insideYlimits) this.top -= deltaY;
      } else {
        insideYlimits = insideBoundaries(this.canvas.height, this.top, this.height, deltaY);
        if(insideYlimits) this.top += deltaY;
      }
    }

    this.lastMouseOnX = mouseOnX;
    this.lastMouseOnY = mouseOnY;
  },

  move: function() {
    moveOnX.apply(this);
    moveOnY.apply(this);
  }
};
;FindingBug = function(options) {
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
;TestController = function(canvas) {
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
;Test = function(canvas) {
  var that = this;
  var previousSelectedBug;
  var targetBug;
  var finishedAt;
  var startedAt;

  this.hasSucceed = function() {
    return this.selectedBug === targetBug;
  };

  this.hasFailed = function() {
    return !this.hasSucceed();
  };

  this.showBugToBeFound = function() {
    fabric.Image.fromURL('images/ladybug_to_be_found.png', function(bug) {
      bug.set('left', targetBug.left);
      bug.set('top',  targetBug.top);
      canvas.add(bug);
    });
  };

  this.duration = function() {
    return Math.round((finishedAt - startedAt) / 1000);
  };

  this.finish = function() {
    canvas.defaultCursor = 'default';
    clearInterval(that.rendering);
    canvas.off('mouse:move');
    finishedAt = new Date();

    canvas.getObjects().forEach(function(image) {
      if(image.bug) {
        image.selectable = true;
        image.setCoords();
      } else {
        canvas.remove(image);
      }
    });

    canvas.on('object:selected', function(event) {
      that.selectedBug = event.target;
      if(previousSelectedBug) {
        canvas.remove(previousSelectedBug);
      }

      fabric.Image.fromURL('images/ladybug_selected.png', function(bug) {
        bug.set('left', that.selectedBug.left);
        bug.set('top',  that.selectedBug.top);
        canvas.add(bug);
        previousSelectedBug = bug;
      });
    });
  };

  this.start = function(poc, options) {
    var speed = 10; //miliseconds
    var obstacle = options.test.obstacle || false;

    var mouseHandler = function(params) {
      var currentPositionX = params.e.x;
      var currentPositionY = params.e.y;

      targetBug.computePositionFor(currentPositionX, currentPositionY, options.invert);
    };

    canvas.on('mouse:move', mouseHandler);

    var objectInit = function(bug) {
      bug.set('left', fabric.util.getRandomInt(0, canvas.width - bug.width));

      bug.set('top',  fabric.util.getRandomInt(0, canvas.height - bug.height));
      bug.movingLeft = !!Math.round(Math.random());
      bug.movingDown = !!Math.round(Math.random());
      bug.selectable = false;
      bug.canvas = canvas;

      bug.increment = options.increment;

      bug.computePositionFor = Bug.computePositionFor;
      bug.move = Bug.move;
      bug.bug = true;
      canvas.add(bug);

      if(canvas._objects.length == 1) targetBug = bug;
    };

    for(var i = 0; i < options.quantity; i++) {
      fabric.Image.fromURL('images/ladybug.png', objectInit);
    }

    if(obstacle) {
      fabric.Image.fromURL('images/tronco.png', function(plant){
        plant.canvas = canvas;
        plant.selectable = false;

        plant.set('left', (canvas.width - plant.width) / 2);
        plant.set('top', (canvas.height - plant.height) / 2);

        canvas.add(plant);
      });
    }

    var animate = function() {
      canvas.forEachObject(function(bug) { if(bug.bug) bug.move(); });
    };

    var render = function() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(animate);
    };

    startedAt = new Date();
    that.rendering = setInterval(render, speed);
  };
};
;PinCar = function(options) {
  var subject = options.subject;
  this.table = options.table;

  this.leftLimit = 200;
  this.increment = parseInt(options.speed) || 1;
  this.duration = parseInt(options.duration) || 10;
  this.duration = this.duration * 1000;
  this.speed = 10;

  this.results = [];
  this.canvas = undefined;
  this.rightLimit = undefined;
  var bugcar;
  this.testCallback = undefined;
  var moving = true;
  var justCrashed = false;

  this.newTest = function(callback) {
    this.canvas = CanvasFactory.create('container');
    this.testCallback = callback;
    this.rightLimit = this.canvas.width - this.leftLimit;
    var that = this;

    events = [];

    var computeOrientation = function(pushLeft, pushRight) {
      if(shouldMove(pushLeft, pushRight)) {
        if(pushLeft) { // left arrow key
          bugcar.movingLeft = true;
        }
        if(pushRight) { // rigth arrow key
          bugcar.movingLeft = false;
        }

        moving = true;

        if(justCrashed) {
          var crashTime = Math.round((new Date() - lastCrashAt) / 1000);
          that.results.push(crashTime);
        }
      }
    };

    this.canvas.on({
      'touch:drag': function(event) {
        events.push({
          state: event.self.state,
              x: event.self.x,
              y: event.self.y,
        });

        if(events.length % 5 === 0) {
          var dragToRight = (events[events.length - 1].x - events[events.length - 5].x) > 0;

          var pushLeft = !dragToRight;
          var pushRight = dragToRight;
          computeOrientation(pushLeft, pushRight);
        }
      },
    });

    document.body.onkeydown = function(event) {
      var pushLeft = event.keyCode == 37;
      var pushRight = event.keyCode == 39;

      computeOrientation(pushLeft, pushRight);
    };

    var initialY = 200;

    fabric.Image.fromURL('images/car.png', function(img) {
      var middlePoint = (that.canvas.width / 2) - (img.width / 2);
      img.set('left', middlePoint);
      img.set('top',  initialY);
      img.movingLeft = !!Math.round(Math.random());
      img.selectable = false;

      that.canvas.add(img);
      bugcar = img;
    });

    var leftBorder = new fabric.Rect({
      left: 0,
      top: 0,
      fill: 'black',
      width: this.leftLimit,
      height: this.canvas.height,
      selectable: false,
    });

    var rightBorder = new fabric.Rect({
      left: this.rightLimit,
      top: 0,
      fill: 'black',
      width: this.leftLimit,
      height: this.canvas.height,
      selectable: false,
    });

    var fadingPaneWidth = this.canvas.width - (2 * this.leftLimit);
    this.fadingPane = new fabric.Rect({
      left: this.leftLimit,
      top: 0,
      fill: 'red',
      width: fadingPaneWidth,
      height: this.canvas.height,
      opacity: 0,
      selectable: false,
    });

    var lineHeight = 120;
    var lineWidth = 30;
    var lineLeft = (this.canvas.width / 2) - (lineWidth / 2);
    var lineTop = -lineHeight;
    this.yellowLineOne = new fabric.Rect({
      left: lineLeft,
      top: lineTop,
      fill: 'yellow',
      width: lineWidth,
      height: lineHeight,
      selectable: false,
    });
    this.canvas.add(this.yellowLineOne);

    this.yellowLineTwo = new fabric.Rect({
      left: lineLeft,
      top: (lineTop / 2 ) + (this.canvas.height / 2),
      fill: 'yellow',
      width: lineWidth,
      height: lineHeight,
      selectable: false,
    });
    this.canvas.add(this.yellowLineTwo);

    var shouldMove = function(pushLeft, pushRight) {
      var pushingToTheCrashedDirection =
        bugcar.movingLeft && pushRight ||
        !bugcar.movingLeft && pushLeft;

      if (justCrashed && pushingToTheCrashedDirection) {
        return false;
      } else {
        return true;
      }
    };


    this.canvas.add(leftBorder);
    this.canvas.add(rightBorder);
    this.canvas.add(this.fadingPane);
    this.startedAt = new Date();

    // TODO: research a better approach: this on the setInterval function is 'undefined' or 'windows'
    var start = function() { that.render(); };
    this.rendering = setInterval(start, this.speed);

    var finish = function() { that.showResults(); };
    setTimeout(finish, this.duration);
  };

  this.animate = function() {
    // FIXME When the this.canvas.add(img) has not finished and we call animate bugcar is undefined and it throws an error
    var crashedLeftLimit  = (this.leftLimit * 0.3) >= bugcar.left;
    var crashedRightLimit = (this.rightLimit + this.leftLimit * 0.7) <= bugcar.left + bugcar.width;

    var crashed = function(that) {
      bugcar.movingLeft = crashedRightLimit;
      moving = false;
      justCrashed = true;
      lastCrashAt = new Date();
    };

    if((crashedLeftLimit || crashedRightLimit) && !justCrashed) {
      crashed(this);
    }

    if(moving) {
      justCrashed = false;
      if(bugcar.movingLeft) {
        bugcar.left -= this.increment;
      } else {
        bugcar.left += this.increment;
      }
    }

    var that = this;
    [this.yellowLineOne, this.yellowLineTwo].forEach(function(line) {
      if(that.canvas.height < line.top) {
        var lineHeight = 120;
        var lineTop = -lineHeight;
        line.top = lineTop;
      }
      line.top += (that.increment * 2);
    });
  };

  this.render = function() {
    this.canvas.renderAll();

    // TODO: research a better approach: this on the requestAnimFrame function is 'undefined'
    var that = this;
    var process = function() { that.animate(); };
    fabric.util.requestAnimFrame(process);
  };

  this.showResults = function() {
    //FIXME: Extract the id value 'results' into a param or attribute
    clearInterval(this.rendering);
    var duration = Math.round((new Date() - this.startedAt) / 1000);


    if(justCrashed) {
      var crashTime = Math.round((new Date() - lastCrashAt) / 1000);
      this.results.push(crashTime);
    }

    var resultMessage = 'Duracion: ' + duration + ' Segundos';

    var headers = ['Subject','Tiempo en Banquina'];
    var body = [];
    body.push(headers);
    this.results.forEach(function(time, index) {
      numberOfCrashed = index + 1;
      body.push([subject, time]);
    });

    var resultTable = document.getElementById('results');
    var tableBuilder = new TableBuilder(headers, body, resultTable);
    tableBuilder.asHtml();

    tableBuilder.asCSV(subject, 'pincar');

    this.testCallback();
  };

  this.getResults = function() {
    return this.results;
  };
};
;RowBuilder = function(headers) {
  var that = this;
  this.cellBuilders = [];

  headers.forEach(function(header) {
    that.cellBuilders.push(new SimpleTextCellBuilder());
  });

  this.build = function(row, header) {
    var tr = document.createElement('tr');
    row.forEach(function(value, index) {
      var cell;
      if(header) {
        cell = that.cellBuilders[index].buildHeader(value);
      } else {
        cell = that.cellBuilders[index].buildCell(value);
      }
      tr.appendChild(cell);
    });
    return tr;
  };
};
;SimpleTextCellBuilder = function() {

  this.buildCell = function(text) {
    var td = document.createElement('td');
    return build(text, td);
  };

  this.buildHeader = function(text) {
    var th = document.createElement('th');
    return build(text, th);
  };

  var build = function(text, element) {
    var textNode = document.createTextNode(text);
    element.appendChild(textNode);
    return element;
  };
};
;TableBuilder = function(headers, body, htmlTable) {
  var that = this;
  this.rowBuilder = new RowBuilder(headers);

  this.asHtml = function() {
    var table = htmlTable || document.createElement('table');

    var thead = document.createElement('thead');
    var header = that.rowBuilder.build(headers, true);
    table.appendChild(thead);
    thead.appendChild(header);

    var tbody = document.createElement('tbody');
    body.forEach(function(row) {
      var tr = that.rowBuilder.build(row);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  };

  this.asCSV = function(subject, prefix) {
    console.log(body);
    var file = new Blob(body, {type: 'text/csv'});
    var a = window.document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + window.encodeURIComponent(body.join('\n')));

    var filename = prefix || '';
    if(subject) {
      filename += '_';
      filename += subject;
      filename += '.csv';
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
};

