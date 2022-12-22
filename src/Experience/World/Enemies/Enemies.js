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
        if (this.activeGroup) {
            this.activeGroup.reached.forEach(enemyGroup => {
                this.scene.remove(enemyGroup);
            });
            this.activeGroup.dead.forEach(enemyGroup => {
                this.scene.remove(enemyGroup);
            })
            delete this.activeGroup;
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

    createWave(_wave) {
        const enemies = this;
        const wave = {
            waveNumber: _wave.waveNumber,
            waveColor: _wave.waveColor,
            delayBetweenSteps: _wave.delayBetweenSteps,
            enemies: []
        };

        for (let i = 0; i < _wave.enemyBehavior.length; i++) {
            const { type, total, startPosition, path } = _wave.enemyBehavior[i];
            const enemyParam = {
                ...enemies.parameter.enemiesParameters[type],
                name: type,
                waveNumber: _wave.waveNumber,
                waveColor: _wave.waveColor,
            };
            const enemyGroup = new THREE.Group();
            enemyGroup.name = type + "_group";
            enemyGroup.position.copy(startPosition);
            enemyGroup.userData.path = path;
            enemyGroup.userData.steps = path.length;
            enemyGroup.userData.currentStep = 0;
            enemyGroup.userData.delayBetweenSteps = _wave.delayBetweenSteps;
            enemyGroup.userData.isAlive = true;

            for (let j = 0; j < total; j++) {
                const enemyMesh = enemies.createEnemy(enemyParam);
                enemyMesh.position.x = enemyParam.xOffset / 2 * j;
                enemyGroup.add(enemyMesh);
            }

            wave.enemies.push(enemyGroup);
            // enemies.scene.add(enemyGroup);
        }

        return wave;
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
        if (!this.activeGroup)
            this.activeGroup = {
                total: _wave.enemies.length,
                alive: _wave.enemies.length,
                dead: [],
                reached: [],
                hit: 0,
            };

        const { enemies } = _wave;

        if (this.activeGroup.alive === 0 || this.activeGroup.hit === this.activeGroup.total) {
            this.waveController.activeWave++;
            enemies.forEach(enemyGroup => {
                setTimeout(() => {
                    this.scene.remove(enemyGroup);
                }, 1000);
            });
            this.removeActivesFromScene();
            return;
        }

        for (let i = 0; i < enemies.length; i++) {
            const enemyGroup = enemies[i];
            if (!this.activeGroup.dead.includes(enemyGroup) && !this.activeGroup.reached.includes(enemyGroup)) {
                if (!enemyGroup.parent || !enemyGroup.parent.isScene) {
                    this.scene.add(enemyGroup);
                }
            }
            const { currentStep, steps, path, isAlive } = enemyGroup.userData;

            if (isAlive) {
                if (currentStep < steps) {
                    const destination = path[currentStep];
                    this.moveEnemyGroupToDestination(enemyGroup, destination, deltaT, () => {
                        enemyGroup.userData.currentStep++;
                    });
                } else {
                    if (!this.activeGroup.reached.includes(enemyGroup)) {
                        this.activeGroup.hit++;
                        this.activeGroup.reached.push(enemyGroup);
                    }
                }
            } else {
                if (!this.activeGroup.dead.includes(enemyGroup) && !this.activeGroup.reached.includes(enemyGroup)) {
                    this.activeGroup.alive--;
                    this.activeGroup.dead.push(enemyGroup);
                }
            }
        }
    }

    update(deltaT) {
        // Wait for the first wave to be ready
        if (!this.waves || this.waves.length === 0) return;

        setTimeout(() => {
            const wave = this.waves[this.waveController.activeWave];
            this.updateEnemyWave(wave, deltaT);
        }, this.waveController.delayBetweenWaves) // 3 seconds
    }
}
