class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        this.controls = new Controls();
        this.maxSpeed = 5;
        this.friction = 0.05;
        this.angle = 0;
    }
  
    update(canvasWidth, canvasHeight) {
        this.#move();
   
    }
    #move(canvasWidth, canvasHeight) {
        if(this.controls.forward) {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }
        if(this.speed > 0) {
            this.speed -= this.friction;
        }
        if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
        if(this.speed!=0){
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
        }
        
        // Only allow turning when the car is moving
        if(Math.abs(this.speed) > 0.2) {
            if(this.controls.left) {
                this.angle += 0.03 * Math.abs(this.speed);
            }
            if(this.controls.right) {
                this.angle -= 0.03 * Math.abs(this.speed);
            }
        }
        // Update position
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
        
        // Boundary checks to keep car on canvas
        const buffer = 20; // Buffer to prevent car from getting stuck at edges
        
        if(canvasWidth && canvasHeight) {
            // Left boundary
            if(this.x < buffer) {
                this.x = buffer;
                this.speed *= 0.5; // Slow down when hitting boundary
            }
            
            // Right boundary
            if(this.x > canvasWidth - buffer) {
                this.x = canvasWidth - buffer;
                this.speed *= 0.5;
            }
            
            // Top boundary
            if(this.y < buffer) {
                this.y = buffer;
                this.speed *= 0.5;
            }
            
            // Bottom boundary
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
    }
}