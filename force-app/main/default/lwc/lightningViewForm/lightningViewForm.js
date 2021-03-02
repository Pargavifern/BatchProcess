import { LightningElement, track , api } from 'lwc';

export default class LightningViewForm extends LightningElement {
    @api recordId;
    @api objectApiName;

    @api fields;
    @api iconName;
    @api headerName;
    @api iconColorSet;

    @track fieldList=[];
    @track renderedExecuted = false;

    renderedCallback(){
        if(!this.renderedExecuted){
            this.renderedExecuted = true;
            const style = document.createElement('style');
            style.innerText = `c-lightning-view-form .my-icon {
                --sds-c-icon-color-background: #c05e8b;
            }`;
            this.template.querySelector('lightning-icon').appendChild(style);
            if(this.fields !== null && typeof this.fields !== 'undefined' && this.fields !== ''){
                this.fieldList = this.fields.split(",");
            }
        }
        
    }
}