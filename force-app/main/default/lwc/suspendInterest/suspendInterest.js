import { LightningElement, track, api, wire } from 'lwc';
import { getDayInterest } from 'c/loanUtil';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import INTEREST_SUSPENSE from '@salesforce/schema/Interest_Suspense__c';
import SUSPENSE_FIELD from '@salesforce/schema/Interest_Suspense__c.SuspenseOption__c';

export default class SuspendInterest extends LightningElement {

    @track _suspenseType;
    @track _lastTransactionDate;
    @track amount=0;
    @track _suspenseType;
    @track _comments;
    @track maxAmount=0;
    @track _startDate;
    @track _endDate = null;
    @track _closingInterest=0;
    @track _interestCharge=0;
    @track options;
    @track _accruedInterest = 0;
    @api activeRecord = false;
    @track _endSuspension;

    @api interestBalance;
    @api balance;
    @api InterestFrequency;
    @api rate;
    @api dayCount;
    @api paymentFrequency;
    @api interestCalculation;
    @api principalBalance;
    @api accruedDate;

    @track currencySymbol = CURRENCY;

    @api
    get endSuspension() {
        return this._endSuspension;
    }

    set endSuspension(val) {
        this._endSuspension = val;
    }

    @api
    get accruedInterest() {
        return this._accruedInterest;
    }

    set accruedInterest(val) {
        this._accruedInterest = val;
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
    get suspenseType() {
        return this._suspenseType;
    }

    set suspenseType(val) {
        this._suspenseType = val;
    }

    @api
    get comments() {
        return this._comments;
    }

    set comments(val) {
        this._comments = val;
    }

    @api 
    get startDate(){
        return this._startDate;
    }

    set startDate(val){
        this._startDate=val;
    }

    @api 
    get endDate(){
        return this._endDate;
    }

    set endDate(val){
        this._endDate=val;
    }

    @api 
    get interestCharge(){
        return this._interestCharge;
    }

    set interestCharge(val){
        this._interestCharge=val;
    }


    @api 
    get closingInterest(){
        return this._closingInterest;
    }

    set closingInterest(val){
        this._closingInterest=val;
    }

    @wire(getObjectInfo, { objectApiName: INTEREST_SUSPENSE })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: SUSPENSE_FIELD})
    TypePicklistValues({ data, error}) {
        if (data) {
          this.options = data.values;
        } 
        else if (error) {
          this.error = error;
        }
      }

    handleChange(event) {
        this._suspenseType = event.detail.value;
        this.validate();
    }

    handleComment(event){
        this.comments=event.detail.value;
    }

    handleStartDate(event){
        this._startDate=event.detail.value;
        this._interestCharge = parseFloat(this.interest_Calculation_method(this._startDate, this._lastTransactionDate));
        this._closingInterest = parseFloat(this.interestBalance) + parseFloat(this._interestCharge); 
        this.validate();
    }

    handleEndDate(event){
        this._endDate=event.detail.value;
        let today = new Date();
        let endDate = new Date(this._endDate);
        if(this.activeRecord === true){
            if(endDate <= today){
                this._accruedInterest = parseFloat(this.interest_Calculation_method(this._endDate, this.accruedDate));
            }
        }
        this.validate();
    }

    interest_Calculation_method(big,small) {
        var choosenDate = new Date(big);
        var lastDate = (new Date(small));
        
        var diffDays =Math.floor((choosenDate-lastDate)/(1000 * 3600 * 24)); 
        var dayInterest = getDayInterest(this.InterestFrequency, this.dayCount, this.paymentFrequency, parseFloat(this.rate), parseFloat(this.principalBalance), this.interestCalculation);
        let totalInterest = (dayInterest * diffDays).toFixed(2); 
        
        return totalInterest;
    }

    @api
    validate(){
        var isValid = true;
        var errorMessage = '';
        let today = new Date();

        var edate = this.template.querySelector(".endDatehtml");
        edate.setCustomValidity("");

        this._endSuspension = false;
        if (sessionStorage.getItem('customButtonEvent') == 'true') {
            sessionStorage.removeItem('customButtonEvent');
            this._endSuspension = true;
            let today = new Date();
            if(new Date(this._startDate) <= today)
                this._endDate = today;
            else
                this._endDate = this._startDate;
            this._accruedInterest = parseFloat(this.interest_Calculation_method(this._endDate, this.accruedDate));
            return {
                isValid: true
            };
        }

        if(new Date(this._startDate) ==  new Date(this._endDate) && this._endDate != null ){
            isValid = false;
            errorMessage = "End date must be greater than start date " + this._startDate.toDateString();
            edate.setCustomValidity(errorMessage);
        }

        if(new Date(this._startDate) <= today && new Date(this._endDate) <= today && this._endDate != null){
            isValid = false;
            errorMessage = "End date must be greater than today " + today.toDateString();
            edate.setCustomValidity(errorMessage);
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

    connectedCallback(){
        let today = new Date();
        if(this.activeRecord === true){
            if(new Date(this._endDate) <= today){
                this._accruedInterest = parseFloat(this.interest_Calculation_method(this._endDate, this.accruedDate));
            }
        }
        else{
            this._interestCharge = parseFloat(this.interest_Calculation_method(this._startDate, this._lastTransactionDate));
            this._closingInterest = parseFloat(this.interestBalance) + parseFloat(this._interestCharge); 
        }
    }
}