import { LightningElement, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';
import placeholderimages from '@salesforce/resourceUrl/placeholderimages';
import { getDayInterest } from 'c/loanUtil';

const COLS = [
    { label: 'Payment', fieldName: 'paymentNumber', type: 'number', cellAttributes: { alignment: 'left' }, initialWidth: 96 },
    { label: 'Payment Date', fieldName: 'paymentDate', type: 'date' },
    { label: 'Total Payment', fieldName: 'totalPayment', type: 'currency' },
    { label: 'Principal', fieldName: 'principal', type: 'currency' },
    { label: 'Interest Paid', fieldName: 'interestPaid', type: 'currency' },
    { label: 'Interest', fieldName: 'interest', type: 'currency' },
    { label: 'Balance', fieldName: 'remainingBalance', type: 'currency' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Make seasonal period', name: 'seasonal' },
                { label: 'Set grace period', name: 'deferred' },
                { label: 'Repeat seasonal payments', name: 'repeat' },
                { label: 'Pay seasonal interest', name: 'interest' },
            ]
        }
    },
];

const bactions = [
    { label: 'Make seasonal period', name: 'seasonal' },
];

export default class loanCalculatorDetails extends LightningElement {

    @track con = false;
    @track columns = COLS;

    @track loanProductName;
    @track interestProductName
    @track amount = "0.00";
    @track monthlyPayment = "0.00";
    @track term;
    @track Rate;
    @track calculationMethod;
    @track dayCount;
    @track interestCompoundingFrequency;
    @track repaymentFrequency;
    @track balloonAmount;
    @track periodsDeferredWithGrace;
    @track seasonalPeriods;

    //preset to every month (can't change)
    @track repaymentPeriod = 3;
    @track repaymentNum = 1;
    //preset to every month but depends on loan product, no continuous compounding
    @track compoundPeriod = 3;
    @track compoundNum = 1;
    @track continuousCompounding = false;
    //preset to every month (can't change)
    @track termPeriod = 3;
    @track termNum = 1; // monthly
    //not in calculator, default to zero
    @track balloonPayment = 0.0;
    @track oddDays = 0;
    @track periodsDeferredWithGrace = 0;
    @track seasonalNoPayment = [];
    @track seasonalNoPaymentTerm = [];
    @track seasonalNoInterest = 0;
    @track seasonalInterestPaid = false;
    @track seasonalRepeat = false;
    @track seasonalPaymentAmount = 0;
    @track minTerm;
    @track maxTerm;
    @track minAmount;
    @track maxAmount;
    @track selectedRow;

    @track compound;
    @track isCalculated = false;
    @track isTermTooLarge = false;
    @track isTermTooSmall = false;
    @track isAmountTooLarge = false;
    @track isAmountTooSmall = false;
    @track isTermBroken = false;
    @track isCalculationBroken = false;
    @track balloonBool = false;

    @track repaymentPOY;
    @track compoundPOY;
    @track termPOY;

    @track numLoanRepayment = 0.0;
    @track numLoanRepaymentFormatted = 0.0;
    @track datePayedOff;
    @track repaymentLabel = "Monthly Payment";
    @track chartTitleLabel = "Monthly Payments Chart";
    @track termInputLabel = "Term (months)";
    @track termTypeLabel = "months";

    @track remainingPayments;
    @track totalInterest;
    @track totalInterestPaid;
    @track totalPrincipal;
    @track totalRepaid;
    @track totalInterestFormatted;
    @track totalInterestPaidFormatted;
    @track totalRepaidFormatted;
    @track totalPrincipalFormatted;

    @track p;
    @track c;
    @track n;
    @track _pn;
    @track pn;
    @track _i;
    @track _iop;
    @track _an;
    @track _r;
    @track _ans = 0;
    @track _ansP = 0;
    @track s;
    @track _s // used as count
    @track tem;

    @track loanSchedule = [];
    @track loanScheduleFormatted = [];

    @track help = 0;
    @track tempDate;

    @track schedNo;
    @track schedDate;

    @track chartprincipal = [];
    @track charttempInterest = [];
    @track chartremainingTotalBalance = [];
    @track xAxis = [];
    @track placeimage;
    @wire(CurrentPageReference) pageRef;
    @track initialpaymentdate;
    @track disbursalDate;
    @track initialDate;

    allowedFileTypes = [".png", ".jpg", ".jpeg", ".svg"];

    connectedCallback() {
        this.placeimage = placeholderimages;
        registerListener("handle_calculate", this.handleCalculate, this);

    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    renderedCallback() {
        //used to add space between the tabs
        var tag;
        const style = document.createElement('style');
        style.innerText = `c-loan-calculator-details .slds-tabs_default__item + .slds-tabs_default__item{
            margin-left: var(--lwc-varSpacingHorizontalLarge,1.5rem);
        }`;
        tag = this.template.querySelector('lightning-tabset');
        if (tag != null) {
            tag.appendChild(style);
        }
    }


    handleCalculate(args) {
        var parameters;
        //preset to zero
        this.balloonPayment = 0.0;
        this.oddDays = 0;
        this.periodsDeferredWithGrace = 0;
        this.seasonalNoPayment = [];
        // this.selectedRow = [];
        this.seasonalNoPaymentTerm = [];
        this.seasonalNoInterest = 0;
        this.seasonalInterestPaid = false;
        this.seasonalRepeat = false;
        this._ans = 0;
        this._ansP = 0;
        this.tem = null;
        this.remainingPayments = 0;
        this._pn = 0;
        this.loanSchedule = [];
        this.loanScheduleFormatted = [];
        this.loanScheduleFormattedWTotals = [];
        //setup variables from calculator form data
        this.term = args.term;
        this.Rate = args.Rate;
        this.amount = args.amount;
        this.numLoanRepayment = args.repaymentAmount;
        this.loanProductName = args.loanProductName;
        this.calculationMethod = args.calculationMethod;
        this.interestCalculationMethod = args.interestCalculationMethod;
        //this.interestProductName = args.interestProductText;
        this.dayCount = args.dayCount;
        this.interestCompoundingFrequency = args.interestCompoundingFrequency;
        this.repaymentFrequency = parseInt(args.repaymentFrequency, 0);
        this.balloonAmount = args.balloonAmount;
        if (this.balloonAmount > 0) {
            this.balloonBool = true;
        }
        this.periodsDeferredWithGrace = args.periodsDeferredWithGrace;
        this.seasonalPeriods = args.seasonalPeriods;
        this.seasonalInterestPaid = args.seasonalInterestPaid;
        this.seasonalRepeat = args.seasonalRepeat;
        this.seasonalPaymentAmount = args.seasonalPaymentAmount;
        this.initialpaymentdate = args.initialpaymentdate;
        this.disbursalDate = args.disbursalDate;
        this.minTerm = args.minTerm;
        this.maxTerm = args.maxTerm;
        this.minAmount = args.minAmount;
        this.maxAmount = args.maxAmount;
        this.termInputLabel = args.termInputLabel;
        this.termTypeLabel = args.termTypeLabel;

        this.isCalculated = false;
        this.isTermTooLarge = false;
        this.isTermTooSmall = false;
        this.isAmountTooLarge = false;
        this.isAmountTooSmall = false;
        this.isTermBroken = false;
        this.isCalculationBroken = false;

        this.loanProductSwitch();
        this.continuousCompounding = false;

        if (this.calculationMethod != '3') {

            this.termNum = this.term;
            this.repaymentPOY = this.partOfYear(this.dc, this.repaymentPeriod);
            this.compoundPOY = this.partOfYear(this.dc, this.compoundPeriod);
            this.termPOY = this.partOfYear(this.dc, this.termPeriod);

            this.p = this.repaymentPOY / this.repaymentNum;
            this.c = this.compoundPOY / this.compoundNum;
            this.n = this.termNum / this.termPOY;

            // round pn
            this._pn = parseInt((this.p * this.n).toFixed(2));

            this.createSeasonalPayments();

            this.loanCalculation();
        } else if (this.calculationMethod === '3') {
            this.loanCalculation();
            this.loanCalculation();
        }

        //this.loanCalculation();

        try {
            this.loanSchedule = this.createLoanSchedule();
        } catch (exception) {
            window.console.log("Error creating loan schedule");
            this.isCalculationBroken = true;
        }

        try {
            this.loanScheduleFormatted = this.formatSchedule(this.loanSchedule);
        } catch (Exception) {
            window.console.log("Error formatting schedule");
            this.isCalculationBroken = true;
        }

        try {
            this.loanScheduleFormattedWTotals = this.formatScheduleTotals(this.loanSchedule);
        } catch (Exception) {
            window.console.log("Error formatting schedule with totals");
            this.isCalculationBroken = true;
        }

        this.isCalculated = true;
        if (this.isCalculationBroken === true || this.isTermBroken === true || this.isTermTooLarge === true || this.isTermTooSmall === true || this.isAmountTooLarge === true || this.isAmountTooSmall === true) {
            this.isCalculated = false;
        }

        parameters = {
            amt: this.amount,
            interest: this._i,
            payments: Math.ceil(this._pn),
            datePaid: this.formatDate(this.datePayedOff),
            loanPrdName: this.loanProductName,
            term: this.term,
            repayment: this.repaymentLabel,
            // interestProductName: this.interestProductName,
            schedule: this.scheduleContent(),
        };
        fireEvent(this.pageRef, "pass_data_to_mail", parameters);
        try {
            this.template.querySelector("c-loan-calculator-chart").updatechart(this.xAxis, this.chartprincipal, this.charttempInterest, this.chartremainingTotalBalance, this.repaymentLabel);
        } catch (exception) {
            window.console.log("Error updating chart");
        }
        this.sendCalculatedValues();
    }

    // eslint-disable-next-line consistent-return
    createSeasonalPayments() {
        var s = 0;
        var t = 0;
        this.seasonalPeriods = this.seasonalPeriods.replace(/\s+/g, '');

        if (this.seasonalPeriods.length === 0) {
            return "";
        }

        this.seasonalNoPayment = this.seasonalPeriods.split(",").map(Number);

        if (this.seasonalRepeat === true && this.seasonalPeriods.length > 0) {
            let p = this.repaymentPOY / this.repaymentNum;
            let ps = Math.round(p);

            for (t = 0; t < this._pn; t = t + ps) {
                for (s = 0; s < this.seasonalNoPayment.length; s++) {
                    let total = this.seasonalNoPayment[s] + t;
                    this.seasonalNoPaymentTerm.push(total);
                }
            }
        } else {
            for (s = 0; s < this.seasonalNoPayment.length; s++) {
                this.seasonalNoPaymentTerm.push(this.seasonalNoPayment[s]);
            }
        }

    }

    numberOfDays(period) {
        switch (period) {
            case 1: // Day
                return 1;
            case 2: // Week
                return 7;
            case 3: // MOnth
                return 30.4166666667;
            case 4: // Year
                return 365;
            default:
                return 0;
        }
    }

    numberOfDaysSimple() {
        switch (this.repaymentFrequency) {
            case 1: //daily
                return 1;
                break;
            case 2: //weekly
                return 7;
            case 3: //fortnightly
                return 14;
            case 4: //monthly
                return 30.4166666667
            case 5: //quarterly
                return 30.4166666667 * 3;
            case 6: //yearly
                return 365;
            default: //monthly
                return 30.4166666667
                break;
        }
    }

    partOfYear(dayCount, period) {
        var numberOfDays = this.numberOfDays(period);
        switch (dayCount) {
            case 0:
                return 365.25 / numberOfDays;
            case 1:
                return 365 / numberOfDays;
            case 2:
                return period === 3 ? 12 : 360 / numberOfDays;
            case 3:
                return 360 / numberOfDays;
            case 4:
                return 365.25 / numberOfDays;
            default:
                return 365 / numberOfDays;
        }
    }

    daysInYear(dayCount) {
        switch (dayCount) {
            case 0:
                return 365.25;
            case 1:
                return 365;
            case 2:
                return 360;
            case 3:
                return 360;
            case 4:
                return 365.25;
            default:
                return 365;
        }
    }

    loanCalculation() {
        if (this.calculationMethod === '3') {
            this.termNum = this.term;
            this.repaymentPOY = this.partOfYear(this.dc, this.repaymentPeriod);
            this.compoundPOY = this.partOfYear(this.dc, this.compoundPeriod);
            this.termPOY = this.partOfYear(this.dc, this.termPeriod);

            this.p = this.repaymentPOY / this.repaymentNum;
            this.c = this.compoundPOY / this.compoundNum;
            this.n = this.termNum / this.termPOY;

            this._pn = parseInt((this.p * this.n).toFixed(2));

            this.createSeasonalPayments();
        }

        if (this.seasonalInterestPaid === true) {
            this._pn -= this.seasonalNoPaymentTerm.length; // Same as decreasing the term of the loan.
        }
        this.pn = 0 - (this._pn - this.periodsDeferredWithGrace);

        this._i = this.Rate / 100;
        // this._iop = Math.pow(1 + (this._i / this.c), this.c / this.p) - 1;
        if (this.compound === 1) {
            this._iop = Math.pow(Math.pow(1 + (this._i / this.compoundPOY), this.compoundPOY), 1 / this.repaymentPOY) - 1;
        } else {
            this._iop = this._i * (this.numberOfDaysSimple() / this.daysInYear(this.dc));
        }
        this._r = 1 + this._iop;

        this._an = (1 - Math.pow(this._r, this.pn));
        if (this.seasonalInterestPaid === false && this.seasonalNoPaymentTerm.length > 0) {
            for (this.s = 0; this.s < this.seasonalNoPaymentTerm.length; this.s++) {
                this._s = 0 - this.s;
                this.tem = this.seasonalNoPaymentTerm[this.s];
                this.ans = 0;
                this._ans += Math.pow(this._r, -this.tem) - Math.pow(this._r, (1 - this.tem));
                this._ansP += Math.pow(this._r, -this.tem) - Math.pow(this._r, (1 - this.tem));
            }
            this._an = this._an + this._ans;
        }
        this._an = this._an / (this._r - 1);
        this._ansP = this._ansP / (this._r - 1);

        if (this.calculationMethod === '1') {
            //   Loan Amount and Term calculating repayment
            this.numLoanRepayment = this.calculateLoanRepayment(this.amount);
            this.numLoanRepaymentFormatted = this.numLoanRepayment.toFixed(2);
        } else if (this.calculationMethod === '2') {
            // Term and Repayment Amount calculating loan amount
            this.amount = this.calculateLoanAmount(this.numLoanRepayment);

            if (this.amount > this.maxAmount) {
                this.isAmountTooLarge = true;
            } else if (this.amount < this.minAmount) {
                this.isAmountTooSmall = true;
            }

            try {
                this.numLoanRepaymentFormatted = this.numLoanRepayment.toFixed(2);
            } catch (exception) {
                this.numLoanRepaymentFormatted = Math.round(this.numLoanRepayment * 100) / 100;
            }

        } else if (this.calculationMethod === '3') {
            // Loan Amount and Repayment Amount calculating loan term
            this.term = this.calculateLoanTerm(this.amount, this.numLoanRepayment);
            this.term = Math.ceil(this.term);
            this.termNum = this.term;

            if (this.termNum > this.maxTerm) {
                this.isTermTooLarge = true;
            } else if (this.termNum < this.minTerm) {
                this.isTermTooSmall = true;
            }

            this._pn = this.termNum;

            try {
                this.numLoanRepaymentFormatted = this.numLoanRepayment.toFixed(2);
            } catch (exception) {
                this.numLoanRepaymentFormatted = Math.round(this.numLoanRepayment * 100) / 100;
            }
        }
    }

    calculateLoanAmount(repaymentAmount) {
        var loanAmount = repaymentAmount * this._an + this.presentValueOfBalloonPayment();
        var seasonTem = this.seasonalPaymentValue();
        loanAmount += seasonTem;
        return Math.round(loanAmount, 2);
    }

    calculateLoanRepayment(loanAmount) {
        var tempVal = this.effectiveLoanAmount(loanAmount);

        return tempVal / this._an;
    }

    effectiveLoanAmount(loanAmount) {
        var tempVal = this.presentValueOfBalloonPayment();
        var seasonTem = this.seasonalPaymentValue();
        var totalDeduction = loanAmount - tempVal - seasonTem;

        return totalDeduction;
    }

    calculateLoanTerm(loanAmount, repaymentAmount) {
        if (this._iop != 0) {
            var interest1 = this.calculateInterestSchedule(loanAmount);
            if (repaymentAmount < interest1) {
                //window.console.log("Loan repayment is less than initial interest");
            }
            var y = Math.log(1 - (this.effectiveLoanAmount(loanAmount) * this._iop / repaymentAmount) + this._ans) / Math.log(this._r);
            var yAbs = Math.abs(y);

            if (Number.isNaN(yAbs)) {
                this.isTermBroken = true;
            }
            return Math.abs(y);
        } else {
            window.console.log("Error iop is equal to zero");
        }
    }

    seasonalPaymentValue() {
        return this.seasonalPaymentAmount * this._ansP * -1;
    }

    presentValueOfBalloonPayment() {
        if (this.pn === undefined || Number.isNaN(this.pn)) {
            return this.balloonAmount;
        } else {
            var returnVal = this.balloonAmount * Math.pow(this._r, this.pn);
            return returnVal;
        }
    }

    createLoanSchedule() {
        var j = 0;
        var tempSchedule = [];
        var temp;
        var loanAmount = this.amount;
        var totalInterest = 0;
        var totalInterestPaid = 0;
        var totalRepaid = 0;
        var totalPrincipal = 0;
        var repaymentAmount = this.numLoanRepayment;
        var intPaid = 0;
        var loanPaid = 0;
        var todaysDate = new Date();
        var paymentDate = todaysDate // first payment is 1st of next month
        var InterestCarried = 0;
        var i;
        this.xAxis = [];
        this.charttempInterest = [];
        this.chartremainingTotalBalance = [];
        this.chartprincipal = [];
        this.tempDate = paymentDate;
        var interestStartDate = todaysDate;

        if (this.seasonalInterestPaid === true) {
            this._pn = this._pn + this.seasonalNoPaymentTerm.length;
        }

        if (this.disbursalDate) {
            paymentDate = interestStartDate = new Date(this.disbursalDate);
        }

        for (i = 0; i <= this._pn; i++) {
            temp = {
                paymentDate: paymentDate,
                paymentNumber: i,
                totalPayment: 0,
                principal: 0,
                interest: 0,
                interestPaid: 0,
                interestBalance: 0,
                remainingBalance: loanAmount
            }
            if (i > this.periodsDeferredWithGrace) {
                if (this.seasonalNoPaymentTerm.includes(i) && this.seasonalPaymentAmount > 0) {
                    repaymentAmount = this.seasonalPaymentAmount;
                }
                var endDate;
                if (this.initialpaymentdate && i == 1) {
                    endDate = new Date(this.initialpaymentdate);
                } else {
                    endDate = this.nextPaymentDate(interestStartDate);
                }
                temp.interest = this.calculateInterest(interestStartDate, endDate, loanAmount);
                temp.interestBalance += temp.interest + InterestCarried;

                intPaid = temp.interestBalance > repaymentAmount ? repaymentAmount : temp.interestBalance;
                loanPaid = repaymentAmount - intPaid;
                loanPaid = temp.remainingBalance > loanPaid ? loanPaid : temp.remainingBalance;

                if (this.seasonalNoPaymentTerm.includes(i)) {
                    if (this.seasonalInterestPaid === true) {
                        temp.interestBalance -= intPaid;
                        temp.totalPayment = intPaid;
                        temp.interestPaid = intPaid;
                    } else if (this.seasonalPaymentAmount > 0) {
                        temp.interestBalance -= intPaid;
                        temp.principal = Math.max(repaymentAmount - intPaid, 0);
                        temp.totalPayment = temp.principal + intPaid;
                        temp.interestPaid = intPaid;
                    } else {
                        temp.remainingBalance = loanAmount;
                        temp.principal = 0.00;
                        temp.totalPayment = 0.00;
                    }
                } else {
                    temp.interestBalance -= intPaid;
                    temp.principal = Math.max(repaymentAmount - intPaid, 0);
                    temp.totalPayment = temp.principal + intPaid;
                    temp.interestPaid = intPaid;
                }
                if (loanAmount - temp.principal < 0) {
                    //last payment
                    temp.principal = loanAmount;
                    temp.totalPayment = loanAmount + intPaid;
                    i = this._pn;
                }
                temp.remainingBalance = loanAmount - temp.principal;
            }
            if (i === this._pn) {
                this.datePayedOff = paymentDate;
                //temp.principal += temp.remainingBalance;
                //temp.totalPayment += temp.principal + temp.interestPaid;
                temp.remainingBalance = 0;

                temp.principal = loanAmount;
                temp.totalPayment = loanAmount + intPaid;
            }
            if (i === 0) {
                temp.principal = null;
                temp.totalPayment = null;
                temp.paymentNumber = null;
                temp.interestPaid = null;
                temp.interest = null;
                this.initialDate = true;
                if (this.initialpaymentdate) {
                    paymentDate = new Date(this.initialpaymentdate);
                } else {
                    if (this.disbursalDate) {
                        paymentDate = this.nextPaymentDate(paymentDate);
                    } else {
                        paymentDate = this.nextPaymentDate(todaysDate);
                    }
                }

            } else {
                paymentDate = this.nextPaymentDate(paymentDate);
                interestStartDate = this.nextPaymentDate(interestStartDate);
            }
            if (temp.totalPayment > 0) {
                this.remainingPayments++;
            }
            totalInterest = totalInterest + temp.interest;
            totalInterestPaid = totalInterestPaid + temp.interestPaid;
            totalRepaid = totalRepaid + temp.totalPayment;
            if(temp.principal == null){
                temp.principal = 0;
            }
            totalPrincipal = totalPrincipal + temp.principal;
            InterestCarried = temp.interestBalance;
            loanAmount = temp.remainingBalance;
            repaymentAmount = this.numLoanRepayment;
            if (i > 0) {
                this.chartprincipal[j] = Math.round(temp.principal * 100) / 100;
                this.charttempInterest[j] = Math.round(temp.interestPaid * 100) / 100;
                this.chartremainingTotalBalance[j] = Math.round(loanAmount * 100) / 100;
                this.xAxis[j] = this.formatDate(temp.paymentDate);
                j++;
            }
            tempSchedule.push(temp);
        }

        this.totalInterest = totalInterest;
        this.totalInterestPaid = totalInterestPaid;
        this.totalRepaid = totalRepaid;
        this.totalPrincipal = totalPrincipal;

        try{
            this.totalPrincipalFormatted = Math.round(this.totalPrincipal * 100) / 100;
            this.totalInterestFormatted = this.totalInterest.toFixed(2);
            this.totalInterestPaidFormatted = this.totalInterestPaid.toFixed(2);
            this.totalRepaidFormatted = this.totalRepaid.toFixed(2);
        } catch(ex) {
            this.totalPrincipalFormatted = Math.round(this.totalPrincipal * 100) / 100;
            this.totalInterestFormatted = Math.round(this.totalInterest * 100) / 100;
            this.totalInterestPaidFormatted = Math.round(this.totalInterestPaid * 100) / 100;
            this.totalRepaidFormatted = Math.round(this.totalRepaid * 100) / 100;
        }
        return tempSchedule;

    }

    formatSchedule(loanSchedule) {
        var tempSchedule = [];
        var temp;
        var i;
        var tempPayNo;
        var tempPayDate;
        var tempRemainingBal;
        var tempInterest;
        var tempInterestPaid;
        var tempPrincipal;
        var tempTotalPayment;
        for (i = 1; i <= this._pn; i++) {
            tempPayNo = loanSchedule[i].paymentNumber;
            tempPayDate = this.formatDate(loanSchedule[i].paymentDate);
            tempRemainingBal = Math.round(loanSchedule[i].remainingBalance * 100) / 100;
            tempInterest = Math.round(loanSchedule[i].interest * 100) / 100;
            tempInterestPaid = Math.round(loanSchedule[i].interestPaid * 100) / 100;
            tempPrincipal = Math.round(loanSchedule[i].principal * 100) / 100;
            tempTotalPayment = Math.round(loanSchedule[i].totalPayment * 100) / 100;
            temp = {
                paymentNumber: tempPayNo,
                paymentDate: tempPayDate,
                remainingBalance: tempRemainingBal,
                interest: tempInterest,
                interestPaid: tempInterestPaid,
                principal: tempPrincipal,
                totalPayment: tempTotalPayment
            }
            tempSchedule.push(temp);
        }
        return tempSchedule;
    }

    formatScheduleTotals(loanSchedule) {
        var tempSchedule = [];
        var temp;
        var i;
        var tempPayNo;
        var tempPayDate;
        var tempRemainingBal;
        var tempInterest;
        var tempInterestPaid;
        var tempPrincipal;
        var tempTotalPayment;
        var tempInterestFormatted;
        var tempInterestPaidFormatted;
        var tempPrincipalFormatted;
        var tempTotalPaymentFormatted;
        var max = Math.floor(this._pn) + 1;
        this.totalInterest = 0;
        this.totalInterestPaid = 0;
        this.totalPrincipal = 0;
        this.totalRepaid = 0;

        for (i = 0; i <= max; i++) {
            if (i == 0) {
                tempPayNo = loanSchedule[i].paymentNumber;
                tempPayDate = this.formatDate(loanSchedule[i].paymentDate);
                tempRemainingBal = loanSchedule[i].remainingBalance;
                tempInterest = loanSchedule[i].interest;
                tempInterestPaid = loanSchedule[i].interestPaid;
                tempPrincipal = loanSchedule[i].principal;
                tempTotalPayment = loanSchedule[i].totalPayment;
                temp = {
                    paymentNumber: tempPayNo,
                    paymentDate: tempPayDate,
                    remainingBalance: tempRemainingBal,
                    interest: tempInterest,
                    interestPaid: tempInterestPaid,
                    principal: tempPrincipal,
                    totalPayment: tempTotalPayment
                }
            } else if (i < max) {
                tempPayNo = loanSchedule[i].paymentNumber;
                tempPayDate = this.formatDate(loanSchedule[i].paymentDate);
                tempRemainingBal = Math.round(loanSchedule[i].remainingBalance * 100) / 100;
                tempInterestPaid = loanSchedule[i].interestPaid
                tempInterestPaidFormatted = Math.round(tempInterestPaid * 100) / 100;
                tempPrincipal = loanSchedule[i].principal;
                tempPrincipalFormatted = Math.round(tempPrincipal * 100) / 100;
                tempTotalPayment = loanSchedule[i].totalPayment;
                tempTotalPaymentFormatted = Math.round(tempTotalPayment * 100) / 100;
                temp = {
                    paymentNumber: tempPayNo,
                    paymentDate: tempPayDate,
                    remainingBalance: tempRemainingBal,
                    interest: tempInterestFormatted,
                    interestPaid: tempInterestPaidFormatted,
                    principal: tempPrincipalFormatted,
                    totalPayment: tempTotalPaymentFormatted
                }
            } else if (i == max) {

                temp = {
                    paymentNumber: null,
                    paymentDate: null,
                    remainingBalance: null,
                    interest: this.totalInterestFormatted,
                    interestPaid: this.totalInterestFormatted,
                    principal: this.totalPrincipalFormatted,
                    totalPayment: this.totalRepaidFormatted
                }
            }
            tempSchedule.push(temp);
        }
        return tempSchedule;
    }

    calculateInterest(startDate, endDate, balance) {
        var returnVal;
        if (this.compound === 0) {
            //simple
            returnVal = this.calculateInterestSimple(startDate, endDate, balance);
        } else {
            //compound
            returnVal = this.calculateInterestCompound(startDate, endDate, balance);
        }
        return returnVal;
    }

    calculateInterestSchedule(balance) {
        var returnVal;

        returnVal = Math.round(Math.exp(this._iop) * balance, 2)

        return returnVal;
    }

    calculateInterestCompound(startDate, endDate, balance) {
        // endDate = this.nextPaymentDate(startDate);
        //var differenceInDays = (endDate.getTime() - startDate.getTime()) / 86400000;
        var differenceInDays = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / (1000 * 60 * 60 * 24));

        //var Elapsed_o_Diy = differenceInDays / this.daysInYear(this._dc);

        return balance * (Math.pow(Math.pow(1 + (this._i / this.compoundPOY), this.compoundPOY), 1 / this.daysInYear(this._dc)) - 1) * differenceInDays;
    }

    calculateInterestSimple(startDate, endDate, balance) {
        // var endDate;
        // endDate = this.nextPaymentDate(startDate);
        // var daysElapsed = (endDate.getTime() - startDate.getTime()) / 86400000;
        var daysElapsed = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / (1000 * 60 * 60 * 24));

        return balance * this._i * (daysElapsed / this.daysInYear(this.dc));
    }

    setDateFirstOfNextMonth(passedDate) {
        var current = new Date(passedDate);

        current.setMonth(passedDate.getMonth() + 1);

        return current;
    }

    addThreeMonths(passedDate) {
        var current = new Date(passedDate);
        current.setMonth(passedDate.getMonth() + 3)


        return current;
    }

    addOneYear(passedDate) {
        var current = new Date();

        current.setFullYear(passedDate.getFullYear() + 1);
        current.setMonth(passedDate.getMonth());
        current.setDate(passedDate.getDate());

        return current;
    }

    addDaysII(passedDate, days) {
        var current = new Date(passedDate);

        current.setDate(passedDate.getDate() + days);

        return current;
    }

    nextPaymentDate(passedDate) {
        var f = this.repaymentFrequency;
        if (f === 1) {
            //add a day
            passedDate = this.addDaysII(passedDate, 1);
        } else if (f === 2) {
            //add a week
            passedDate = this.addDaysII(passedDate, 7);
        } else if (f === 3) {
            // add a fortnight
            passedDate = this.addDaysII(passedDate, 14);
        } else if (f === 4) {
            //add a month
            passedDate = this.setDateFirstOfNextMonth(passedDate);
        } else if (f === 5) {
            //add 3 months
            passedDate = this.addThreeMonths(passedDate);
        } else if (f === 6) {
            //add a year
            passedDate = this.addOneYear(passedDate);
        }

        return passedDate;
    }

    // this method validates the data and creates the csv file to download
    downloadCSVFile() {
        let csvString = this.scheduleContent();

        // Creating anchor element to download
        let downloadElement = document.createElement('a');

        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        // CSV File Name
        downloadElement.download = 'Account Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click();
    }

    //Method formats date as string like "1 Feb 2020"
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

    //generate a schedule content for mail and csv download
    scheduleContent() {
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        let rowData = new Set();

        // getting keys from data
        this.loanScheduleFormatted = this.formatSchedule(this.loanSchedule);
        this.loanScheduleFormatted.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });
        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        rowData = Array.from(rowData);

        // splitting using ','
        csvString += rowData.join(',');
        csvString += rowEnd;

        // main for loop to get the data based on key value
        for (let i = 0; i < this.loanScheduleFormatted.length; i++) {
            let colValue = 0;

            // validating keys in data
            for (let key in rowData) {
                if (rowData.hasOwnProperty(key)) {
                    // Key value
                    // Ex: Id, Name
                    let rowKey = rowData[key];
                    // add , after every value except the first.
                    if (colValue > 0) {
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.loanScheduleFormatted[i][rowKey] === undefined ? '' : this.loanScheduleFormatted[i][rowKey];
                    csvString += '"' + value + '"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }
        return csvString;
    }
    loanProductSwitch() {
        switch (this.interestCalculationMethod) {
            case "Simple":
                this.compound = 0;
                break;
            case "Compound":
                this.compound = 1;
                break;
            default:
                this.compound = 1;
                break;
        }

        switch (this.interestCompoundingFrequency) {
            case "Annual":
                this.compoundPeriod = 4;
                this.compoundNum = 1;
                break;
            case "Semi-Annual":
                this.compoundPeriod = 3;
                this.compoundNum = 6;
                break;
            case "Quarterly":
                this.compoundPeriod = 3;
                this.compoundNum = 3;
                break;
            case "Monthly":
                this.compoundPeriod = 3;
                this.compoundNum = 1;
                break;
            case "Semi-Monthly":
                this.compoundPeriod = 3;
                this.compoundNum = 2; //? currently every other month
                break;
            case "Bi-Weekly": //bi-weekly or fortnightly? currently fortnightly
                this.compoundPeriod = 2;
                this.compoundNum = 2;
                break;
            case "Weekly":
                this.compoundPeriod = 2;
                this.compoundNum = 1;
                break;
            case "Daily":
                this.compoundPeriod = 1;
                this.compoundNum = 1;
                break;
            default:
                this.compoundPeriod = 3; //monthly
                this.compoundNum = 1;
                break;
        }

        switch (this.dayCount) {
            case "Actual / Actual":
                this.dc = 0;
                break;
            case "Actual / 365":
                this.dc = 1;
                break;
            case "30 / 360":
                this.dc = 2;
                break;
            case "Actual / 360":
                this.dc = 3;
                break;
            case "Actual / 365.25":
                this.dc = 4;
                break;
            default:
                this.dc = 69;
        }

        switch (this.interestCompoundingFrequency) {
            case 'Daily': //daily
                this.compoundPeriod = 1;
                this.compoundNum = 1;
                break;
            case 'Weekly': //weekly
                this.compoundPeriod = 2;
                this.compoundNum = 1;
                break;
            case 'Fortnightly': //fortnightly
                this.compoundPeriod = 2;
                this.compoundNum = 2;
                break;
            case 'Monthly': //monthly
                this.compoundPeriod = 3;
                this.compoundNum = 1;
                break;
            case 'Quarterly': //quarterly
                this.compoundPeriod = 3;
                this.compoundNum = 3;
                break;
            case 'Annual': //yearly
                this.compoundPeriod = 4;
                this.compoundNum = 1;
                break;
            default: //monthly
                this.compoundPeriod = 3;
                this.compoundNum = 1;
                break;
        }

        switch (this.repaymentFrequency) {
            case 1: //daily
                this.repaymentPeriod = 1;
                this.repaymentNum = 1;
                this.termPeriod = 1;
                this.repaymentLabel = "Daily Payment";
                this.chartTitleLabel = "Daily Payments Chart";
                break;
            case 2: //weekly
                this.repaymentPeriod = 2;
                this.repaymentNum = 1;
                this.termPeriod = 2;
                this.repaymentLabel = "Weekly Payment";
                this.chartTitleLabel = "Weekly Payments Chart";
                break;
            case 3: //fortnightly
                this.repaymentPeriod = 2;
                this.repaymentNum = 2;
                this.termPeriod = 2;
                this.repaymentLabel = "Fortnightly Payment";
                this.chartTitleLabel = "Fortnightly Payments Chart";
                break;
            case 4: //monthly
                this.repaymentPeriod = 3;
                this.repaymentNum = 1;
                this.termPeriod = 3;
                this.repaymentLabel = "Monthly Payment";
                this.chartTitleLabel = "Monthly Payments Chart";
                break;
            case 5: //quarterly
                this.repaymentPeriod = 3;
                this.repaymentNum = 3;
                this.termPeriod = 3;
                this.repaymentLabel = "Quarterly Payment";
                this.chartTitleLabel = "Quarterly Payments Chart";
                break;
            case 6: //yearly
                this.repaymentPeriod = 4;
                this.repaymentNum = 1;
                this.termPeriod = 4;
                this.repaymentLabel = "Yearly Payment";
                this.chartTitleLabel = "Yearly Payments Chart";
                break;
            default: //monthly
                this.repaymentPeriod = 3;
                this.repaymentNum = 1;
                this.termPeriod = 3;
                this.repaymentLabel = "Monthly Payment";
                this.chartTitleLabel = "Monthly Payments Chart";
                break;
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const id = JSON.stringify(row.paymentNumber);
        if (id > 0) {
            switch (actionName) {
                case 'seasonal':
                    this.seasonalRow(id);
                    break;
                case 'deferred':
                    this.deferredRow(id);
                    break;
                case 'repeat':
                    this.addRepeatSeasonal();
                    break;
                case 'interest':
                    this.addPayInterest();
                    break;
                default:
                    this.seasonalRow(row);
                    break;
            }
        }
    }

    seasonalRow(rowId) {

        this.selectedRow = this.seasonalPeriods.split(",");
        if (this.seasonalPeriods.length === 0) {
            this.seasonalPeriods = rowId.toString();
        }
        else {
            var i;
            let equalrows = false;
            this.selectedRow = this.seasonalPeriods.split(",");
            for (i = 0; i < this.selectedRow.length; i++) {
                if (this.selectedRow[i] === rowId) {
                    equalrows = true;
                    break;
                }
            }
            if (equalrows === false) {
                this.seasonalPeriods = this.seasonalPeriods + "," + rowId.toString();
            }
        }

        this.sendInlineEdit();
    }

    deferredRow(rowId) {
        this.periodsDeferredWithGrace = rowId.toString();
        this.sendInlineEdit();
    }

    addRepeatSeasonal(rowId) {
        if (this.seasonalRepeat === true) {
            this.seasonalRepeat = false;
        } else {
            this.seasonalRepeat = true;
        }
        this.sendInlineEdit();
    }

    addPayInterest(rowId) {
        if (this.seasonalInterestPaid === true) {
            this.seasonalInterestPaid = false;
        } else {
            this.seasonalInterestPaid = true;
        }
        this.sendInlineEdit();
    }

    sendInlineEdit() {
        const parameters = {
            seasonalPeriods: this.seasonalPeriods,
            periodsDeferredWithGrace: this.periodsDeferredWithGrace,
            seasonalRepeat: this.seasonalRepeat,
            seasonalInterestPaid: this.seasonalInterestPaid
        };

        fireEvent(this.pageRef, "handle_inline_recalculate", parameters);
    }

    sendCalculatedValues() {
        const parameters = {
            amount: this.amount,
            term: this.term,
            repaymentAmount: this.numLoanRepaymentFormatted,
            isCalculated: this.isCalculated
        };

        fireEvent(this.pageRef, "handle_calculated_values", parameters);
    }
}