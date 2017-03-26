Test = function(canvas) {
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
