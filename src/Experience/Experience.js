import * as THREE from "three";

// Utils
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Resources from "./Utils/Resources.js";
import sources from "./sources.js";
import Debug from "./Utils/Debug.js";

// Experience
import Camera from "./Camera.js"
import Renderer from "./Renderer.js";

// World
import World from "./World/World.js";


export default class Experience 
{
    constructor(canvas){
        window.experience = this;
        this.canvas = canvas;

        // options
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.debug = new Debug();

        // Setup
        this.camera = new Camera({
            canvas: this.canvas,
            scene: this.scene,
            sizes: this.sizes
        });

        this.renderer = new Renderer({
            canvas: this.canvas,
            scene: this.scene,
            sizes: this.sizes,
            camera: this.camera
        });

        this.world = new World({
            scene: this.scene,
            camera: this.camera.instance,
            renderer: this.renderer.instance,
            resources: this.resources,
            debug: this.debug
        });

        // Events
        if(this.resources.toLoad !== 0){
            this.resources.on('ready', () => {
                this.ready();
            })
        } else {
            this.ready();
        }
        this.sizes.on('resize', () => {
            this.resize();
        })
        this.time.on('update', () => {
            this.update();
        })

    }

    ready(){
        this.world.ready();
    }

    resize(){
        this.camera.resize();
        this.renderer.resize();
    }

    update(){
        this.camera.update();
        this.renderer.update();
        this.world.update(this.time.deltaTime);
    }
}