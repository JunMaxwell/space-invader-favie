import * as THREE from "three"

export const maxX = 10;
export const minX = -90;
export const maxY = 40;
export const minY = -40;
export const enemySize = 10;

export default class GlobalParameter {
    constructor(_options) {

        this.world = _options.world
        this.globalParameter();

        this.reset(0, 0);
    }

    // Set up
    globalParameter() {
        this.canUpdate = false;
        this.dead = false;

        this.secondPhase = false;
        this.setSecondPhase = false;

        this.defeat = 0;
        this.victory = 0;

        this.mouse = {}
        this.raycaster = new THREE.Raycaster();

        this.maxX = maxX;
        this.minX = minX;
        this.maxY = maxY;
        this.minY = minY;
    }

    reset(waveN, waveD) {
        this.waveNumber = waveN
        this.waveDestroyed = waveD;

        // Z Indexes
        this.backgroundZIndex = 0;
        this.elementZIndex = 0.1;

        this.layoutParameter();
        this.lifeParameter();

        this.playerParameter();
        this.selectorsParameter();

        this.enemyTypesParameter();
        this.enemiesWaveParmeter();
    }

    layoutParameter() {
        this.gameBackgroundGeometry = new THREE.PlaneGeometry(120, 90);
        this.gameBackgroundPosition = new THREE.Vector3(-40, 0, -20);

        this.selectorBackgroundGeometry = new THREE.PlaneGeometry(70, 40);
        this.selectorBackgroundPosition = new THREE.Vector3(60, 25, this.backgroundZIndex);

        this.lifeBackgroundGeometry = new THREE.PlaneGeometry(50, 10);
        this.lifeBackgroundPosition = new THREE.Vector3(60, -5, this.backgroundZIndex);
    }

    lifeParameter() {
        this.lifeNumber = 3;
        this.lifePoints = []

        this.lifeGeometry = new THREE.PlaneGeometry(6, 6);

        this.lifeColor1 = new THREE.Color('#84CB8B')
        this.lifeColor2 = new THREE.Color('#D6C765')
        this.lifeColor3 = new THREE.Color('#DA8C7D')

        this.lifeStartPosX = 78.75;
        this.lifeStartPosXDecrease = 7.5;
        this.lifePosXIncrease = 15;
    }

    playerParameter() {
        this.playerGeometry = new THREE.PlaneGeometry(17, 12);

        this.startPosition = new THREE.Vector3(-40, minY + 2, this.elementZIndex);
        this.minPosition = new THREE.Vector3(minX, minY + 2, this.elementZIndex);
        this.maxPosition = new THREE.Vector3(maxX, minY + 2, this.elementZIndex);

        this.rocketGeometry = new THREE.PlaneGeometry(1, 5);
        this.destroyedRocketGeometry = new THREE.PlaneGeometry(3, 5);

        this.canShoot = true;
        this.fireTime = 25;
        this.fireTimeCount = this.fireTime;

        this.rocketMaxY = maxY + 1;

        this.rocketYSpeed = 1;
        this.rocketYSpeedAfterCollision = -1;
        this.rocketYSpeedAfterDestruction = -.1;
        this.rocketXAngle = 0;

        this.minRocketPosition = new THREE.Vector3(minX - 6, minY - 1, this.elementZIndex);
        this.maxRocketPosition = new THREE.Vector3(maxX + 6, maxY + 1, this.elementZIndex);

        this.rocketReduction = .4;
    }

    selectorsParameter() {
        this.yellow = new THREE.Color(0xd6c765);
        this.red = new THREE.Color(0xda8c7d);
        this.blue = new THREE.Color(0x84c8cb);
        this.purple = new THREE.Color(0xb092cc);
        this.green = new THREE.Color(0x98d39d);
        this.darkBlue = new THREE.Color(0x405594);

        this.selectorOnePosition = new THREE.Vector3(40, 32.5, this.elementZIndex);
        this.selectorTwoPosition = new THREE.Vector3(60, 32.5, this.elementZIndex);
        this.selectorThreePosition = new THREE.Vector3(80, 32.5, this.elementZIndex);
        this.selectorFourPosition = new THREE.Vector3(50, 13.5, this.elementZIndex);
        this.selectorFivePosition = new THREE.Vector3(70, 13.5, this.elementZIndex);
    }

    enemyTypesParameter() {
        // Enemy parameters
        this.enemiesParameters = {};
        for (let i = 0; i < 8; i++) { // There are 8 types of viruses
            const enemy = {
                name: `virus_${i + 1}`,
                geometry: new THREE.PlaneGeometry(10.1, 9.5),
                ySpeed: (i + 1) * 0.01,
                xAngle: (i + 1) * 0.01,
                ySpeedAfterCollision: -1,
                ySpeedAfterDestruction: -.1,
                maxXPosition: maxX,
                minXPoisition: minX,
                maxYPosition: maxY,
                minYPoisition: minY,
                xOffset: 10,
            }
            this.enemiesParameters[enemy.name] = enemy;
        }
    }

    enemiesWaveParmeter() {
        const params = this;
        this.waveParameters = [
            {
                waveNumber: 1,
                waveColor: this.blue,
                totalNumberOfEnemies: 15,
                delayBetweenSteps: 200, // in ms
                enemyBehavior: [
                    {
                        type: `virus_1`,
                        total: 3,
                        startPosition: new THREE.Vector3(randomXPos(3), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_2`,
                        total: 4,
                        startPosition: new THREE.Vector3(randomXPos(4), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_3`,
                        total: 3,
                        startPosition: new THREE.Vector3(randomXPos(3), maxY, params.elementZIndex),
                        path: [...generatePath(3)],
                    },
                    {
                        type: `virus_1`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(2)],
                    },
                ]
            },
            {
                waveNumber: 2,
                waveColor: this.yellow,
                totalNumberOfEnemies: 20,
                delayBetweenSteps: 150, // in ms,
                enemyBehavior: [
                    {
                        type: `virus_4`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(6)],
                    },
                    {
                        type: `virus_5`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(6)],
                    },
                    {
                        type: `virus_6`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(6)],
                    },
                    {
                        type: `virus_5`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(6)],
                    }
                ]
            },
            {
                waveNumber: 3,
                waveColor: this.red,
                totalNumberOfEnemies: 25,
                delayBetweenSteps: 300, // in ms,
                enemyBehavior: [
                    {
                        type: `virus_7`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_8`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_2`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_7`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    },
                    {
                        type: `virus_8`,
                        total: 5,
                        startPosition: new THREE.Vector3(randomXPos(5), maxY, params.elementZIndex),
                        path: [...generatePath(5)],
                    }
                ]
            }
        ]

        function randomXPosition() {
            return Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        }

        function randomXPos(width) {
            const size = width * enemySize;
            const min = minX + size / 2;
            const max = maxX - size / 2;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function randomYPosition() {
            return Math.floor(Math.random() * (maxY - minY + 1)) + minY;
        }

        function generatePath(steps) {
            const path = [];
            const stepSize = Math.floor((maxY - minY) / steps);
            for (let i = 1; i <= steps; i++) {
                path.push(new THREE.Vector3(randomXPosition(), maxY - (stepSize * i), params.elementZIndex));
            }

            if (path[path.length - 1].y != minY) {
                path.push(new THREE.Vector3(randomXPosition(), minY, params.elementZIndex));
            }
            return path;
        }
    }

    // Dynamic

    getMousePosition(mouse, _event) {
        mouse.x = (_event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (_event.clientY / window.innerHeight) * 2 + 1;

        return mouse
    }

    setVictory() {
        if (this.victory == 1) {
            this.canUpdate = false;

            console.log('win')
        }
        this.victory -= 1;
    }

    update() {
        if (this.waveDestroyed == 3 && !this.setSecondPhase) {
            document.getElementById('popUp').style.visibility = 'visible'

            this.setSecondPhase = true;
            this.canUpdate = false;
            this.secondPhase = true;
        }

        if (this.waveDestroyed == 5 && !this.victoryLock) {
            this.world.player.playerSelector.removeSelector();
            this.world.layout.victory.visible = true;
            this.victory = 200;
            this.victoryLock = true
        }

        if (this.victory > 0) {
            this.setVictory();
        }

        if (this.secondPhase && !this.hyperBadGuys) {
            this.hyperBadGuys = true;
            this.enemyImpact = 3;
            this.spawnTime = this.phaseTwoWaveNumber * this.spawnFrequency;
        }
    }

}