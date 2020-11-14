const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))

var me = {};
var board = {};
var maxX = -1;
var maxY = -1;

var snakes = [];
var food = [];

var head = {};
var heading = 0;
var verbose = true;

//making attracted to food and repeled from other snakes head

var foodScalar = 2000.0;
var headScalar = -3500.0;
var bodyScalar = -25.0;
var cornerScalar = -250.0;
var cornerXs = [0, 0, maxX,maxX];
var cornerYs = [0, maxY, 0,maxY];
var weightLimits = [-999999, -10000, 3000, -25000];

function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Sn33r',
    color: '#FF3300',
    head: 'bendr',
    tail: 'freckled'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body
  me = gameData.you;
  board = gameData.board;
  maxX = board.width-1;
  maxY = board.height-1;
  snakes = board.snakes;
  x = me.head.x;
  y = me.head.y;
  
 // console.log(x+", "+y);
  for (var i = 0; i < snakes.length; i++){
 //     console.log(snakes[i].head.x+", "+snakes[i].head.y);
  }

  console.log('START')
  response.status(200).send('ok')
}

function getHeading(x1, y1, x2, y2){

  var dx = x1 - x2;
  var dy = y1 - y2;
  if (verbose){
    console.log("x1 y1 " + x1+ ", "+y1);
    console.log("x2 y2 " + x2+ ", "+y2);
    console.log("dx dy " + dx+ ", "+dy);
  }
  
  var direction = 0;
  if (dx===0 && dy===0){
    console.log("wtf");
    return 0;
  }
  if (dx === 0 ){
    if (dy < 0){
      direction = 2; //down
    }
    else if (dy > 0){
      direction = 0; //up
    }
    else{
      console.log("wtf");
    }
  }
  else if (dy === 0 ){
    if (dx < 0){
      direction = 3; //left
    }
    else if (dx > 0){
      direction = 1; //right
    }
    else{
      console.log("wtf");
    }
  }

  return direction;
}


function isMoveSafe(x,y, snakes){

  //check the walls 
  if (x > maxX || x < 0){
    return false;
  }

  if (y > maxY || y < 0){
    return false;
  }

  //check each body segment of every snake

  for (var i = 0; i < snakes.length; i++){
    var body = snakes[i].body;
    for (var j = 0; j < body.length; j++){
      if (x === body[j].x && y === body[j].y){
        return false;
      }
    }
  }

  return true;
}

function getManhattenDistance(x1, y1, x2, y2){
  return Math.abs(x1-x2)+Math.abs(y1-y2);
}

function log(msg){
  if (verbose){
    console.log(msg);
  }
}

function getWeightings(x, y, s, f, w){
  var xs = [x, x+1, x, x-1];
  var ys = [y+1, y, y-1, y];
  
  for (var i = 0; i < xs.length; i++){
    if(!isMoveSafe(xs[i], ys[i], s)) {
      w[i] += weightLimits[0];
    }
      //go thru the snake heads
    for(var j = 0; j < s.length; j++ ) {
      //don't get self repelled
      //log(s[j].id+", "+me.id);
      for (var k = 1; k < s[j].body.length;k++){
        var distance = getManhattenDistance(xs[i], ys[i], s[j].body[k].x , s[j].body[k].y );
        w[i]+= Math.max(bodyScalar/(distance*distance), weightLimits[1]);
      }



      if (s[j].id!=me.id){
        var distance = getManhattenDistance(xs[i], ys[i], s[j].head.x , s[j].head.y );
        var d2 = distance * distance;
        var weight = Math.max(headScalar/d2, 2*weightLimits[1]);
      //  log("head weight: "+weight);
        w[i] += weight;
      }
    }

      //go thru the food
    for(var j = 0; j < f.length; j++ ) {
      var distance = getManhattenDistance(xs[i], ys[i], f[j].x , f[j].y );
     // log ("food dist" + distance);
      var d2 = distance * distance;
      var weight = Math.min(foodScalar/d2, weightLimits[2]);
      //log("food weight: "+weight);
      w[i] += weight;
    }

    for(var j = 0; j < cornerXs.length; j++) {
      var distance = getManhattenDistance(xs[i], ys[i], cornerXs[j] , cornerYs[j] );
      w[i]+= Math.max(cornerScalar/(distance*distance), weightLimits[3]);
    }
    console.log("weightings"+i+": "+w[i]);
  }
  return w;
}

function handleMove(request, response) {
  var gameData = request.body
  var possibleMoves = ['up', 'right', 'down', 'left'];
  var weightings = [0,0,0,0];//up right down left
  me = gameData.you;
  head = me.head;
  body = me.body;
  board = gameData.board;
  snakes = board.snakes;
  food = board.food;
  x = head.x;
  y = head.y;
  heading = getHeading(x, y, body[1].x, body[1].y);
  console.log("heading is "+ possibleMoves[heading]);

  weightings = getWeightings(x, y, snakes, food, weightings);
  var best = heading;
  var bestWeighting = weightings[heading];
  for (var i = 0; i < weightings.length; i++){
    if (weightings[i] > bestWeighting){
      best = i;
      bestWeighting = weightings[i];
    }
  }
    
  //var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  //look ahead to see what might happen
 // var newX = x;
 // var newY = y;
  //var randomChance  = Math.floor(Math.random() * 100);

  /*
  if (me.health< 20){
    
    heading =Math.floor(Math.random() * possibleMoves.length);
    if (verbose){
      console.log("random!");
    }
  }
  if (heading === 0 ){//if going up
    
    if (!isMoveSafe(x, y+1, snakes)){
      //try left
      if (isMoveSafe(x-1, y, snakes)){
        heading = 3;
      }
      else if(isMoveSafe(x+1, y, snakes)){
        heading = 1;
      }
      else if(isMoveSafe(x, y-1, snakes)){
        heading = 2;
      }
    }
  }
  else if (heading === 2 ){//if going down
    
    if (!isMoveSafe(x, y-1, snakes)){//can we still go down
      //try left
      if (isMoveSafe(x-1, y, snakes)){
        heading = 3;
      }
      else if(isMoveSafe(x+1, y, snakes)){
        heading = 1;
      }
      else if(isMoveSafe(x, y+1, snakes)){
        heading = 0;
      }

    }
  }

  else if (heading === 1 ){//if going right
    
    if (!isMoveSafe(x+1, y, snakes)){
      //try left
      if (isMoveSafe(x, y+1, snakes)){
        heading = 0;
      }
      else if(isMoveSafe(x, y-1, snakes)){
        heading = 2;
      }
      else if(isMoveSafe(x-1, y, snakes)){
        heading = 3;
      }

    }
  }
  else if (heading === 3 ){//if going left
    
    if (!isMoveSafe(x-1, y, snakes)){
      //try left
      if (isMoveSafe(x, y+1, snakes)){
        heading = 0;
      }
      else if(isMoveSafe(x, y-1, snakes)){
        heading = 2;
      }
      else if(isMoveSafe(x+1, y, snakes)){
        heading = 1;
      }

    }
  } 
  /*
  if (heading === 0 ){//if going up
    newY ++; //our newY is one higher
    if (newY >=11){//if the newY is off the top of the screen 
      heading = 3;//go left
    } 
  }
  else if (heading === 2){
    newY --;
    if (newY <0){
      heading = 1;
    } 
  }
  else if (heading === 1 ){
    newX ++;
    if (newX >=11){
      heading = 0;
    } 
  }
  else if (heading === 3){
    newX --;
    if (newX <0){
      heading = 2;
    } 
  }
  */

  var move = possibleMoves[best];
  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END '+gameData.turn)
  response.status(200).send('ok')
}
