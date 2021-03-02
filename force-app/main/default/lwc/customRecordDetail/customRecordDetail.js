import { LightningElement, api, track } from 'lwc';
export default class CustomRecordDetail extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api fields;
    @api title;
    @api icon;
    @api column = "3"
    @api mode = "readonly"
    @api size = "small"

    @track fieldArray = [];
    connectedCallback() {
        if(this.fields !== null && typeof this.fields !== 'undefined' && this.fields !== ''){
            this.fieldArray = this.fields.split(",");
        }
        if (this.column == undefined) {
            this.column = "3";
        }
        if (this.mode == undefined) {
            this.mode = "readonly";
        }
    }


}