/*
  squarepig -- a simple HTML5 game engine.
  version 0.1, 18/11/2011

  Copyright 2011 Alex McGivern / Reality Games Ltd

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.

  Alex McGivern (alex@realitycouncil.com)
*/

pig = {
	canvas: null,
	context: null,
	images: {},
	world: null,
	mouse: {x: undefined, y: undefined, pressed: false},
	offset: [0, 0],
	fps: 60
}

pig.init = function(canvas) {
	this.canvas = canvas ;
	this.context = canvas.getContext('2d'); ;
	this.world = new pig.World() ;
	this.canvas.onmousedown = pig._canvasMouseDown ;
	document.onkeydown = pig.keyDown ;
	this.canvas.onmousemove = pig.mouseMove ;
	this.canvas.onmouseout = pig.mouseOut ;

	if (document.defaultView && document.defaultView.getComputedStyle) {
		var paddingLeft = +(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'])      || 0 ;
		var paddingTop  = +(document.defaultView.getComputedStyle(canvas, null)['paddingTop'])       || 0 ;
		var borderLeft  = +(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'])  || 0 ;
		var borderTop   = +(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'])   || 0 ;
		pig.offset = [paddingLeft + borderLeft, paddingTop + borderTop] ;
	}

	this.canvas.width = this.canvas.clientWidth ;
	this.canvas.height = this.canvas.clientHeight ;
} ;

pig.loadImage = function(url) {
	if(url in this.images)
		return this.images[url] ;
	var i = new Image() ;
	i.src = url ;
	this.images[url] = i ;
	return i ;
} ;

pig._mousePosition = function(e) {
	var ox = 0 ;
	var oy = 0 ;
	var element = pig.canvas ;
	if (element.offsetParent) {
		do {
			ox += element.offsetLeft;
			oy += element.offsetTop;
		} while ((element = element.parent)) ;
	}
	var mp = [e.pageX - ox + pig.offset[0], e.pageY - oy + pig.offset[1]] ;
	return mp ;
} ;

pig._canvasMouseDown = function(event) {

	pig.mouseDown() ;
} ;

pig.keyDown = function(event) {
	pig.world.keyDown(event.keyCode) ;
} ;

pig.mouseDown = function() {
	pig.world.mouseDown() ;
} ;

pig.mouseMove = function(event) {
	var mousePos = pig._mousePosition(event) ;
	pig.mouse.x = mousePos[0] ;
	pig.mouse.y = mousePos[1] ;
} ;

pig.mouseOut = function(event) {
	pig.mouse.x = undefined ;
	pig.mouse.y = undefined ;
};

pig.run = function() {
	var dtime = 1000 / pig.fps ;
	setInterval(pig.update(dtime / 1000), dtime) ;
} ;

pig.update = function(dtime) {
	var update = function() {
		pig.world.update(dtime) ;
		pig.canvas.width = pig.canvas.clientWidth ;
		pig.canvas.height = pig.canvas.clientHeight ;
		pig.context.clearRect(0, 0, pig.canvas.width, pig.canvas.height) ;
		pig.world.draw() ;
	}
	return update ;
} ;

pig.Object = function() {
	this.clone = function() {
		var f = function() {} ;
		f.prototype = this ;
		var o = new f() ;
		return o ;
	} ;

	this.extend = function(data) {
		var o = this.clone() ;
		for(var k in data) {
			o[k] = data[k] ;
		}
		return o ;
	} ;

	this.init = function() {} ;
}

pig.World = function() {
	pig.Object.apply(this) ;

	this.entities = [] ;
	this.removed = [] ;

	this.add = function(e) {
		this.entities.push(e) ;
	} ;

	this.init = function() {

	} ;

	this.draw = function() {
		for(var e in this.entities) {
			this.entities[e].draw() ;
		}
	} ;

	this.getType = function(type) {
		var ents = [] ;
		for(var e in this.entities) {
			if(this.entities[e].type == type)
				ents.push(this.entities[e]) ;
		}
		return ents ;
	} ;

	this.keyDown = function(key) {
		for(var e in this.entities) {
			this.entities[e].keyDown(key) ;
		}
	} ;

	this.keyUp = function(key) {
		for(var e in this.entities) {
			this.entities[e].keyUp(key) ;
		}
	} ;

	this.mouseDown = function() {
		for(var e in this.entities) {
			this.entities[e].mouseDown() ;
		}
	} ;

	this.remove = function(e) {
		this.removed.push(e) ;
	} ;

	this._update = function(dtime) {
		for(var e in this.entities) {
			if(this.entities[e].graphic)
				this.entities[e].graphic.update(dtime) ;
			this.entities[e].update(dtime) ;
		}
		for(var r in this.removed) {
			for(var e in this.entities) {
				if(this.entities[e] == this.removed[r])
					this.entities.splice(e, 1) ;
			}
		}
		this.removed = [] ;
	} ;

	this.update = function(dtime) { this._update(dtime) ; } ;
}

pig.Entity = function() {
	pig.Object.apply(this) ;

	this.graphic = null ;
	this.type = "entity" ;

	this.collide = function(rect) {
		return false ;
	} ;

	this.draw = function() {
		if(this.graphic)
			this.graphic.draw() ;
	} ;

	this.keyDown = function(key) {} ;

	this.keyUp = function(key) {} ;

	this.update = function() {} ;
}

pig.Rect = function(x, y, w, h) {
	pig.Object.apply(this) ;
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.collide = function(rect) {
		if(this.x > rect.x + rect.w)
			return false ;
		if(rect.x > this.x + this.w)
			return false ;
		if(this.y > rect.y + rect.h)
			return false ;
		if(rect.y > this.y + this.h)
			return false ;
		return true ;
	} ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;
}

pig.Circle = function(x, y, radius) {
	pig.Object.apply(this) ;

	this.init = function(x, y, radius) {
		this.x = x ;
		this.y = y ;
		this.radius = radius ;
	} ;

	this.collide = function(circle) {
		var dx = this.x - circle.x ;
		var dy = this.y - circle.y ;
		var sqDistance = dx*dx + dy*dy ;

		var r = this.radius + circle.radius ;
		var collide = (sqDistance <= r*r) ;
		return collide ;
	} ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;
} ;

pig.Sprite = function(x, y, image, frameW, frameH) {
	pig.Object.apply(this) ;

	this.x = x ;
	this.y = y ;
	this.origin = [0, 0] ;
	this.scale = 1 ;
	this.image = pig.loadImage(image) ;
	this.frame = 0 ;
	this.animations = {} ;
	this.animation = null ;
	this.fps = 0 ;
	this.time = 0 ;
	this.frameWidth = frameW ;
	this.frameHeight = frameH ;
	this.flip = false ;


	this.add = function(animation, frames) {
		this.animations[animation] = frames ;
	} ;

	this.draw = function() {
		if(this.image.height) {
			var px = this.x - (this.image.width/2)*(this.scale-1) ;
			var py = this.y - (this.image.height/2)*(this.scale-1) ;

			var fx = 0 ;
			if(this.animation) {
				var frame = this.animation[this.frame] ;
				fx = frame * this.frameWidth ;
			}
			pig.context.save() ;
			pig.context.translate(this.x, this.y) ;
			if(this.flip) {
				pig.context.scale(-1, 1) ;
				pig.context.translate(-this.frameWidth, 0) ;
			}
			pig.context.drawImage(this.image, fx, 0, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth * this.scale, this.frameHeight * this.scale) ;
			pig.context.restore() ;
		}
	} ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;

	this.play = function(animation, fps) {
		this.animation = this.animations[animation] ;
		this.fps = fps ;
		this.frame = this.animations[animation][0] ;
		this.time = 0 ;
	} ;

	this.update = function(dtime) {
		this.time += dtime ;

		if(this.fps > 0 && this.time > 1 / this.fps) {
			++this.frame ;
			this.time -= 1 / this.fps ;
			if(this.frame >= this.animation.length) {
				this.frame -= this.animation.length ;
			}
		}
	} ;
} ;

pig.key = {
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,

	ZERO:  48,
	ONE:   49,
	TWO:   50,
	THREE: 51,
	FOUR:  52,
	FIVE:  53,
	SIX:   54,
	SEVEN: 55,
	EIGHT: 56,
	NINE:  57,

	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
};
