import * as THREE from "three"

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

        this.enemyParameter();
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

        this.startPosition = new THREE.Vector3(-40, -38, this.elementZIndex);
        this.minPosition = new THREE.Vector3(-90, -38, this.elementZIndex);
        this.maxPosition = new THREE.Vector3(10, -38, this.elementZIndex);

        this.rocketGeometry = new THREE.PlaneGeometry(1, 5);
        this.destroyedRocketGeometry = new THREE.PlaneGeometry(3, 5);

        this.canShoot = true;
        this.fireTime = 25;
        this.fireTimeCount = this.fireTime;

        this.rocketMaxY = 41;

        this.rocketYSpeed = 1;
        this.rocketYSpeedAfterCollision = -1;
        this.rocketYSpeedAfterDestruction = -.1;
        this.rocketXAngle = 0;

        this.minRocketPosition = new THREE.Vector3(-96, -41, this.elementZIndex);
        this.maxRocketPosition = new THREE.Vector3(16, 41, this.elementZIndex);

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

    enemyParameter() {
        // Enemy parameters
        this.enemiesParameters = [];
        for (let i = 0; i < 8; i++) { // There are 8 types of viruses
            const enemy = {
                name: `virus_${i + 1}`,
                geometry: new THREE.PlaneGeometry(10.1, 9.5),
                ySpeed: (i + 1) * 0.01,
                xAngle: (i + 1) * 0.01,
                ySpeedAfterCollision: -1,
                ySpeedAfterDestruction: -.1,
            }
            this.enemiesParameters.push(enemy);
        }
    }

    enemiesWaveParmeter() {
        this.randomXPosition = () => Math.floor(Math.random() * (10 - -90 + 1)) + -90;
        this.waveParameters = [];
        for (let i = 0; i < 3; i++) { // 3 Waves following instructions
            const wave = {
                name: `Wave_${i + 1}`,
                startPosition: new THREE.Vector3(this.randomXPosition(), 42, this.elementZIndex),
                endPosition: new THREE.Vector3(-40, -42, this.elementZIndex),
                minPosition: new THREE.Vector3(-96, -42, this.elementZIndex),
                maxPosition: new THREE.Vector3(16, 42, this.elementZIndex),
                enemiesNumber: (i + 1) * 5,
                waveNumber: i + 1,
            }
            this.waveParameters.push(wave);
        }

        // Random int between min: -90 and max: 10
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