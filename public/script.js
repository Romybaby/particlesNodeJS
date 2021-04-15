var socket = io();
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var flagNum = -1
var previousTimeStamp = 0
var boxes = {}

/*var direction = 
  {"up": false, 
  "down": false, 
  "left": false, 
  "right": false}
function move(){
  if(direction.up){
    yvel = -yac
  }else if(direction.down){
    yvel = yac
  }else{
    yvel = 0
  }
  if(direction.right){
    xvel = xac
  }else if(direction.left){
    xvel = -xac
  }else{
    xvel = 0
  }
  x += xvel
  y += yvel
}

function keydown(e){
  switch(e.keyCode){
  case 87:
    direction.up = true
    break
  case 83:
    direction.down = true
    break
  case 65:
    direction.left = true
    break
  case 68:
    direction.right = true
    break
  }
}
function keyup(e){
  switch(e.keyCode){
  case 87:
    direction.up = false
    break
  case 83:
    direction.down = false
    break
  case 65:
    direction.left = false
    break
  case 68:
    direction.right = false
    break
  }
}*/
class Box{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.savedx = 0
    this.savedy = 0
    this.xvel = 0
    this.yvel = 0
  }
  boxMove(e){
    this.savedx = this.x
    this.savedy = this.y
    this.x = event.clientX-150;
    this.y = event.clientY-150;
    this.xvel = this.x - this.savedx
    this.yvel = this.y - this.savedy
    for(var i in boxes){
      if(this.x + 100>= boxes[i].x && this.x <= boxes[i].x+100 && this.y + 100 >= boxes[i].y && this.y <= boxes[i].y+100){
        this.x = this.savedx
        this.y = this.savedy
        break
      }
    }
    socket.emit('box move',{"x": this.x, "y": this.y, "savedX": this.savedx, "savedY": this.savedy, "xvel": this.xvel, "yvel": this.yvel});
  }
}
socket.on('create', function(msg) {
    for(var key in msg){
      boxes[key] = new Box(msg[key]["x"], msg[key]["y"])
    }
    
    document.addEventListener("mousemove",boxes[socket.id].boxMove)
    
});
socket.on("send pos", function(msg){
  for(var key in msg){
    boxes[key].x = msg[key]["x"]
    boxes[key].y = msg[key]["y"]
    boxes[key].savedx = msg[key]["savedX"]
    boxes[key].savedy = msg[key]["savedY"]
    boxes[key].xvel = msg[key]["xvel"]
    boxes[key].yvel = msg[key]["yvel"]
  }
})
socket.on("addParticles", function(info){
  particle = info
})
class Particle{
  constructor(index){
    this.x = Math.random()*c.width
    this.y = 25
    this.xvel = Math.random()*2-1
    this.yvel = Math.random()*2-1
    this.r = Math.random() * 255
    this.g = Math.random() * 255
    this.b = Math.random() * 255
    this.color = "rgb(" + this.r + "," + this.g + "," + this.b + ")"
  }

  particlemove(i){
    this.yvel = this.yvel + 0.1
    this.x = this.x + this.xvel
    this.y = this.y + this.yvel
    if(this.topcollide()){
      this.yvel = -this.yvel / 2
      if (yvel < 0){
        this.yvel += yvel/2
      }
      this.y = y - 4
    }
    else if(this.leftcollide()){
      this.xvel = -this.xvel / 2
      if (xvel < 0){
        this.xvel += xvel/2
      }
      this.x = x - 4
    }
    else if(this.rightcollide()){
      this.xvel = -this.xvel / 2
      if (xvel > 0){
        this.xvel += xvel/2
      }
      this.x = x + 101
    }
    else if(this.bottomcollide()){
      this.yvel = -this.yvel / 2
      if (yvel > 0){
        this.yvel += yvel/2
      }
      this.y = y + 101
      
    }
    if(this.x < 0){
      this.x = 0
      this.xvel = -this.xvel / 2
      
    }
    else if(this.x + 3 > c.width){
      this.x = c.width - 3
      this.xvel = -this.xvel / 2
      
    }
    if(this.y + 3 > c.height){
      this.y = c.height -  3
      this.yvel = -this.yvel / 2
    }
    for(let j = 0; j < i; j++){
      let p = particle[j]
      if(this.collide(p)){
        let tempyvel = p.yvel
        p.yvel = this.yvel
        this.yvel = tempyvel
        this.xvel -= (Math.random()/5)-0.1
        if(this.y < p.y){
          this.y = p.y - 4
        }else if(this.y > p.y){
          this.y = p.y + 4
        }
        let tempxvel = p.xvel
        p.xvel = this.xvel
        this.xvel = tempxvel
        this.yvel -= (Math.random()/10)
        if(this.x < p.x){
          this.x = p.x - 4
        }else if(this.x > p.x){
          this.x = p.x + 4
        }
      }
    }
    
  }
  topcollide(){
    if(this.x <= x + 100 && this.x + 3 >= x){
      if(this.y <= y + 10 && this.y + 3 >= y){
        return true
      }
    }
    return false
  }
  bottomcollide(){
    if(this.x <= x + 100 && this.x + 3 >= x){
      if(this.y <= y + 100 && this.y + 3 >= y + 90){
        return true
      }
    }
    return false
  }
  rightcollide(){
    if(this.x <= x + 100 && this.x + 3 >= x + 50){
      if(this.y <= y + 100 && this.y + 3 >= y){
        return true
      }
    }
    return false
  }
  leftcollide(){
    if(this.x <= x + 50 && this.x + 3 >= x){
      if(this.y <= y + 100 && this.y + 3 >= y){
        return true
      }
    }
    return false
  }
  collide(p){
    if(this.x <= p.x + 3 && this.x + 3 >= p.x){
      if(this.y <= p.y + 3 && this.y + 3 >= p.y){
        return true
      }
    }
    return false
  }
}
//function altparticlemove(i){
//}
var particle = []

//document.addEventListener("keydown", keydown);
//document.addEventListener("keyup", keyup);

function draw(timeStamp){
  var fps = 1/((timeStamp - previousTimeStamp)/1000)
  previousTimeStamp = timeStamp
  ctx.clearRect(0,0, c.width, c.height)
  ctx.fillStyle = "black"
  ctx.fillText(Math.round(fps), 5, 10)
  for(var key in boxes){
    ctx.strokeRect(boxes[key].x, boxes[key].y, 100, 100); 
  }
  //move()
  for(var i = 0; i < particle.length; i++){
    var p = particle[i]
    ctx.fillStyle = p.color
    ctx.fillRect(p.x-2, p.y-2, 4, 4)
  }
  requestAnimationFrame(draw)
}
//host();
draw();