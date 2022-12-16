import * as THREE from "three";

import { DragControls } from "three/examples/jsm/controls/DragControls.js"

export default class PlayerSelector {
    constructor(_options){
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.renderer = _options.renderer;

        this.parameter = _options.parameter;

        this.player = _options.player;
        this.playerAsset = _options.playerAsset;
        this.hiddenAsset = _options.hiddenAsset;

        this.mouse = _options.mouse;
        this.raycaster = _options.raycaster;

        this.selectorsList = []
        this.selectorsListPhase2 = []

        this.setUpPlayerSelector();

        this.setSelectorClick();

    }

    setUpPlayerSelector(){
        this.setGeometry();
        this.setMaterial();
        this.setPlayerSelector();
        this.setHiddenSelector();
    }

    setGeometry(){
        this.geometry = this.parameter.playerGeometry;
    }

    setMaterial(){
        this.material1 = new THREE.MeshBasicMaterial({map: this.playerAsset, color: this.parameter.blue, transparent: true})
        this.material2 = new THREE.MeshBasicMaterial({map: this.playerAsset, color: this.parameter.yellow, transparent: true})
        this.material3 = new THREE.MeshBasicMaterial({map: this.playerAsset, color: this.parameter.red, transparent: true})
        this.material4 = new THREE.MeshBasicMaterial({map: this.playerAsset, color: this.parameter.green, transparent: true})
        this.material5 = new THREE.MeshBasicMaterial({map: this.playerAsset, color: this.parameter.purple, transparent: true})
        this.materialH = new THREE.MeshBasicMaterial({map: this.hiddenAsset, transparent: true})
    }

    setPlayerSelector(){
        this.selector1 = new THREE.Mesh(this.geometry, this.material1)
        this.selector1.userData.position = this.parameter.selectorOnePosition
        this.selector1.position.copy(this.selector1.userData.position)

        this.selector2 = new THREE.Mesh(this.geometry, this.material2)
        this.selector2.userData.position = this.parameter.selectorTwoPosition
        this.selector2.position.copy(this.selector2.userData.position)

        this.selector3 = new THREE.Mesh(this.geometry, this.material3)
        this.selector3.userData.position = this.parameter.selectorThreePosition
        this.selector3.position.copy(this.selector3.userData.position)

        this.selectorsList.push(this.selector1,this.selector2, this.selector3) 

        this.scene.add(this.selector1, this.selector2, this.selector3)
    }
    
    setHiddenSelector(){
        this.selector4 = new THREE.Mesh(this.geometry, this.materialH)
        this.selector4.userData.position = this.parameter.selectorFourPosition
        this.selector4.position.copy(this.selector4.userData.position)

        this.selector5 = new THREE.Mesh(this.geometry, this.materialH)
        this.selector5.userData.position = this.parameter.selectorFivePosition
        this.selector5.position.copy(this.selector5.userData.position)
        
        this.scene.add(this.selector4, this.selector5)
    }

    updateColorSelector(color){
        this.player.updatePlayer(color)
    }

    setSelectorClick(){

        this.selectorColor = (_event) => {
            this.parameter.getMousePosition(this.mouse,_event)

            this.raycaster.setFromCamera( this.mouse, this.camera);

            if(!this.parameter.secondPhase){
                this.intersects = this.raycaster.intersectObjects(this.selectorsList, true);
            } else {
                this.intersects = this.raycaster.intersectObjects(this.selectorsListPhase2, true);
            }

            if(this.intersects[0] !== undefined){

                this.player.updatePlayer(this.intersects[0].object.material.color)
            }
        }

        this.pointerUpdate = (_event) => {
            this.parameter.getMousePosition(this.mouse,_event)

            this.raycaster.setFromCamera( this.mouse, this.camera);

            this.intersects1 = this.raycaster.intersectObjects(this.selectorsList, true);
            this.intersects2 = this.raycaster.intersectObjects(this.selectorsListPhase2, true);
            this.intersects3 = this.raycaster.intersectObjects(this.player.controller.keys, true)
           
            if(this.intersects1.length > 0 || this.intersects2.length > 0 || this.intersects3.length > 0){
                document.querySelector('canvas.webgl').style.cursor = "pointer"
            } else {
                document.querySelector('canvas.webgl').style.cursor = "default"
                if(!this.parameter.secondPhase){
                   
                }
            }
        }

        document.addEventListener('mousemove', this.pointerUpdate)
        document.addEventListener('click', this.selectorColor)
    }

    removeSelector(){
        document.removeEventListener('mousemove', this.pointerUpdate)
        document.removeEventListener('click', this.selectorColor)
    }

    dragSelector(){
        const controls = new DragControls( this.selectorsList, this.camera, this.renderer.domElement );


        this.dragRaycast = (_event) => {
            this.parameter.getMousePosition(this.mouse,_event)

            this.raycaster.setFromCamera( this.mouse, this.camera);

            const intersects = this.raycaster.intersectObjects(this.selectorsList, true);

            if(intersects.length == 2){
                this.getColor(intersects[0].object, intersects[1].object);
            }

        }

        controls.addEventListener( 'dragstart', function ( event ) {
            event.object.renderOrder = 1    
        } );
        
        controls.addEventListener( 'dragend', function ( event ) {
            event.object.position.copy(event.object.userData.position)
            event.object.renderOrder = 0
        } );

        document.addEventListener('mouseup', this.dragRaycast)
    }

    getColor(selector1, selector2){
        const color1 = selector1.material.color
        const color2 = selector2.material.color

        if(((color1.r == this.parameter.blue.r && color2.r == this.parameter.yellow.r) || (color1.r == this.parameter.yellow.r && color2.r == this.parameter.blue.r)) && !this.greenLock){
            this.selector4.material = this.material4
            this.selectorsListPhase2.push(this.selector4)
            this.greenLock = true;
        } else if (((color1.r == this.parameter.blue.r && color2.r == this.parameter.red.r) || (color1.r == this.parameter.red.r && color2.r == this.parameter.blue.r)) && !this.purpleLock){
            this.selector5.material = this.material5
            this.selectorsListPhase2.push(this.selector5)
            this.purpleLock = true;
        }
    }

    update(){
        if(this.parameter.secondPhase && !this.dragSelectorLock){
            this.dragSelector();
            this.dragSelectorLock = true;
        }
    }

}