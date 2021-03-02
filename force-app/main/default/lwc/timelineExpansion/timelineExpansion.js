import { LightningElement, api, track } from 'lwc';

export default class TimelineExpansion extends LightningElement {
    @api objectId;
    @api objectName;
    @track application=false;
    @track employment=false;
    @track trans=false;

    connectedCallback(){
        if(this.objectName=='Application__c'){
            this.application=true;
        }
        else if(this.objectName=='Employment__c'){
            this.employment=true;
        }
       else if(this.objectName== 'Loan_Transaction__c'){
            this.trans=true;
        }
    }
}