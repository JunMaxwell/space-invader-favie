import * as THREE from "three";
import GUI from 'lil-gui';
import CollisionChecker from "./CollisionChecker.js";
import Enemies from "./Enemies/Enemies.js";

import Layout from "./GameLayout/Layout.js";
import PopUpManager from "./GameLayout/PopUpManager.js";
import GlobalParameter from "./GlobalParameter.js";
import Player from "./Player/Player.js";

export default class World {
    constructor(_options) {
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.renderer = _options.renderer;
        this.resources = _options.resources;
        this.debug = _options.debug;

        this.parameter = new GlobalParameter({
            world: this
        });
        this.popUp = new PopUpManager({ parameter: this.parameter });
    }

    ready() {
        this.layout = new Layout({
            scene: this.scene,
            parameter: this.parameter,
            resources: this.resources
        })

        this.player = new Player({
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            resources: this.resources,
            parameter: this.parameter
        })

        this.enemies = new Enemies({
            scene: this.scene,
            resources: this.resources,
            parameter: this.parameter,
            popUp: this.popUp,
            layout: this.layout,
            player: this.player
        })

        this.collisionChecker = new CollisionChecker({
            scene: this.scene,
            resources: this.resources,
            parameter: this.parameter,
            popUp: this.popUp,
            layout: this.layout,
            player: this.player,
            enemies: this.enemies
        })

        this.isReady = true;
    }

    update(deltaT) {
        this.parameter.update();

        if (this.isReady && this.parameter.canUpdate) {
            this.player.update(deltaT);
            this.collisionChecker.update();
            this.enemies.update(deltaT);
        }

    }

}