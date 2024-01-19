export class HandTracking {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.leftHand = this.renderer.xr.getHand(0);
        this.rightHand = this.renderer.xr.getHand(1);
        this.initHands();
    }

    initHands() {
        this.scene.add(this.leftHand);
        this.scene.add(this.rightHand);

        // Initialize hands with dummy spheres for joints
        for (let i = 0; i <= 24; i++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.01, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xFF0000 })
            );
            sphere.castShadow = true;
            this.leftHand.add(sphere);
            this.rightHand.add(sphere);
        }
    }

    updateHandJoints(hand) {
        for (const joint of Object.values(hand.joints)) {
            // Update the position and rotation of joint spheres
            const jointMesh = hand.children[joint.jointName];
            jointMesh.position.copy(joint.position);
            jointMesh.quaternion.copy(joint.quaternion);
        }
    }

    updateHands() {
        this.updateHandJoints(this.leftHand); // Update left hand
        this.updateHandJoints(this.rightHand); // Update right hand
    }
}
