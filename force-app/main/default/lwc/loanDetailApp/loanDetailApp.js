import { LightningElement, api, track, wire } from 'lwc';
import getLoanDetails from '@salesforce/apex/LoanController.getAll';
import { getRecord } from 'lightning/uiRecordApi';

export default class LoanDetailApp extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track loanId;
    @track loanNumber;
    @track loanLink;

    connectedCallback(){
        this.getLoan();
    }

    getLoan() {
        let loanRecord={'sobjectType':'Loan__c'};
        loanRecord.Application__c = this.recordId;

        getLoanDetails({ value:loanRecord, autoNumber: null }).then(data=>{
            if(data!==''&& data!== 'null' && data!=='undefined'){  
                let loanData = JSON.parse(JSON.stringify(data)); 
                this.loanId = loanData[0].Id;
                this.loanNumber = loanData[0].Name;
                this.loanLink = "/lightning/r/"+ this.loanId +"/view";
            }
        } ).catch(error => {
            this.errorMessage(error);
        });
    }
}