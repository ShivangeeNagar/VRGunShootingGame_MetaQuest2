export class VRManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this._isInVRMode = false;
    }
    
    setupVREntryInterface() {
        const vrButton = VRButton.createButton(this.renderer, { requiredFeatures: ['hand-tracking'] });
        document.body.appendChild(vrButton);
    }

    setupVRModeEvents() {
        this.renderer.xr.addEventListener('sessionstart', () => {
            this._isInVRMode = true;
            console.log('Entered VR Mode');
        });
        this.renderer.xr.addEventListener('sessionend', () => {
            this._isInVRMode = false;
            console.log('Exited VR Mode');
        });
    }

    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    get isInVRMode() {
        return this._isInVRMode; // Getter method
    }
}
