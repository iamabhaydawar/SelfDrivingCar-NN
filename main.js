const canvas = document.getElementById("canvas");
canvas.width = 300;  // Fixed width
canvas.height = window.innerHeight; // Fixed height

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width/2, canvas.width);
const car = new Car(road.getLaneCenter(1), 100, 30, 50);
animate();

function animate() {
    car.update(canvas.width, canvas.height);
        
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -car.y+canvas.height*0.7);

    car.draw(ctx);
    road.draw(ctx);
    ctx.restore(-car.angle);

    requestAnimationFrame(animate);
}