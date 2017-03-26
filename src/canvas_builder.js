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
