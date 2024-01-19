export class GunLogic {
    constructor(scene, camera, controller2) {
        this.scene = scene;
        this.camera = camera;
        this.controller2 = controller2;
        this.prevTime = 0;
        this.gun = null;
        this.target = null;
        this.bullet = null; 
        this.pointerRaycaster = new THREE.Raycaster();       
        this.worldQuaternion = new THREE.Quaternion(); 
        this.isBulletFired = false;
        this.bulletSpeed = 0.1;
        this.bulletDirection = new THREE.Vector3();
        this.isGunGrabbed = false;
        this.score = 0;
    }

    setGun(gun) {
        this.gun = gun;
    }

    setTarget(target) {
        this.target = target;
    }

    onSelectStartRight() {
        if (!this.isGunGrabbed) {
            this.grabGun();
        } else {
            this.fireBullet();
        }
    }

    onSelectEndRight() {
        // This function can remain empty or be used for other purposes
    }


    grabGun() {
        this.isGunGrabbed = true;
        let customHandModel = this.controller2.controller.getObjectByName("CustomHandModel");
        if (customHandModel) customHandModel.visible = false;
    }

    fireBullet() {
        const newBullet = this.createBullet();
        const bulletStartPosition = new THREE.Vector3();
        const forwardDirection = new THREE.Vector3(1, 0, 0);
        this.gun.getWorldPosition(bulletStartPosition);
        this.gun.getWorldQuaternion(this.worldQuaternion);
        forwardDirection.applyQuaternion(this.worldQuaternion);
        newBullet.position.copy(bulletStartPosition);
        newBullet.userData.direction = forwardDirection;
        newBullet.visible = true;
        this.scene.add(newBullet);
    }

    createBullet() {
        const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.userData.activeTime = 0;
        bullet.visible = true;

        return bullet;
    }

    updateBulletProjectileAnimation() {
        const currentTime = performance.now(); // Get the current time in milliseconds
        const deltaTime = (currentTime - this.prevTime) / 1000; // Convert to seconds
        this.prevTime = currentTime; // Update prevTime for the next frame

        this.scene.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.geometry.type === "SphereGeometry") {
                if (child.userData.direction) {
                    child.position.add(child.userData.direction.clone().multiplyScalar(this.bulletSpeed));
                    child.userData.activeTime += deltaTime;
                    if (child.userData.activeTime > 0.5) {
                        this.checkBulletCollision(child);
                    }
            }}
        });
    }
   
    checkBulletCollision(bullet) {
        if (!bullet || !this.target || bullet.userData.activeTime <= 0.1) return; 
    
        // Create a raycaster with bullet's position and direction
        const raycaster = new THREE.Raycaster(bullet.position, bullet.userData.direction.clone());
        const intersects = raycaster.intersectObject(this.target, true);
    
        if (intersects.length > 0) {
            // Collision detected
            const collisionPoint = intersects[0].point;
            this.createBulletHole(collisionPoint);
            this.score++;
            this.updateScoreText();
            bullet.visible = false;
            this.scene.remove(bullet);
        }
    }

    createBulletHole(position) {
        const textureLoader = new THREE.TextureLoader();
        const bulletHoleTexture = textureLoader.load('assets/bullethole.png');
        const bulletHoleMaterial = new THREE.MeshBasicMaterial({
            map: bulletHoleTexture,
            transparent: true
        });
        const bulletHoleGeometry = new THREE.PlaneGeometry(0.2, 0.2);
        const bulletHoleMesh = new THREE.Mesh(bulletHoleGeometry, bulletHoleMaterial);
        bulletHoleMesh.position.copy(position);
        bulletHoleMesh.lookAt(this.camera.position);
        this.scene.add(bulletHoleMesh);
    }
        

    createScoreText() {
        const loader = new THREE.FontLoader();
        loader.load('fonts/helvetiker_bold.typeface.json', (font) => {
            this.globalFont = font; // Store the loaded font globally
            const geometry = new THREE.TextGeometry('Score: 0', {
                font: font,
                size: 0.3,
                height: 0.1,
            });
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            this.scoreText = new THREE.Mesh(geometry, material);
            this.scoreText.position.set(-1, 6, -5);
            this.scene.add(this.scoreText);
        });
    }
    
    updateScoreText() {
        if (this.scoreText && this.globalFont) { 
            // Dispose of the old geometry to prevent memory leaks
            this.scoreText.geometry.dispose();
    
            // Create new geometry with the updated score
            this.scoreText.geometry = new THREE.TextGeometry(`Score: ${this.score}`, {
                font: this.globalFont, // globally stored font
                size: 0.5, // Adjusted size as needed
                height: 0.1, // Adjusted height as needed
            });
        }
    }

    // Getters
    getGun() {
        return this.gun;
    }
    
    getTarget() {
        return this.target;
    }
    
}
