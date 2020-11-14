


var heading = 0;

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