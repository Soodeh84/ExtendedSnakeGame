import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor('rgb(255,255,255)');

//enable the shadow 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height,
                                            0.1, 1000);
camera.position.x =30;
camera.position.z =5;
camera.position.y =8;

const ambientLight = new THREE.AmbientLight('#ffffff');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#ffffff');
spotLight.position.set( 0,5,0 );
spotLight.castShadow = true;
spotLight.intensity = 100;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.2;
scene.add(spotLight);

//TODO: DELETE AT THE END......
scene.add(new THREE.AxesHelper(1));
//........

const txtLoader = new THREE.TextureLoader();

/*******************************************************Ground*************************************************************/
const groundX = 800;
const groundZ = 800;

const groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( groundX, groundZ), 
                                   new THREE.MeshStandardMaterial({wireframe:false,
                                                                   emissive: '#f3ffff',
                                                                   emissiveIntensity: 0.5, 
                                                                   transparent: true,
                                                                   opacity: 0.8,
                                                                   side: THREE.DoubleSide}));

groundMesh.rotation.x = Math.PI/2;
groundMesh.receiveShadow = true;
scene.add( groundMesh );

/******field******************************************************************************************************************/
const fieldWidth = 12;
const fieldHeight = 12;


const divField = 12; //to divide the playing field

const fieldTexture = txtLoader.load('resources/FloorsCheckerboard_S_Diffuse.jpg');
const normalMap = txtLoader.load('resources/FloorsCheckerboard_S_Normal.jpg');

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

//------cushions----------
const cushionWidth = 0.3;
const cushionHeight = 12.5;
const cushionDepth = 0.3;
const yValue = 0.2;
const cushionsTexture = txtLoader.load('resources/hardwood2_diffuse.jpg');
const cushinNormal = txtLoader.load('resources/hardwood2_roughness.jpg');
//top and bottom
const cushionsT_B =[
                    {x: 6.2, y:yValue, z: 0},
                    {x:-6.2, y:yValue, z: 0}
                  ];
for (let i=0; i<cushionsT_B.length; i++){
  const cushionMeshA = new THREE.Mesh(new THREE.BoxGeometry(cushionWidth, cushionHeight, cushionDepth),
                                      new THREE.MeshStandardMaterial({color: '#ffffff',
                                                                    map: cushionsTexture,
                                                                    normalMap: cushinNormal,
                                                                    side: THREE.DoubleSide}));
  cushionMeshA.rotation.x = Math.PI/2;
  cushionMeshA.position.set(cushionsT_B[i].x,cushionsT_B[i].y,cushionsT_B[i].z);
  cushionMeshA.castShadow = true;
  scene.add(cushionMeshA);
}
//left and right
const cushionsL_R =[
                    {x: 0, y:yValue, z: 6.2},
                    {x: 0, y:yValue, z: -6.2}
                  ];
for (let i=0; i<cushionsL_R.length; i++){
  const cushionMeshB = new THREE.Mesh(new THREE.BoxGeometry(cushionHeight,cushionWidth, cushionDepth),
                                      new THREE.MeshBasicMaterial({color: '#ffffff',
                                                                   map: cushionsTexture,
                                                                   side: THREE.DoubleSide}));
  cushionMeshB.rotation.x = Math.PI/2;
  cushionMeshB.position.set(cushionsL_R[i].x,cushionsL_R[i].y,cushionsL_R[i].z);
  cushionMeshB.castShadow = true;
  scene.add(cushionMeshB);
}

//add the grid to the playing field
/* const gridHelper = new THREE.GridHelper( fieldWidth, divField, 'black', 'black' );
scene.add( gridHelper );
gridHelper.position.set(0,0.2,0); */

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

let skyBoxGeo = new THREE.BoxGeometry(200, 200, 200);
let skyBox = new THREE.Mesh(skyBoxGeo, matArray);
scene.add(skyBox);

const controls = new OrbitControls( camera, canvas );
controls.zoomSpeed = 5;
function render() {
  requestAnimationFrame(render);
  skyBox.position.copy(camera.position);

  spotLight.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}

render();

/* function myPlaneGeo(){
    const planeVertices = new Array(4);
    planeVertices[0] = new THREE.Vector3(2, 1, 0);
    planeVertices[1] = new THREE.Vector3(0, 1, 0);
    planeVertices[2] = new THREE.Vector3(0, 0, 0);
    planeVertices[3] = new THREE.Vector3(2, 0, 0);
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints([
        //face 0
        planeVertices[0], planeVertices[1], planeVertices[2],
        //face 2
        planeVertices[0], planeVertices[2], planeVertices[3],
    ]);

    const uvs = new Array();
    //face 0
    uvs.push(1, 1);
    uvs.push(0, 1);
    uvs.push(0, 0);
    //face 1
    uvs.push(1.0, 1.0);
    uvs.push(0.0, 0.0);
    uvs.push(1.0, 0.0);

    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return geo;
} */
