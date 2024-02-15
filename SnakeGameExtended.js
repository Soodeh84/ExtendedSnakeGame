"use strict";

import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('rgb(255,255,255)');    // set background color

const scene = new THREE.Scene(); // Create a new Three.js scene
//add a camera
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.set(1, -5, 9);
camera.lookAt(scene.position);
scene.add(camera);

/*****************************************************************************/
//field variables
const blockSize = 1;
const gridRow = 10; 
const gridCol = 10;

const divField = 10; //to divide the playing field

//snake variables
const snakeX = (blockSize * 0.95);
const snakeY = (blockSize * 0.95);
const snakeZ = blockSize;

let speed = new THREE.Vector3(0, 0, 0); 
const speedValue = 1;

const snakeBody = [];

//Food variable
const ballRadius = 0.5;

//audio sounds
const eatBallSound = new Audio ("sound2.wav");
const gameOverSound = new Audio ("sound1.wav");

//other variables
let gameOver = false;

/******************Add the playing field*******************************/
const fieldGeo = new THREE.PlaneGeometry(gridRow,gridCol);
const fieldMat = new THREE.MeshBasicMaterial( {color: 0x808080, transparent: true, opacity: 0.5} );
const fieldPlane = new THREE.Mesh(fieldGeo, fieldMat);
scene.add(fieldPlane); 

//add the grid to the playing field
const gridHelper = new THREE.GridHelper( gridRow, divField, 0x808080, 0x808080 );
scene.add( gridHelper );

//set the grid on x-y axis
gridHelper.rotation.x = Math.PI/2; 

/*****************Add snakeHead*****************************************/
const headGeo = new THREE.BoxGeometry( snakeX, snakeY, snakeZ); 
const headMat = new THREE.MeshBasicMaterial( {color: 0x008000} ); 
const snakeHead = new THREE.Mesh( headGeo, headMat ); 

scene.add(snakeHead);

//randomly place the snakeHead on a unit cell of the playing field 
function placeHead() {

  const headX = Math.floor(Math.random() * gridCol - gridCol / 2) * blockSize + blockSize / 2;
  const headY = Math.floor(Math.random() * gridRow - gridRow / 2) * blockSize + blockSize / 2;
  
  snakeHead.position.set(headX, headY, 0.5);
}
placeHead();

/****************Add snakeFood: red ball!*******************************/
const ballGeo = new THREE.SphereGeometry(ballRadius, 32,16);
const ballMat = new THREE.MeshBasicMaterial({color:0x993333});

const snakeFood = new THREE.Mesh(ballGeo, ballMat);
scene.add(snakeFood);

//randomly place the food on the playing field
function placeFood() {
  let foodX;
  let foodY;

  do {
    foodX = (Math.floor(Math.random() * gridCol - gridCol / 2) + blockSize / 2) * blockSize;
    foodY = (Math.floor(Math.random() * gridRow - gridRow / 2) + blockSize / 2) * blockSize;
  } while (findFreeCell(foodX, foodY));

  snakeFood.position.set(foodX, foodY, 0.5);
}
//check if the cells are occupied by snake and find an empty cell to place the food
function findFreeCell(x, y) {//check collision with snakeHead
  const headPosition = snakeHead.position;
  if (headPosition.x === x && headPosition.y === y) {
    return true;
  }
  for (const bodyPart of snakeBody) {//check collision with snakeBody
    const bodyPartPosition = bodyPart.position;
    if (bodyPartPosition.x === x && bodyPartPosition.y === y) {
      return true;
    }
  }
  return false;
}
placeFood();

//*******************************Snake movement****************************************************/
let prevHeadPosition = new THREE.Vector3(); 

function moveSnake() {
  if(gameOver){
    return; //Exit function if game is over
  }
  prevHeadPosition.copy(snakeHead.position); //store the previous position of the head before it is updated
  snakeHead.position.add(speed.clone().multiplyScalar(blockSize));//update snakeHead position based on its current position

  // Check for collisions with food
  if (prevHeadPosition.distanceTo(snakeFood.position) < 1) {
    eatBallSound.play();
    snakeTail();
    placeFood();
    
  }
  // Check for collisions with boundaries or itself
  else if (
    snakeHead.position.x < -gridRow / 2 ||
    snakeHead.position.x > gridRow / 2 ||
    snakeHead.position.y < -gridCol / 2 ||
    snakeHead.position.y > gridCol / 2 ||
    checkSelfCollision()
  ) {
    gameOverSound.play();
    alert("OH NoOo, You killed me! I was only: " + snakeBody.length);
    updateGame();
  }
  // Update body parts to attach and follow the head
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i].position.copy(snakeBody[i - 1].position);
  }
  // Update the first body part to follow the head
  if (snakeBody.length > 0) {
    snakeBody[0].position.copy(prevHeadPosition);
  }
}
// Check if the snake collides with itself
function checkSelfCollision() {
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeHead.position.distanceTo(snakeBody[i].position) < 1) {
      return true;
    }
  }
  return false;
}

/*****************************Add snakeBody parts****************************************************/
function snakeTail() {
  
  const tailGeo = new THREE.BoxGeometry(snakeX, snakeY, snakeZ);
  const tailMat = new THREE.MeshBasicMaterial({color: 0x0049ff});
  const newBodyPart = new THREE.Mesh(tailGeo, tailMat);

  newBodyPart.position.copy(prevHeadPosition); //use the previous position of the head for the body
  snakeBody.push(newBodyPart); //add the new body part to the front of the array

  scene.add(newBodyPart);  
}

/************************Handle arrow key input for snake movement******************************/
document.addEventListener("keydown", ArrowKeysHandler);

function ArrowKeysHandler(event) {
  //check for each direction that the snake wont go backward 
  if (event.key === "ArrowUp" && speed.y !== -speedValue) {
    speed.set(0, speedValue, 0);
  } else if (event.key === "ArrowDown" && speed.y !== speedValue) {
    speed.set(0, -speedValue, 0);
  } else if (event.key === "ArrowLeft" && speed.x !== speedValue) {
    speed.set(-speedValue, 0, 0);
  } else if (event.key === "ArrowRight" && speed.x !== -speedValue) {
    speed.set(speedValue, 0, 0);
  }
}

/****************************Reset the game*******************************************/
function updateGame() {
  snakeHead.position.set(0, 0, 0.5);
  speed.set(0, 0, 0);
  // Remove snake body parts
  for (const bodyPart of snakeBody) {
    scene.remove(bodyPart);
  }
  snakeBody.length = 0;

  placeHead();
  placeFood();
}

// Set interval for snake movement
setInterval(moveSnake, 250);

/*******************************************Render loop************************************************ */
const controls = new TrackballControls(camera, renderer.domElement); //allow user to control the scene by mouse or touch input

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
  controls.update();  
}
render();

