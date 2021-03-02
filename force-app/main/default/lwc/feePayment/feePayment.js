import { LightningElement, api, track } from 'lwc';

export default class FeePayment extends LightningElement {

    @api feeBalance;
    @api transactionDate;
    @track _lastTransactionDate;
    @api amount;
    @api feeName;

    @track renderedCallbackExecuted;

    @api
    get lastTransactionDate() {
        return this._lastTransactionDate;
    }

    set lastTransactionDate(val) {
        let d = new Date(val);
        this._lastTransactionDate = d.toDateString();
    }

    connectedCallback() {
        if (this.amount == undefined) {
            this.amount = this.feeBalance;
        }
    }


    handleAmountChange(event) {
        this.amount = event.target.value;
    }

    transactionDateChange(event) {
        this.transactionDate = event.target.value;
    }

    getValidForm() {
        return [...this.template.querySelectorAll('lightning-input, lightning-combobox')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }

    @api validate() {
        var isValid = this.getValidForm();


        if (!isValid) {
            return {
                isValid: false,
                errorMessage: ""
            };
        } else {
            return {
                isValid: true,
                errorMessage: ""
            };
        }
    }
    renderedCallback() {
        if (!this.renderedCallbackExecuted) {
            this.validate();
        }
    }


}