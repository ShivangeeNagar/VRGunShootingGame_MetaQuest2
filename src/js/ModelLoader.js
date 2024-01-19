export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new THREE.GLTFLoader();
    }

    loadVRRoomModel(callback, errorCallback) {
        this.loader.load('assets/models/vr_presentation-room/scene.gltf', gltf => {
            const vrRoom = gltf.scene;
            vrRoom.position.set(0, 0, 0);
            this.scene.add(vrRoom);

            vrRoom.traverse(function (child) {
                if (child.isMesh) {
                    callback(vrRoom, child);
                }
            });
        }, undefined, errorCallback);
    }

    loadGunModel(callback, errorCallback) {
        this.loader.load('assets/models/just_your_ordanary_low_poly_gun_game-ready/scene.gltf', gltf => {
            const gun = gltf.scene;
            gun.position.set(1.7, 1.0, -2.75);
            gun.scale.set(0.5, 0.5, 0.5);
            gun.rotation.set(Math.PI / -2, Math.PI / 20.5, Math.PI / 6);
            this.scene.add(gun);
            callback(gun);
        }, undefined, errorCallback);
    }

    loadTargetModel(callback, errorCallback) {
        this.loader.load('assets/models/simple_shooting_range_target./scene.gltf', gltf => {
            const target = gltf.scene;
            target.position.set(0, 1.5, -5);
            target.scale.set(1, 1, 1);
            target.rotation.y = Math.PI / 2;
            this.scene.add(target);
            callback(target);
        }, undefined, errorCallback);
    }
}
