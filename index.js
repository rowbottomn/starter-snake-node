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
var head = {};
var heading = 0;
var verbose = true;

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
      bX = body[j].x;
      bY = body[j].y;

    //watch out for the head
      if (j === 0 && snakes[i].id != me.id){
        for (var xx = -1; xx < 2; xx++){
          for (var yy = -1; yy < 2; yy++){
            if (x === bX + xx && y === bY + yy ){
              console.log("++++++++++++++avoiding head!"+x+","+ y+","+bX+","+bY+","+xx+"," + yy+","+ i +", "+ snakes[i].name)
              return false;    
            }
          }
        }
      }
      else {
        if (x === bX && y === bY){
          return false;
        }
      } 
    }

  }

  return true;
}

function handleMove(request, response) {
  var gameData = request.body
  var possibleMoves = ['up', 'right', 'down', 'left'];
  me = gameData.you;
  head = me.head;
  body = me.body;
  board = gameData.board;
  snakes = board.snakes;
  x = head.x;
  y = head.y;
  heading = getHeading(x, y, body[1].x, body[1].y);
  console.log("heading is "+ possibleMoves[heading]);


    
  //var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  //look ahead to see what might happen
 // var newX = x;
 // var newY = y;
  //var randomChance  = Math.floor(Math.random() * 100);
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

  var move = possibleMoves[heading];
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
