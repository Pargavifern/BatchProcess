import { LightningElement, track, wire, api } from 'lwc';
//import getLoanProducts from '@salesforce/apex/LoanProductController.getLoanProducts';
//import getInterestProducts from '@salesforce/apex/InterestProductController.getAll';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';
import { registerListener } from 'c/pubsub';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';


export default class LoanCalculatorSidebar extends LightningElement {

    @track error;
    //@track interestProducts = [];
    @track amount = 1.00;
    @track repaymentAmount = 1.00;
    @track payment;
    @track selectedLoanProductValue;
    @track selectedInterestProductValue;
    @track selectedLoanProduct;
    @track minTerm;
    @track maxTerm;
    @track minTermTemp;
    @track maxTermTemp;
    @track minAmount;
    @track maxAmount;
    @track minRate;
    @track maxRate;
    @track DefaultRate;
    @track selectedRate = 0;
    @track selectedTerm = 0;
    @track selectedLoanProductName;
    @track repaymentFrequency;
    @track repaymentFrequencylabel;
    @track balloonAmount = 0.00;
    @track periodsDeferredWithGrace = 0;
    @track seasonalPeriods = "";
    @track seasonalInterestPaid = false;
    @track seasonalRepeat = false;
    @track seasonalPaymentAmount = 0;
    @track selectedInterestProductText;
    @track loanProductRecordType;
    @track disableRate;
    @track interestProductRate;
    @track calculationMethod = '1';

    @track selectedRepaymentFrquency = '4'; //default monthly
    @track rateLabel = "Rate";
    @track termInputLabel = "Term (months)";
    @track termTypeLabel = "months";

    @track interestCalculationMethod;
    @track dayCount;
    @track interestCompoundingFrequency;
    @track isCalculated = false;

    @track advanced = false;
    @track AdvancedLabel = "Show Advanced";

    @track annualRepaymentFrequency = false;
    @track currencySymbol = CURRENCY;

    @track interestProductId;
    @track fpRequired = false;

    @wire(CurrentPageReference) pageRef;

    @track stack;
    @track initialpaymentdate;
    @track disbursalDate;

    @track amountShown = true;
    @track termShown = true;
    @track repaymentAmountShown = false;

    //get the selected product details
    @wire(getRecord, { recordId: '$selectedLoanProductValue', layoutTypes: ['Full'] })
    wiredOptions({ error, data }) {
        if (data) {
            this.assign_starting_values(data);
        } else if (error) {
            this.error = error;
            console.log("Loan Product Error", this.error);
        }
    }

    assign_starting_values(data) {
        let LoanRecord = JSON.parse(JSON.stringify(data));

        this.loanProductRecordType = LoanRecord.recordTypeInfo.name;

        this.minTerm = getFieldValue(data, 'Loan_Product__c.Minimum_Term__c');
        this.maxTerm = getFieldValue(data, 'Loan_Product__c.Maximum_Term__c');
        this.minTermTemp = getFieldValue(data, 'Loan_Product__c.Minimum_Term__c');
        this.maxTermTemp = getFieldValue(data, 'Loan_Product__c.Maximum_Term__c');
        this.minAmount = getFieldValue(data, 'Loan_Product__c.Minimum_Amount__c');
        this.maxAmount = getFieldValue(data, 'Loan_Product__c.Maximum_Amount__c');
        this.maxRate = getFieldValue(data, 'Loan_Product__c.Maximum_Rate__c');
        this.minRate = getFieldValue(data, 'Loan_Product__c.Minimum_Rate__c');
        this.interestCalculationMethod = getFieldValue(data, 'Loan_Product__c.Interest_Calculation_Method__c');
        this.dayCount = getFieldValue(data, 'Loan_Product__c.Day_Count__c');
        this.interestCompoundingFrequency = getFieldValue(data, 'Loan_Product__c.Interest_Compounding_Frequency__c');
        if (this.amount < this.minAmount || this.amount > this.maxAmount || this.amount === 0.00) {
            this.amount = this.maxAmount / 2;
        }
        if (this.selectedTerm < this.minTerm || this.selectedTerm > this.maxTerm || this.selectedTerm === 0) {
            this.selectedTerm = Math.round(this.maxTerm / 2);
        }

        let ip = getFieldValue(data, 'Loan_Product__c.Interest_Product__c');
        if (ip != null) {
            this.interestProductId = ip;
        } else {
            this.interestProductId = '';
            //this.setRate(undefined, getFieldValue(data, 'Loan_Product__c.Default_Rate__c'));
            this.setRate(undefined, this.minRate);
        }
    }

    @wire(getRecord, { recordId: '$interestProductId', fields: ['Interest_Product__c.Current_Rate__c'] })
    interPrdoucts({ error, data }) {
        if (data) {
            this.setRate(getFieldValue(data, 'Interest_Product__c.Current_Rate__c'), 0)
        } else if (error) {
            this.error = error;
            console.log("Interest Product Error", this.error);
        }
    }
    // @wire(getInterestProducts)
    // wiredInterestProducts({ error, data }) {
    //     if (data) {
    //         this.interestProducts = data;
    //         this.error = undefined;
    //     } else if (error) {
    //         this.error = error;
    //         this.interestProducts = undefined;
    //     }
    // }

    connectedCallback() {
        let today = new Date();
        this.disbursalDate = today.toISOString();

        var addDate = new Date(today.setMonth(today.getMonth() + 1));
        this.initialpaymentdate = addDate.toISOString();

        registerListener("handle_inline_recalculate", this.handleInlineRealculate, this);
    }

    connectedCallback() {
        registerListener("handle_calculated_values", this.handleCalculatedValues, this);
    }

    // get interestProductOptions() {
    //     return this.interestProducts.map(function(x) {
    //         return {
    //             value: x.Id,
    //             label: x.Name
    //         }
    //     });
    // }

    get repaymentOptions() {
        return [
            { label: 'Daily', value: '1' },
            { label: 'Weekly', value: '2' },
            { label: 'Fortnightly', value: '3' },
            { label: 'Monthly', value: '4' },
            { label: 'Quarterly', value: '5' },
            { label: 'Annually', value: '6' },
        ];
    }

    get calculationOptions() {
        return [
            { label: 'Using Loan Amount and Term', value: '1' },
            { label: 'Using Term and Repayment Amount', value: '2' },
            { label: 'Using Loan Amount and Repayment Amount', value: '3' },
        ];
    }

    setRate(Current_Rate__c, defaultRate) {
        this.interestProductRate = Current_Rate__c;
        // const filtedInterestProduct = this.interestProducts.filter(function(interestProduct) {
        //     return interestProduct.Id === selectedRate;
        // });
        var a = this.template.querySelector(".inp");
        // if (filtedInterestProduct[0].Current_Rate__c == undefined || filtedInterestProduct[0].Current_Rate__c == null) {

        //     a.setCustomValidity("Selected interest product must have an interest rate");
        //     this.selectedRate = null;
        //     return;
        // } else {
        //     a.setCustomValidity("");
        // }

        if (Current_Rate__c == undefined || Current_Rate__c == null) {

            //  this.disableRate = true;
            this.rateLabel = "Rate";
            this.selectedRate = defaultRate;
            // this.minRate = 1;

        } else {
            this.rateLabel = "Rate  + (" + Current_Rate__c + "%)";
            if (Current_Rate__c < 0)
                this.minRate = -(Current_Rate__c) + 1;
            else
                this.minRate = 1;

            this.disableRate = false;
        }

        //this.productCurrentRate = defaultRate;
    }
    // interestProductChanged(event) {
    //     if (this.selectedLoanProductValue != undefined && this.selectedLoanProductValue != null) {
    //         this.selectedInterestProductValue = event.detail.value;
    //         this.selectedInterestProductText = event.target.options.find(opt => opt.value === event.detail.value).label;
    //         this.setRate(event.detail.value, this.loanProductRecordType);

    //     } else {
    //         this.showToast('Please select loan product first', 'error');
    //         this.template.querySelectorAll('inp').forEach(each => {
    //             each.value = undefined;
    //         });
    //     }
    // }

    LoanProductChanged(event) {
        this.selectedLoanProductValue = event.detail.selectedId;
        this.selectedLoanProductName = event.detail.selectedValue;
    }

    termChanged(event) {
        var a = this.template.querySelector(".term");
        this.selectedTerm = event.target.value;

        this.selectedTerm = Math.round(this.selectedTerm);
        if (this.selectedTerm < this.minTerm) {
            a.setCustomValidity("Term must be at least " + this.minTerm);
        } else if (this.selectedTerm > this.maxTerm) {
            a.setCustomValidity("Term must be less than " + this.maxTerm);
        } else {
            a.setCustomValidity("");
        }
    }

    amountChanged(event) {
        var a = this.template.querySelector(".amt");
        var vals = a.value;

        // regexes to see if to 2 dp, if not rounds to 2 dp
        var re = new RegExp('^[0-9]{1,111}(?:\.[0-9]{1,2})?$');
        var reDecimalPoint = new RegExp('^[0-9]{1,111}(?:\.)?$');
        if (re.test(vals) || reDecimalPoint.test(vals)) {
        } else {
            vals = Math.round(vals * 100) / 100;
        }

        if (vals < this.minAmount) {
            a.setCustomValidity("Amount must be at least " + this.currencySymbol + this.minAmount);
        } else if (vals > this.maxAmount) {
            a.setCustomValidity("Amount must be less than " + this.currencySymbol + this.maxAmount);
        } else {
            a.setCustomValidity("");
        }

        this.amount = vals;
        a.value = this.amount;
    }

    repaymentAmountChanged(event) {
        var a = this.template.querySelector(".repayAmt");
        var vals = a.value;
        var amount = this.amount;

        // regexes to see if to 2 dp, if not rounds to 2 dp
        var re = new RegExp('^[0-9]{1,111}(?:\.[0-9]{1,2})?$');
        var reDecimalPoint = new RegExp('^[0-9]{1,111}(?:\.)?$');
        if (re.test(vals) || reDecimalPoint.test(vals)) {
        } else {
            vals = Math.round(vals * 100) / 100;
        }

        // if (vals <= 0 && this.calculationMethod != 2) {
        //     a.setCustomValidity("Repayment Amount must be greater than zero ");
        // } else if ((vals < amount) && this.calculationMethod != 2) {
        //     a.setCustomValidity("");
        // } else if ((vals > amount) && this.calculationMethod != 2) {
        //     a.setCustomValidity("Repayment Amount must be less than Loan Amount, " + this.currencySymbol + amount);
        // } else {
        //     a.setCustomValidity("");
        // }

        this.repaymentAmount = vals;
        a.value = this.repaymentAmount;
    }

    balloonAmountChanged(event) {

        var balloon = this.template.querySelector(".loon");
        var vals = parseInt(balloon.value);
        var max = parseInt(this.amount);

        if (vals >= max) {
            balloon.setCustomValidity(" Amount must be less than  " + this.currencySymbol + max);
        } else if (vals < 0) {
            balloon.setCustomValidity(" Amount must be positive  ");
        } else {
            balloon.setCustomValidity("");
        }

        this.balloonAmount = event.target.value;
    }

    periodsDeferredWithGraceChanged(event) {
        this.periodsDeferredWithGrace = event.target.value;
    }

    seasonalPeriodsChanged(event) {

        this.seasonalPeriods = event.target.value;
    }
    rateInputChanged(event) {
        var rate = this.template.querySelector(".rt");
        var vals = rate.value;
        if (vals < this.minRate) {
            rate.setCustomValidity(' Rate must be at least ' + this.minRate + '% ');
        } else if (vals > this.maxRate) {

            rate.setCustomValidity(' Rate must be less that ' + this.maxRate + '%');

        } else {
            rate.setCustomValidity("");
        }
        this.selectedRate = event.target.value;
    }
    dateInputChange(event) {
        this.initialpaymentdate = null;
        if (event.target.value) {
            this.initialpaymentdate = event.target.value;
            var today = null;
            var error = "";
            if (this.disbursalDate) {
                today = new Date(this.disbursalDate);
                error = "Date should be greater than Disbursal Date";
            } else {
                today = new Date();
                error = "Date should be in future";
            }
            var initialdate = new Date(this.initialpaymentdate);
            var Idate = this.template.querySelector(".dt");
            if (initialdate <= today) {
                Idate.setCustomValidity(error);
            } else {
                Idate.setCustomValidity("");
            }
        }
    }
    disbursalDateChange(event) {
        this.disbursalDate = null;
        if (event.target.value) {
            this.disbursalDate = event.target.value;
            var today = new Date();
            var initialdate = new Date(this.disbursalDate);
            var Idate = this.template.querySelector(".disbersaldt");

            if (initialdate.getDate() < today.getDate()) {
                Idate.setCustomValidity("Disbursal date should be greater than or equal to today");
            } else {
                Idate.setCustomValidity("");
            }
        }
    }
    seasonalInterestChanged(event) {
        this.seasonalInterestPaid = event.target.checked;
    }

    seasonalRepeatChanged(event) {
        this.seasonalRepeat = event.target.checked;
    }

    seasonalPaymentAmountChanged(event) {
        var season = this.template.querySelector(".sea");
        var vals = season.value;
        if (vals >= this.amount) {
            season.setCustomValidity(" Amount must be less than  " + this.currencySymbol + this.amount);
        }
        else if (vals < 0) {
            season.setCustomValidity(" Amount must be positive ");
        } else {
            season.setCustomValidity("");
        }
        this.seasonalPaymentAmount = event.target.value;
    }

    // monthlypaymentChanged(event) {
    //     this.monthlyPayment = event.target.value;
    // }

    handleRepaymentFrequencyChange(event) {
        var initialrepaymentFrequency = this.repaymentFrequency;
        this.repaymentFrequency = event.detail.value;
        this.repaymentFrequencylabel = event.target.options.find(opt => opt.value === event.detail.value).label;

        this.selectedRepaymentFrquency = this.repaymentFrequency;

        if (this.repaymentFrequency === '6') {
            this.annualRepaymentFrequency = true;
        } else {
            this.annualRepaymentFrequency = false;
        }

        this.handleTermLabelChange(initialrepaymentFrequency);
    }

    handleCustomValidationPeriodsDeferredWithGrace(event) {
        var arrayTemp = [];
        var s = 0;
        let inputValue = event.target.value;
        let inputPeriodsDeferredWithGrace = this.template.querySelector(".inputPeriodsDeferredWithGrace");
        try {
            let periodsDeferredWithGrace = inputValue;
            if (this.calculationMethod == 3 && periodsDeferredWithGrace > 0 && this.isCalculated == false) {
                inputPeriodsDeferredWithGrace.setCustomValidity("Periods of deferred grace is unavailable for this calculation method");
                inputPeriodsDeferredWithGrace.reportValidity();
                return;
            } else if (periodsDeferredWithGrace >= (this.selectedTerm - 1)) {
                inputPeriodsDeferredWithGrace.setCustomValidity("Please enter how many periods will be deferred with grace. This must be less than the Term");
                inputPeriodsDeferredWithGrace.reportValidity();
                return;
            }
            inputPeriodsDeferredWithGrace.setCustomValidity('');
            inputPeriodsDeferredWithGrace.reportValidity();
        } catch (exception) {
            window.console.log("PeriodsDeferredWithGrace validation breaking ");
            inputSeasonalPeriods.setCustomValidity("Please enter how many periods will be deferred with grace");
            inputSeasonalPeriods.reportValidity();
        }
    }

    handleCalculationMethodChange(event) {
        this.calculationMethod = event.detail.value;
        if (this.calculationMethod === '1') {
            //   Loan Amount and Term
            this.amountShown = true;
            this.termShown = true;
            this.repaymentAmountShown = false;
        }
        else if (this.calculationMethod === '2') {
            // Term and Repayment Amount
            this.amountShown = false;
            this.termShown = true;
            this.repaymentAmountShown = true;
        }
        else if (this.calculationMethod === '3') {
            // Loan Amount and Repayment Amount
            this.amountShown = true;
            this.termShown = false;
            this.repaymentAmountShown = true;
        }
        else {
            window.console.log("Error selecting calculation method");
        }
        this.handleTermLabelChange(this.repaymentFrequency);
    }

    handleTermLabelChange(initialrepaymentFrequency) {
        var termMonthsTemp = 12;
        if (this.calculationMethod === '3') {
            if (initialrepaymentFrequency === '1') {
                termMonthsTemp = Math.round(this.selectedTerm / 30.417);
            } else if (initialrepaymentFrequency === '2') {
                termMonthsTemp = Math.round(this.selectedTerm / 4.34524);
            } else if (initialrepaymentFrequency === '3') {
                termMonthsTemp = Math.round(this.selectedTerm / 2.173);
            } else if (initialrepaymentFrequency === '4') {
                termMonthsTemp = this.selectedTerm;
            } else if (initialrepaymentFrequency === '5') {
                termMonthsTemp = Math.round(this.selectedTerm * 3);
            } else if (initialrepaymentFrequency === '6') {
                termMonthsTemp = Math.round(this.selectedTerm * 12);
            }
        } else {
            if (initialrepaymentFrequency === '1') {
                termMonthsTemp = Math.round(this.selectedTerm / 30.417);
            } else if (initialrepaymentFrequency === '2') {
                termMonthsTemp = Math.round(this.selectedTerm / 4.34524);
            } else if (initialrepaymentFrequency === '3') {
                termMonthsTemp = Math.round(this.selectedTerm / 4.34524);
            } else if (initialrepaymentFrequency === '4') {
                termMonthsTemp = this.selectedTerm;
            } else if (initialrepaymentFrequency === '5') {
                termMonthsTemp = this.selectedTerm;
            } else if (initialrepaymentFrequency === '6') {
                termMonthsTemp = Math.round(this.selectedTerm * 12);
            }
        }

        if (this.calculationMethod === '3') {
            if (this.repaymentFrequency === '1') {
                this.termInputLabel = "Term (days)";
                this.termTypeLabel = "days";
                this.minTerm = Math.round(this.minTermTemp * 30.417);
                this.maxTerm = Math.round(this.maxTermTemp * 30.417);
                this.selectedTerm = Math.round(termMonthsTemp * 30.417);
            } else if (this.repaymentFrequency === '2') {
                this.termInputLabel = "Term (weeks)";
                this.termTypeLabel = "weeks";
                this.minTerm = Math.round(this.minTermTemp * 4.34524);
                this.maxTerm = Math.round(this.maxTermTemp * 4.34524);
                this.selectedTerm = Math.round(termMonthsTemp * 4.34524);
            } else if (this.repaymentFrequency === '3') {
                this.termInputLabel = "Term (fortnights)";
                this.termTypeLabel = "fortnights";
                this.minTerm = Math.round(this.minTermTemp * 2.173);
                this.maxTerm = Math.round(this.maxTermTemp * 2.173);
                this.selectedTerm = Math.round(termMonthsTemp * 2.173);
            } else if (this.repaymentFrequency === '4') {
                this.termInputLabel = "Term (months)";
                this.termTypeLabel = "months";
                this.minTerm = this.minTermTemp;
                this.maxTerm = this.maxTermTemp;
                this.selectedTerm = Math.round(termMonthsTemp);
            } else if (this.repaymentFrequency === '5') {
                this.termInputLabel = "Term (quarters)";
                this.termTypeLabel = "quarters";
                this.minTerm = Math.round((this.minTermTemp / 3) * 100.0) / 100.0;
                this.maxTerm = Math.round((this.maxTermTemp / 3) * 100.0) / 100.0;
                this.selectedTerm = Math.round(termMonthsTemp / 3);
            } else if (this.repaymentFrequency === '6') {
                this.termInputLabel = "Term (years)";
                this.termTypeLabel = "years";
                this.minTerm = Math.round((this.minTermTemp / 12) * 100.0) / 100.0;
                this.maxTerm = Math.round((this.maxTermTemp / 12) * 100.0) / 100.0;
                this.selectedTerm = Math.round(termMonthsTemp / 12);
            }
        } else {
            if (this.repaymentFrequency === '1') {
                this.termInputLabel = "Term (days)";
                this.termTypeLabel = "days";
                this.minTerm = Math.round(this.minTermTemp * 30.417);
                this.maxTerm = Math.round(this.maxTermTemp * 30.417);
                this.selectedTerm = Math.round(termMonthsTemp * 30.417);
            } else if (this.repaymentFrequency === '2') {
                this.termInputLabel = "Term (weeks)";
                this.termTypeLabel = "weeks";
                this.minTerm = Math.round(this.minTermTemp * 4.34524);
                this.maxTerm = Math.round(this.maxTermTemp * 4.34524);
                this.selectedTerm = Math.round(termMonthsTemp * 4.34524);
            } else if (this.repaymentFrequency === '3') {
                this.termInputLabel = "Term (weeks)";
                this.termTypeLabel = "weeks";
                this.minTerm = Math.round(this.minTermTemp * 4.34524);
                this.maxTerm = Math.round(this.maxTermTemp * 4.34524);
                this.selectedTerm = Math.round(termMonthsTemp * 4.34524);
            } else if (this.repaymentFrequency === '4') {
                this.termInputLabel = "Term (months)";
                this.termTypeLabel = "months";
                this.minTerm = this.minTermTemp;
                this.maxTerm = this.maxTermTemp;
                this.selectedTerm = Math.round(termMonthsTemp);
            } else if (this.repaymentFrequency === '5') {
                this.termInputLabel = "Term (months)";
                this.termTypeLabel = "months";
                this.minTerm = this.minTermTemp;
                this.maxTerm = this.maxTermTemp;
                this.selectedTerm = Math.round(termMonthsTemp);
            } else if (this.repaymentFrequency === '6') {
                this.termInputLabel = "Term (years)";
                this.termTypeLabel = "years";
                this.minTerm = Math.round((this.minTermTemp / 12) * 100.0) / 100.0;
                this.maxTerm = Math.round((this.maxTermTemp / 12) * 100.0) / 100.0;
                this.selectedTerm = Math.round(termMonthsTemp / 12);
            }
        }
    }




    getActualRate(interestProductRate, selectedRate) {
        if (interestProductRate == undefined || interestProductRate == null) {
            return selectedRate;
        }
        return parseFloat(selectedRate) + parseFloat(interestProductRate);
    }


    showToast(title, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
            }),
        );
    }

    // eslint-disable-next-line no-unused-vars
    recalculateClicked(event) {
        let fbValid = true;
        this.fpRequired = false;

        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox')].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);


        if (this.selectedLoanProductValue == '' || typeof this.selectedLoanProductValue == 'undefined') {
            this.fpRequired = true;
            fbValid = false;
        }

        if (allValid && fbValid) {

            if (this.repaymentFrequencylabel == undefined || this.repaymentFrequency == null) {
                this.repaymentFrequencylabel = "Monthly";
            }
            const parameters = {
                term: this.selectedTerm,
                Rate: this.getActualRate(this.interestProductRate, this.selectedRate),
                amount: this.amount,
                loanProductName: this.selectedLoanProductName,
                calculationMethod: this.calculationMethod,
                interestCalculationMethod: this.interestCalculationMethod,
                dayCount: this.dayCount,
                interestCompoundingFrequency: this.interestCompoundingFrequency,
                repaymentFrequency: this.selectedRepaymentFrquency,
                balloonAmount: this.balloonAmount,
                loanPrdId: this.selectedLoanProductValue,
                periodsDeferredWithGrace: this.periodsDeferredWithGrace,
                seasonalPeriods: this.seasonalPeriods,
                seasonalInterestPaid: this.seasonalInterestPaid,
                seasonalRepeat: this.seasonalRepeat,
                seasonalPaymentAmount: this.seasonalPaymentAmount,
                repaymentFrequencylabel: this.repaymentFrequencylabel,
                interestProduct: this.selectedInterestProductValue,
                interestProductText: this.selectedInterestProductText,
                selectedRate: this.selectedRate,
                initialpaymentdate: this.initialpaymentdate,
                repaymentAmount: this.repaymentAmount,
                disbursalDate: this.disbursalDate,
                maxTerm: this.maxTerm,
                minTerm: this.minTerm,
                maxAmount: this.maxAmount,
                minAmount: this.minAmount,
                termInputLabel: this.termInputLabel,
                termTypeLabel: this.termTypeLabel
            };
            fireEvent(this.pageRef, "handle_calculate", parameters);
        }
    }

    // eslint-disable-next-line no-unused-vars
    advancedClicked(event) {
        if (this.advanced === false) {
            this.advanced = true;
            this.AdvancedLabel = "Hide Advanced";
        } else if (this.advanced === true) {
            this.advanced = false;
            this.AdvancedLabel = "Show Advanced";
            this.balloonAmount = 0.00;
            this.periodsDeferredWithGrace = 0;
            this.seasonalPeriods = "";
            this.seasonalInterestPaid = false;
            this.seasonalRepeat = false;
            this.seasonalPaymentAmount = 0;
        }
    }

    handleCustomValidationSeasonalPayments(event) {
        var arrayTemp = [];
        var s = 0;
        let inputValue = event.target.value;
        let inputSeasonalPeriods = this.template.querySelector(".inputSeasonalPeriods");
        try {
            let seasonalPeriods = inputValue.replace(/\s+/g, '');
            if (this.calculationMethod == 3 && seasonalPeriods.length > 0 && this.isCalculated == false) {
                inputPeriodsDeferredWithGrace.setCustomValidity("Periods of deferred grace is unavailable for this calculation method");
                inputPeriodsDeferredWithGrace.reportValidity();
                window.console.log("this.periodsDeferredWithGrace : " + this.periodsDeferredWithGrace);
                return;
            } else if (seasonalPeriods.length > 0) {
                arrayTemp = this.seasonalPeriods.split(",");
                for (s = 0; s < arrayTemp.length; s++) {
                    if (isNaN(Number(arrayTemp[s]))) {
                        inputSeasonalPeriods.setCustomValidity("Please enter seasonal period number separated by a comma");
                        inputSeasonalPeriods.reportValidity();
                        return;
                    }
                }
                inputSeasonalPeriods.setCustomValidity('');
                inputSeasonalPeriods.reportValidity();
            } else {
                inputSeasonalPeriods.setCustomValidity('');
                inputSeasonalPeriods.reportValidity();
            }
        } catch (exception) {
            inputSeasonalPeriods.setCustomValidity("Please enter seasonal period number separated by a comma");
            inputSeasonalPeriods.reportValidity();
        }
    }

    handleInlineRealculate(args) {
        try {
            if (this.advanced === false) {
                this.advanced = true;
                this.AdvancedLabel = "Hide Advanced";
            }
            this.seasonalPeriods = args.seasonalPeriods;
            this.periodsDeferredWithGrace = args.periodsDeferredWithGrace;

            let seasonalIntCheckbox = this.template.querySelector(".seasonal-interest-checkbox");
            if (args.seasonalInterestPaid === true) {
                seasonalIntCheckbox.checked = true;
                this.seasonalInterestPaid = args.seasonalInterestPaid;
            }
            let seasonalRepeatCheckbox = this.template.querySelector(".seasonal-repeat-checkbox");
            if (args.seasonalRepeat === true) {
                seasonalRepeatCheckbox.checked = true;
                this.seasonalRepeat = args.seasonalRepeat;
            }
            this.recalculateClicked();
        } catch (exception) {
            window.console.log("exception : " + exception);
        }
    }

    handleCalculatedValues(args) {
        try {
            this.amount = args.amount;
            this.selectedTerm = args.term;
            this.repaymentAmount = args.repaymentAmount;
            this.isCalculated = args.isCalculated;
        } catch (exception) {
            window.console.log("exception : " + exception);
        }
    }

}