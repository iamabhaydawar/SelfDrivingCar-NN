const canvas = document.getElementById("canvas");
canvas.width = 200;  // Fixed width
canvas.height = window.innerHeight; // Fixed height

const ctx = canvas.getContext("2d");
const car = new Car(canvas.width/2, canvas.height/2, 30, 50);

animate();

function animate() {
    car.update(canvas.width, canvas.height);
    
    // Create a semi-transparent effect by drawing a translucent rectangle
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    car.draw(ctx);
    requestAnimationFrame(animate);
}