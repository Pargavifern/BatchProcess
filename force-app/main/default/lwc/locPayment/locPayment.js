import { LightningElement, api, track } from 'lwc';
import { getDayInterest } from 'c/loanUtil';

export default class LocPayment extends LightningElement {
    @track _interest = 0;
    @track _principal = 0;
    @track _fee = 0;
    @track _interestCharged = 0;
    @track _transactionDate;
    @track _comments = ' ';
    @track closingPrincipal = 0;
    @track closingInterest = 0;
    @track closingFee = 0
    @track _lastPaymentDate;  
    @track _total = 0;
    @track _totalBalance = 0;
    @track closingBalanceTotal = 0;
    @track renderedCallbackExecuted = false;

    @api creditLimit;
    @api rate;
    @api balance;
    @api principalBalance;
    @track _interestBalance;
    @track _actualInterestBalance;
    @api feeBalance;

    @track orderedPayment= [
                            { label: "principal", value: 2 },
                            { label: "interest", value: 1 },
                            { label: "fee", value: 3 },
                        ];

    @api 
    get interestBalance(){
        return this._interestBalance;
    }
    set interestBalance(val) {
        this._interestBalance = this._actualInterestBalance = val;
    }

    @api
    get lastPaymentDate() {
        return this._lastPaymentDate;
    }

    set lastPaymentDate(val) {
        let d = new Date(val);
        this._transactionDate = val;
        this._lastPaymentDate = d.toDateString();
    }

    @api 
    get transactionDate(){
        return this._transactionDate;
    }
    set transactionDate(val) {
        this._transactionDate = val;
    }

    @api 
    get comments(){
        return this._comments;
    }
    set comments(val) {
        this._comments = val;
    }

    @api 
    get principalPaid(){
        return this._principal;
    }
    set principalPaid(val) {
        this._principal = val;
    }

    @api 
    get interestPaid(){
        return this._interest;
    }
    set interestPaid(val) {
        this._interest = val;
    }

    @api 
    get interestCharged(){
        return this._interestCharged;
    }
    set interestCharged(val) {
        this._interestCharged = val;
    }

    @api 
    get feePaid(){
        return this._fee;
    }
    set feePaid(val) {
        this._fee = val;
    }

    sortPaymentOrder(){
        this.orderedPayment.sort(function(a, b) {
            return a.value - b.value;
        });
        this.setTotalBalance();
    }

    setPaymentByOrder() {
        var balance = parseFloat(this._total);
        this._principal = 0;
        this._fee = 0;
        this._interest = 0;
        if (balance > 0) {
            for (var i = 0; i < this.orderedPayment.length; i++) {
                var returnBalance = this.setPayment(balance, this.orderedPayment[i].label);
                balance = returnBalance;
            }
        }

        this.calculateClosingFee();
        this.calculateClosingPrincipal();
        this.calculateClosingInterest();
        this.calculateClosingTotal();
    }

    setPayment(balance, paymentName) {
        if (paymentName == "principal" && this.principalBalance > 0) {
            if (balance <= this.principalBalance) {
                this._principal = balance;
            } else {
                this._principal = this.principalBalance
            }
            return (balance - this._principal).toFixed(2);
        } else if (paymentName == "fee" && this.feeBalance > 0) {
            if (balance <= this.feeBalance) {
                this._fee = balance;
            } else {
                this._fee = this.feeBalance
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

    setTotalBalance() {
        this._totalBalance = parseFloat(this.principalBalance) + parseFloat(this._interestBalance) + parseFloat(this.feeBalance);
    }

    calculateClosingFee() {
        this.closingFee = this.feeBalance - this._fee;
    }

    calculateClosingTotal() {
        this.closingBalanceTotal = this._totalBalance - this._total;
    }

    calculateClosingPrincipal() {
        this.closingPrincipal = this.principalBalance - this._principal;
    }

    calculateClosingInterest() {
        this.closingInterest = this._interestBalance - this._interest;
    }

    totalAmountCalculate(){
        this._total = parseFloat(this._principal) + parseFloat(this._interest) + parseFloat(this._fee);
    }

    feeChange(event) {
        this._fee = event.target.value;
        this.calculateClosingFee();
        this.totalAmountCalculate();
        this.validate();
    }

    interestChange(event) {
        this._interest = event.target.value;
        this.calculateClosingInterest();
        this.totalAmountCalculate();
        this.validate();
    }

    principalChange(event) {
        this._principal = event.target.value;
        this.calculateClosingPrincipal();
        this.totalAmountCalculate();
        this.validate();
    }

    totalChange(event) {
        this._total = event.target.value;
        this.setPaymentByOrder();
        this.validate();

    }

    transactionDateChange(event) {
        this._transactionDate = event.target.value;
        this.updateInterestBalance();
        this.calculateClosingInterest();
        this.validate();
    }

    handleComment(event){
        this._comments = event.target.value;
    }

    updateInterestBalance() {
        var tdate = (new Date(this._transactionDate));
        var todayDate = (new Date(this._lastPaymentDate));
        this._interestCharged = 0;
        let dayInterest = 0;

        let diffDays = Math.floor((Date.UTC(tdate.getFullYear(), tdate.getMonth(), tdate.getDate()) - Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())) / (1000 * 60 * 60 * 24));
        if(diffDays>0){
            dayInterest = getDayInterest('', '', '', parseFloat(this.rate), parseFloat(this.principalBalance), 'Simple');
            this._interestCharged = (parseFloat(dayInterest) * parseFloat(diffDays)).toFixed(2);
        }
        else{
            this._interestCharged = 0;
        }
        this._interestBalance = (parseFloat(this._actualInterestBalance) + parseFloat(this._interestCharged)).toFixed(2);
        
        this.setTotalBalance();
        this.calculateClosingTotal();
        if (this._total > 0)
            this.setPaymentByOrder();
    }


    @api
    validate() {
        console.log(this.orderedPayment);
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
            errorMessage = 'Payment amount should not be negative';
            inpPrincipal.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._total) < 0) {
            errorMessage = 'Total amount should not be negative';
            inpTotal.setCustomValidity(errorMessage);
        }

        if (parseFloat(this._interest) < 0) {
            errorMessage = 'Interest amount should not be negative';
            inpInterest.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._fee) < 0) {
            errorMessage = 'Fee amount should not be negative';
            inpFee.setCustomValidity(errorMessage);
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
            errorAll = 'The transaction has no amount entered';
        }

        if (parseFloat(this._principal) > this.principalBalance) {
            errorMessage = 'Payment amount should be less than or equal to payment balance';
            inpPrincipal.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._total) > parseFloat(this._totalBalance).toFixed(2)) {
            errorMessage = 'Total amount should be less than or equal to total balance';
            inpTotal.setCustomValidity(errorMessage);
        }
        if (parseFloat(this._interest) > parseFloat(this._interestBalance).toFixed(2)) {
            errorMessage = 'Interest amount should be less than or equal to interest balance';
            inpInterest.setCustomValidity(errorMessage)
        }
        if (parseFloat(this._fee) > this.feeBalance) {
            errorMessage = 'Fee amount should be less than or equal to fee balance';
            inpFee.setCustomValidity(errorMessage)
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
        return [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
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

            this.sortPaymentOrder();
            console.log(this.orderedPayment);

        }
    }
}