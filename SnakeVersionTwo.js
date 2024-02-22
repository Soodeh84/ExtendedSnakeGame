"use strict";

import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";

// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor('rgb(255,255,255)');
renderer.setSize(window.innerWidth, window.innerHeight);

//enable the shadow 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
// create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height,
                                            0.1, 1000);
camera.position.x =15;
camera.position.z =0;
camera.position.y =5;

window.addEventListener("resize", function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});
//set up the lights
const ambientLight = new THREE.AmbientLight('#ffffff');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#bbbbbb');
spotLight.position.set(5,10, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.fov = 50;
spotLight.shadow.camera.near = 6;
spotLight.shadow.camera.far = 100;
spotLight.intensity = 500;

scene.add(spotLight);

const txtLoader = new THREE.TextureLoader();

/*******************************************************Ground*************************************************************/
const groundX = 100;
const groundZ = 100;

const groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( groundX, groundZ), 
                                   new THREE.MeshStandardMaterial({color: '#bbbbbb',
                                                                    emissive: '#808080',
                                                                    emissiveIntensity: 0.4}));

groundMesh.rotation.x = -Math.PI/2;
groundMesh.receiveShadow = true;
scene.add( groundMesh );

/**********************************************field**********************************************************************************/
const fieldSide = 12;

const fieldTexture = txtLoader.load('resources/FloorsCheckerboard_S_Diffuse.jpg');
fieldTexture.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
fieldTexture.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
fieldTexture.repeat.set(2,2);
const bumpMap = txtLoader.load('resources/FloorsCheckerboard_S_Normal.jpg');
bumpMap.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
bumpMap.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
bumpMap.repeat.set(2,2);
const fieldGeo = new THREE.PlaneGeometry(fieldSide,fieldSide);
const fieldMesh = new THREE.Mesh(fieldGeo,
                                 new THREE.MeshPhongMaterial({color: "#bbbbbb",
                                                                 map: fieldTexture,
                                                                 bumpMap: bumpMap,
                                                                 bumpScale: 0.2,
                                                                 transparent: true,
                                                                 opacity: 0.9,
                                                                 side: THREE.DoubleSide}));
fieldMesh.castShadow = true;
fieldMesh.receiveShadow = true;
fieldMesh.rotation.x = Math.PI/2;
fieldMesh.position.set(0,0.1,0);
scene.add(fieldMesh);

//----------------------------walls----------
const cushionWidth = 0.2;
const cushionHeight = 12.5;
const cushionDepth = 1;
const yValue = 0.5;
const cushionsTexture = txtLoader.load('resources/hardwood2_diffuse.jpg');
cushionsTexture.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
cushionsTexture.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
cushionsTexture.repeat.set(3,3);
const wallBump = txtLoader.load('resources/hardwood2_bump.jpg');
//top and bottom
const cushionsT_B =[
                    {x: 6.1, y:yValue, z: 0},
                    {x:-6.1, y:yValue, z: 0}
                  ];
for (let i=0; i<cushionsT_B.length; i++){
  const cushionMeshA = new THREE.Mesh(new THREE.BoxGeometry(cushionWidth, cushionHeight-0.1, cushionDepth),
                                      new THREE.MeshStandardMaterial({color: '#bbbbbb',
                                                                    map: cushionsTexture,
                                                                    bumpMap: wallBump,
                                                                    bumpScale: 0.1,
                                                                    roughness: 4,
                                                                    side: THREE.DoubleSide}));
  cushionMeshA.rotation.x = -Math.PI/2;
  cushionMeshA.position.set(cushionsT_B[i].x,cushionsT_B[i].y,cushionsT_B[i].z);
  cushionMeshA.castShadow = true;
  cushionMeshA.receiveShadow = true;
  scene.add(cushionMeshA);
  cushionMeshA.magFilter = THREE.LinearMipmapLinearFilter;
}
//left and right
const cushionsL_R =[
                    {x: 0, y:yValue, z: 6.1},
                    {x: 0, y:yValue, z: -6.1}
                  ];
for (let i=0; i<cushionsL_R.length; i++){
  const cushionMeshB = new THREE.Mesh(new THREE.BoxGeometry(cushionHeight-0.5,cushionWidth, cushionDepth),
                                      new THREE.MeshStandardMaterial({color: '#bbbbbb',
                                                                   map: cushionsTexture,
                                                                   normalMap: wallBump,
                                                                   bumpScale: 0.1,
                                                                   roughness: 4,
                                                                   side: THREE.DoubleSide}));
  cushionMeshB.rotation.x = Math.PI/2;
  cushionMeshB.position.set(cushionsL_R[i].x,cushionsL_R[i].y,cushionsL_R[i].z);
  cushionMeshB.castShadow = true;
  cushionMeshB.receiveShadow = true;
  scene.add(cushionMeshB);
}
/*****************************************************SKY***************************************/
const urls = [
    "resources/skybox/nz.jpg",
    "resources/skybox/pz.jpg",
    "resources/skybox/py.jpg",
    "resources/skybox/ny.jpg",
    "resources/skybox/px.jpg",
    "resources/skybox/nx.jpg",
  ];

let matArray = [];
urls.forEach(tn => {
  const txt = txtLoader.load(tn);
  matArray.push(new THREE.MeshBasicMaterial({map:txt,
                                             side:THREE.DoubleSide}));
});

let skyBoxGeo = new THREE.BoxGeometry(300, 300, 300);
let skyBox = new THREE.Mesh(skyBoxGeo, matArray);
scene.add(skyBox);
/************************************snake head******************************************************************* */
const snakeTexture = txtLoader.load('resources/snakeSkin.jpg');
const blockSize = 1;
const snakeX = (blockSize * 0.95);
const snakeY = (blockSize * 0.95);
const snakeZ = (blockSize * 0.95);

const headGeo = new THREE.BoxGeometry( snakeX, snakeY, snakeZ); 
const headMat = new THREE.MeshPhongMaterial( {color: 0x008000,
                                              map: snakeTexture}); 
const snakeHead = new THREE.Mesh( headGeo, headMat ); 

scene.add(snakeHead);
snakeHead.castShadow = true;

//randomly place the snakeHead on a unit cell of the playing field 
function placeHead() {

  const headX = Math.floor(Math.random() * fieldSide - fieldSide / 2) * blockSize + blockSize / 2;
  const headZ = Math.floor(Math.random() * fieldSide - fieldSide / 2) * blockSize + blockSize / 2;
  
  snakeHead.position.set(headX, 0.59, headZ);
}
placeHead();
/********************************APPLE******************************************************************* */
const scaleFact = 0.01;
let appleObj;
const loader = new OBJLoader();

txtLoader.load('resources/Apple_BaseColor.png', function (textureApple) {
      // Load the normal map
        txtLoader.load('resources/Apple_Normal.png', function (normalMap) {
                // Load the specular map
                txtLoader.load('resources/Apple_Roughness.png', function (specularMap) {
                        // Set up material with the loaded texture, normal map, and specular map
                        const material = new THREE.MeshPhongMaterial({ 
                            map: textureApple,
                            normalMap: normalMap,
                            specularMap: specularMap,
                            specular:'#ffff00',
                            shininess: 4 });
                        // Load the OBJ file
                        loader.load('resources/Apple.obj', function (object) {
                                // Apply the material with the texture to the object
                                object.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        child.castShadow = true;
                                        child.material = material;
                                    }
                                });
                                appleObj = object;
                                placeFood();
                            });
                    });
            });
    }); 

function placeFood() {
  let foodX;
  let foodZ;
  do{
  foodX = (Math.floor(Math.random() * fieldSide - fieldSide / 2) + blockSize / 2) * blockSize;
  foodZ = (Math.floor(Math.random() * fieldSide - fieldSide / 2) + blockSize / 2) * blockSize;
  } while (findFreeCell(foodX, foodZ));
  
  appleObj.scale.set(scaleFact,scaleFact,scaleFact);
  appleObj.position.set(foodX, 0.49, foodZ);
  scene.add(appleObj);
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
/****************************************snake Movement************************************* */
const snakeBody = [];
let prevHeadPosition = new THREE.Vector3();
let gameOver = false;
let speed = new THREE.Vector3(0, 0, 0); 
//audio sounds
const eatBallSound = new Audio ("resources/sound2.wav");
const gameOverSound = new Audio ("resources/sound1.wav");

function moveSnake() {
  if(gameOver){
    return; //Exit function if game is over
  }
  prevHeadPosition.copy(snakeHead.position); //store the previous position of the head before it is updated
  snakeHead.position.add(speed.clone().multiplyScalar(blockSize));//update snakeHead position based on its current position

  // Check for collisions with food
  if (appleObj && prevHeadPosition.distanceTo(appleObj.position) < 0.5) {
    eatBallSound.play();
    snakeTail();
    placeFood();
    
  }
  // Check for collisions with boundaries or itself
  else if (
    snakeHead.position.x < -fieldSide / 2 ||
    snakeHead.position.x > fieldSide / 2 ||
    snakeHead.position.z < -fieldSide / 2 ||
    snakeHead.position.z > fieldSide / 2 ||
    checkSelfCollision()
  ) {
    gameOverSound.play();
    alert("Game Over! your Score: " + snakeBody.length);
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
/*************************************Add snakeBody************************************************************** */
function snakeTail() {
  
  const tailGeo = new THREE.BoxGeometry(snakeX, snakeY, snakeZ);
  const tailMat = new THREE.MeshStandardMaterial({color: '#00ffff',
                                                  map: snakeTexture});
  const newBodyPart = new THREE.Mesh(tailGeo, tailMat);
  newBodyPart.castShadow = true;
  newBodyPart.position.copy(prevHeadPosition); //use the previous position of the head for the body
  snakeBody.push(newBodyPart); //add the new body part to the front of the array

  scene.add(newBodyPart);  
}
/************************Handle arrow key input for snake movement******************************/
const speedValue = 1;
document.addEventListener("keydown", ArrowKeysHandler);

function ArrowKeysHandler(event) {
  //check for each direction that the snake wont go backward 
  if (event.key === "ArrowUp" && speed.x !== -speedValue) {
    speed.set(-speedValue,0 , 0);
  } else if (event.key === "ArrowDown" && speed.x !== speedValue) {
    speed.set(speedValue, 0, 0);
  } else if (event.key === "ArrowLeft" && speed.y !== speedValue) {
    speed.set(0, 0, speedValue);
  } else if (event.key === "ArrowRight" && speed.y !== -speedValue) {
    speed.set(0, 0, -speedValue);
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
  //scene.remove(appleObj); 
  placeHead();
  placeFood();
}
// Set interval for snake movement
setInterval(moveSnake, 250);

/*********************************Screen base**************************** */
const baseX = 0.5;
const baseY = 9;
const baseZ = 6;
const baseMesh = new THREE.Mesh(new THREE.BoxGeometry (baseX, baseY, baseZ),
                                 new THREE.MeshStandardMaterial({color: '#000000',
                                                                 side: THREE.DoubleSide}));

baseMesh.rotation.x = Math.PI/2;
baseMesh.castShadow = true;
baseMesh.position.set(-7.45, 3, 0);
scene.add(baseMesh);
/**************************************Screen**********************************************************************/
const screenX = 10;
const screenY = 4;

const rtHeight = 512;
const rtWidth = 512;
const rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

const screenMesh = new THREE.Mesh( new THREE.PlaneGeometry( screenX, screenY), 
                                   new THREE.MeshStandardMaterial({color: '#bbbbbb',
                                                                 map: rt.texture,
                                                                 side: THREE.FrontSide}));

screenMesh.rotation.y = Math.PI/2;
screenMesh.castShadow = true;
screenMesh.position.set(-7, 3.5, 0);
scene.add( screenMesh );
screenMesh.material.needsUpdate = true;

const rtCamera = new THREE.PerspectiveCamera(100, rtWidth / rtHeight, 0.1, 1000);
rtCamera.position.copy(snakeHead.position); 

/************************************Renderer***************************************** */
const controls = new OrbitControls( camera, canvas );
const controlsb = new TrackballControls(rtCamera, renderer.domElement);

function render() {
  requestAnimationFrame(render);

  rtCamera.position.copy(snakeHead.position); 
  // Calculate the target position for the camera to look at
  const targetPosition = new THREE.Vector3().copy(snakeHead.position).add(speed);

  // Orient the camera towards the target position
  rtCamera.lookAt(targetPosition);

  renderer.setRenderTarget(rt);
  renderer.render(scene, rtCamera);

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  controls.update(); 
  
}
render();


