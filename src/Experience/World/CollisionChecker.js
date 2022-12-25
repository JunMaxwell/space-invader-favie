import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB";

export default class CollisionChecker {
    constructor(_options) {
        this.scene = _options.scene;
        this.resources = _options.resources;
        this.parameter = _options.parameter;
        this.popUp = _options.popUp;

        this.layout = _options.layout;
        this.player = _options.player;
        this.enemyController = _options.enemies;
        this.enemiesList = _options.enemies.enemies;
    }

    checkCollision() {
        // Check collision between rocket and enemy
        // Destroy the enemy & destroy the rocket
        // Increment the waveDestroyed count if every enemy of a wave is destroyed
        // Detect when enemy wave get to the player level, if so loose a life point
        // Imagine an effect if rockets color is not same the enemy

        const { rockets } = this.player;

        if (!this.enemyController.activeGroup || rockets?.length < 1) return;
        this.enemyController.activeGroup.flying.forEach(enemyGroup => {
            for (let i = 0; i < rockets.length; i++) {
                const rocket = rockets[i];
                if (rocket.userData.collided) continue;
                const rocketOBB = rocket.userData.obb;
                for (const enemy of enemyGroup.children) {
                    const { obb } = enemy.userData;
                    if (rocketOBB.intersectsOBB(obb)) {
                        this.rocketHit(rocket);
                    }
                }
            }
        })
    }

    rocketHit(rocket) {
        console.log("Hit")
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
        if (!this.enemyController.activeGroup) return;
        if (this.enemyController.activeGroup.reached && this.enemyController.activeGroup.reached.length > 0) {
            this.enemyController.activeGroup.reached.forEach((enemyGroup) => {
                if (enemyGroup.position.y < this.parameter.minY && this.parameter.defeat !== 200) {
                    let enemyImpact = this.parameter.enemyImpact ?? 1;
                    this.loseLifePoints(enemyImpact);
                    this.enemyController.activeGroup.reached.splice(this.enemyController.activeGroup.reached.indexOf(enemyGroup), 1);
                    this.scene.remove(enemyGroup);
                }
            })
        }
    }

    loseLifePoints(enemyImpact) {

        this.parameter.lifeNumber -= enemyImpact;

        const iteration = enemyImpact;
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