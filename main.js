let canvas = null;
let context = null;
let inputBuffer = {};
let allPoints = [];
let points = [];
let safeZones = [];
let needsRender = true;

let imgBackground = new Image();
imgBackground.isReady = false;
imgBackground.onload = function() {
    this.isReady = true;
};
imgBackground.src = 'assets/background.jpg';


function initialize() {
    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');
    scaleCanvas();

    generateTerrain();

    window.addEventListener('keydown', function(event) {
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
    if(needsRender){
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (imgBackground.isReady) {
            context.drawImage(imgBackground,0,0, canvas.width, canvas.height);
        }
        renderTerrain()
        renderCharacter(myCharacter)
        needsRender = false
    }
}

let myCharacter = function(imageSource, location) {
    let image = new Image();
    image.isReady = false;
    image.onload = function() {
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image,
        angle: 1
    };
}('assets/character.png', {x:50, y:50});

function renderCharacter(character) {
    let size = .15*character.image.width
    if (character.image.isReady) {
        context.save()
        context.translate(character.location.x, character.location.y)
        context.rotate(character.angle)
        context.drawImage(character.image,size/-2,size/-2,size,size);
        context.restore()
    }
}

function moveCharacter(key) {
    if (key == 'ArrowUp') {
        console.log("Thrust")
        needsRender = true;
    }
    if (key == 'ArrowRight') {
        console.log("Bank Right")
        myCharacter.angle += 2 * Math.PI/180
        needsRender = true;
    }
    if (key == 'ArrowLeft') {
        console.log("Bank Left")
        myCharacter.angle -= 2 * Math.PI/180
        needsRender = true;
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
}

function generateSafeZone(){
    var length = 150;
    //make sure the x value cant be within 15% of the edges of the screen
    let xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width) 
    let yVal = Math.random()*canvas.height*.7+(.1*canvas.height)

    //if the safe zones generate on the same x values, change it
    while(safeZones.length != 0 && Math.abs(safeZones[0].start.x-xVal) < 300){
        console.log("Changed it from " + xVal + ": " + safeZones[0].start.x)
        xVal = (Math.random()*canvas.width*.7)+(.15*canvas.width)
    }

    safeZone = {
        start: {x:xVal, y:yVal},
        end: {x:xVal+length, y:yVal}
    }
    safeZones.push(safeZone)
}

function makeLine(start, end){
    //the bigger the distance between points, the more iterations
    let xDist = end.x - start.x
    let iterations = Math.floor(xDist/50)

    //get the midpoints and then sort them based on x value
    midpoint(start, end, iterations, 0);
    points.push(start)
    points.push(end)
    points.sort(function(a,b){return a.x - b.x;})

    
    allPoints.push(points)
    points = [];
}

function midpoint(start, end, iterations){
    if(iterations != 0){
        //get distance from start to end
        let xDist = end.x-start.x
        let mid = {x:null, y:null};

        mid.x = (xDist/2) + start.x

        //TODO: make rand a gaussian random number
        let roughness = .3
        let rand = ((Math.random()*2)-1);
        let random = roughness * rand * Math.abs(xDist)
        mid.y = .5*(start.y + end.y) + random;

        points.push(mid)
        
        midpoint(mid, end, iterations-1)
        midpoint(start, mid, iterations-1)
    }
}

function renderTerrain(){
    context.beginPath();
    //print line
    for(var j = 0; j < allPoints.length; j++){
        var current = allPoints[j]
        context.moveTo(current[0].x, current[0].y)
        for(var i = 0; i < current.length; i++){
            point = current[i];
            context.lineTo(point.x, point.y)
        }
        start = current[0]
        end = current[current.length-1]
        context.lineTo(end.x+1, end.y)
        context.lineTo(end.x+1,canvas.height)
        context.lineTo(start.x-1,canvas.height)
        context.lineTo(start.x-1,start.y)
        context.fillStyle = 'gray'
    }
    context.fill()
    context.closePath()
    context.strokeStyle = 'rgb(255, 255, 255)';
    context.stroke();

    //print safe zones
    for(var i = 0; i < safeZones.length; i++){
        var zone = safeZones[i];
        context.beginPath();
        context.moveTo(zone.start.x-1, zone.start.y)
        context.lineTo(zone.end.x+1, zone.end.y)
        context.closePath()
        context.stroke()
        context.fillStyle = 'gray'
        context.fillRect(zone.start.x-1, zone.start.y,zone.end.x-zone.start.x+2,canvas.height - zone.start.y)
    }
    context.fill()
}

function scaleCanvas(){
    canvas.height = window.innerHeight * .96;
    canvas.width = window.innerWidth * .98;
}