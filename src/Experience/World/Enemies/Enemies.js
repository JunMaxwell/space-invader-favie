import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";

export default class Enemies {
    constructor(_options) {
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.renderer = _options.renderer;
        this.resources = _options.resources;
        this.parameter = _options.parameter;
        this.layout = _options.layout;
        this.player = _options.player;
        this.layout.SetDelegate({
            onReset: () => { this.reset() }
        })
        this.reset();
    }

    reset() {
        this.removeActivesFromScene();
        this.waves = [];
        this.enemies = [];
        for (let i = 0; i < 3; i++) {
            let waveParameters = this.parameter.waveParameters[i]
            const wave = this.createWave(waveParameters);
            this.waves.push(wave);
        }

        this.waveController = {
            activeWave: 0,
            totalWaves: this.waves.length,
            delayBetweenWaves: 3000
        }

        this.delegate = {

        }
    }

    getUpdatedEnemy(uuid) {
        return this.enemies.find(enemy => enemy.uuid === uuid)
    }

    removeActivesFromScene() {
        if (this.activeEnemies) {
            this.activeEnemies.reached.forEach(enemyGroup => {
                this.scene.remove(enemyGroup);
            });
            this.activeEnemies.dead.forEach(enemyGroup => {
                this.scene.remove(enemyGroup);
            })
            delete this.activeEnemies;
        }

        if (this.waves && this.waves.length > 0) {
            this.waves.forEach(wave => {
                wave.enemies.forEach(enemy => {
                    this.scene.remove(enemy);
                })
            })
        }
    }

    createEnemy(_enemy) {
        const geometry = _enemy.geometry;
        const material = new THREE.MeshBasicMaterial({ map: this.resources.items[_enemy.name], color: _enemy.waveColor, transparent: true });

        const enemy = new THREE.Mesh(geometry, material);
        enemy.name = _enemy.name;
        // enemy.position.copy(this.parameter.waveParameters[0].minPosition)

        geometry.computeBoundingBox();
        enemy.geometry.userData.obb = new OBB().fromBox3(enemy.geometry.boundingBox);
        enemy.userData.obb = new OBB();

        enemy.userData.collided = false;
        enemy.userData.reflected = false;
        enemy.userData.destroyed = false;
        enemy.userData.color = _enemy.waveColor;
        enemy.userData.updateValuePositionY = _enemy.ySpeed;
        enemy.userData.updateValuePositionX = _enemy.xAngle;
        enemy.userData.waveNumber = _enemy.waveNumber;
        enemy.userData.maxPosition = {
            x: _enemy.maxXPosition,
            y: _enemy.maxYPosition
        };
        enemy.userData.minPosition = {
            x: _enemy.minXPoisition,
            y: _enemy.minYPoisition
        };
        enemy.userData.isAlive = true;

        this.enemies.push(enemy);
        return enemy
    }

    destroyEnemy(_enemy) {
        _enemy.userData.destroyed = true;
        _enemy.userData.isAlive = false;
        _enemy.material.color.setHex(0x000000);
        _enemy.geometry.dispose();
        for (const key in _enemy.material) {
            const value = _enemy.material[key];
            if (value && typeof value.dispose === "function") {
                value.dispose();
            }
        }

        this.scene.remove(_enemy);
        this.enemies = this.enemies.filter(enemy => enemy.uuid !== _enemy.uuid);

        if (this.activeEnemies) {
            this.activeEnemies.flying.filter(enemy => enemy.uuid !== _enemy.uuid);
            this.activeEnemies.reached.filter(enemy => enemy.uuid !== _enemy.uuid);

            if (!this.activeEnemies.dead.includes(_enemy)) {
                this.activeEnemies.dead.push(_enemy);
                this.activeEnemies.hit = this.activeEnemies.dead.length;
            }
        }
    }

    createWave(_wave) {
        const controller = this;
        const wave = {
            waveNumber: _wave.waveNumber,
            waveColor: _wave.waveColor,
            delayBetweenSteps: _wave.delayBetweenSteps,
            enemies: []
        };

        for (let i = 0; i < _wave.enemyBehavior.length; i++) {
            const { type, total, startPosition, path } = _wave.enemyBehavior[i];
            const enemyParam = {
                ...controller.parameter.enemiesParameters[type],
                name: type,
                waveNumber: _wave.waveNumber,
                waveColor: _wave.waveColor,
            };

            const enemy = controller.createEnemy(enemyParam);
            enemy.position.copy(startPosition);
            enemy.userData.path = path;
            enemy.userData.steps = path.length;
            enemy.userData.currentStep = 0;
            enemy.userData.delayBetweenSteps = _wave.delayBetweenSteps;
            enemy.userData.isAlive = true;

            wave.enemies.push(enemy);
            // enemies.scene.add(enemyGroup);
        }

        return wave;
    }

    incrementWaveDestroyed() {
        console.log("incrementWaveDestroyed")
    }

    moveEnemyGroupToDestination(_enemy, destination, deltaT, onReached) {
        const { delayBetweenSteps } = _enemy.userData;
        const speed = 1 / delayBetweenSteps;
        const distance = _enemy.position.distanceTo(destination);
        const t = 1.0 - Math.pow(0.1, deltaT * speed);
        _enemy.position.lerp(destination, t);

        if (distance < 0.01) {
            onReached();
        }
    }

    updateEnemyWave(_wave, deltaT) {
        if (!this.activeEnemies)
            this.activeEnemies = {
                total: _wave.enemies.length,
                alive: _wave.enemies.length,
                dead: [],
                reached: [],
                flying: [..._wave.enemies],
                hit: 0,
            };

        const { enemies } = _wave;

        if (this.activeEnemies.alive < 0
            || this.activeEnemies.hit === this.activeEnemies.total
            || this.activeEnemies.reached.length === this.activeEnemies.total
            || this.activeEnemies.dead.length === this.activeEnemies.total) {
            enemies.forEach(enemy => {
                setTimeout(() => {
                    this.scene.remove(enemy);
                }, 1000);
            });
            
            this.waveController.activeWave++;
            return;
        }

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!this.activeEnemies.dead.includes(enemy) && !this.activeEnemies.reached.includes(enemy)) {
                if (!enemy.parent || !enemy.parent.isScene) {
                    this.scene.add(enemy);
                }
            }
            const { currentStep, steps, path, isAlive } = enemy.userData;

            if (isAlive) {
                if (currentStep < steps) {
                    const destination = path[currentStep];
                    this.moveEnemyGroupToDestination(enemy, destination, deltaT, () => {
                        enemy.userData.currentStep++;
                    });
                } else {
                    if (!this.activeEnemies.reached.includes(enemy)) {
                        this.activeEnemies.hit++;
                        this.activeEnemies.reached.push(enemy);
                        this.activeEnemies.flying.splice(this.activeEnemies.flying.indexOf(enemy), 1);
                    }
                }
            } else {
                if (!this.activeEnemies.dead.includes(enemy) && !this.activeEnemies.reached.includes(enemy)) {
                    this.activeEnemies.alive--;
                    this.activeEnemies.dead.push(enemy);
                    this.activeEnemies.flying.splice(this.activeEnemies.flying.indexOf(enemy), 1);
                }
            }
        }
    }

    update(deltaT) {
        // Wait for the first wave to be ready
        if (!this.waves || this.waves.length === 0) return;

        setTimeout(() => {
            const wave = this.waves[this.waveController.activeWave];
            console.log({
                activeWave: this.waveController.activeWave,
                wave
            })
            if (!wave) return;
            this.updateEnemyWave(wave, deltaT);
        }, this.waveController.delayBetweenWaves) // 3 seconds
    }
}
