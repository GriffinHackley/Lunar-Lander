let canvas = null;
let context = null;
let inputBuffer = {};
let points = [];
let safeZones = [];


function initialize() {
    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');
    scaleCanvas();
    generateTerrain();

    window.addEventListener('keyup', function(event) {
        inputBuffer[event.key] = event.key;
    });

    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    var current = performance.now()
    update(current)
    processInput();
    render();
    requestAnimationFrame(gameLoop);
}

function update(current){

}

function processInput() {
    for (input in inputBuffer) {
        moveCharacter(inputBuffer[input]);
    }
    inputBuffer = {};
}

function render(){

}

function moveCharacter(key) {
    if (key == 'ArrowUp') {
        console.log("Thrust")
    }
    if (key == 'ArrowRight') {
        console.log("Bank Right")
    }
    if (key == 'ArrowLeft') {
        console.log("Bank Left")
    }
}

function generateTerrain(){
    //divide line based on length of line
    let begin = {x:0, y:canvas.height/2};
    let end = {x:canvas.width , y:canvas.height/2} 

    context.beginPath();
    context.moveTo(begin.x, begin.y);

    //generate 2 safe zones then sort them based on x value
    generateSafeZone();
    generateSafeZone();
    safeZones.sort(function(a,b){return a.start.x - b.start.x;})

    //generate the terrain between safe zones
    makeLine(begin, safeZones[0].start);
    makeLine(safeZones[0].end, safeZones[1].start);
    makeLine(safeZones[1].end, end);

    //print safe zones
    for(var i = 0; i < safeZones.length; i++){
        var zone = safeZones[i];
        context.moveTo(zone.start.x, zone.start.y)
        context.lineTo(zone.end.x, zone.end.y)
    }

    context.strokeStyle = 'rgb(255, 255, 255)';
    context.stroke();  
}

function generateSafeZone(){
    //make sure the x value cant be within 15% of the edges of the screen
    let xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width) 
    let yVal = Math.random()*canvas.height*.8

    //if the safe zones generate on the same x values, change it
    while(safeZones.length != 0 && Math.abs(safeZones[0].start.x-xVal) < 300){
        console.log("Changed it from " + xVal + ": " + safeZones[0].start.x)
        xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width)
    }

    safeZone = {
        start: {x:xVal, y:yVal},
        end: {x:xVal+150, y:yVal}
    }
    safeZones.push(safeZone)
}

function makeLine(start, end){
    context.moveTo(start.x, start.y)

    //the bigger the distance between points, the more iterations
    let xDist = end.x - start.x
    let iterations = Math.floor(xDist/50)


    //get the midpoints and then sort them based on x value
    midpoint(start, end, iterations, 0);
    points.sort(function(a,b){return a.x - b.x;})

    //print line
    for(var i = 0; i < points.length; i++){
        point = points[i];
        context.lineTo(point.x, point.y)
    }
    context.lineTo(end.x+1, end.y)
    points = [];
}

function midpoint(start, end, iterations){
    if(iterations != 0){
        //get distance from start to end
        let xDist = end.x-start.x
        let mid = {x:null, y:null};

        mid.x = (xDist/2) + start.x

        //TODO: make rand a gaussian random number
        let roughness = .25
        let rand = ((Math.random()*2)-1);
        let random = roughness * rand * Math.abs(xDist)
        mid.y = .5*(start.y + end.y) + random;

        points.push(mid)
        
        midpoint(mid, end, iterations-1)
        midpoint(start, mid, iterations-1)
    }
}

function stdNormalDistribution (x) {
    return Math.pow(Math.E,-Math.pow(x,2)/2)/Math.sqrt(2*Math.PI);
  }

function scaleCanvas(){
    canvas.height = window.innerHeight * .96;
    canvas.width = window.innerWidth * .98;
}