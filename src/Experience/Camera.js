import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default class Camera
{
    constructor(_options){

        this.canvas = _options.canvas;
        this.scene = _options.scene;
        this.sizes = _options.sizes;

        this.setInstance();
        // this.setOrbitControl();
    }

    setInstance(){
        this.instance = new THREE.OrthographicCamera(100 * this.sizes.aspect / -2, 100 * this.sizes.aspect / 2, 100 / 2, 100/ -2, 0.1, 1000);
        this.instance.position.z = 10
        this.scene.add(this.instance);
    }

    setOrbitControl(){
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
    }

    resize(){
        // this.instance.aspect = this.sizes.width / this.sizes.height;
        // this.instance.updateProjectionMatrix();
    }

    update(){
        // this.controls.update();
    }

}

