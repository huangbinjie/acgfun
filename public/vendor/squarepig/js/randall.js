function Randall(x, y) {
	pig.Entity.apply(this) ;

	var randall = new pig.Sprite(x, y, "./static/plugins/squarepig/images/pig.png", 64, 64) ;
	randall.add("stand", [0]) ;
	randall.add("walk", [1, 2, 3]) ;
	randall.play("stand", 0) ;
	this.graphic = randall ;

	this.x = x ;
	this.y = y ;
	this.direction = 0 ;

	this.returnTimer = 0 ;

	this.update = function(dtime) {
		var d = 0 ;

		var minX = this.x + 32 - 128 ;
		if(this.direction == 1) {
			minX -= 64 ;
		}

		var maxX = this.x + 32 + 128 ;
		if(this.direction < 0) {
			maxX += 64 ;
		}
		if(this.returning) {
			if(this.x < 32)
				d = 1 ;
			else if(this.x > pig.canvas.width - 96)
				d = -1 ;
			else if(this.x > 32 && this.x < pig.canvas.width - 64)
				this.returning = false ;
		}
		else if(pig.mouse.x < (this.x + 32) && pig.mouse.x > minX) {
			d = 1 ;
			this.returnTimer = 0 ;
		}
		else if(pig.mouse.x > (this.x + 32) && pig.mouse.x < (maxX)) {
			d = -1 ;
		}

		if(d != this.direction) {
			this.direction = d ;
			if(d)
				this.graphic.play("walk", 15) ;
			else
				this.graphic.play("stand", 0) ;
		}

		if(d > 0) {
			this.graphic.flip = false ;
			if(this.graphic.frame != 2)
				this.x += dtime * 300 ;
		}
		else if(d < 0) {
			this.graphic.flip = true ;
			if(this.graphic.frame != 2)
				this.x -= dtime * 300 ;
		}
		this.graphic.place([this.x, this.y]) ;

		if(this.x < -64 || this.x > pig.canvas.width) {
			this.returnTimer += dtime ;
			if(this.returnTimer > 1)
				this.returning = true ;
		} else {
			this.returnTimer = 0 ;
		}
	} ;
}

function main() {
	pig.init(document.getElementById('pig-canvas')) ;
	var randall = new Randall(pig.canvas.width/2 - 32, 0) ;
	pig.world.add(randall) ;
	pig.run() ;
}

main() ;
