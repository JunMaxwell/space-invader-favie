import * as THREE from "three";

import { OBB } from "three/examples/jsm/math/OBB";

export default class Rocket {
    constructor(_options){
        this.scene = _options.scene;
        this.resources = _options.resources;
        this.parameter = _options.parameter;

        this.player = _options.player;

        this.setResources();
        this.setRocket();


        return this.mesh
    }

    setResources(){
        this.destroyedRocketAsset = this.resources.items.destroyedRocket;
    }

    setRocket(){
        const geometry = this.parameter.rocketGeometry;


        const material = new THREE.MeshBasicMaterial({color: this.player.material.color})

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.set(this.player.position.x, this.player.position.y, this.parameter.elementZIndex)

        geometry.computeBoundingBox();
        this.mesh.geometry.userData.obb = new OBB().fromBox3(this.mesh.geometry.boundingBox)
        this.mesh.userData.obb = new OBB();
        
        this.mesh.userData.collided = false;
        this.mesh.userData.reflected = false;
        this.mesh.userData.destroyed = false;
        this.mesh.userData.color = this.player.material.color;
        this.mesh.userData.destroyedAsset = {
            geometry: this.parameter.destroyedRocketGeometry,
            material: new THREE.MeshBasicMaterial({map:this.destroyedRocketAsset, color: this.player.material.color, transparent: true})
        }
        this.mesh.userData.updateValuePositionY = this.parameter.rocketYSpeed;
        this.mesh.userData.updateValuePositionX = this.parameter.rocketXAngle;

        this.scene.add(this.mesh)
    }

}