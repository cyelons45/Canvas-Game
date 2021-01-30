

import utils from './utils'
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
let scoreEl=document.querySelector('#scoreEl')
let startGameBtn=document.querySelector('#startGameBtn')
let modalEl=document.querySelector('#modalEl')
let bigScoreEl=document.querySelector('#big-scoreEl')
let animationId
let score=0
let player;
let projectiles = []
let enemies = []
let particles = []
const friction = 0.99
const enemySpeed=0.3
const projectileSpped = 5
let noOfEnemiesAlive = 10
let noOfEnemiesKilled=0
let enemyID=0
let createEnemy

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})


addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  // init()
})

function initialize () {
  let x = canvas.width / 2;
  let y = canvas.height / 2;
  player = new Player(x, y, 10, 'white')
 
   projectiles = []
 enemies = []
 particles = []
  noOfEnemiesAlive = 10
noOfEnemiesKilled=0
 enemyID=0
score=0
}


// Objects
class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update() {
    this.draw()
  }
}





class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity=velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update () {
    this.draw()
    this.x += this.velocity.x
    this.y+=this.velocity.y

  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity=velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update () {
    this.draw()
    this.x +=this.velocity.x
    this.y+=this.velocity.y

  }
}

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha=1
  }

  draw () {
    c.save()
    c.globalAlpha=this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
    c.restore()
  }

  update () {
    this.draw()
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x
    this.y+=this.velocity.y
   this.alpha-=0.01
  }
}



function spawnEnemies () {
   createEnemy=setInterval(() => {
    let radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    if (Math.random()<0.5) {
       x = Math.random() < 5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;

    } else {
      x = Math.random() * canvas.width;
     y =Math.random() < 5 ? 0 - radius : canvas.height + radius;
    }
  
 
    const color = `hsl(${Math.random()*360},50%,50%)`
    let angle=Math.atan2(canvas.height/2 -y,canvas.width/2 -x)
    let velocity = {
      x:Math.cos(angle)*enemySpeed,
      y:Math.sin(angle)*enemySpeed
    }
     enemyID += 1
     if (enemyID === noOfEnemiesAlive) {
       clearInterval(createEnemy)
     }
      enemies.push(new Enemy(x,y,radius,color,velocity))
  },1000) 
}

addEventListener('click', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
  let angle=Math.atan2(mouse.y-canvas.height/2,mouse.x-canvas.width/2,)
  let velocity = {
    x:Math.cos(angle)*projectileSpped,
    y:Math.sin(angle)*projectileSpped
 }
  projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 3, 'white', velocity))

})


// Animation Loop

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle="rgba(0,0,0,0.1)"
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  particles.forEach((particle,index) => {
    if (particle.alpha<=0) {
particles.splice(index,1)
    } else {
      particle.update() 
    }
    
  })
  projectiles.forEach((projectile,index) => {
    if (projectile) {
      projectile.update() 
      if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width
      ||projectile.y+projectile.radius<0 ||projectile.y - projectile.radius > canvas.height
      ) {
        setTimeout(() => {
          projectiles.splice(index,1) 
   },0)
      }
    }
 
  })
  if (noOfEnemiesAlive-noOfEnemiesKilled===0) {
    cancelAnimationFrame(animationId)
    modalEl.style.display = 'flex'
    bigScoreEl.innerHTML=score
   }
  enemies.forEach((enemy,index) => {
    enemy.update()
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y) 
    // End game
    if (dist - enemy.radius - player.radius < 1) { 
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML=score
    }
    projectiles.forEach((projectile,projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) 
      if (dist - enemy.radius - projectile.radius < 1) {
        // increase score
        score += 100
        scoreEl.innerHTML=score
        for (let i = 0; i < enemy.radius *3; i++){
          particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {
            x: (Math.random() - 0.5)*(Math.random()*6),
            y:Math.random()-0.*(Math.random()*6)
          }))
        }
        if (enemy.radius - 10 > 5) {
          gsap.to(enemy,{
            radius:enemy.radius - 10
          })
          setTimeout(() => {
            projectiles.splice(projectileIndex,1) 
     },0)

        } else {
          score += 250
          scoreEl.innerHTML=score
          setTimeout(() => {
            enemies.splice(index, 1)
            noOfEnemiesKilled+=1
            projectiles.splice(projectileIndex,1) 
     },0)
        }

      }
    })
  })
}


startGameBtn.addEventListener("click", event => {
  initialize() 
  animate()
  spawnEnemies ()
  modalEl.style.display='none'
})
// init()
