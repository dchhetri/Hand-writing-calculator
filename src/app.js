function App(){
  this.initialize();
  this._renderDebugButton();
}

App.prototype.initialize = function(){
  this.stage = this.createStage();
  this.drawLayer = new Kinetic.Layer();
  this.trainer = new Trainer();
  
  var background = this.createBackgroundRect();
  this.drawLayer.add(background);
  this.stage.add( this.drawLayer );
  
  this.pencil = new Pencil({
    stage: this.stage, 
    layer: this.drawLayer,
    eventHandler: background,
  });
  //logic to overlay a grid handler
  this.downSampler = new DownSampler({
     canvas: this.drawLayer.getCanvas(),
     drawingContext: this.drawLayer.getCanvas().getContext('2d'),
     downsampleWidth: Environment.DOWNSAMPLE_WIDTH,
     downsampleHeight: Environment.DOWNSAMPLE_HEIGHT
  });
}
App.prototype.createStage = function(){
  $("#drawing-container").empty();
  return new Kinetic.Stage({
        container: 'drawing-container',
        width: Environment.DRAWING_AREA_WIDTH,
        height: Environment.DRAWING_AREA_HEIGHT
  });
}
App.prototype.createBackgroundRect = function(){
  return new Kinetic.Rect({
     x: 0,
     y: 0,
     width: Environment.DRAWING_AREA_WIDTH,
     height: Environment.DRAWING_AREA_HEIGHT,
     fill: Environment.BACKGROUND_COLOR,
     stroke: 'black',
     strokeWidth: 1,
   })
}

App.prototype.render = function(){
}

App.prototype._renderDebugButton = function(){
  var recognizeButton = $("<button>Recognize</button>");
  $("body").append( recognizeButton );
  var that = this;
  recognizeButton.click(function(){
    var result = that.downSampler.calculate();
    console.log('in perform downsample: ', result);
    for(var row = 0; row < Environment.DOWNSAMPLE_HEIGHT; ++row){
        var rowIndex = row * Environment.DOWNSAMPLE_WIDTH;
        console.log(result.slice(rowIndex,Environment.DOWNSAMPLE_WIDTH + rowIndex));
    }
    var start = new Date().getTime();
    var bestMatch = that.trainer.bestMatch(result);
    console.log('best match = ' , bestMatch);
    var end = new Date().getTime();
    console.log('time take = ' , (end-start) + ' ms');
    $("#result").empty();
    $("#result").text(bestMatch);
  });

  var clearButton = $("<button>Clear</button>");
  $("body").append( clearButton );
  clearButton.click(function(){
    that.initialize();
  }) 
}