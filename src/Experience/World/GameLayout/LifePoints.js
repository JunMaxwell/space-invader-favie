import * as THREE from "three"

export default class LifePoints {
    constructor(_options){
        this.scene = _options.scene;
        this.parameter = _options.parameter;

        this.setLifePoints(this.parameter.lifeNumber);

        return this.parameter.lifePoints
    }

    setLifePoints(lifePoints){
        for(let i = 1; i <= lifePoints; i++){

            const color = this.setLifeColor(i)

            const point1 = new THREE.Mesh(this.parameter.lifeGeometry, color)
            point1.position.set(this.parameter.lifeStartPosX, -5, this.parameter.elementZIndex);
            const point2 = new THREE.Mesh(this.parameter.lifeGeometry, color)
            point2.position.set(this.parameter.lifeStartPosX - this.parameter.lifeStartPosXDecrease, -5, this.parameter.elementZIndex);
            
            this.parameter.lifePoints.push([point1, point2])
            this.scene.add(point1, point2)
            

            this.parameter.lifeStartPosX -= this.parameter.lifePosXIncrease;
        }
    }

    setLifeColor(iteration){

        const mat = new THREE.MeshBasicMaterial({transparent: true})
        if(iteration == 1){
            mat.color = this.parameter.lifeColor1;
        } else if (iteration == 2){
            mat.color = this.parameter.lifeColor2;
        } else {
            mat.color = this.parameter.lifeColor3;
        }

        return mat
    }
}