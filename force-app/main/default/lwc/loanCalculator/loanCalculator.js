import { LightningElement, track, wire, api } from 'lwc';
//import getLoanProducts from '@salesforce/apex/LoanProductController.getLoanProducts';
//import getInterestProducts from '@salesforce/apex/InterestProductController.getAll';
import { CurrentPageReference } from 'lightning/navigation';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTempScheduledTrasactions from '@salesforce/apex/LoanCalculator.getScheduledTrasactions';
import placeholderimages from '@salesforce/resourceUrl/placeholderimages';
import { FlowNavigationNextEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';


const COLS = [
    { label: 'Payment', fieldName: 'Payment_Number__c', type: 'number', cellAttributes: { alignment: 'left' }, initialWidth: 96 },
    { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date' },
    { label: 'Total Payment', fieldName: 'Total_Payment__c', type: 'currency' },
    { label: 'Principal', fieldName: 'Principal__c', type: 'currency' },
    { label: 'Interest', fieldName: 'Interest__c', type: 'currency' },
    { label: 'Balance', fieldName: 'Remaining_Balance__c', type: 'currency' }
];


export default class LoanCalculator extends LightningElement {
    @api applicationRecord;
    @api availableActions = [];

    @track error;
    @track interestProducts = [];
    @track amount = 1.00;

    @track placeimage;
    @track payment;
    @track selectedLoanProductValue;
    @track selectedInterestProductValue;
    @track selectedLoanProduct;
    @track minTerm;
    @track maxTerm;
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
    @track loanScheduleFormattedWTotals;
    @track totalInterestFormatted;
    @track totalRepaidFormatted;
    @track datePayedOff;
    @track remainingPayments;
    @track repaymentLabel;
    @track chartTitleLabel;

    @track selectedRepaymentFrquency = '4'; //default monthly
    @track rateLabel = "Rate";
    @track isCalculated = false;
    @track finalRate;

    @track interestCalculationMethod;
    @track dayCount;
    @track interestCompoundingFrequency;
    @track contactId;
    @track accountId;
    @track loanRecordType;

    @track advanced = false;
    @track AdvancedLabel = "Show Advanced";

    @track annualRepaymentFrequency = false;
    @track currencySymbol = CURRENCY;
    @track columns = COLS;
    @track chartprincipal = [];
    @track charttempInterest = [];
    @track chartremainingTotalBalance = [];
    @track xAxis = [];
    @track numLoanRepaymentFormatted;
    @track disbursalDate;


    @wire(CurrentPageReference) pageRef;

    @track interestProductId;
    @track fpRequired = false;

    @track stack;
    @track initialpaymentdate;


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
        this.minAmount = getFieldValue(data, 'Loan_Product__c.Minimum_Amount__c');
        this.maxAmount = getFieldValue(data, 'Loan_Product__c.Maximum_Amount__c');
        this.maxRate = getFieldValue(data, 'Loan_Product__c.Maximum_Rate__c');
        this.minRate = getFieldValue(data, 'Loan_Product__c.Minimum_Rate__c');
        this.interestCalculationMethod = getFieldValue(data, 'Loan_Product__c.Interest_Calculation_Method__c');
        this.dayCount = getFieldValue(data, 'Loan_Product__c.Day_Count__c');
        this.interestCompoundingFrequency = getFieldValue(data, 'Loan_Product__c.Interest_Compounding_Frequency__c');

        if (this.amount < this.minAmount || this.amount > this.maxAmount || this.amount === 0.00) {
            this.amount = getFieldValue(data, 'Loan_Product__c.Default_Amount__c');
        }

        if (this.selectedTerm < this.minTerm || this.selectedTerm > this.maxTerm || this.selectedTerm === 0.00) {
            this.selectedTerm = getFieldValue(data, 'Loan_Product__c.Default_Term__c');
        }

        let ip = getFieldValue(data, 'Loan_Product__c.Interest_Product__c');
        if (ip != null) {
            this.interestProductId = ip;
        } else {
            this.interestProductId = '';
            this.setRate(undefined, getFieldValue(data, 'Loan_Product__c.Default_Rate__c'));
        }
        this.initialpaymentdate = getFieldValue(data, 'Application__c.Initial_Payment_Date__c');
    }

    //get the interest product details if it is present
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
        this.placeimage = placeholderimages;
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


        if (vals < this.minAmount) {
            a.setCustomValidity("Amount must be at least " + this.currencySymbol + this.minAmount);
        } else if (vals > this.maxAmount) {
            a.setCustomValidity("Amount must be less than " + this.currencySymbol + this.maxAmount);
        } else {
            a.setCustomValidity("");
        }

        this.amount = event.target.value;
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
        //nitialpaymentdate
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
            if (initialdate < today) {
                Idate.setCustomValidity("Date should be in future");
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
            season.setCustomValidity(" Amount must be less than " + this.currencySymbol + this.amount);
        } else if (vals < 0) {
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
        this.repaymentFrequency = event.detail.value;
        this.repaymentFrequencylabel = event.target.options.find(opt => opt.value === event.detail.value).label;

        this.selectedRepaymentFrquency = this.repaymentFrequency;
        if (this.repaymentFrequency === '6') {
            this.annualRepaymentFrequency = true;
        } else {
            this.annualRepaymentFrequency = false;
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
            this.isCalculated = true;
            this.setLabel();
            if (this.repaymentFrequencylabel == undefined || this.repaymentFrequency == null) {
                this.repaymentFrequencylabel = "Monthly";
            }
            this.finalRate = this.getActualRate(this.interestProductRate, this.selectedRate) / 100;

            var calculator = {
                term: this.selectedTerm,
                amount: this.amount,
                calculationMethod: this.interestCalculationMethod,
                dayCount: this.dayCount,
                interestCompoundingFrequency: this.interestCompoundingFrequency,
                repaymentFrequency: this.repaymentFrequencylabel,
                balloonAmount: this.balloonAmount,
                loanPrdId: this.selectedLoanProductValue,
                periodsDeferredWithGrace: this.periodsDeferredWithGrace,
                seasonalPeriods: this.seasonalPeriods,
                seasonalInterestPaid: this.seasonalInterestPaid,
                seasonalRepeat: this.seasonalRepeat,
                seasonalPaymentAmount: this.seasonalPaymentAmount,
                interestProduct: this.selectedInterestProductValue,
                interestProductText: this.selectedInterestProductText,
                Rate: this.selectedRate,
                initialpaymentdate: this.initialpaymentdate,
                disbursalDate: this.disbursalDate
            };


            if (calculator.calculationMethod != 'Compound') {
                calculator.interestCompoundingFrequency = 'Monthly';
            }

            getTempScheduledTrasactions({ params: JSON.stringify(calculator) }).then(result => {
                this.loanScheduleFormattedWTotals = this.getTransactionWithSummery(result);
                this.setApplicationValues(calculator);
            }).
            catch(error => {
                this.error = error;
                console.log(' error occurred : ', JSON.parse(JSON.stringify(error)));
            });
            // fireEvent(this.pageRef, "handle_calculate", parameters);
        }
    }

    getTransactionWithSummery(dataValues) {
        var totalFee = 0.00;
        var totalInterest = 0.00;
        var totalAmount = 0.00;
        if (dataValues.length > 0) {
            for (var i = 0; i < dataValues.length; i++) {

                if (dataValues[i].Type__c == 'Disbursal') {
                    dataValues[i].Payment_Number__c = null;
                    dataValues[i].Fees__c = null;
                    dataValues[i].Interest__c = null;
                } else {
                    totalFee += dataValues[i].Fees__c;
                    totalInterest += dataValues[i].Interest__c;
                    totalAmount += dataValues[i].Total_Payment__c;
                    this.chartprincipal[i] = Math.round(dataValues[i].Principal__c * 100) / 100;
                    this.charttempInterest[i] = Math.round(dataValues[i].Interest__c * 100) / 100;
                    this.chartremainingTotalBalance[i] = Math.round(dataValues[i].Remaining_Balance__c * 100) / 100;
                    this.xAxis[i] = this.formatDate(new Date(dataValues[i].Payment_Date__c));
                }

            }
            dataValues.push({ Principal__c: parseFloat(this.amount).toFixed(2), Interest__c: (totalAmount - parseFloat(this.amount)).toFixed(2), Fees__c: totalFee.toFixed(2), Total_Payment__c: totalAmount.toFixed(2) })
            this.datePayedOff = dataValues[dataValues.length - 2].Payment_Date__c;
            this.remainingPayments = dataValues.length;
            this.numLoanRepaymentFormatted = dataValues[dataValues.length - 2].Total_Payment__c;
            this.updateChart();
        }

        this.totalInterestFormatted = totalInterest;
        this.totalRepaidFormatted = totalAmount;




        return dataValues;
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
            if (seasonalPeriods.length > 0) {
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
            this.recalculateClicked()
        } catch (exception) {
            window.console.log("exception : " + exception);
        }
    }

    renderedCallback() {
        const style = document.createElement('style');
        style.innerText = `.uiModal--medium .modal-container{
                                width: 90% !important;
                                max-width: 90% !important;
                             }
                             c-new-record-lookup .slds-fade-in-open{
                                margin-left: -76px;
                                margin-right: -76px;
                             }`;
        this.template.querySelector('lightning-card').appendChild(style);
    }

    setLabel() {
        switch (parseInt(this.repaymentFrequency)) {
            case 1: //daily
                this.repaymentLabel = "Daily Payment";
                this.chartTitleLabel = "Daily Payments Chart";
                break;
            case 2: //weekly
                this.repaymentLabel = "Weekly Payment";
                this.chartTitleLabel = "Weekly Payments Chart";
                break;
            case 3: //fortnightly
                this.repaymentLabel = "Fortnightly Payment";
                this.chartTitleLabel = "Fortnightly Paymepnts Chart";
                break;
            case 4: //monthly
                this.repaymentLabel = "Monthly Payment";
                this.chartTitleLabel = "Monthly Payments Chart";
                break;
            case 5: //quarterly
                this.repaymentLabel = "Quarterly Payment";
                this.chartTitleLabel = "Quarterly Payments Chart";
                break;
            case 6: //yearly
                this.repaymentLabel = "Yearly Payment";
                this.chartTitleLabel = "Yearly Payments Chart";
                break;
            default: //monthly
                this.repaymentLabel = "Monthly Payment";
                this.chartTitleLabel = "Monthly Payments Chart";
                break;
        }
    }

    formatDate(date) {
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    updateChart() {
        try {
            this.template.querySelector("c-loan-calculator-chart").updatechart(this.xAxis, this.chartprincipal, this.charttempInterest, this.chartremainingTotalBalance, this.repaymentLabel);
        } catch (exception) {
            window.console.log("Error updating chart");
        }
    }

    setApplicationValues(value) {

        this.applicationRecord = { 'sobjectType': 'Application__c' };
        this.applicationRecord.Rate__c = value.Rate;
        this.applicationRecord.Term__c = value.term;
        this.applicationRecord.Date__c = new Date();
        this.applicationRecord.Loan_Product__c = value.loanPrdId;
        this.applicationRecord.Amount__c = value.amount;
        this.applicationRecord.Balloon_Amount__c = parseFloat(value.balloonAmount);
        this.applicationRecord.Pay_Seasonal_Interest__c = value.seasonalInterestPaid;
        this.applicationRecord.Periods_Deferred_with_Grace__c = parseInt(value.periodsDeferredWithGrace);
        this.applicationRecord.Repeat_Seasonal_Periods__c = value.seasonalRepeat;
        this.applicationRecord.Seasonal_Payment_Amount__c = value.seasonalPaymentAmount;
        this.applicationRecord.Seasonal_Periods__c = value.seasonalPeriods;
        this.applicationRecord.Repayment_Frequency__c = value.repaymentFrequency;
        this.applicationRecord.Interest_Product__c = value.interestProduct;
        this.applicationRecord.Initial_Payment_Date__c = value.initialpaymentdate;
        this.applicationRecord.Disbursal_Date__c = value.disbursalDate;
    }

    handleApply(event) {
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
            if (this.applicationRecord != null && this.applicationRecord != undefined) {
                if (this.availableActions.find(action => action === 'NEXT')) {
                    const navigateNextEvent = new FlowNavigationNextEvent();
                    this.dispatchEvent(navigateNextEvent);
                } else if (this.availableActions.find(action => action === 'FINISH')) {
                    const navigateFinishEvent = new FlowNavigationFinishEvent();
                    this.dispatchEvent(navigateFinishEvent);
                }
            } else if (this.fpRequired) {
                this.showToast("Please choose the Loan product", "error");
            } else {
                this.showToast("Please calculate the application before apply", "error");
            }
        }
    }

}