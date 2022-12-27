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

        let { rockets } = this.player;

        if (!this.enemyController.activeEnemies || rockets?.length < 1) return;
        this.enemyController.activeEnemies.flying.forEach(enemy => {
            for (let i in rockets) {
                const rocket = rockets[i];
                if (!rocket.userData.collided || !rocket.userData.destroyed) {
                    const { obb } = enemy.userData;
                    const rocketOBB = rocket.userData.obb;
                    if (rocketOBB.intersectsOBB(obb)) {
                        this.rocketHit(rocket, enemy);
                    }
                }
            }
        })
    }

    rocketHit(rocket, enemy) {
        if (enemy.userData.destroyed || rocket.userData.collided || rocket.userData.destroyed) return;

        if (colorCompare(rocket.userData.color, enemy.userData.color)) {
            this.rocketDestroy(rocket);
            this.enemyDestroy(enemy);
        } else {
            this.rocketBounce(rocket);
        }

        function colorCompare(color1, color2) {
            return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b
        }
    }

    destroyRocket(rockets, rocket) {
        if (!rockets[rocket] | rockets[rocket].userData.destroyed) return;
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

    enemyDestroy(enemy) {
        this.enemyController.destroyEnemy(enemy);
    }

    checkCollisionBottom() {
        if (!this.enemyController.activeEnemies) return;
        if (this.enemyController.activeEnemies.reached && this.enemyController.activeEnemies.reached.length > 0) {
            this.enemyController.activeEnemies.reached.forEach((enemy) => {
                if (enemy.position.y < this.parameter.minY && this.parameter.defeat !== 200) {
                    let enemyImpact = this.parameter.enemyImpact ?? 1;
                    this.loseLifePoints(enemyImpact);
                    this.enemyController.activeEnemies.reached.splice(this.enemyController.activeEnemies.reached.indexOf(enemyGroup), 1);
                    this.scene.remove(enemy);
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