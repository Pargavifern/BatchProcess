import { LightningElement, track, api } from 'lwc';
import { getDayInterest } from 'c/loanUtil';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class WriteoffTransaction extends LightningElement {
    get options() {
        return [
            { label: 'Regular Write-Off', value: 'Write Off - Regular' },
            { label: 'Discard Interest Write-Off', value: 'Write Off - Discard' },
        ];
    }

    @track renderedCallbackExecuted = false;

    
    @track _lastTransactionDate;
    @track _writeoffAmount = 0;
    @track _comments;
    @track _transactionDate;

    @track _closingPrincipal=0;
    @track _closingFee = 0;
    @track _closingInterest = 0;

    @track _principalBalance = 0;
    @track _interestBalance = 0;
    @track _feeBalance = 0;
    @track _interestCharge = 0;
    @track _actualInterestBalance = 0;
    @track _interest = 0;
    @track _fee = 0;
    @track _principal = 0.00;
    @track disableInterest = false;

    @api balance;
    @api InterestFrequency;
    @api rate;
    @api dayCount;
    @api paymentFrequency;
    @api interestCalculation;
    @track _transactionType;
    @api writeoffType;

    @track currencySymbol = CURRENCY;

    @api 
    get transactionType(){
        return this._transactionType;
    }

    set transactionType(val){
        this._transactionType = val;
    }
    
    @api 
    get principalBalance(){
        return this._principalBalance;
    }
    set principalBalance(val){
        this._principalBalance = this._principal = this._closingPrincipal = val;
    }

    @api 
    get interestBalance(){
        return this._interestBalance;
    }
    set interestBalance(val){
        this._interestBalance = this._interest = this._actualInterestBalance = this._closingInterest = val;
    }

    @api 
    get feeBalance(){
        return this._feeBalance;
    }
    set feeBalance(val){
        this._feeBalance = this._fee = this._closingFee = val;
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
    get writeoffAmount() {
        return this._writeoffAmount;
    }

    set writeoffAmount(val) {
        this._writeoffAmount = val;
    }

    @api
    get comments() {
        return this._comments;
    }

    set comments(val) {
        this._comments = val;
    }

    @api 
    get transactionDate(){
        return this._transactionDate;
    }

    set transactionDate(val){
        this._transactionDate=val;
    }

    @api 
    get interestCharge(){
        return this._interestCharge;
    }

    set interestCharge(val){
        this._interestCharge=val;
    }

    @api 
    get Fee(){
        return this._fee;
    }

    set Fee(val){
        this._fee=val;
    }

    @api 
    get Interest(){
        return this._interest;
    }

    set Interest(val){
        this._interest=val;
    }

    @api 
    get Principal(){
        return this._principal;
    }

    set Principal(val){
        this._principal = parseFloat(val);
    }

    writeoffMethodChange(event) {
        this._transactionType = event.detail.value;
        this.setInterestEnable();
    }

    setInterestEnable(){
        if(this._transactionType == 'Write Off - Discard'){
            this._interest = this._interestBalance;
            this.disableInterest = true;
            this.setInterestBalance();
        }
        else{
            this.disableInterest = false;
        }
    }

    principalChange(event) {
        this._principal = event.target.value;
        this.setPrincipalBalance();
        this.validate();
    }

    setPrincipalBalance(){
        this._closingPrincipal = this._principalBalance - this._principal;
    }

    feeChange(event) {
        this._fee = event.target.value;
        this.setFeeBalance();
        this.validate();
    }

    setFeeBalance(){
        this._closingFee = this._feeBalance - this._fee;
    }

    interestChange(event) {
        this._interest = event.target.value;
        this.setInterestBalance();
        this.validate();
    }

    setInterestBalance(){
        this._closingInterest = this._interestBalance - this._interest;
    }

    handleComment(event){
        this.comments=event.detail.value;
    }

    transactionDateChange(event){
        this._transactionDate = event.detail.value;
        this.interest_Calculation_method();
        this.validate();
    }

    interest_Calculation_method() {
        var choosenDate = new Date(this._transactionDate);
        var lastDate = (new Date(this._lastTransactionDate));
        
        var diffDays =Math.floor((choosenDate-lastDate)/(1000 * 3600 * 24)); 
        var dayInterest = getDayInterest(this.InterestFrequency, this.dayCount, this.paymentFrequency, parseFloat(this.rate), parseFloat(this._principalBalance), this.interestCalculation);
        let charged = (dayInterest * diffDays).toFixed(2);

        if(charged > 0)
            this._interestCharge = parseFloat(charged);
        else
            this._interestCharge = 0;

        this._interestBalance = this._interest = this._actualInterestBalance + this._interestCharge; 
        this.setInterestBalance();
    }
    
    setWriteoffAmount(){
        if(this._transactionType == 'Write Off - Discard')
            this._writeoffAmount = this._principal + this._interest + this._fee;
        else
            this._writeoffAmount = this._principal + this._fee;
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

        if(this._principal == this._principalBalance){
            this.writeoffType = 'Full';
        }
        else{
            this.writeoffType = 'Partial';
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

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input, lightning-combobox')].reduce((validSoFar, inputCmp) => {
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
            this.interest_Calculation_method();
            this.setInterestBalance();
            this.setFeeBalance();
            this.setPrincipalBalance();
            this.setInterestEnable();
            this.validate();
        }
    }
}