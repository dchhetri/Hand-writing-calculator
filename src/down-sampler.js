function CreateFilledArray(size,value){
	return new Array(size).map(Number.prototype.valueOf,value);
}

function DownSampler(opt){
	this.canvas = opt.canvas;
	this.drawingContext = opt.drawingContext;
	this.downsampleWidth = opt.downsampleWidth;
	this.downsampleHeight = opt.downsampleHeight;

	this.borderSize = 5;//todo: get away from this
	this.sampleSpaceBounds = {	x: this.borderSize,
								y: this.borderSize,
								width: this.canvas.width - this.borderSize,
								height: this.canvas.height - this.borderSize
						    };
}

DownSampler.prototype.isRowClear = function (row) {
    var pix = this.drawingContext.getImageData(0, row, this.sampleSpaceBounds.width, 1).data;
    var isClear = true;
    for (var i = this.sampleSpaceBounds.x; i < pix.length; i+=3) {
        if (pix[i] == 0 && pix[i+1] == 0 && pix[i+2] == 0) {
        	isClear = false;
        	break;
        }
    }
    return isClear;
},

DownSampler.prototype.isColumnClear = function (col) {
    var pix = this.drawingContext.getImageData(col,0, 1, this.sampleSpaceBounds.height).data;
    var isClear = true;
    for (var i = this.sampleSpaceBounds.y; i < pix.length; i+=3) {
        if (pix[i] == 0 && pix[i+1] == 0 && pix[i+2] == 0) {
        	isClear = false;
        	break;
        }
    }
    return isClear;
}
//Downsample the drawing area. 
DownSampler.prototype.calculate = function () {
    'use strict';
   	var boundingRegion = this.findBoundingRectangle();
   	//DEBUG
    //this.drawingContext.strokeRect(boundingRegion.left,boundingRegion.top,boundingRegion.right-boundingRegion.left,boundingRegion.bottom-boundingRegion.top);
    // now downsample
    var cellWidth = (boundingRegion.right - boundingRegion.left) / this.downsampleWidth;
    var cellHeight = (boundingRegion.bottom - boundingRegion.top) / this.downsampleHeight;
    var result = [];
    //'Overlay a grid of downsample-size and mark hit or miss'
    for (var row = 0; row < this.downsampleHeight; row++) {
        for (var col = 0; col < this.downsampleWidth; col++) {
            var x = (cellWidth * col) + boundingRegion.left;
            var y = (cellHeight * row) + boundingRegion.top;
            // obtain pixel data for the grid square
            var pixels = this.drawingContext.getImageData(x, y, cellWidth, cellHeight).data;
            var isCellHit = _.contains(pixels,0);
            //DEBUG -- draw each cell
            this.drawingContext.strokeStyle="#777777";
            this.drawingContext.strokeRect(x,y,cellWidth,cellHeight);
            this.drawingContext.strokeStyle="black";
            //1.0 = hit , -1.0 = miss
            var score = isCellHit ? 1.0 : -1.0;
            result.push(score);
        }
    }

    return result;
}

DownSampler.prototype.findBoundingRectangle = function(opt){
	var options = opt || {};
	var defaults = {
		stepSize: options.stepSize || 1,
		minBounds: options.minBounds || {width:50,height:50},
	}

    // first find a bounding rectangle so that we can crop out unused space
    var top = this.sampleSpaceBounds.y;
    while (this.isRowClear(top) && top < this.sampleSpaceBounds.height) {
        top += defaults.stepSize;
    }
    var bottom = this.sampleSpaceBounds.height;
    while (this.isRowClear(bottom) && bottom > 0) {
        bottom -= defaults.stepSize;
    }
    var left = this.sampleSpaceBounds.x;
    while (this.isColumnClear(left) && left < this.sampleSpaceBounds.width) {
        left += defaults.stepSize;
    }
    var right = this.sampleSpaceBounds.width;
    while (this.isColumnClear(right) && right > 0) {
        right -= defaults.stepSize;
    }
    
    //assert min bounds
    var width = right - left;
    var height = bottom - top;
    //if not meet, shift half left , half right; making sure not to go out of bounds
    if(width < defaults.minBounds.width){
    	left  = Math.max(0,left - defaults.minBounds.width / 2);
    	right = Math.min(this.sampleSpaceBounds.width, right + defaults.minBounds.width / 2);
    }
    //if not meet, shift half up, half down; making sure not to go out of bounds
    if(height < defaults.minBounds.height){
    	top = Math.max(0 , top - defaults.minBounds.height / 2);
    	bottom = Math.min(this.sampleSpaceBounds.height , bottom + defaults.minBounds.height / 2);
    }

    var bounds = {top:top , right:right , bottom:bottom , left:left};
    console.log('bounds = ' , bounds );
    return bounds;
}

