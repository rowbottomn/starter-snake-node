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
var snakes = [];
var head = {};
var heading = 0;


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Sn33r',
    color: '#FF3300',
    head: 'beluga',
    tail: 'default'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body
  me = gameData.you;
  board = gameData.board;
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

  console.log("x1 y1 " + x1+ ", "+y1);
  console.log("x2 y2 " + x2+ ", "+y2);
  var dx = x1 - x2;
  var dy = y1 - y2;

  console.log("dx dy " + dx+ ", "+dy);
  var direction = -1;
  if (dx===0 && dy===0){
    console.log("wtf");
    return -99;
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

function handleMove(request, response) {
  var gameData = request.body
  var possibleMoves = ['up', 'right', 'down', 'left'];
  me = request.body.you;
  head = me.head;
  body = me.body;

  x = head.x;
  y = head.y;
  heading = getHeading(x, y, body[1].x, body[1].y);
  console.log("heading is "+ possibleMoves[heading]);


    
  //var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  //look ahead to see what might happen
  var newX = x;
  var newY = y;

  if (heading === 0 ){
    newY ++;
    if (newY >=11){
      heading = 3;
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

  var move = possibleMoves[heading];
  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
