import { LightningElement, api, track } from 'lwc';
import { getDayInterest } from 'c/loanUtil';


export default class InterestTransaction extends LightningElement {

    @track _dayCount;
    @track _rate;
    @track _interestBalance;
    @track _interestAmount;
    @track _principalBalance;
    @track _interestFrequency;
    @track _paymentFrequency;
    @track _transactionDate;
    @track _actualInterestBalance;
    @track _lastPaymentDate;
    @track _calculationMethod;
    @track _disabled = true;
    @track renderedCallbackExecuted = false;
    @track _actualPrincipalBalance;
    @track _suspendInterest;
    @track _actualInterestCharged;

    @api suspenseEndDate;
    @api suspenseOption;
    @api accruedInterest;
    @api activeRecord = false;


    @api
    get suspenseInterest() {
        return this._suspendInterest;
    }
    set suspenseInterest(val) {
        this._suspendInterest = val;
    }

    @api
    get transactionDate() {
        return this._transactionDate;
    }
    set transactionDate(val) {
        this._transactionDate = val;
    }
    @api
    get lastPaymentDate() {
        return this._lastPaymentDate;
    }

    set lastPaymentDate(val) {
        this._lastPaymentDate = val;
    }

    @api
    get interestBalance() {
        return this._interestBalance;
    }

    set interestBalance(val) {
        this._interestBalance = parseFloat(val);
    }
    @api
    get rate() {
        return this._rate;
    }
    set rate(val) {
        this._rate = val;
    }
    @api
    get dayCount() {
        return this._dayCount;
    }

    set dayCount(val) {
        this._dayCount = val;
    }
    @api
    get interestAmount() {
        return this._actualInterestCharged;
    }

    set interestAmount(val) {
        this._actualInterestCharged = val;
    }
    @api
    get InterestFrequency() {
        return this._interestFrequency;
    }

    set InterestFrequency(val) {
        this._interestFrequency = val;
    }
    @api
    get PaymentFrequency() {
        return this._paymentFrequency;
    }

    set PaymentFrequency(val) {
        this._paymentFrequency = val;
    }
    @api
    get principalBalance() {
        return this._principalBalance;
    }

    set principalBalance(val) {
        this._principalBalance = this._actualPrincipalBalance = parseFloat(val);
    }
    @api
    get calculationMethod() {
        return this._calculationMethod;
    }
    set calculationMethod(val) {
        this._calculationMethod = val;
    }

    transactionDateChange(event) {
        this._transactionDate = event.target.value;
        this.updateInterest();
    }
    updateInterest() {
        var tdate = (new Date(this._transactionDate));
        var todayDate = (new Date(this._lastPaymentDate));
        let actualInterest = 0, dummy = 0;
        this._principalBalance = parseFloat(this._actualPrincipalBalance);
        
        if(this.activeRecord === true){
            let endDate = (new Date(this.suspenseEndDate)); 
            if(tdate < endDate || typeof this.suspenseEndDate == 'undefined'){
                dummy = this.calculateInterest(tdate, todayDate); 
                this._suspendInterest = actualInterest = parseFloat(dummy).toFixed(2);
                this._actualInterestCharged = 0;
            }
            else{
                dummy = this.calculateInterest(endDate, todayDate); 
                this._suspendInterest = parseFloat(dummy).toFixed(2);
                let calculated = parseFloat(this.accruedInterest) + parseFloat(this._suspendInterest);

                if(this.suspenseOption === 'Capitalize')
                    this._principalBalance = parseFloat(this._actualPrincipalBalance) + parseFloat(calculated);    
                else if(this.suspenseOption === 'Apply')
                    actualInterest = parseFloat(calculated);
                
                dummy = this.calculateInterest(tdate,endDate);
                this._actualInterestCharged = parseFloat(dummy).toFixed(2);
                actualInterest = parseFloat(actualInterest) + parseFloat(this._actualInterestCharged);
            }
        }
        else{
            dummy = this.calculateInterest(tdate, todayDate);
            this._actualInterestCharged = actualInterest = parseFloat(dummy).toFixed(2);
        }
        
        if (actualInterest < 0) {
            this._interestAmount = 0;
        } else {
            this._interestAmount = parseFloat(actualInterest).toFixed(2);
        }
    }

    calculateInterest(edate,sdate){
        var diffDays = Math.floor((Date.UTC(edate.getFullYear(), edate.getMonth(), edate.getDate()) - Date.UTC(sdate.getFullYear(), sdate.getMonth(), sdate.getDate())) / (1000 * 60 * 60 * 24));
        var dayInterest = getDayInterest(this._interestFrequency, this._dayCount, this._paymentFrequency, parseFloat(this._rate), parseFloat(this._principalBalance), this._calculationMethod).toFixed(2);

        return dayInterest * diffDays
    }

    @api
    validate() {
        var errorAll = "";
        var valid = true;
        valid = this.getValidForm();
        if (this._interestAmount == 0 || this._interestAmount === null || typeof this._interestAmount === 'undefined') {
            valid = false;
            errorAll = "Interest Amount should not be zero or null";
        }

        return {
            isValid: valid,
            errorMessage: errorAll
        };
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input, lightning-combobox')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }
    renderedCallback() {
        if (!this.renderedCallbackExecuted) {
            this.validate();
            this.renderedCallbackExecuted = true;
            this.updateInterest();
        }
    }
}