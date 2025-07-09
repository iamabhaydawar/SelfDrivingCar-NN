class Car {
    constructor(x, y, width, height, controlType,maxSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;
        this.useBrain=controlType=="AI";
        
        if(controlType!="DUMMY"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount,6,4]);
        }
      
        this.controls = new Controls(controlType);
    }
  
    update(roadBorders,traffic) {
        if(!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);
           
            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left    = outputs[1];
                this.controls.right   = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }
    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;   
    }
    #createPolygon() {
        const points = [];
        
        // Create a more realistic car shape
        const frontLength = this.height * 0.4;
        const rearLength = this.height * 0.6;
        const halfWidth = this.width / 2;
        
        // Front of car (hood)
        points.push({
            x: this.x - Math.sin(this.angle) * frontLength,
            y: this.y - Math.cos(this.angle) * frontLength
        });
        
        // Front right corner
        points.push({
            x: this.x - Math.sin(this.angle) * frontLength + Math.sin(this.angle - Math.PI/2) * halfWidth,
            y: this.y - Math.cos(this.angle) * frontLength + Math.cos(this.angle - Math.PI/2) * halfWidth
        });
        
        // Right side middle (door area)
        points.push({
            x: this.x + Math.sin(this.angle - Math.PI/2) * halfWidth,
            y: this.y + Math.cos(this.angle - Math.PI/2) * halfWidth
        });
        
        // Rear right corner
        points.push({
            x: this.x + Math.sin(this.angle) * rearLength + Math.sin(this.angle - Math.PI/2) * halfWidth,
            y: this.y + Math.cos(this.angle) * rearLength + Math.cos(this.angle - Math.PI/2) * halfWidth
        });
        
        // Rear of car
        points.push({
            x: this.x + Math.sin(this.angle) * rearLength,
            y: this.y + Math.cos(this.angle) * rearLength
        });
        
        // Rear left corner
        points.push({
            x: this.x + Math.sin(this.angle) * rearLength + Math.sin(this.angle + Math.PI/2) * halfWidth,
            y: this.y + Math.cos(this.angle) * rearLength + Math.cos(this.angle + Math.PI/2) * halfWidth
        });
        
        // Left side middle (door area)
        points.push({
            x: this.x + Math.sin(this.angle + Math.PI/2) * halfWidth,
            y: this.y + Math.cos(this.angle + Math.PI/2) * halfWidth
        });
        
        // Front left corner
        points.push({
            x: this.x - Math.sin(this.angle) * frontLength + Math.sin(this.angle + Math.PI/2) * halfWidth,
            y: this.y - Math.cos(this.angle) * frontLength + Math.cos(this.angle + Math.PI/2) * halfWidth
        });
        
        return points;
    }
    #move() {
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
    }

    draw(ctx,color,drawSensor=false) {
        ctx.save();
        
        // Car dimensions
        const carLength = this.height;
        const carWidth = this.width;
        const frontOverhang = carLength * 0.15;
        const rearOverhang = carLength * 0.2;
        const wheelbase = carLength * 0.65;
        
        // Draw car shadow first
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 3, carWidth * 0.6, carLength * 0.4, this.angle, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main car body with rounded rectangle
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Main body
        ctx.fillStyle = this.damaged ? "#666666" : color;
        this.drawRoundedRect(ctx, -carWidth/2, -carLength/2, carWidth, carLength, 8);
        ctx.fill();
        
        // Car body outline
        ctx.strokeStyle = this.damaged ? "#444444" : "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, -carWidth/2, -carLength/2, carWidth, carLength, 8);
        ctx.stroke();
        
        // Draw windshield and windows
        ctx.fillStyle = this.damaged ? "rgba(80,80,80,0.8)" : "rgba(150,200,255,0.7)";
        
        // Front windshield
        ctx.beginPath();
        ctx.moveTo(-carWidth * 0.35, -carLength * 0.3);
        ctx.lineTo(carWidth * 0.35, -carLength * 0.3);
        ctx.lineTo(carWidth * 0.3, -carLength * 0.1);
        ctx.lineTo(-carWidth * 0.3, -carLength * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Rear window
        ctx.beginPath();
        ctx.moveTo(-carWidth * 0.3, carLength * 0.1);
        ctx.lineTo(carWidth * 0.3, carLength * 0.1);
        ctx.lineTo(carWidth * 0.25, carLength * 0.25);
        ctx.lineTo(-carWidth * 0.25, carLength * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // Side windows
        ctx.fillStyle = this.damaged ? "rgba(60,60,60,0.8)" : "rgba(120,180,255,0.6)";
        
        // Left side window
        ctx.fillRect(-carWidth * 0.45, -carLength * 0.05, carWidth * 0.15, carLength * 0.1);
        
        // Right side window
        ctx.fillRect(carWidth * 0.3, -carLength * 0.05, carWidth * 0.15, carLength * 0.1);
        
        // Draw wheels with proper positioning
        const wheelWidth = carWidth * 0.12;
        const wheelHeight = carLength * 0.15;
        const wheelOffsetX = carWidth * 0.35;
        const wheelOffsetY = wheelbase * 0.25;
        
        // Front wheels
        this.drawWheel(ctx, -wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight);
        this.drawWheel(ctx, wheelOffsetX, -wheelOffsetY, wheelWidth, wheelHeight);
        
        // Rear wheels
        this.drawWheel(ctx, -wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight);
        this.drawWheel(ctx, wheelOffsetX, wheelOffsetY, wheelWidth, wheelHeight);
        
        // Draw headlights
        ctx.fillStyle = this.damaged ? "#999999" : "#FFFF99";
        const headlightSize = carWidth * 0.08;
        
        // Left headlight
        ctx.beginPath();
        ctx.arc(-carWidth * 0.25, -carLength * 0.45, headlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right headlight
        ctx.beginPath();
        ctx.arc(carWidth * 0.25, -carLength * 0.45, headlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Headlight glow effect
        if (!this.damaged) {
            ctx.fillStyle = "rgba(255,255,150,0.3)";
            ctx.beginPath();
            ctx.arc(-carWidth * 0.25, -carLength * 0.45, headlightSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(carWidth * 0.25, -carLength * 0.45, headlightSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw taillights
        ctx.fillStyle = this.damaged ? "#666666" : "#FF4444";
        const taillightSize = carWidth * 0.06;
        
        // Left taillight
        ctx.beginPath();
        ctx.arc(-carWidth * 0.3, carLength * 0.4, taillightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right taillight
        ctx.beginPath();
        ctx.arc(carWidth * 0.3, carLength * 0.4, taillightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw grille
        ctx.strokeStyle = this.damaged ? "#444444" : "#222222";
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const y = -carLength * 0.45 + (i * carLength * 0.05);
            ctx.beginPath();
            ctx.moveTo(-carWidth * 0.15, y);
            ctx.lineTo(carWidth * 0.15, y);
            ctx.stroke();
        }
        
        // Add car details (door handles, etc.)
        ctx.fillStyle = this.damaged ? "#555555" : "#333333";
        
        // Door handles
        ctx.fillRect(-carWidth * 0.48, -carLength * 0.02, carWidth * 0.04, carLength * 0.04);
        ctx.fillRect(carWidth * 0.44, -carLength * 0.02, carWidth * 0.04, carLength * 0.04);
        
        // Side mirrors
        ctx.fillStyle = this.damaged ? "#666666" : color;
        ctx.fillRect(-carWidth * 0.55, -carLength * 0.15, carWidth * 0.08, carLength * 0.06);
        ctx.fillRect(carWidth * 0.47, -carLength * 0.15, carWidth * 0.08, carLength * 0.06);
        
        ctx.restore();

        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
    }
    
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    drawWheel(ctx, x, y, width, height) {
        // Tire (black)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tire outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Rim (metallic)
        ctx.fillStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.ellipse(x, y, width * 0.6, height * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rim spokes
        ctx.strokeStyle = "#999999";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * width * 0.5, y + Math.sin(angle) * height * 0.5);
            ctx.stroke();
        }
        
        // Center cap
        ctx.fillStyle = "#888888";
        ctx.beginPath();
        ctx.ellipse(x, y, width * 0.2, height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}