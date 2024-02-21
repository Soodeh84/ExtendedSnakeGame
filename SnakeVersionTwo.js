import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
//import {TrackballControls} from "three/addons/controls/TrackballControls.js";
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
const camera = new THREE.PerspectiveCamera(40, canvas.width / canvas.height,
                                            0.1, 1000);
camera.position.x =25;
camera.position.z =0;
camera.position.y =10;

window.addEventListener("resize", function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});
//set up the lights
const ambientLight = new THREE.AmbientLight('#ffffff');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#bbbbbb');
spotLight.position.set( 4,10, 0);
spotLight.castShadow = true;
spotLight.shadow.camera.fov = 40;
spotLight.shadow.camera.near = 5;
spotLight.shadow.camera.far = 200;
spotLight.intensity = 400;

scene.add(spotLight);

const txtLoader = new THREE.TextureLoader();

/*******************************************************Ground*************************************************************/
const groundX = 100;
const groundZ = 100;

const groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( groundX, groundZ), 
                                   new THREE.MeshStandardMaterial({
                                                                   color: 'white',
                                                                   emissive: '#808080',
                                                                   emissiveIntensity: 0.2,
                                                                   transparent: false,
                                                                   opacity: 0.8}));

groundMesh.rotation.x = -Math.PI/2;
groundMesh.receiveShadow = true;
scene.add( groundMesh );

/******field******************************************************************************************************************/
const fieldSide = 12;
const fieldHeight = 12;


//const divField = 12; //to divide the playing field

const fieldTexture = txtLoader.load('resources/FloorsCheckerboard_S_Diffuse.jpg');
fieldTexture.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
fieldTexture.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
fieldTexture.repeat.set(2,2);
fieldTexture.magFilter = THREE.LinearMipmapLinearFilter;
const normalMap = txtLoader.load('resources/FloorsCheckerboard_S_Normal.jpg');
normalMap.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
normalMap.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
normalMap.repeat.set(2,2);
normalMap.magFilter = THREE.LinearMipmapLinearFilter;
//const fieldGeo = myPlaneGeo();
const fieldGeo = new THREE.PlaneGeometry(fieldSide,fieldHeight);
const fieldMesh = new THREE.Mesh(fieldGeo,
                                 new THREE.MeshPhongMaterial({color: "#bbbbbb",
                                                                 map: fieldTexture,
                                                                 bumpMap: normalMap,
                                                                 bumpScale: 0.2,
                                                                 transparent: true,
                                                                 opacity: 0.9,
                                                                 side: THREE.DoubleSide}));
fieldMesh.castShadow = true;
fieldMesh.receiveShadow = true;
fieldMesh.rotation.x = Math.PI/2;
fieldMesh.position.set(0,0.1,0);
scene.add(fieldMesh);

//------walls----------
const cushionWidth = 0.2;
const cushionHeight = 12.5;
const cushionDepth = 1;
const yValue = 0.5;
const cushionsTexture = txtLoader.load('resources/hardwood2_diffuse.jpg');
cushionsTexture.wrapS = THREE.RepeatWrapping;  // wrap mode in u-direction
cushionsTexture.wrapT = THREE.RepeatWrapping;  // wrap mode in v-direction
cushionsTexture.repeat.set(3,3);
cushionsTexture.magFilter = THREE.LinearMipmapLinearFilter;
const wallBump = txtLoader.load('resources/hardwood2_bump.jpg');
wallBump.magFilter = THREE.LinearMipmapLinearFilter;
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
  scene.add(cushionMeshA);
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
const snakeTexture = txtLoader.load('resources/lavatile.jpg');
const blockSize = 1;
const snakeX = (blockSize * 0.95);
const snakeY = (blockSize * 0.95);
const snakeZ = (blockSize * 0.95);

const headGeo = new THREE.BoxGeometry( snakeX, snakeY, snakeZ); 
const headMat = new THREE.MeshBasicMaterial( {color: 0x008000,
                                               map: snakeTexture}); 
const snakeHead = new THREE.Mesh( headGeo, headMat ); 

scene.add(snakeHead);

//randomly place the snakeHead on a unit cell of the playing field 
function placeHead() {

  const headX = Math.floor(Math.random() * fieldSide - fieldSide / 2) * blockSize + blockSize / 2;
  const headZ = Math.floor(Math.random() * fieldSide - fieldSide / 2) * blockSize + blockSize / 2;
  
  snakeHead.position.set(headX, 0.6, headZ);
}
placeHead();
//FUCKING ROUNDED CUBES!.........................
/* const length = 0.8, width = 0.8;

const shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

const extrudeSettings = {
	depth: 0.9, 
	bevelEnabled: true,
	bevelSegments: 18
};
const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const mesh = new THREE.Mesh( geometry, material ) ;
scene.add( mesh );
mesh.castShadow = true;

function placeHeadB() {

  const lengthX = Math.floor(Math.random() * 11 - 11 / 2)* blockSize + blockSize / 2;
  const widthZ = Math.floor(Math.random() * 11 - 11 / 2)* blockSize + blockSize / 2;
  
  mesh.position.set(lengthX, 0.2, widthZ);
}
placeHeadB(); */
/********************************APPLE******************************************************************* */
const ScaleFact = 0.01;
let foodX;
let foodZ;
const loader = new OBJLoader();

txtLoader.load(
    'resources/Apple_BaseColor.png',
    function (texture) {
      
        // Load the normal map
        txtLoader.load(
            'resources/Apple_Normal.png',
            function (normalMap) {
                // Load the specular map
                txtLoader.load(
                    'resources/Apple_Roughness.png',
                    function (specularMap) {
                        // Set up material with the loaded texture, normal map, and specular map
                        const material = new THREE.MeshStandardMaterial({ 
                            map: texture,
                            normalMap: normalMap,
                            specularMap: specularMap,
                        });

                        // Load the OBJ file
                        loader.load(
                            'resources/Apple.obj',
                            function (object) {
                                // Apply the material with the texture to the object
                                object.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        child.material = material;
                                    }
                                });
                                //scale the Apple
                                object.scale.set(ScaleFact, ScaleFact, ScaleFact);
                                //randomly place the apple on the field
                                foodX = (Math.floor(Math.random() * fieldSide - fieldSide / 2) + blockSize / 2) * blockSize;
                                foodZ = (Math.floor(Math.random() * fieldSide - fieldSide / 2) + blockSize / 2) * blockSize;
                                object.position.set(foodX, 0.5, foodZ);
                                
                                scene.add(object);
                            },
                            function (xhr) {
                                // Progress callback
                                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                            },
                            function (error) {
                                // Error callback
                                console.error('Error loading OBJ file:', error);
                            }
                        );
                    },
                    function (xhr) {
                        // Progress callback for specular map loading
                        console.log((xhr.loaded / xhr.total * 100) + '% specular map loaded');
                    },
                    function (error) {
                        // Error callback for specular map loading
                        console.error('Error loading specular map:', error);
                    }
                );
            },
            function (xhr) {
                // Progress callback for normal map loading
                console.log((xhr.loaded / xhr.total * 100) + '% normal map loaded');
            },
            function (error) {
                // Error callback for normal map loading
                console.error('Error loading normal map:', error);
            }
        );
    },
    function (xhr) {
        // Progress callback for texture loading
        console.log((xhr.loaded / xhr.total * 100) + '% texture loaded');
    },
    function (error) {
        // Error callback for texture loading
        console.error('Error loading texture:', error);
    }
);


/**************************************Screen**********************************************************************/
const screenX = 15;
const screenZ = 4;

const rtHeight = 512;
const rtWidth = 512;
const rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

const screenMesh = new THREE.Mesh( new THREE.PlaneGeometry( screenX, screenZ), 
                                   new THREE.MeshPhongMaterial({color: '#bbbbbb',
                                                                 map: rt.texture}));

screenMesh.rotation.y = Math.PI/2;
screenMesh.castShadow = true;
screenMesh.position.set(-10, 3.5, 0);
scene.add( screenMesh );
screenMesh.material.needsUpdate = true;

const rtCamera = new THREE.PerspectiveCamera(90, rt.width / rt.height,
                                             0.1, 1000);
rtCamera.position.copy(snakeHead.position); 
//rtCamera.position.copy(mesh.position); 
/************************************Renderer***************************************** */
const controls = new OrbitControls( camera, canvas );
//const controlsb = new TrackballControls( rtCamera, canvas );
//controls.zoomSpeed = 5;
function render() {
  requestAnimationFrame(render);
  
  renderer.setRenderTarget(rt);
  renderer.render(scene, rtCamera);

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  controls.update();
  //controlsb.update();
  //renderer.render(scene, camera);
}

render();


