import ControllerKey from "../World/GameLayout/ControllerKey";

export default class Controller
{
    constructor(_options){
        this.scene = _options.scene;
        this.camera = _options.camera;
        this.resources = _options.resources;
        this.player = _options.player;
        this.parameter = _options.parameter;

        this.mouse = _options.mouse;
        this.raycaster = _options.raycaster;

        this.keys = new ControllerKey({
            scene: this.scene,
            resources: this.resources
        })

        this.setControllerClick();

        this.setActions();
        this.setKeyboad();

        this.getXValue();
        this.getYValue();


    }

    setActions(){
        this.actions = {}
        this.actions.top = 0;
        this.actions.bottom = 0;
        this.actions.right = 0;
        this.actions.left = 0;
        this.actions.space = false;
    }

    setKeyboad(){
        
        this.keyboard = {}
        this.keyboard.events = {}

        this.keyboard.events.keyDown = (_event) => {
            switch(_event.key){
                case 'ArrowUp':
                case 'z':
                case 'w':
                    this.actions.top = 1;
                    break

                case 'ArrowDown':
                case 's':
                    this.actions.bottom = 1;
                    break

                case 'ArrowRight':
                case 'd':
                    this.actions.right = 1;
                    break

                case 'ArrowLeft':
                case 'q':
                case 'a':
                    this.actions.left = 1;
                    break   
                        
            }
        }

        this.keyboard.events.keyUp = (_event) => {
            switch(_event.key){
                case 'ArrowUp':
                case 'z':
                case 'w':
                    this.actions.top = 0;
                    break

                case 'ArrowDown':
                case 's':
                    this.actions.bottom = 0;
                    break

                case 'ArrowRight':
                case 'd':
                    this.actions.right = 0;
                    break

                case 'ArrowLeft':
                case 'q':
                case 'a':
                    this.actions.left = 0;
                    break    
            }    
        }

        document.addEventListener('keydown', this.keyboard.events.keyDown);
        document.addEventListener('keyup', this.keyboard.events.keyUp);

    }

    setControllerClick(){

        this.ControllerDown = (_event) => {
            this.parameter.getMousePosition(this.mouse,_event)
  
            this.raycaster.setFromCamera(this.mouse, this.camera);

            this.intersects = this.raycaster.intersectObjects(this.keys, true);

            if(this.intersects[0] !== undefined){

               if(this.intersects[0].object.name == 'left'){
                this.actions.left = 1
               } else if(this.intersects[0].object.name = 'right'){
                this.actions.right = 1
               }
            }
        }

        this.ControllerUp = () => {
            this.actions.left = 0;
            this.actions.right = 0;
        }

        document.addEventListener('mousedown', this.ControllerDown)
        document.addEventListener('mouseup', this.ControllerUp)
    }

    getXValue(){
        return this.actions.left - this.actions.right;
    }

    getYValue(){
        return this.actions.top - this.actions.bottom;
    }
}