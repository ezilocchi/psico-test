PinCar = function(options) {
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
