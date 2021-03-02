import { LightningElement, api, track, wire } from 'lwc';
import getAllFees from '@salesforce/apex/ChargeTransaction.getAll';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';
export default class FeeTransaction extends LightningElement {
   
    @api Ctype;
    @track _feeBalance;
    @track recordId;
    @api Amount__c;
    @api loanAmount;
    @api feeId;
    @track accountsource;
    @track fee;
    @track options = [];
    @track FeeTransactionlist;
    @track AmountHide = false;
    @track currencySymbol = CURRENCY;
    @track error;
    @track minAmount = 0;
    @track maxAmount = 0;
    @track lblAmount = "Transaction Amount"
    @track fpRequired;
    @track isFirst = true;
    @track _lastTransactionDate;


    get feeoptions() {
        return [
            { label: 'Fee', value: 'fee', },
        ];
    }

    @api
    get feeBalance() {
        return this._feeBalance;
    };
    set feeBalance(Val) {
        this._feeBalance = parseFloat(Val);
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
    get getName() {
        return this.Name;
    }
    set getName(val) {
        this.Name = val;
    }

    connectedCallback() {
        this.getData();
    }

    errorCallback(error, stack) {
        this.error = error;
    }

    @api
    get getAmount() {
        return parseFloat(this.Amount__c);
    }
    set getAmount(val) {
        this.Amount__c = val;
    }
    
    @api
    get ChargeType() {
        return this.charge;
    }
    set ChargeType(val) {
        this.charge = val;
    }

    @api
    get transactionDate() {
        return this._transactionDate;
    }

    set transactionDate(val) {
        this._transactionDate = val;
    }

    getData() {
        getAllFees().then(data => {
            if (data !== "" && data !== undefined) {
                this.FeeTransactionlist = JSON.parse(JSON.stringify(data));
                console.log(this.FeeTransactionlist);
                let count = this.FeeTransactionlist.length;
                var optionList = [];
                for (let i = 0; i < count; i++) {
                    let row = {};
                    row["label"] = this.FeeTransactionlist[i].Name;
                    row["value"] = this.FeeTransactionlist[i].Id;
                    optionList.push(row);
                }
                this.options = optionList;
                if (this.FeeTransactionlist.length > 0) {
                    if (this.feeId) {
                        this.setValues(this.feeId);
                    } else {
                        this.setValues(this.FeeTransactionlist[0].Id);
                    }
                }
            }
        }).catch(error => {
            console.log('error ' + JSON.stringify(error));
        });
    }
    handleChange(event) {
        this.feeId = event.detail.value;
        this.setValues(this.feeId);
    }

    setValues(feeIdValue) {
            this.feeId = feeIdValue;
            let count = this.FeeTransactionlist.length;
            this.lblAmount = "Transaction Amount";
            var amountvalid = this.template.querySelector(".amountvalid");
            amountvalid.setCustomValidity("");

            for (let i = 0; i < count; i++) {
                if (this.FeeTransactionlist[i].Id == this.feeId) {
                    var defaultAmount = this.FeeTransactionlist[i].Amount__c;
                    if (this.FeeTransactionlist[i].RecordType.Name == "Fixed") {
                        this.getAmount = defaultAmount;
                        this.AmountHide = true;

                    } else {
                        this.AmountHide = false;
                        defaultAmount = this.FeeTransactionlist[i].Default_Amount__c;

                        if (defaultAmount > 0) {
                            if (!(this.isFirst && this.getAmount > 0))
                                this.getAmount = defaultAmount;

                            this.minAmount = this.FeeTransactionlist[i].Minimum__c;
                            this.maxAmount = this.FeeTransactionlist[i].Maximum__c;
                        }

                        var percentage = this.FeeTransactionlist[i].Percentage__c;
                        if (percentage > 0) {
                            let lAmount = parseFloat(this.loanAmount);
                            this.getAmount = lAmount * percentage / 100;
                            this.AmountHide = true;
                            this.lblAmount = this.lblAmount + " (" + lAmount + " % " + percentage + ")"
                        }

                        var formula = this.FeeTransactionlist[i].Formula__c;
                        if (formula != undefined) {
                            if (formula.length > 0) {
                                var L = parseFloat(this.loanAmount);
                                formula = this.replaceAll(formula, "L", L);
                                this.getAmount = eval(formula);
                                this.lblAmount = this.lblAmount + " (" + formula + ")"
                                this.AmountHide = true;
                            }
                        }
                    }
                    this.isFirst = false;
                    break;
                }
            }
        }
        //Amount         
    handleAmountChange(event) {
        this.getAmount = event.target.value;
        this.validate();
    }
    handleChargeChange(event) {
        this.ChargeType = event.target.value;
    }
    transactionDateChange(event) {
        this.transactionDate = event.target.value;
    }
    @api
    validate() {
        var tp = this.template.querySelector(".tp");
        tp.setCustomValidity("");
        var isValid = true;
        var errorMessage = "";
        var amountvalid = this.template.querySelector(".amountvalid");
        amountvalid.setCustomValidity("");
        var errorAll = "";

        if (this.getAmount < 0) {
            amountvalid.setCustomValidity('Amount should not be negative');
            isValid = false;
        } else if (this.getAmount < this.minAmount) {
            amountvalid.setCustomValidity("Amount must be at least " + this.currencySymbol + this.minAmount);
            isValid = false;
        } else if (this.getAmount > this.maxAmount) {
            amountvalid.setCustomValidity("Amount must be less than " + this.currencySymbol + this.maxAmount);
            isValid = false;
        }
        isValid = this.getValidForm();


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
    renderedCallback()
     {
        // if (!this.renderedCallbackExecuted) 
        // {
        //     if (this.FeeTransactionlist.length > 0) 
        //     {
        //     //     const style = document.createElement('style');
        //     //     style.innerText = `.slds-modal__content{
        //     //     overflow: initial;
        //     //     width: 100% !important;
        //     //     max-width: 100% !important;
        //     // }`;
        //         this.template.querySelector('div').appendChild(style);

        //         this.validate();

        //         this.renderedCallbackExecuted = true;
        //     }
        //     // this.handleAmountChange();
        //     //this.transactionDateChange();
        // }
        if (!this.renderedCallbackExecuted) {
            this.validate();
        }
    }

    replaceAll(str, term, replacement) {
        return str.replace(new RegExp(this.escapeRegExp(term), 'g'), replacement);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

}