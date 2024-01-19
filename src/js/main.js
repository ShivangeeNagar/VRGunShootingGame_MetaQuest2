import { VRController } from './VRController.js';
import { HandTracking } from './HandTracking.js'; 
import { VRManager } from './VRManager.js';
import { ModelLoader } from './ModelLoader.js';
import { GunLogic } from './GunLogic.js';


// Global variables
let scene, camera, renderer, controls;
let vrRoom;
let controller1, controller2;
let cameraGroup, hands;
let raycastableObjects = [];


let pointerLine, pointerMarker, pointedObject = null;
const pointerRaycaster = new THREE.Raycaster();

// Global variables for line, marker, and raycaster
let line;
let marker;
let vrManager;
let modelLoader;
let gunLogic;

function init() {
    initScene();
    initRenderer();
    initVRManager();
    initFlyControls();
    setupVREnvironment();
    animate();
}

function initScene() {
    // Initialize Scene
    scene = new THREE.Scene();

    // Initialize Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    // Create Camera Group
    cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    cameraGroup.position.y = 0.5;
    scene.add(cameraGroup);

}
//web xr api
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
}

function initVRManager() {
    vrManager = new VRManager(renderer, scene, camera);
    vrManager.setupVREntryInterface();
    vrManager.setupVRModeEvents();
    vrManager.setupLighting();
    hands = new HandTracking(renderer, scene);
}

function initFlyControls() {

    controls = new window.FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 0.2;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
}


function setupVREnvironment() {

    modelLoader = new ModelLoader(scene);

    gunLogic = new GunLogic(scene, camera, controller2);

    gunLogic.createScoreText();

    modelLoader.loadVRRoomModel((loadedVrRoom, child) => {
        vrRoom = loadedVrRoom;
        if (child.isMesh) {
            raycastableObjects.push(child);
        }
    }, error => console.error('Error loading VR room model:', error));

    modelLoader.loadGunModel(loadedGun => {
        gunLogic.setGun(loadedGun);
    }, error => console.error('Error loading gun model:', error));

    modelLoader.loadTargetModel(loadedTarget => {
        gunLogic.setTarget(loadedTarget);
    }, error => console.error('Error loading target model:', error));
    
    initLeftControllerLineVisuals();
    initVRControllers();  
    initRightControllerLineVisuals(); 
    
}

function initVRControllers() {

    // Left controller
    controller1 = new VRController(renderer, scene, camera, cameraGroup, true, line, marker);
    // Right controller
    controller2 = new VRController(renderer, scene, camera, cameraGroup, false, line, marker); 

    gunLogic.controller2 = controller2;
    gunLogic.controller2.controller.addEventListener('selectstart', () => gunLogic.onSelectStartRight());
    gunLogic.controller2.controller.addEventListener('selectend', () => gunLogic.onSelectEndRight());
}

function initLeftControllerLineVisuals() {
    //blue color line
    const material = new THREE.LineBasicMaterial({ 
        color: 0x0000ff,
        fog: false
    });

    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    line = new THREE.Line(geometry, material);
    scene.add(line);

    // Marker
    const markerGeometry = new THREE.CircleGeometry(0.3, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    scene.add(marker);
}

function initRightControllerLineVisuals() {
    // Green color line
    const pointerMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const pointerPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)];
    const pointerGeometry = new THREE.BufferGeometry().setFromPoints(pointerPoints);

    pointerLine = new THREE.Line(pointerGeometry, pointerMaterial);
    scene.add(pointerLine);

    // Smaller than teleport marker
    const pointerMarkerGeometry = new THREE.CircleGeometry(0.1, 32); 

    // Marker
    const pointerMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    pointerMarker = new THREE.Mesh(pointerMarkerGeometry, pointerMarkerMaterial);
    pointerMarker.rotation.x = -Math.PI / 2;
    pointerMarker.visible = false;
    scene.add(pointerMarker);
}

function animate() {
    renderer.setAnimationLoop(() => {
        controls.update(1);
        TWEEN.update();
        updateLineForLeftController();
        hands.updateHands();
 
        if (gunLogic.isGunGrabbed) {
            updateLineForRightControllerAfterGunIsGrabbed(); // Continuously update gun sight line

            //mimicing the gun and the line coming out from gun wit ref to right controller
            gunLogic.getGun().position.copy(controller2.controller.position);
            gunLogic.getGun().quaternion.copy(controller2.controller.quaternion);
            gunLogic.getGun().rotateY(Math.PI / 2); // Adjust rotation as needed
            gunLogic.getGun().rotateZ(-Math.PI / 20); // Fine-tune rotation
        } else {
            updateLineForRightControllerBeforeGunIsGrabbed(); // Original pointer line and marker
        }

        gunLogic.updateBulletProjectileAnimation();
 
        renderer.render(scene, camera);
    });
}

function updateLineForRightControllerAfterGunIsGrabbed() {
    if (!gunLogic.isGunGrabbed) return;

    const startPoint = new THREE.Vector3();
    const direction = new THREE.Vector3(1, 0, 0);

    gunLogic.getGun().getWorldPosition(startPoint);
    gunLogic.getGun().getWorldQuaternion(gunLogic.worldQuaternion);
    direction.applyQuaternion(gunLogic.worldQuaternion);

    pointerRaycaster.set(startPoint, direction);
    let targetPoint = startPoint.clone().add(direction.multiplyScalar(10));

    pointerLine.geometry.setFromPoints([startPoint, targetPoint]);

    pointerMarker.position.copy(targetPoint);
    pointerMarker.visible = true;
}


function updateLineForLeftController() {
    // Check if vrManager, controller1, controller1's position, line, and raycaster are defined
    if (vrManager && vrManager.isInVRMode && controller1 && controller1.controller && controller1.controller.position && line) {
        const startPoint = controller1.controller.position.clone();
        const direction = new THREE.Vector3();
        controller1.controller.getWorldDirection(direction);
        direction.multiplyScalar(-1);

        // Perform raycasting
        const raycaster = new THREE.Raycaster();
        raycaster.set(startPoint, direction);
        const intersects = raycaster.intersectObjects(raycastableObjects, true);

        let targetPoint;
        if (intersects.length > 0) {
            targetPoint = intersects[0].point;
            marker.position.copy(targetPoint);
            marker.visible = true;
        } else {
            targetPoint = startPoint.clone().add(direction.normalize().multiplyScalar(5));
            marker.visible = false;
        }

        line.geometry.setFromPoints([startPoint, targetPoint]);
    }
}


function updateLineForRightControllerBeforeGunIsGrabbed() {
    if (vrManager.isInVRMode && gunLogic.controller2.controller && gunLogic.controller2 && pointerLine) {
        const startPoint = gunLogic.controller2.controller.position.clone();

        const direction = new THREE.Vector3();
        gunLogic.controller2.controller.getWorldDirection(direction);
        direction.multiplyScalar(-1);

        pointerRaycaster.set(startPoint, direction);
        const intersects = pointerRaycaster.intersectObjects([gunLogic.getGun()], true);

        let targetPoint;
        if (intersects.length > 0) {

            targetPoint = intersects[0].point;
            pointerMarker.position.copy(targetPoint);
            pointerMarker.visible = true;
            pointerLine.material.color.set(0xff0000); // Change to red when pointing at gun
            pointedObject = intersects[0].object;   

        } else {
            targetPoint = startPoint.clone().add(direction.normalize().multiplyScalar(5));
            pointerMarker.visible = false;
            pointerLine.material.color.set(0x00ff00); // Reset to green
            pointedObject = null;
        }

        pointerLine.geometry.setFromPoints([startPoint, targetPoint]);
        pointerLine.visible = true;
    } 
}


init();
