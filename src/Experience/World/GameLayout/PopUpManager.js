export default class PopUpManager {
    constructor(_options){
        this.parameter = _options.parameter;

        this.popUp = document.getElementById('popUp');
        this.popUpText = document.getElementById('popUp-text');
        this.buttonText = document.getElementById('button-text');

        this.currentText = 1;

        this.setPopUpText1()
    }

    setPopUpText1(){
        this.popUpText.innerHTML = "Vous y êtes !<br><b>La boîte de Pétri n°7.</b><br><br>Et effectivement, il y a beaucoup de bactéries. <br><br>Prenez le contrôle des antibiotiques et interceptez les bactéries. <br><br><b>Restez prudent, certaines réactions des bactéries pourraient vous surprendre.</b>"
        this.buttonText.innerHTML = "Niveau 1"
    }

    setPopUpText2(){
        this.popUpText.innerHTML = "<b>Mécanismes de résistances des bactéries :</b><br><br><b>- Enzymes : Inactivation de l'antibiotique</b> par une enzyme bactérienne.<br>(Une enzyme est une protéine présente dans les cellules et qui a pour fonction de faciliter les réactions chimiques qui s'y produisent.<br><br><b>- Diminution de la quantité d’antibiotique atteignant la cible</b><br>( L'antibiotique n’est pas modifié, mais il ne peut pas accéder à sa cible au sein de la bactérie )<br><br><b>- Imperméabilité de la membrane bactérienne :</b> l’antibiotique ne peut plus pénétrer dans la membrane de la bactérie).<br><br><b>- Système d’efflux :</b> l’antibiotique est expulsé activement vers l’extérieur de la bactérie par des protéines jouant le rôle de pompe."
        this.buttonText.innerHTML = "Continuer"
    }

    setPopUpText3(){
        this.popUpText.innerHTML = "<b>Modification de la cible</b><br><br><b>-Modifications quantitatives :</b> par exemple, l’absence de paroi chez les bactéries du genre Mycoplasma est responsable de leur résistance naturelle aux β-lactamines.<br><br><b>-Modifications qualitatives :</b> la modification de la structure de la cible peut diminuer son affinité pour l’antibiotique. C’est un mécanisme fréquent de résistance acquise.<br><br><b>-Protection de la cible :</b> c’est une protection réversible de la cible (par des protéines empêchant la fixation des quinolones, par exemple)."
        this.buttonText.innerHTML = "Niveau 2"
    }

    changePopUpText(){

        if(this.currentText == 1){
            this.popUp.style.visibility = 'hidden'
            this.parameter.canUpdate = true;
            this.setPopUpText2()
            this.currentText += 1;
        } else if(this.currentText == 2){
           this.setPopUpText3()
           this.currentText += 1;
        } else if (this.currentText == 3){
            this.popUp.style.visibility = 'hidden'
            this.parameter.canUpdate = true;
        }


    }

}