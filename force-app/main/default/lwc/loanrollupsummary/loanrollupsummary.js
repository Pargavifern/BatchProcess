import { LightningElement,track,api,wire } from 'lwc';
import  getMPayments from '@salesforce/apex/ScheduledTransactionController.getMissedPayment';
import  getDetails from '@salesforce/apex/LoanController.getById';
import { getRecord } from 'lightning/uiRecordApi';

export default class Loanrollupsummary extends LightningElement {
    @track missedPayment=0;
    @track mPaymentPresent=false;

    @track total_paid;
    @track no_payments;
    @track total_principal;
    @track total_interest;
    @track total_fee;
    @track loading=false;

    @api recordId;
    @track error;
    @track details=[];

    @wire(getRecord,{ recordId: '$recordId',fields: ['Loan__c.Name'] })
    getRollupSummary({data,error}){
        if(data){
           this.loanSummary();
           this.mPayments();
        }
        else{
            this.errorMethod(error);
        }  
    }

    connectedCallback(){
        this.loanSummary();
        this.mPayments();
    }

    loanSummary(){
        this.loading=true;
        getDetails({ id:this.recordId}).then(data=>{
            if (data !== "" && data !== undefined) {
                this.error = undefined;
                this.details=JSON.stringify(data);
                var summary=JSON.parse(this.details);
                this.no_payments=summary["Number_of_Payments__c"];
                this.total_paid=summary["Total_Paid_Positive__c"];
                this.total_fee=summary["Total_Fees_Positive__c"];
                this.total_interest=summary["Total_Interest_Positive__c"];
                this.total_principal=summary["Total_Principal_Positive__c"];
                this.loading=false;
            }
        }).catch(error=>{
            this.errorMethod(error);
        });
    }

    mPayments(){
        this.loading=true;

        var stObj={ 'sobjectType': 'Scheduled_Transaction__c'};
        stObj.Loan__c=this.recordId;
        getMPayments({ value:stObj}).then(data=>{
            if (data !== "" && data !== undefined) {
                this.error = undefined;
                let details=JSON.stringify(data);
                let payDetails=JSON.parse(details);
                this.missedPayment=payDetails.length;

                if(this.missedPayment>0){
                    this.mPaymentPresent=true;
                }
                else{
                    this.mPaymentPresent=false;
                }
            }
        }).catch(error=>{
            this.errorMethod(error);
        });
    }

    errorMethod(emsg){
        this.loading=false;
        this.error=emsg;
        console.log(emsg);
    }
}