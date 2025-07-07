class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 2;
        this.acceleration = 0.2;
        
        this.maxSpeed = 15;
        this.friction = 0.01;
        this.angle = 0;
        this.sensor = new Sensor(this);
        this.controls = new Controls();
    }
  
    update(roadBorders) {
        this.#move();
        this.sensor.update(roadBorders);
    }

    #move(canvasWidth, canvasHeight) {
        // Handle acceleration
        if(this.controls.forward) {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // Limit speed
        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }

        // Apply friction
        if(this.speed > 0) {
            this.speed -= this.friction;
        }
        if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
 
        // Handle turning - only when moving
        if(Math.abs(this.speed) > 0.2) {
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if(this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        // Update position
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
        
        // Boundary checks
        if(canvasWidth && canvasHeight) {
            const buffer = 20;
            if(this.x < buffer) {
                this.x = buffer;
                this.speed *= 0.5;
            }
            if(this.x > canvasWidth - buffer) {
                this.x = canvasWidth - buffer;
                this.speed *= 0.5;
            }
            if(this.y < buffer) {
                this.y = buffer;
                this.speed *= 0.5;
            }
            if(this.y > canvasHeight - buffer) {
                this.y = canvasHeight - buffer;
                this.speed *= 0.5;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        ctx.beginPath();
        ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.restore();

        this.sensor.draw(ctx);
    }
}