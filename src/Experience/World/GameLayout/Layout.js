import * as THREE from "three"
import LifePoints from "./LifePoints";

export default class Layout {
    constructor(_options) {
        this.scene = _options.scene;
        this.parameter = _options.parameter;
        this.resources = _options.resources;

        this.setSceneBackground();
        this.setGameBackground();
        this.setSelectorBackground();
        this.setLifeBackground();
        this.setVictory();
        this.setDefeat();

    }

    setSceneBackground() {
        const background = document.getElementById('background-video')
        this.scene.background = new THREE.VideoTexture(background)
    }

    setGameBackground() {
        const gameBackgroundAsset = document.getElementById('game-background-video');
        const gameBackgroundTexture = new THREE.VideoTexture(gameBackgroundAsset)
        // gameBackgroundAsset.magFilter = THREE.NearestFilter;

        this.gameBackground = new THREE.Mesh(this.parameter.gameBackgroundGeometry, new THREE.MeshBasicMaterial({ map: gameBackgroundTexture, transparent: true }))
        this.gameBackground.position.copy(this.parameter.gameBackgroundPosition);
        this.scene.add(this.gameBackground);
    }

    setSelectorBackground() {
        const selectorBackgroundAsset = document.getElementById('selector-background-video');
        const selectorBackgroundTexture = new THREE.VideoTexture(selectorBackgroundAsset)
        // selectorBackgroundAsset.magFilter = THREE.NearestFilter;

        this.selectorBackground = new THREE.Mesh(this.parameter.selectorBackgroundGeometry, new THREE.MeshBasicMaterial({ map: selectorBackgroundTexture, transparent: true }))
        this.selectorBackground.position.copy(this.parameter.selectorBackgroundPosition);
        this.scene.add(this.selectorBackground)
    }

    setLifeBackground() {
        const lifeBackgroundAsset = this.resources.items.lifeBackground;

        this.lifeBackground = new THREE.Mesh(this.parameter.lifeBackgroundGeometry, new THREE.MeshBasicMaterial({ map: lifeBackgroundAsset, transparent: true }))
        this.lifeBackground.position.copy(this.parameter.lifeBackgroundPosition);
        this.scene.add(this.lifeBackground)

        this.setlifePoints();
    }

    setlifePoints() {
        this.lifePoints = new LifePoints({
            scene: this.scene,
            parameter: this.parameter
        })
    }

    setVictory() {
        this.TextureAnimator(this.resources.items.bravo, 1, 2, 300);
        this.victory = new THREE.Mesh(this.parameter.selectorBackgroundGeometry, new THREE.MeshBasicMaterial({ map: this.resources.items.bravo, transparent: true }))
        this.victory.position.copy(this.parameter.selectorBackgroundPosition)
        this.victory.position.z = 2;
        this.victory.visible = false;
        this.scene.add(this.victory);
    }

    setDefeat() {
        this.TextureAnimator(this.resources.items.game_over, 1, 2, 300);
        this.defeat = new THREE.Mesh(this.parameter.selectorBackgroundGeometry, new THREE.MeshBasicMaterial({ map: this.resources.items.game_over, transparent: true }))
        this.defeat.position.copy(this.parameter.selectorBackgroundPosition)
        this.defeat.position.z = 2;

        const button = new THREE.Mesh(this.parameter.lifeBackgroundGeometry, new THREE.MeshBasicMaterial({ map: this.resources.items.retry_button, transparent: true }));
        button.position.set(this.parameter.lifeBackgroundPosition.x, this.parameter.lifeBackgroundPosition.y, 2)
        this.defeat.attach(button)
        this.defeat.visible = false;

        this.scene.add(this.defeat);
    }

    // source: http://stemkoski.github.io/Three.js/Texture-Animation.html
    TextureAnimator(texture, tilesHoriz, tilesVert, tileDispDuration) {
        let obj = {};

        obj.texture = texture;
        obj.tilesHorizontal = tilesHoriz;
        obj.tilesVertical = tilesVert;
        obj.tileDisplayDuration = tileDispDuration;

        obj.numberOfTiles = tilesHoriz * tilesVert;

        obj.texture.wrapS = THREE.RepeatWrapping;
        obj.texture.wrapT = THREE.RepeatWrapping;
        obj.texture.repeat.set(1 / tilesHoriz, 1 / tilesVert);
        obj.currentTile = 0;

        obj.nextFrame = function () {
            obj.currentTile++;
            if (obj.currentTile == obj.numberOfTiles)
                obj.currentTile = 0;

            let currentColumn = obj.currentTile % obj.tilesHorizontal;
            obj.texture.offset.x = currentColumn / obj.tilesHorizontal;

            let currentRow = Math.floor(obj.currentTile / obj.tilesHorizontal);
            obj.texture.offset.y = obj.tilesVertical - currentRow / obj.tilesVertical;
        }

        obj.start = function () { obj.intervalID = setInterval(obj.nextFrame, obj.tileDisplayDuration); }

        obj.stop = function () { clearInterval(obj.intervalID); }

        obj.start();
        return obj;
    }

    reloadTimer() {
        this.clickDown = (_event) => {
            this.parameter.getMousePosition(this.parameter.mouse, _event)

            this.parameter.raycaster.setFromCamera(this.parameter.mouse, this.parameter.world.camera);

            this.intersects = this.parameter.raycaster.intersectObjects(this.defeat.children, true);

            if (this.intersects[0] !== undefined) {
                this.defeat.children[0].material.map = this.resources.items.retry_button_clicked
            }

        }

        this.clickUp = (_event) => {
            this.parameter.getMousePosition(this.parameter.mouse, _event)

            this.parameter.raycaster.setFromCamera(this.parameter.mouse, this.parameter.world.camera);

            this.intersects = this.parameter.raycaster.intersectObjects(this.defeat.children, true);

            if (this.intersects[0] !== undefined) {

                this.defeat.visible = false;
                this.defeat.children[0].material.map = this.resources.items.retry_button

                if (!this.parameter.secondPhase) {
                    this.parameter.reset(0, 0);
                    this.setlifePoints()
                } else {
                    this.parameter.reset(3, 3);
                    this.setlifePoints()
                }


                document.addEventListener('mousemove', this.pointerUpdate);
                document.removeEventListener('mousedown', this.clickDown);
                document.removeEventListener('mouseup', this.clickUp);

            }

        }

        this.pointerUpdate = (_event) => {
            this.parameter.getMousePosition(this.parameter.mouse, _event)

            this.parameter.raycaster.setFromCamera(this.parameter.mouse, this.parameter.world.camera);

            this.intersects = this.parameter.raycaster.intersectObjects(this.defeat.children, true);

            if (this.intersects[0] !== undefined) {
                document.querySelector('canvas.webgl').style.cursor = "pointer"
            } else {
                document.querySelector('canvas.webgl').style.cursor = "default"
            }
        }

        document.addEventListener('mousemove', this.pointerUpdate)
        document.addEventListener('mousedown', this.clickDown);
        document.addEventListener('mouseup', this.clickUp);
    }

}