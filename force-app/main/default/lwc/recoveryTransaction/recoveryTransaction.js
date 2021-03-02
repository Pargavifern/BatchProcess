import { LightningElement, track, api } from 'lwc';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class RecoveryTransaction extends LightningElement {
    get options() {
        return [
            { label: 'Settlement', value: 'true' }
        ];
    }

    @api balance;

    @track renderedCallbackExecuted = false;
    @track _comments;
    @track _transactionDate;
    @track _amount;
    @track checkboxValue;
    @track currencySymbol = CURRENCY;
   
    @track _lastTransactionDate;

    @track _closingPrincipal=0;
    @track _closingFee = 0;
    @track _closingInterest = 0;

    @track _principalBalance = 0;
    @track _interestBalance = 0;
    @track _feeBalance = 0;
    @track _interestCharge = 0;
    @track _interest = 0;
    @track _fee = 0;
    @track _principal = 0.00;

    @api
    get principalWriteoff(){
        return this._principal;
    }

    set principalWriteoff(val){
        this._principal = this._principalBalance = val;
    }

    @api 
    get interestWriteoff(){
        return this._interest;
    }

    set interestWriteoff(val){
        this._interest = this._interestBalance = val;
    }

    @api
    get feeWriteoff(){
        return this._fee;
    }

    set feeWriteoff(val){
        this._fee = this._feeBalance = val;
    }

    @api
    get comments(){
        return this._comments;
    }
    set comments(val){
        this._comments=val;
    }

    @api
    get transactionDate(){
        return this._transactionDate;
    }
    set transactionDate(val){
        this._transactionDate=val;
    }

    @api
    get lastTransactionDate() {
        return this._lastTransactionDate;
    }

    set lastTransactionDate(val) {
        let d = new Date(val);
        this._lastTransactionDate = d.toDateString();
    }

    @api
    get amount(){
        return this._amount;
    }
    set amount(val){
        this._amount=val;
    }

    @api
    get settlement(){
        return this.checkboxValue;
    }
    set settlement(val){
        this.checkboxValue = val;
    }

    handleComment(event){
        this.comments=event.detail.value;
    }

    handleDate(event){
        this._transactionDate=event.detail.value;
    }

    handleChange(event){
        this.checkboxValue=event.target.checked;
    }

    transactionDateChange(event){
        this._transactionDate = event.detail.value;
        this.validate();
    }

    principalChange(event) {
        this._principal = event.target.value;
        this.setPrincipalBalance();
        this.validate();
    }

    feeChange(event) {
        this._fee = event.target.value;
        this.setFeeBalance();
        this.validate();
    }

    interestChange(event) {
        this._interest = event.target.value;
        this.setInterestBalance();
        this.validate();
    }

    setPrincipalBalance(){
        this._closingPrincipal = this._principalBalance - this._principal;
    }

    setFeeBalance(){
        this._closingFee = this._feeBalance - this._fee;
    }

    setInterestBalance(){
        this._closingInterest = this._interestBalance - this._interest;
    }

    @api
    validate(){
        var isValid = true;
        var errorMessage = '';

        var inpPrincipal = this.template.querySelector(".inpPrincipal");
        inpPrincipal.setCustomValidity("");
        var inpInterest = this.template.querySelector(".inpInterest");
        inpInterest.setCustomValidity("");
        var inpFee = this.template.querySelector(".inpFee");
        inpFee.setCustomValidity("");

        if (parseFloat(this._principal) < 0) {
            errorMessage = 'Principal amount should not be negative';
            inpPrincipal.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._interest) < 0) {
            errorMessage = 'Interest amount should not be negative';
            inpInterest.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._fee) < 0) {
            errorMessage = 'Fee amount should not be negative';
            inpFee.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._principal) > this._principalBalance) {
            errorMessage = 'Principal amount should be less than or equal to principal balance';
            inpPrincipal.setCustomValidity(errorMessage);
        }
 
        if (parseFloat(this._interest) > parseFloat(this._interestBalance).toFixed(2)) {
            errorMessage = 'Interest amount should be less than or equal to interest balance';
            inpInterest.setCustomValidity(errorMessage)
        }

        if (parseFloat(this._fee) > this._feeBalance) {
            errorMessage = 'Fee amount should be less than or equal to fee balance';
            inpFee.setCustomValidity(errorMessage)
        }

        if (this._interest == '') {
            this._interest = 0;
        }
        if (this._fee == '') {
            this._fee = 0;
        }
        if (this._principal == '') {
            this._principal = 0;
        }

        if (parseFloat(this._principal) == 0 && parseFloat(this._interest) == 0 && parseFloat(this._fee) == 0) {
            isValid = false;
            errorMessage = 'Please provide an amount to continue the transaction';
        }

        if (isValid) {
            isValid = this.getValidForm();
        } else {
            this.getValidForm();
        }
        if (!isValid) {
            return {
                isValid: false,
                errorMessage: errorMessage
             };
        } else {
            this.setWriteoffAmount();
            return {
                isValid: true,
                errorMessage: ""
            };
        }
    }

    setWriteoffAmount(){
        this._amount = parseFloat(this._principal) + parseFloat(this._interest) + parseFloat(this._fee);
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }

    renderedCallback(){
        if (!this.renderedCallbackExecuted) {
            const style = document.createElement('style');
            style.innerText = ` .slds-modal__container {
                width: 65% !important;
                max-width: 70% !important;
            }`;
            this.template.querySelector('.slds-media__body').appendChild(style);
            
            this.renderedCallbackExecuted = true;
            this.setInterestBalance();
            this.setFeeBalance();
            this.setPrincipalBalance();
            this.validate();
        }
    }
}