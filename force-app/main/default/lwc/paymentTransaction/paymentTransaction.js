import { LightningElement, track, wire, api } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getDayInterest } from 'c/loanUtil';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TRANSACTION_OBJECT from '@salesforce/schema/Loan_Transaction__c';
import PAYMENT_METHOD_FIELD from '@salesforce/schema/Loan_Transaction__c.Payment_Method__c';




export default class paymentTransaction extends LightningElement {
    @track _principal = 0;
    @track _interest = 0;
    @track _fee = 0;
    @track _totalBalance
    @track _principalBalance
    @track _feeBalance
    @track _transactionDate
    @track _closingBalancePrincipal = 0;
    @track _closingBalanceInterest = 0;
    @track _closingBalanceFee = 0;
    @track _closingBalanceTotal = 0;
    @track renderedCallbackExecuted = false;
    @track _lastPaymentDate;
    @track _todayDate;
    @track _interestFrequency;
    @track _dayCount;
    @track _actualInterestBalance;
    @track _actualTotalBalance;
    @track _actualPrincipalBalance;
    @track _rate;
    @track _paymentFrequency;
    @track paymentMethodOptions;
    @track error;
    @api availableActions = [];
    @track _comments;
    @track orderedPayment = [];
    @track _suspendInterest = 0;

    @api principalOrder;
    @api interstOrder;
    @api feeOrder;
    @api interestCalculation;
    @api suspenseEndDate;
    @api accruedAmount;
    @api suspendOption;
    @api suspendPresent;

    @api
    get suspenseInterest() {
        return this._suspendInterest;
    }
    set suspenseInterest(val) {
        this._suspendInterest = val;
    }

    @api
    get comments() {
        return this._comments;
    }
    set comments(val) {
        console.log(val);
        this._comments = val;
    }

    @api get total() {
        return this._total;
    }
    set total(value) {
        this._total = value;
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
    get paymentMethod() {
        return this._paymentMethod;
    }

    set paymentMethod(val) {
        this._paymentMethod = val;
    }

    @api
    get PaymentFrequency() {
        return this._paymentFrequency;
    }

    set PaymentFrequency(val) {
        this._paymentFrequency = val;
    }

    @api
    get InterestFrequency() {
        return this._interestFrequency;
    }

    set InterestFrequency(val) {
        this._interestFrequency = val;
    }
    @api
    get todayDate() {
        return this._todayDate;
    }

    set todayDate(val) {
        this._todayDate = val;
    }
    @api
    get transactionDate() {
        return this._transactionDate;
    }

    set transactionDate(val) {
        this._transactionDate = val;
    }
    @api
    get forScheduled() {
        return this._forScheduled;
    }

    set forScheduled(val) {
        this._forScheduled = val;
    }

    @api
    get lastPaymentDate() {
        return this._lastPaymentDate;
    }

    set lastPaymentDate(val) {
        let d = new Date(val);
        this._lastPaymentDate = d.toDateString();
    }

    @api
    get interest() {
        return this._interest;
    }

    set interest(val) {
        this._interest = val;
    }

    @wire(getObjectInfo, { objectApiName: TRANSACTION_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: PAYMENT_METHOD_FIELD })
    PicklistValues({ error, data }) {
        if (data) {
            this.paymentMethodOptions = data.values;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.paymentMethodOptions = undefined;
        }
    }

    doOrderPayment() {
        this.orderedPayment.push({ paymentName: "prinicpal", value: this.principalOrder });
        this.orderedPayment.push({ paymentName: "interest", value: this.interstOrder });
        this.orderedPayment.push({ paymentName: "fee", value: this.feeOrder });

        this.orderedPayment.sort(function(a, b) {
            return parseFloat(a.value) - parseFloat(b.value);
        });

    }

    setTotalBalance() {
        this._totalBalance = parseFloat(this._principalBalance) + parseFloat(this._interestBalance) + parseFloat(this._feeBalance);
    }

    setPayment(balance, paymentName) {
        if (paymentName == "prinicpal" && this._principalBalance > 0) {
            if (balance <= this._principalBalance) {
                this._principal = balance;
            } else {
                this._principal = this._principalBalance
            }
            return (balance - this._principal).toFixed(2);
        } else if (paymentName == "fee" && this._feeBalance > 0) {
            if (balance <= this._feeBalance) {
                this._fee = balance;
            } else {
                this._fee = this._feeBalance
            }
            return (balance - this._fee).toFixed(2);
        } else if (paymentName == "interest" && this._interestBalance > 0) {

            if (balance <= this._interestBalance) {
                this._interest = balance;
            } else {
                this._interest = this._interestBalance
            }
            return (balance - this._interest).toFixed(2);
        }

        return balance;
    }
    setPaymentByOrder() {
        var balance = parseFloat(this._total);
        this._principal = 0;
        this._fee = 0;
        this._interest = 0;
        if (balance > 0) {
            for (var i = 0; i < this.orderedPayment.length; i++) {
                var returnBalance = this.setPayment(balance, this.orderedPayment[i].paymentName);
                balance = returnBalance;
            }
        }

        this.calculateClosingFee();
        this.calculateClosingPrincipal();
        this.calculateClosingInterest();
        this.calculateClosingTotal();
    }

    transactionDateChange(event) {
        this.
        _transactionDate = event.target.value;
        this.updateInterestBalance();
        this.calculateClosingInterest();
    }

    handleComment(event) {
        this._comments = event.target.value;
    }

    updateInterestBalance() {
        var tdate = (new Date(this._transactionDate));
        var todayDate = (new Date(this._lastPaymentDate));
        var interestPerday = 0;
        this._principalBalance = this._actualPrincipalBalance;

        if (this.suspendPresent == true) {
            let endDate = (new Date(this.suspenseEndDate));
            if (tdate < endDate || typeof this.suspenseEndDate == 'undefined') {
                this._suspendInterest = this.calculateInterest(tdate, todayDate);
            } else {
                this._suspendInterest = this.calculateInterest(endDate, todayDate);
                let calculated = parseFloat(this.accruedAmount) + parseFloat(this._suspendInterest);

                if (this.suspendOption === 'Capitalize')
                    this._principalBalance = (parseFloat(this._actualPrincipalBalance) + parseFloat(calculated)).toFixed(2);
                else if (this.suspendOption === 'Apply')
                    interestPerday = parseFloat(calculated);

                interestPerday = parseFloat(interestPerday) + parseFloat(this.calculateInterest(tdate, endDate));
            }

            this._interestBalance = (parseFloat(this._actualInterestBalance) + interestPerday).toFixed(2);

        } else {
            interestPerday = this.calculateInterest(tdate, todayDate);
            this._interestBalance = (parseFloat(this._actualInterestBalance) + interestPerday).toFixed(2);
        }

        this.setTotalBalance();
        this.calculateClosingTotal();
        if (this._total > 0)
            this.setPaymentByOrder();
    }

    calculateInterest(tdate, todayDate) 
    {
        if(tdate > todayDate)
        {
            let diffDays = Math.floor((Date.UTC(tdate.getFullYear(), tdate.getMonth(), tdate.getDate()) - Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())) / (1000 * 60 * 60 * 24));
            let dayInterest = getDayInterest(this._interestFrequency, this._dayCount, this._paymentFrequency, parseFloat(this._rate), parseFloat(this._principalBalance), this.interestCalculation);
            return dayInterest * diffDays;
        }
        else
        {
            // this._interestBalance = null;
            return this._interestBalance=0;
        }
    }

    @api
    get totalBalance() {
        return this._totalBalance;
    }

    set totalBalance(val) {
        this._totalBalance = this._closingBalanceTotal = this._actualTotalBalance = val;
        // this._totalBalanceWithCurrency = CURRENCY + val;
    }
    @api
    get principalBalance() {
        return this._principalBalance;
    }

    set principalBalance(val) {
        this._principalBalance = this._actualPrincipalBalance = val;
        // this._principalBalanceWithCurrency = CURRENCY + val;
        this._closingBalancePrincipal = val;
    }

    @api
    get interestBalance() {
        return this._interestBalance;
    }

    set interestBalance(val) {
        this._actualInterestBalance = this._interestBalance = val;
        //this._interestBalanceWithCurrency = CURRENCY + val;
        this._closingBalanceInterest = val;

    }
    @api
    get feeBalance() {
        return this._feeBalance;
    }

    set feeBalance(val) {
        this._feeBalance = val;
        //this._feeBalanceWithCurrency = CURRENCY + val;
        this._closingBalanceFee = val;
    }

    @api
    get closingBalanceFee() {
        return this._closingBalanceFee;
    }

    set closingBalanceFee(val) {
        //this._feeClosingBalance = val;
    }

    @api
    get closingBalanceInterest() {
        return this._closingBalanceInterest;
    }

    set closingBalanceInterest(val) {
        // this._interestClosingBalance = val;
    }

    @api
    get closingBalancePrincipal() {
        return this._closingBalancePrincipal;
    }

    set closingBalancePrincipal(val) {
        // this._principalClosingBalance = val;
    }
    @api
    get principal() {
        return this._principal;
    }

    set principal(val) {
        this._principal = val;
    }

    principalChange(event) {
        this._principal = event.target.value;
        this.calculateClosingPrincipal();
        this.totalAmountCalculate();
        this.validate();
    }

    totalChange(event) {
        //let r = event.target.value;
        this._total = event.target.value;
        this.setPaymentByOrder();
        this.validate();

    }

    calculateClosingTotal() {
        this._closingBalanceTotal = this.totalBalance - this._total;
    }

    calculateClosingPrincipal() {
        this._closingBalancePrincipal = this._principalBalance - this._principal;
    }

    @api
    get fee() {
        return this._fee;
    }

    set fee(val) {
        this._fee = val;
    }

    feeChange(event) {
        this._fee = event.target.value;
        this.calculateClosingFee();
        this.totalAmountCalculate();
        this.validate();

    }
    calculateClosingFee() {
        this._closingBalanceFee = this._feeBalance - this._fee;
    }

    interestChange(event) {
        this._interest = event.target.value;
        this.calculateClosingInterest();
        this.totalAmountCalculate();
        this.validate();
    }
    paymentMethodChange(event) {
        this._paymentMethod = event.target.value;
    }
    calculateClosingInterest() {
        this._closingBalanceInterest = this._interestBalance - this._interest;
    }

    //Change attribute on Flow
    attributChanged(key, value) {
        const attributeChangeEvent = new FlowAttributeChangeEvent(key, value);
        this.dispatchEvent(attributeChangeEvent);
    }

    totalAmountCalculate() {
        let r = parseFloat(this._principal) + parseFloat(this._interest) + parseFloat(this._fee);
        this._total = parseFloat(r).toFixed(2);
    }

    //Hook to Flow's Validation engine
    @api
    validate() {
        this._forScheduled = false;
        if (sessionStorage.getItem('customButtonEvent') == 'true') {
            sessionStorage.removeItem('customButtonEvent');
            this._forScheduled = true;
            this._interestBalance = this._actualInterestBalance;
            return {
                isValid: true
            };
        }
        var isValid = true;
        var errorMessage = '';
        inpPrincipal
        var inpTotal = this.template.querySelector(".inpTotal");
        inpTotal.setCustomValidity("");
        var inpPrincipal = this.template.querySelector(".inpPrincipal");
        inpPrincipal.setCustomValidity("");
        var inpInterest = this.template.querySelector(".inpInterest");
        inpInterest.setCustomValidity("");
        var inpFee = this.template.querySelector(".inpFee");
        inpFee.setCustomValidity("");
        var errorAll = "";

        if (parseFloat(this._principal) < 0) {
            // isValid = false;
            errorMessage = 'Principal amount should not be negative';
            inpPrincipal.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._total) < 0) {
            // isValid = false;
            errorMessage = 'Total amount should not be negative';
            inpTotal.setCustomValidity(errorMessage);
        }


        if (parseFloat(this._interest) < 0) {
            // isValid = false;
            errorMessage = 'Interest amount should not be negative';
            inpInterest.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._fee) < 0) {
            //isValid = false;
            errorMessage = 'Fee amount should not be negative';
            inpFee.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._principal) == 0 && parseFloat(this._interest) == 0 && parseFloat(this._fee) == 0) {
            isValid = false;
            errorAll = 'The transaction has no amount entered';
        }

        if (parseFloat(this._principal) > this._principalBalance) {
            // isValid = false;
            errorMessage = 'Principal amount should be less than or equal to principal balance';
            inpPrincipal.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._total) > parseFloat(this._totalBalance).toFixed(2)) {
            // isValid = false;
            errorMessage = 'Total amount should be less than or equal to total balance';
            inpTotal.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._interest) > parseFloat(this._interestBalance).toFixed(2)) {
            // isValid = false;
            errorMessage = 'Interest amount should be less than or equal to interest balance';
            inpInterest.setCustomValidity(errorMessage)
        }
        if (parseFloat(this._fee) > this._feeBalance) {

            // isValid = false;
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

        if (isValid) {
            isValid = this.getValidForm();
        } else {
            this.getValidForm();
        }

        if (!isValid) {
            return {
                isValid: false,
                errorMessage: errorAll
            };
        } else {
            return {
                isValid: true,
                errorMessage: ""
            };
        }

        //If the component is invalid, return the isValid parameter as false and return an error message. 

    }

    //Go to Next screen of Flow
    handleNext(event) {
        const nextNavigationEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(nextNavigationEvent);
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input, lightning-combobox')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }

    renderedCallback() {

        if (!this.renderedCallbackExecuted) {
            const style = document.createElement('style');
            style.innerText = `.slds-modal__container {
            width: 90% !important;
            max-width: 90% !important;
        }`;
            this.template.querySelector('lightning-card').appendChild(style);

            this.renderedCallbackExecuted = true;
            this.updateInterestBalance();
            this.calculateClosingFee();
            this.calculateClosingPrincipal();
            this.calculateClosingInterest();
            this.doOrderPayment();
            this.setPaymentByOrder();
            this.totalAmountCalculate();
            this.validate();
        }
    }
}