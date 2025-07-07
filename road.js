class Road {
    constructor(x, width, laneCount=3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x-width/2;
        this.right = x+width/2;
        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;
        
        this.borders = [
            [{x: this.left, y: this.top}, {x: this.left, y: this.bottom}],
            [{x: this.right, y: this.top}, {x: this.right, y: this.bottom}]
        ];
    }
    getLaneCenter(laneIndex){
        const laneWidth = this.width/this.laneCount;
        return this.left + laneWidth/2 + Math.min(laneIndex, this.laneCount-1)*laneWidth;
    }
    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        
        // Draw lane lines
        for(let i=1; i<this.laneCount; i++) {
            const x = lerp(this.left, this.right, i/this.laneCount);
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        
        // Draw outer borders
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(this.left, this.top);
        ctx.lineTo(this.left, this.bottom);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.right, this.top);
        ctx.lineTo(this.right, this.bottom);
        ctx.stroke();
        
    }
}
