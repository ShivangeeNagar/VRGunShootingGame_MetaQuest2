export class VRController {
    constructor(renderer, scene, camera, cameraGroup, isLeftHand, line, marker) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.cameraGroup = cameraGroup;
        this.isLeftHand = isLeftHand;
        this.line = line;
        this.marker = marker;
        this.controller = this.setupVRController();

    }

    setupVRController() {
        const controller = this.renderer.xr.getController(this.isLeftHand ? 1 : 0);
        this.scene.add(controller);

        this.loadControllerModel(controller);

        if (this.isLeftHand) {
            controller.addEventListener('selectstart', () => this.onSelectStart(controller));
            controller.addEventListener('selectend', () => this.onSelectEnd(controller));

        }

        return controller;
    }

    onSelectStart(controller) {
        if (this.line) {
            this.line.visible = true; // Only set visible if line is defined
        } else {
            console.error('Line is undefined in onSelectStart');
        }
    }

    onSelectEnd(controller, line, cameraGroup, marker) {
        this.line.visible = false;
        if (this.marker.visible) {
            this.teleportUser(this.marker.position.clone(), this.cameraGroup);
        }
    }

    teleportUser(newPosition, cameraGroup) {
        new TWEEN.Tween(cameraGroup.position)
            .to({
                x: newPosition.x,
                y: newPosition.y,
                z: newPosition.z
            }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    loadControllerModel(controller) {
        const loader = new THREE.GLTFLoader();
        loader.load('assets/models/vr_hand_glove/scene.gltf', (gltf) => {
            const controllerModel = gltf.scene;
            controllerModel.scale.set(2.0, 2.0, 2.0);
            if (this.isLeftHand) {
                controllerModel.scale.x *= -1;
            }
            controllerModel.position.set(0, 0, 0);
            controllerModel.rotation.set(0, Math.PI, 0);
            controllerModel.name = "CustomHandModel";  
            controller.add(controllerModel);
        }, undefined, function(error) {
            console.error('Error loading controller model:', error);
        });
    }

}


