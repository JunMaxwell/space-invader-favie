import * as THREE from "three"

export default class ControllerKey {
    constructor(_options){
        this.scene = _options.scene;
        this.resources = _options.resources;

        this.keys =  [];

        const keyAsset = this.resources.items.button;
        keyAsset.minFilter = THREE.NearestFilter;

        this.setKeys(keyAsset)

        return this.keys
    }

    setKeys(asset){
        const controllerLeft = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshBasicMaterial({map: asset, transparent: true}))
        controllerLeft.name = 'left'
        controllerLeft.position.set(50,-30,0);

        const controllerRight = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshBasicMaterial({map: asset, transparent: true}))
        controllerRight.name = 'right'
        controllerRight.position.set(70,-30,0);
        controllerRight.rotation.z = Math.PI

        this.keys.push(controllerLeft, controllerRight)
        this.scene.add(controllerLeft, controllerRight)
    }

}