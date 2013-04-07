function Pencil(option){
	this.stage = option.stage;
	this.layer = option.layer;
	this.eventHandler = option.eventHandler || option.layer;

	this.isTouchDown = false;
	this.currentPointList = [];
	this.currentLine = null;

 	this.eventHandler.on(Environment.TOUCH_DOWN_EVENT_NAME,this.onTouchDown.bind(this));
	this.eventHandler.on(Environment.TOUCH_UP_EVENT_NAME,this.onTouchUp.bind(this));
	this.eventHandler.on(Environment.TOUCH_MOVE_EVENT_NAME, this.onTouchMove.bind(this));
}

Pencil.prototype.onTouchDown = function(event){
	console.log('in Pencil::onTouchDown');
	this.isTouchDown = true;
	var pointerPosition = this.stage.getPointerPosition();
	if(pointerPosition){
		this.currentPointList.push(pointerPosition);
		this.currentLine = this._createLine({points:this.currentPointList});
		this.layer.add( this.currentLine );
		this.render();
	}
}

Pencil.prototype.onTouchUp = function(event){
	console.log('in Pencil::onTouchUp');
	this.isTouchDown = false;
	this.currentPointList = [];
	this.currentLine = null;
}

Pencil.prototype.onTouchMove = function(event){
	if(!Environment.isMobile() && !this.isTouchDown){
		return;
	}
	else{ //drag event
		console.log('in Pencil::onTouchMove');
		var pointerPosition = this.stage.getPointerPosition();
		if(pointerPosition){
			this.currentPointList.push(pointerPosition);
			this.currentLine.setPoints( this.currentPointList );
			this.render();
		}
	}
}

Pencil.prototype.render = function(){
	this.layer.drawScene();
}

Pencil.prototype._createLine = function(opt){
	var defaults = {
		points: opt.points || [],
		stroke: opt.stroke || 'black',
		strokeWidth: opt.strokeWidth || 2,
		lineCap: opt.lineCap || 'round',
		lineJoin: opt.lineJoin || 'round'
	};

	return new Kinetic.Line({
		points: defaults.points,
        stroke: defaults.stroke,
        strokeWidth: defaults.strokeWidth,
        lineCap: defaults.lineCap,
        lineJoin: defaults.lineJoin
	})
}