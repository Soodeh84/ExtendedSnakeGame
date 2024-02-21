import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
//import {TrackballControls} from "three/addons/controls/TrackballControls.js";

// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor('rgb(255,255,255)');
renderer.setSize(window.innerWidth, window.innerHeight);

//enable the shadow 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height,
                                            0.1, 1000);
camera.position.x =20;
camera.position.z =0;
camera.position.y =10;

window.addEventListener("resize", function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

const ambientLight = new THREE.AmbientLight('#ffffff');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#ffffff');
spotLight.position.set( 15,10, 15);
spotLight.castShadow = true;
spotLight.shadow.camera.fov = 60;
spotLight.intensity = 200;

scene.add(spotLight);

const txtLoader = new THREE.TextureLoader();

/*******************************************************Ground*************************************************************/
const groundX = 1000;
const groundZ = 1000;

const groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( groundX, groundZ), 
                                   new THREE.MeshStandardMaterial({
                                                                   color: 'white',
                                                                   emissive: '#808080',
                                                                   emissiveIntensity: 0.2,
                                                                   transparent: false,
                                                                   opacity: 0.8}));

groundMesh.rotation.x = -Math.PI/2;
groundMesh.castShadow = true;
scene.add( groundMesh );

/******field******************************************************************************************************************/
const fieldWidth = 12;
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
const fieldGeo = new THREE.PlaneGeometry(fieldWidth,fieldHeight);
const fieldMesh = new THREE.Mesh(fieldGeo,
                                 new THREE.MeshPhongMaterial({color: "#ffffff",
                                                                 normalMap: normalMap,
                                                                 map: fieldTexture,
                                                                 transparent: true,
                                                                 opacity: 0.7,
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
  const cushionMeshA = new THREE.Mesh(new THREE.BoxGeometry(cushionWidth, cushionHeight, cushionDepth),
                                      new THREE.MeshStandardMaterial({color: 'white',
                                                                    map: cushionsTexture,
                                                                    bumpMap: wallBump,
                                                                    bumpScale: 0.1,
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
                                      new THREE.MeshBasicMaterial({color: '#ffffff',
                                                                   map: cushionsTexture,
                                                                   normalMap: wallBump,
                                                                   side: THREE.DoubleSide}));
  cushionMeshB.rotation.x = Math.PI/2;
  cushionMeshB.position.set(cushionsL_R[i].x,cushionsL_R[i].y,cushionsL_R[i].z);
  cushionMeshB.castShadow = true;
  scene.add(cushionMeshB);
}

//add the grid to the playing field
/* const gridHelper = new THREE.GridHelper( fieldWidth, divField, 'gray', 'gray' );
scene.add( gridHelper );
gridHelper.position.set(0,0.1,0); */

/***SKY*** */
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
/**************************************Screen*************************** */
const screenX = 10;
const screenZ = 5;

const rtHeight = 512;
const rtWidth = 512;
const rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

const screenMesh = new THREE.Mesh( new THREE.PlaneGeometry( screenX, screenZ), 
                                   new THREE.MeshPhongMaterial({color: '#bbbbbb',
                                                                 map: rt.texture}));

screenMesh.rotation.y = Math.PI/2;
screenMesh.castShadow = true;
screenMesh.position.set(-7, 4, 0);
scene.add( screenMesh );


//screenMesh.material.map = rt.texture;
screenMesh.material.needsUpdate = true;


const rtCamera = new THREE.PerspectiveCamera(100, rt.width / rt.height,
                                             0.1, 1000);
rtCamera.position.copy(camera.position);


/************************************Renderer***************************************** */
const controls = new OrbitControls( camera, canvas );
//const controls = new TrackballControls( camera, canvas );
//controls.zoomSpeed = 5;
function render() {
  requestAnimationFrame(render);
  
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  //renderer.render(scene, rtCamera);

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  controls.update();
  //renderer.render(scene, camera);
}

render();


