import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";

export default class Enemies {
    constructor(_options) {
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.renderer = _options.renderer;
        this.resources = _options.resources;
        this.parameter = _options.parameter;

        console.log(
            {
                resources: this.resources,
                parameter: this.parameter
            }
        )

        this.waves = [];
        for (let i = 0; i < this.parameter.waveParameters.length; i++) {
            const wave = this.createWave(this.parameter.waveParameters[i]);
            this.waves.push(wave);
        }

        console.log(this.waves);
    }

    createEnemy(_enemy, wave) {
        const geometry = _enemy.geometry;
        const material = new THREE.MeshBasicMaterial({ map: this.resources.items[_enemy.name], color: wave.waveColor, transparent: true });

        const enemy = new THREE.Mesh(geometry, material);
        enemy.name = _enemy.name;
        // enemy.position.copy(this.parameter.waveParameters[0].minPosition)

        geometry.computeBoundingBox();
        enemy.geometry.userData.obb = new OBB().fromBox3(enemy.geometry.boundingBox);
        enemy.userData.obb = new OBB();

        enemy.userData.collided = false;
        enemy.userData.reflected = false;
        enemy.userData.destroyed = false;
        enemy.userData.updateValuePositionY = _enemy.ySpeed;
        enemy.userData.updateValuePositionX = _enemy.xAngle;
        enemy.userData.waveNumber = wave.waveNumber;

        // console.log(enemy);
        // this.scene.add(enemy);
        return enemy
    }

    createWave(_wave) {
        const wave = {
            enemies: [],
            startPosition: _wave.startPosition,
            endPostion: _wave.endPostion,
            minPosition: _wave.minPosition,
            maxPosition: _wave.maxPosition,
            enemiesNumber: _wave.enemiesNumber,
            waveNumber: _wave.waveNumber,
            isFinished: false,
            isActive: false
        }

        switch (wave.waveNumber) {
            case 1:
                wave.waveColor = this.parameter.blue;
                break;
            case 2:
                wave.waveColor = this.parameter.yellow;
                break;
            case 3:
                wave.waveColor = this.parameter.red;
                break;
        }

        for (let i = 0; i < wave.enemiesNumber; i++) {
            const randomIndex = Math.floor(Math.random() * this.parameter.enemiesParameters.length);
            const enemyType = this.parameter.enemiesParameters[randomIndex];
            const enemy = this.createEnemy(enemyType, wave);
            enemy.position.copy(wave.startPosition);
            this.scene.add(enemy);
            wave.enemies.push(enemy);
        }

        return wave;
    }
    moveEnemy(_enemy, deltaT) {
        _enemy.position.y -= _enemy.userData.updateValuePositionY * deltaT;
        _enemy.position.x -= _enemy.userData.updateValuePositionX * deltaT;

        if (_enemy.position.y > this.parameter.waveParameters[_enemy.userData.waveNumber].maxPosition.y) {
            _enemy.userData.updateValuePositionY = -_enemy.userData.updateValuePositionY;
        }
        if (_enemy.position.y < this.parameter.waveParameters[_enemy.userData.waveNumber].minPosition.y) {
            _enemy.userData.updateValuePositionY = -_enemy.userData.updateValuePositionY;
        }

        if (_enemy.position.x > this.parameter.waveParameters[_enemy.userData.waveNumber].maxPosition.x) {
            _enemy.userData.updateValuePositionX = -_enemy.userData.updateValuePositionX;
        }
        if (_enemy.position.x < this.parameter.waveParameters[_enemy.userData.waveNumber].minPosition.x) {
            _enemy.userData.updateValuePositionX = -_enemy.userData.updateValuePositionX;
        }
    }

    updateEnemy(_enemy, deltaT) {
        if (_enemy.userData.destroyed) {
            this.scene.remove(_enemy);
            return;
        }

        this.moveEnemy(_enemy, deltaT);

        _enemy.userData.obb.copy(_enemy.geometry.userData.obb);
        _enemy.userData.obb.applyMatrix4(_enemy.matrixWorld);
    }

    update(deltaT) {
        // First wave
        for (let i = 0; i < this.waves[0].enemies.length; i++) {
            this.updateEnemy(this.waves[0].enemies[i], deltaT);
        }
    }
}
