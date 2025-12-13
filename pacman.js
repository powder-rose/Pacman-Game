// Доска и размеры
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

// Изображения призраков
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;

// Изображения пакмана
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;

// Изображение стены
let wallImage;

//  Карта локации:
//     Х = стена,
//     O = пропуск,
//     P = pacman,
//     "" = еда,
//  Призраки:
//     b = голубой призрак,
//     p = розовый призрак,
//     o = оранжевый призрак

const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X                 X",
  "X XX X XXXXX X XX X",
  "X    X       X    X",
  "XXXX XXXX XXXX XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXrXX X XXXX",
  "O       bpo       O",
  "XXXX X XXXXX X XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXXXX X XXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X  X     P     X  X",
  "XX X X XXXXX X X XX",
  "X    X   X   X    X",
  "X XXXXXX X XXXXXX X",
  "X                 X",
  "XXXXXXXXXXXXXXXXXXX",
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");
  loadImages();
  loadMap();
  update();

  addEventListener("keyup", movePacman);
};

// Функция загрузки карты, рендер блоков
function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columnCount; c++) {
      const row = tileMap[r];
      const tileMapChar = row[c];

      const x = c * tileSize;
      const y = r * tileSize;

      if (tileMapChar === "X") {
        const wall = new Block(wallImage, x, y, tileSize, tileSize);
        walls.add(wall);
      } else if (tileMapChar === "b") {
        const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "p") {
        const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "o") {
        const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "r") {
        const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "P") {
        pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
      } else if (tileMapChar === " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        foods.add(food);
      }
    }
  }
}

// Функция загрузки изображений
function loadImages() {
  wallImage = new Image();
  wallImage.src = "./assets/wall.png";

  blueGhostImage = new Image();
  blueGhostImage.src = "../assets/blueGhost.png";

  orangeGhostImage = new Image();
  orangeGhostImage.src = "../assets/orangeGhost.png";

  pinkGhostImage = new Image();
  pinkGhostImage.src = "../assets/pinkGhost.png";

  redGhostImage = new Image();
  redGhostImage.src = "../assets/redGhost.png";

  pacmanUpImage = new Image();
  pacmanUpImage.src = "../assets/pacmanUp.png";
  pacmanDownImage = new Image();
  pacmanDownImage.src = "../assets/pacmanDown.png";
  pacmanLeftImage = new Image();
  pacmanLeftImage.src = "../assets/pacmanLeft.png";
  pacmanRightImage = new Image();
  pacmanRightImage.src = "../assets/pacmanRight.png";
}

function update() {
  move();
  draw();
  setTimeout(update, 50);
}

// Отрисовка компонентов: призраки, стены, еда
function draw() {
    context.clearRect(0, 0, board.width, board.height);
  context.drawImage(
    pacman.image,
    pacman.x,
    pacman.y,
    pacman.width,
    pacman.height,
  );
  for (let ghost of ghosts.values()) {
    context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
  }
  for (let wall of walls.values()) {
    context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
  }
  context.fillStyle = "white";
  for (let food of foods.values()) {
    context.fillRect(food.x, food.y, food.width, food.height);
  }
}
// Функция движения пакмана
function move() {
  pacman.x += pacman.velocityX;
  pacman.y += pacman.velocityY;

  for (let wall of walls.values()) {
      if (collision(pacman, wall)){
          pacman.x -= pacman.velocityX;
          pacman.y -= pacman.velocityY;
          break;
      }
  }
}

// Назначение клавиш на движение пакмана
function movePacman(event) {
  if (event.code === "ArrowUp" || event.code === "KeyW") {
    pacman.updateDirection("U");
  } else if (event.code === "ArrowDown" || event.code === "KeyS") {
    pacman.updateDirection("D");
  } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
    pacman.updateDirection("L");
  } else if (event.code === "ArrowRight" || event.code === "KeyD") {
    pacman.updateDirection("R");
  }
}

// Коллизия стен и позиционирование углов
function collision (a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// Класс создания блоков и методы направления и движения пакмана
class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  // Обновление траектории
  updateDirection(direction) {
    this.direction = direction;
    this.updateVelocity();
  }

  // Обновление движения
  updateVelocity() {
    if (this.direction === "U") {
      this.velocityX = 0;
      this.velocityY = -tileSize / 4;
    } else if (this.direction === "D") {
      this.velocityX = 0;
      this.velocityY = tileSize / 4;
    } else if (this.direction === "L") {
      this.velocityX = -tileSize / 4;
      this.velocityY = 0;
    } else if (this.direction === "R") {
      this.velocityX = tileSize / 4;
      this.velocityY = 0;
    }
  }
}
