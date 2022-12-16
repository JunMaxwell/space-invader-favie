import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";

import Controller from "../../Utils/Controller.js";

import PlayerSelector from "./PlayerSelector.js"
import Rocket from "./Rocket.js";

export default class Player {
    constructor(_options){
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.renderer = _options.renderer;
        this.resources = _options.resources;
        this.parameter = _options.parameter;

        this.playerAsset = this.resources.items.player;
        this.hiddenAsset = this.resources.items.hiddenPlayer

        // Selection
        this.mouse = this.parameter.mouse;
        this.raycaster = this.parameter.raycaster;

        this.rockets = []

        this.setUpPlayer();

        this.controller = new Controller({
            scene: this.scene,
            camera: this.camera,
            resources: this.resources,
            parameter: this.parameter,
            player: this,
            mouse: this.mouse,
            raycaster: this.raycaster
        })

        this.playerSelector = new PlayerSelector({
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            parameter: this.parameter,
            player: this,
            playerAsset: this.playerAsset,
            hiddenAsset: this.hiddenAsset,
            mouse: this.mouse,
            raycaster: this.raycaster
        })
    }

    setUpPlayer(){
        this.setGeometry();
        this.setMaterial();
        this.setPlayer();
        this.setPlayerColliderZone();
    }

    setGeometry(){
        this.geometry = this.parameter.playerGeometry
    }

    setMaterial(){
        this.material = new THREE.MeshBasicMaterial({map: this.playerAsset ,color:this.parameter.blue, transparent: true})
    }

    setPlayer(){
        this.player = new THREE.Mesh(this.geometry, this.material)
        this.player.position.copy(this.parameter.startPosition)

        this.scene.add(this.player)
    }

    setPlayerColliderZone(){
        this.colliderZone = new THREE.Mesh(new THREE.PlaneGeometry(120,10))
        this.colliderZone.position.set(-40,-38,0.1)
        this.colliderZone.visible = false;
        this.colliderZone.geometry.computeBoundingBox()
        this.colliderZone.geometry.userData.obb = new OBB().fromBox3(this.colliderZone.geometry.boundingBox)
        this.colliderZone.userData.obb = new OBB()
        
        this.scene.add(this.colliderZone)
    }
  
    movePlayer(deltaT){
        this.player.position.x -= this.controller.getXValue() * deltaT
        this.player.position.clamp(this.parameter.minPosition, this.parameter.maxPosition)
    }

    colliderObbUpdate(){
        this.colliderZone.userData.obb.copy(this.colliderZone.geometry.userData.obb)
        this.colliderZone.userData.obb.applyMatrix4(this.colliderZone.matrixWorld)
    }

    updatePlayer(color){
        this.player.material.color = color;
    }

    lauchRocket(){
        const rocket = new Rocket({
            scene: this.scene,
            resources: this.resources,
            parameter: this.parameter,
            player: this.player
        })
        this.rockets.push(rocket)
    }

    rocketsUpdate(deltaT){
        for(let rocket in this.rockets){
            if(!this.rockets[rocket].userData.destroyed){
                this.rockets[rocket].userData.obb.copy(this.rockets[rocket].geometry.userData.obb)
                this.rockets[rocket].userData.obb.applyMatrix4(this.rockets[rocket].matrixWorld)
            } else {
                if(this.rockets[rocket].material.opacity > 0){
                    this.rockets[rocket].material.opacity -= .025;
                } else {
                    this.disposeRocket(rocket);
                    return
                }
            }


            if(this.rockets[rocket].position.x < this.parameter.maxRocketPosition.x && this.rockets[rocket].position.x > this.parameter.minRocketPosition.x && this.rockets[rocket].position.y < this.parameter.maxRocketPosition.y && this.rockets[rocket].position.y > this.parameter.minRocketPosition.y){
                this.rockets[rocket].position.y += this.rockets[rocket].userData.updateValuePositionY * deltaT;
                this.rockets[rocket].position.x += this.rockets[rocket].userData.updateValuePositionX * deltaT;

                this.rockets[rocket].position.clamp(this.parameter.minRocketPosition, this.parameter.maxRocketPosition);
            } else {
                if(this.rockets[rocket].scale.y > this.rocketReduction){
                    this.rockets[rocket].scale.y -= this.parameter.rocketReduction;
                    this.rockets[rocket].position.y += this.rockets[rocket].userData.updateValuePositionY;
                } else {
                    this.disposeRocket(rocket);
                }
            }
        }
    }

    disposeRocket(rocket){
        this.rockets[rocket].geometry.dispose()
        for (const key in this.rockets[rocket].material) {
            const value = this.rockets[rocket].material[key]
            if (value && typeof value.dispose === 'function') {
                value.dispose()
            }
            }
        this.scene.remove(this.rockets[rocket])
        this.rockets.splice(rocket, 1);
    }

    update(deltaT){
        this.movePlayer(deltaT);
        this.colliderObbUpdate();

        if(this.parameter.fireTimeCount == 0 && this.parameter.canShoot){
            this.lauchRocket();

            this.parameter.fireTimeCount = this.parameter.fireTime;
        } else {
            this.parameter.fireTimeCount -= 1;
        }

        if(this.rockets.length > 0){
            this.rocketsUpdate(deltaT)
        }

        this.playerSelector.update();
    }

}