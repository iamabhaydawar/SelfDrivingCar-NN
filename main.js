const canvas = document.getElementById("canvas");
const neural = document.getElementById("neural");
canvas.width = 200; 
neural.width = 300;

// Clear any existing saved brain at startup
localStorage.removeItem("bestBrain");

const ctx = canvas.getContext("2d");
const neuralCtx = neural.getContext("2d");

const road = new Road(canvas.width/2, canvas.width*0.9);



N=100;
const cars = generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
} else {
    // If no saved brain, apply some mutation to create diversity
    for(let i=1;i<cars.length;i++){
        NeuralNetwork.mutate(cars[i].brain,0.5);
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
]
animate();

function save(){
    localStorage.setItem("bestBrain",JSON.stringify(bestCar.brain));
}
function discard(){
    localStorage.removeItem("bestBrain");
}
function generateCars(N) {
    const cars = [];
    for(let i = 0; i < N; i++) {
        // Spread cars across all lanes
        const lane = i % 3;  // Use all 3 lanes
        cars.push(new Car(road.getLaneCenter(lane), 100, 30, 50, "AI", 3));
    }
    return cars;
}

function animate(time) {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders,[]);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders,traffic);
    }

    // Find the car that has traveled furthest up (most negative y)
    bestCar=cars.find(c=>c.y==Math.min(...cars.map(c=>c.y)));

    canvas.height = window.innerHeight;
    neural.height = window.innerHeight;

    // Center the camera on the best car
    ctx.save();
    ctx.translate(0, -bestCar.y+canvas.height*0.7);

    road.draw(ctx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx,'red');
    }
    
    // Draw all cars semi-transparent
    ctx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        if(cars[i]!=bestCar) {  // Only draw non-best cars semi-transparent
            cars[i].draw(ctx,"blue");
        }
    }
  
    // Draw best car fully opaque with sensors
    ctx.globalAlpha = 1;
    bestCar.draw(ctx,"blue",true);

    ctx.restore();

    // Update neural network visualization
    neuralCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(neuralCtx, bestCar.brain);
    requestAnimationFrame(animate);
}