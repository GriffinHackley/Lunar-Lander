let canvas = null;
let context = null;
let upBuffer = {};
let downBuffer = {};
let allPoints = [];
let points = [];
let safeZones = [];
var lastUpdate = 0;

class Key{
    constructor(defaultKey){
        this.defaultKey = defaultKey
        this.currentKey = defaultKey
        this.isPressed = false;
        this.timePressed = 0;
        this.timeDown = 0;
    }

    equals(key){
        if(key == this.currentKey){
            return true;
        }
        return false;
    }
}

let controls = function(){
    return{
        thrust:new Key("ArrowUp"),
        rotateLeft:new Key("ArrowLeft"),
        rotateRight: new Key("ArrowRight")
    }
}();

let imgBackground = new Image();
imgBackground.isReady = false;
imgBackground.onload = function() {
    this.isReady = true;
};
imgBackground.src = 'assets/background.jpg';

let myCharacter = function(landerSource, flamesSource, location) {
    let lander = new Image();
    let flames = new Image();
    lander.isReady = false;
    flames.isReady = false
    lander.onload = function() {
        this.isReady = true;
    };
    flames.onload = function() {
        this.isReady = true;
    };
    lander.src = landerSource;
    flames.src = flamesSource;
    return {
        location: location,
        lander: lander,
        flames: flames,
        accel: {x:0, y:0},
        vel: {x:0, y:0},
        angle: 0,
        isThrusting: false
    };
}('assets/character.png', 'assets/flames.png',{x:50, y:50});

function initialize() {
    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');
    scaleCanvas();

    generateTerrain();

    window.addEventListener('keyup', function(event) {
        upBuffer[event.key] = event.key;
    });
    window.addEventListener('keydown', function(event) {
        downBuffer[event.key] = event.key;
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

function getMovement(elapsedTime){
    elapsed = elapsedTime/10
    let thrust = 1.68
    var moonGrav = 1.625
    var maxVel = 4
    var maxAccel = 6

    myCharacter.accel.y += (moonGrav*elapsed)

    //get accel from thrusting
    if(controls.thrust.isPressed){
        myCharacter.accel.x += elapsed*thrust*Math.sin(myCharacter.angle)
        myCharacter.accel.y -= elapsed*thrust*Math.cos(myCharacter.angle)
    }
    if(controls.rotateLeft.isPressed){
        myCharacter.angle -= elapsed * 1 * Math.PI/180
    }
    if(controls.rotateRight.isPressed){
        myCharacter.angle += elapsed * 1 * Math.PI/180
    }
    
    //get y values
    if(myCharacter.accel.y >= maxAccel){
        myCharacter.accel.y = maxAccel
    }
    if(myCharacter.accel.y <= -maxAccel){
        myCharacter.accel.y = -maxAccel
    }

    console.log(myCharacter.accel.x,myCharacter.accel.y)

    myCharacter.vel.y = (elapsed*myCharacter.accel.y)+myCharacter.vel.y

    if(myCharacter.vel.y >= maxVel){
        myCharacter.vel.y = maxVel
    }
    if(myCharacter.vel.y <= -maxVel){
        myCharacter.vel.y = -maxVel
    }

    myCharacter.location.y += myCharacter.vel.y
    
    if(myCharacter.location.y > canvas.height || myCharacter.location.y < 0){
        myCharacter.location.y = 0
    }

    //get x values
    if(myCharacter.accel.x >= maxAccel){
        myCharacter.accel.x = maxAccel
    }
    if(myCharacter.accel.x <= -maxAccel){
        myCharacter.accel.x = -maxAccel
    }

    myCharacter.vel.x = (elapsed*myCharacter.accel.x)+myCharacter.vel.x

    if(myCharacter.vel.x >= maxVel){
        myCharacter.vel.x = maxVel
    }
    if(myCharacter.vel.x <= -maxVel){
        myCharacter.vel.x = -maxVel
    }

    myCharacter.location.x += myCharacter.vel.x
    
    if(myCharacter.location.x > canvas.width || myCharacter.location.x < 0){
        myCharacter.location.x = 0
    }    
}

function update(current){
    var elapsed = current-lastUpdate
    lastUpdate = current
    getMovement(elapsed)
}

function processInput() {
    for(input in downBuffer) {
        moveCharacter(downBuffer[input],"down");
    }
    for (input in upBuffer) {
        moveCharacter(upBuffer[input],"up");
    }
    upBuffer = {};
    downBuffer = {};
}

function render(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (imgBackground.isReady) {
        context.drawImage(imgBackground,0,0, canvas.width, canvas.height);
    }
    renderTerrain()
    renderCharacter(myCharacter)
    needsRender = false
}

function renderCharacter(character) {
    let landerSize = .15*character.lander.width
    let flamesSize = .04*character.flames.width
    if (character.lander.isReady && character.flames.isReady) {
        context.save()
        context.translate(character.location.x, character.location.y)

        //rotate for lander
        context.rotate(character.angle)
        context.drawImage(character.lander,landerSize/-2,landerSize/-2,landerSize,landerSize);

        if(controls.thrust.isPressed){
            //rotate for flames
            context.rotate((Math.PI/2))
            context.translate(75,-3)
            context.drawImage(character.flames,flamesSize/-2,flamesSize/-2,flamesSize,flamesSize);
        }
        context.restore()
    }
}

function moveCharacter(key, type) {
    if(type == "up"){
        if (controls.thrust.equals(key)) {
            controls.thrust.isPressed = false
            controls.thrust.timePressed = performance.now()-controls.thrust.timeDown
        }
        if (controls.rotateRight.equals(key)) {
            controls.rotateRight.isPressed = false
            controls.rotateRight.timePressed = performance.now()-controls.rotateRight.timeDown
        }
        if (controls.rotateLeft.equals(key)) {
            controls.rotateLeft.isPressed = false
            controls.rotateLeft.timePressed = performance.now()-controls.rotateLeft.timeDown
        }
    } else {
        if (controls.thrust.isPressed || controls.thrust.equals(key)) {
            controls.thrust.isPressed = true
            controls.thrust.timeDown = performance.now()
        }
        if (controls.rotateRight.isPressed ||controls.rotateRight.equals(key)) {
            controls.rotateRight.isPressed = true
            controls.rotateRight.timeDown = performance.now()
            myCharacter.angle += 3 * Math.PI/180
        }
        if (controls.rotateLeft.isPressed ||controls.rotateLeft.equals(key)) {
            controls.rotateLeft.isPressed = true
            controls.rotateLeft.timeDown = performance.now()
            myCharacter.angle -= 3 * Math.PI/180
        }
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