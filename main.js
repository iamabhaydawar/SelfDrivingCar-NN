const canvas = document.getElementById("canvas");
const neural = document.getElementById("neural");
canvas.width = 200; 
neural.width = 300;


const ctx = canvas.getContext("2d");
const neuralCtx = neural.getContext("2d");

const road = new Road(canvas.width/2, canvas.width*0.9);



N=100;
const cars = generateCars(N);


const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
]
animate();

function generateCars(N) {
    const cars = [];
    for(let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), -100, 30, 50, "AI", 1));
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


    const bestCar=cars.find(c=>c.y==Math.min(...cars.map(c=>c.y)));

    canvas.height = window.innerHeight;
    neural.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y+canvas.height*0.7);

    road.draw(ctx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx,'red');
    }
    ctx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx,"blue");
    }
  
    ctx.globalAlpha = 1;
    bestCar.draw(ctx,"blue",true);

    ctx.restore();

    neuralCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(neuralCtx, bestCar.brain);
    requestAnimationFrame(animate);
}