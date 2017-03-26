var insideBoundaries = function(limit, objectPosition, objectSize, delta) {
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
