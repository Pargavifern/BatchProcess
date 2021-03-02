import { getDayInterest } from 'c/loanUtil';
import { LightningElement, track, api } from 'lwc';

export default class LocInterestCharge extends LightningElement {
    @track _interestAmount = 0;
    @track _transactionDate;
    @track _lastChargedDate;
    @track _disabled = true;
    @track _comments;
    @track renderedCallbackExecuted = false;

    @api suspenseEndDate;
    @api suspenseOption;
    @api accruedInterest;
    @api rate;
    @api principalBalance;
    @api interestBalance;

    @api
    get transactionDate() {
        return this._transactionDate;
    }
    set transactionDate(val) {
        this._transactionDate = val;
    }

    @api
    get lastChargedDate() {
        return this._lastChargedDate;
    }

    set lastChargedDate(val) {
        let d=new Date(val);
        this._transactionDate = val;
        this._lastChargedDate = d.toDateString();
    }
   
    @api
    get interestAmount() {
        return this._interestAmount;
    }

    set interestAmount(val) {
        this._interestAmount = val;
    }
   
    @api 
    get comments(){
        return this._comments;
    }
    set comments(val) {
        this._comments = val;
    }

    transactionDateChange(event) {
        this._transactionDate = event.target.value;
        this.updateInterest();
    }
    updateInterest() {
        var tdate = (new Date(this._transactionDate));
        var todayDate = (new Date(this._lastChargedDate));
        let actualInterest = 0, dayInterest = 0;

        let diffDays = Math.floor((Date.UTC(tdate.getFullYear(), tdate.getMonth(), tdate.getDate()) - Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())) / (1000 * 60 * 60 * 24));
        dayInterest = getDayInterest('', '', '', parseFloat(this.rate), parseFloat(this.principalBalance), 'Simple');
        actualInterest = (dayInterest * diffDays).toFixed(2);
  
        if (actualInterest < 0) {
            this._interestAmount = 0;
        } else {
            this._interestAmount = actualInterest;
        }
    }

    handleComment(event){
        this._comments = event.target.value;
    }

    @api
    validate() {
        var errorAll = "";
        var valid = true;
        valid = this.getValidForm();
        if (this._interestAmount == 0) {
            valid = false;
            errorAll = "Interest Amount should not be zero";
        }

        return {
            isValid: valid,
            errorMessage: errorAll
        };
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }
    renderedCallback() {
        if (!this.renderedCallbackExecuted) {
            this.renderedCallbackExecuted = true;
            this.validate();
            this.updateInterest();
        }
    }
}