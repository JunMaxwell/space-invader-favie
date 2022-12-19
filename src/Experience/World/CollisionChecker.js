import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB";

export default class CollisionChecker {
    constructor(_options) {
        this.scene = _options.scene;
        this.resources = _options.resources;
        this.parameter = _options.parameter;
        this.popUp = _options.popUp;

        this.layout = _options.layout;
        this.player = _options.player.player;
        this.enemies = _options.enemies;
        this.enemiesList = _options.enemies.enemies;
    }

    checkCollision() {
        // Check collision between rocket and enemy
        // Destroy the enemy & destroy the rocket
        // Increment the waveDestroyed count if every enemy of a wave is destroyed
        // Detect when enemy wave get to the player level, if so loose a life point
        // Imagine an effect if rockets color is not same the enemy

    }

    destroyRocket(rockets, rocket) {
        rockets[rocket].userData.collided = true;

        rockets[rocket].geometry.dispose();
        for (const key in rockets[rocket].material) {
            const value = rockets[rocket].material[key]

            if (value && typeof value.dispose === 'function') {
                value.dispose()
            }
        }

        this.scene.remove(rockets[rocket])
        rockets.splice(rocket, 1);

    }

    rocketBounce(rocket) {
        rocket.userData.updateValuePositionY = this.parameter.rocketYSpeedAfterCollision;
        const xValue = (Math.random() - .5)
        rocket.userData.updateValuePositionX = xValue
        rocket.rotation.z = xValue
    }

    rocketDestroy(rocket) {

        if (!rocket.userData.destroyed) {
            rocket.geometry = rocket.userData.destroyedAsset.geometry;
            rocket.material = rocket.userData.destroyedAsset.material;

            rocket.userData.updateValuePositionY = this.parameter.rocketYSpeedAfterDestruction;
        }
        rocket.userData.destroyed = true;
    }

    checkCollisionBottom() {
        // Check if the enemies position is lower than the player position
        // If so, loose a life point
    }

    loseLifePoints() {

        this.parameter.lifeNumber -= this.parameter.enemyImpact;

        const iteration = this.parameter.enemyImpact;
        for (let i = 0; i < iteration; i++) {
            this.scene.remove(this.parameter.lifePoints[0][0], this.parameter.lifePoints[0][1]);
            this.parameter.lifePoints.splice(0, 1);
        }

        if (this.parameter.lifeNumber == 0) {

            this.layout.defeat.visible = true;
            this.parameter.canShoot = false;
            this.parameter.defeat = 200;

            this.layout.reloadTimer()
        }
    }

    update() {
        this.checkCollision()
        this.checkCollisionBottom();
    }
}