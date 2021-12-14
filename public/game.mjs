import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';
const socket = io();

let tick;
let playersList = [];
let oxygenEntity;
let playerEntity;
let spikeEntity;

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let firstCat = new Image();
let secondCat = new Image();
let mainCat = new Image();

const init = () => {
  // get images
  firstCat.src = 'public/images/second-cat.png';
  secondCat.src = 'public/images/second-cat.png';
  mainCat.src = 'public/images/main-cat.png';
  
  // Make Canvas
  socket.on('init', ({ id, players, oxygen, spike }) => {
    oxygenEntity = new Collectible(oxygen);
    playerEntity = players.filter(x => x.id === id)[0];
    playerEntity = new Player(playerEntity);
    //console.log('spike === '+spike);
    spikeEntity = new Player(spike);
  
    playersList = players


    document.onkeydown = e => {
      let  dir = null
      switch(e.keyCode) {
        case 87:
        case 38:
           dir = 'up';
           break;
        case 83:
        case 40:
           dir = 'down';
           break;
        case 65:
        case 37:
           dir = 'left';
           break;
        case 68:
        case 39:
           dir = 'right';
           break;   
      }
      if (dir) {
        playerEntity.movePlayer(dir, 10);
        socket.emit('update', playerEntity);
      }
    }
  
    // update
    socket.on('update', ({players:players,spike:spike,oxygen:oxygen,player:player}) => {
      //console.log('spike === '+spike);
      spikeEntity = new Player(spike)
      playersList = players;
      oxygenEntity = new Collectible(oxygen)
      if (player) {
        if (player.id === playerEntity.id) {
          playerEntity= new Player(player);
        }
      }
      
    });
  
  });
  
  window.requestAnimationFrame(update); 
}

const update = () => {

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set background color
  context.fillStyle = '#220';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create border for play field
  context.strokeStyle = 'white';
  context.strokeRect(dimension.minX, dimension.minY, dimension.arenaSizeX, dimension.arenaSizeY);

  // Controls text
  context.fillStyle = 'white';
  context.font = `13px 'Press Start 2P'`;
  //context.textAlign = 'center';
  //context.fillText('Controls', 80, 20);
  context.textAlign = 'center';
  context.fillText('Controls: WASD', 110, 40);

  // Game title
  context.font = `40px 'Modak'`;
  context.fillText('Cat Game', 350, 40);

  if (playerEntity) {
    playerEntity.draw(context,firstCat);
    context.font = `26px 'Modak'`;
    context.fillText(playerEntity.calculateRank(playersList), 560, 40);
    playersList.forEach((player)=> {
       if (player.id !== playerEntity.id) {
         let p = new Player(player);
         p.draw(context, secondCat);
       }
    });
    
    if (spikeEntity) {
      spikeEntity.draw(context,mainCat);
    }
  }

 
  tick = requestAnimationFrame(update);
}

init();