import { LightningElement, track, api } from 'lwc';
import { getDayInterest } from 'c/loanUtil';

export default class SuspendOptionsInterestCharge extends LightningElement {
    @api chargeAmountOriginal;
    @api rate;
    @api interestFrequency;
    @api dayCount;
    @api paymentFrequency;
    @api principalBalance;
    @api calculationMethod;
    @api lastInterestCharged;

    @track _transactionDate;
    @track _accruedInterest;
    @track minTransactionDate;
 
    @track renderedCallbackExecuted = false;

    @api newEndDate;
    @api extendSuspend;
    @api endSuspend;

    @api
    get transactionDate() {
        return this._transactionDate;
    }

    set transactionDate(val) {
        this._transactionDate = val;
        let d = new Date(val);
        let nextDate = d.setDate(d.getDate() + 1);
        let d1 = new Date(nextDate);
        this.minTransactionDate = d1.toDateString();
    }

    @api
    get accruedInterest() {
        return this._accruedInterest;
    }

    set accruedInterest(val) {
        this._accruedInterest = val;
    }

    handleToggle1(event){
        this.extendSuspend = event.target.checked;
        this.endSuspend = !this.extendSuspend;
    }

    handleToggle2(event){
        this.endSuspend = event.target.checked;
        this.extendSuspend = !this.endSuspend; 
        this.validate();
    }

    transactionDateChange(event){
        this.newEndDate = event.target.value;
        this.validate();
    }

    calculateInterest(){
        let edate, sdate;
        edate = new Date(this._transactionDate);
        sdate = new Date(this.lastInterestCharged);

        var diffDays = Math.floor((Date.UTC(edate.getFullYear(), edate.getMonth(), edate.getDate()) - Date.UTC(sdate.getFullYear(), sdate.getMonth(), sdate.getDate())) / (1000 * 60 * 60 * 24));
        var dayInterest = getDayInterest(this.interestFrequency, this.dayCount, this.paymentFrequency, parseFloat(this.rate), parseFloat(this.principalBalance), this.calculationMethod).toFixed(2);

        this._accruedInterest = dayInterest * diffDays;
    }

    renderedCallback() {
        if (!this.renderedCallbackExecuted) {
            this.renderedCallbackExecuted = true;
            this.validate();
            sessionStorage.removeItem('endDate');
            sessionStorage.removeItem('requiredDate');
            this.calculateInterest();
        }
    }

    @api
    validate(){
        var valid = true;
        let errorMessage;
        valid = this.getValidForm();
        var edate = this.template.querySelector(".endDateInput");
        edate.setCustomValidity("");

        if(typeof this.newEndDate !== 'undefined' && this.newEndDate !== null && this.newEndDate !=='')
            sessionStorage.setItem('endDate',this.newEndDate);
        
        if(this.extendSuspend){
            let endDateSession = sessionStorage.getItem('endDate');
        
            if(typeof endDateSession !== 'undefined' && endDateSession !== null && endDateSession !==''){
                this.newEndDate = endDateSession;
            }  

            let cDate = new Date(this.minTransactionDate);
            let fDate = new Date(this.newEndDate);
            let onLoadError = sessionStorage.getItem('requiredDate');

            if(fDate < cDate){
                valid = false;
                errorMessage = "Date must be greater than or equal to "+this.minTransactionDate+'.';
                edate.setCustomValidity(errorMessage);
                edate.reportValidity();
            }
            
            if(typeof this.newEndDate === 'undefined' || this.newEndDate === '' || this.newEndDate === null){
                sessionStorage.setItem('requiredDate',true);
                valid = false;
                errorMessage = "Please choose the end date";
                edate.setCustomValidity(errorMessage);
                if(onLoadError === 'true'){
                    edate.reportValidity();
                }
            }  
        }
        else{
            edate.reportValidity(); // removing date error message
        }

        if(valid || this.endSuspend){
            sessionStorage.removeItem('endDate');
            sessionStorage.removeItem('requiredDate');
        }    

        return {
            isValid: valid,
            errorMessage: ''
        };
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }
}