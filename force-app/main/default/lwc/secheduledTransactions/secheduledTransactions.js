import { LightningElement, track, api, wire } from 'lwc';
import getById from '@salesforce/apex/ApplicationController.getById';
import getAllByLoan from '@salesforce/apex/ScheduledTransactionController.getAll';
import getTempScheduledTrasactions from '@salesforce/apex/LoanCalculator.getScheduledTrasactions';
import { getRecord } from 'lightning/uiRecordApi';
const columns = [
    { label: 'Payment', fieldName: 'Payment_Number__c', type: 'number', cellAttributes: { alignment: 'center' }, initialWidth: 96 },
    {
        label: 'Payment Date',
        fieldName: 'Scheduled_Date__c',
        type: 'date',
        initialWidth: 150,
        typeAttributes: {
            day: "numeric",
            month: "numeric",
            year: "numeric"
        }
    },
    { label: 'Type', fieldName: 'Type__c', type: 'Picklist', initialWidth: 150, cellAttributes: { alignment: 'left' } },
    { label: 'Principal', fieldName: 'Principal__c', type: 'currency', cellAttributes: { alignment: 'left' } },
    { label: 'Interest', fieldName: 'Interest__c', type: 'currency', cellAttributes: { alignment: 'left' } },
    { label: 'Fees', fieldName: 'Fees__c', type: 'currency', cellAttributes: { alignment: 'left' } },
    { label: 'Total', fieldName: 'Total_Payment__c', type: 'currency', cellAttributes: { alignment: 'left' } }
];

export default class secheduledTransactions extends LightningElement {
    @api recordId;
    @api objectApiName;
    @track data = [];
    @track columns = columns;
    @track error;
    //@track fieldtoWatch = objectApiName + '.Amount__c'

    @wire(getRecord, { recordId: '$recordId', fields: ['Application__c.Id'] })
    getTransactions({ data, error }) {
        if (this.objectApiName === 'Application__c') {
            this.fetchTempTransactions();
        } else if (this.objectApiName === 'Loan__c') {
            this.columns = [
                { label: 'Payment', fieldName: 'Payment_Number__c', type: 'number', cellAttributes: { alignment: 'center' }, initialWidth: 96 },
                { label: 'Scheduled Date', fieldName: 'Scheduled_Date__c', type: 'date', initialWidth: 150, typeAttributes: { day: "numeric", month: "numeric", year: "numeric" } },
                { label: 'Type', fieldName: 'Type__c', type: 'Picklist', initialWidth: 150 },
                { label: 'Principal', fieldName: 'Principal__c', type: 'currency', cellAttributes: { alignment: 'left' } },
                { label: 'Interest', fieldName: 'Interest__c', type: 'currency', cellAttributes: { alignment: 'left' } },
                { label: 'Fees', fieldName: 'Fees__c', type: 'currency', cellAttributes: { alignment: 'left' } },
                { label: 'Total', fieldName: 'Total_Payment__c', type: 'currency', cellAttributes: { alignment: 'left' } },
                { label: 'Paid', fieldName: 'Paid__c', type: 'boolean', cellAttributes: { alignment: 'center' }, initialWidth: 60 },
                { label: 'Percentage', fieldName: 'Paid_Percentage__c', type: 'percent', cellAttributes: { alignment: 'left' }, typeAttributes: { maximumFractionDigits: 4 } }
            ];
            this.fetchTransactions();
        }
    }

    fetchTransactions() {
        getAllByLoan({ value: { sobjectType: 'Scheduled_Transaction__c', Loan__c: this.recordId } }).then(data => {
            if (data !== undefined) {
                this.data = this.getTransactionWithSummery(data);
            }
        }).catch(error => {
            this.error = error;
        });
    }
    handledDownload() {
        window.open(
            '/apex/LoanRepaymentSchedule?Id=' + this.recordId,
            '_blank' // <- This is what makes it open in a new window.
        );
    }

    getTransactionWithSummery(dataValues) {
        var totalFee = 0.00;
        var totalInterest = 0.00;
        var totalPrincipal = 0.00;
        var totalAmount = 0.00;
        if (dataValues.length > 0) {
            for (var i = 0; i < dataValues.length; i++) {
                totalFee += dataValues[i].Fees__c;
                totalPrincipal += dataValues[i].Principal__c;
                totalInterest += dataValues[i].Interest__c;
                totalAmount += dataValues[i].Total_Payment__c;
            }
            dataValues.push({ Principal__c: totalPrincipal.toFixed(2), Interest__c: totalInterest.toFixed(2), Fees__c: totalFee.toFixed(2), Total_Payment__c: totalAmount.toFixed(2) })
        }
        return dataValues;
    }

    fetchTempTransactions() {

        getById({ id: this.recordId }).then(data => {
            if (data !== undefined) {
                var loanApp = data;
                var calculator = {
                    calculationMethod: null,
                    dayCount: null,
                    repaymentFrequency: null,
                    seasonalPeriods: null,
                    term: null,
                    periodsDeferredWithGrace: null,
                    Rate: null,
                    balloonAmount: null,
                    seasonalPaymentAmount: null,
                    seasonalInterestPaid: null,
                    seasonalRepeat: null,
                    amount: null,
                    interestCompoundingFrequency: null,
                    initialPaymentDate: null
                };
                calculator.calculationMethod = loanApp.Loan_Product__r.Interest_Calculation_Method__c;
                calculator.dayCount = loanApp.Loan_Product__r.Day_Count__c;
                calculator.repaymentFrequency = loanApp.Repayment_Frequency__c;
                calculator.seasonalPeriods = loanApp.Seasonal_Periods__c === undefined ? '' : loanApp.Seasonal_Periods__c;
                calculator.term = parseInt(loanApp.Term__c);
                calculator.periodsDeferredWithGrace = loanApp.Periods_Deferred_with_Grace__c === undefined ? 0 : parseInt(loanApp.Periods_Deferred_with_Grace__c);
                calculator.Rate = loanApp.Final_Rate__c;
                calculator.balloonAmount = loanApp.Balloon_Amount__c === undefined ? 0 : loanApp.Balloon_Amount__c;
                calculator.seasonalPaymentAmount = loanApp.Seasonal_Payment_Amount__c === undefined ? 0 : loanApp.Seasonal_Payment_Amount__c;
                calculator.seasonalInterestPaid = loanApp.Pay_Seasonal_Interest__c === undefined ? false : loanApp.Pay_Seasonal_Interest__c;
                calculator.seasonalRepeat = loanApp.Repeat_Seasonal_Periods__c === undefined ? false : loanApp.Repeat_Seasonal_Periods__c
                calculator.amount = loanApp.Amount__c;
                calculator.initialPaymentDate = loanApp.Initial_Payment_Date__c;

                if (calculator.calculationMethod == 'Compound') {
                    calculator.interestCompoundingFrequency = loanApp.Loan_Product__r.Interest_Compounding_Frequency__c;
                } else {
                    calculator.interestCompoundingFrequency = 'Monthly';
                }

                getTempScheduledTrasactions({ params: JSON.stringify(calculator) }).then(result => {
                    this.data = this.getTransactionWithSummery(result);
                }).
                catch(error => {
                    this.error = error;
                    console.log(' error occurred : ', JSON.parse(JSON.stringify(error)));
                });
            }

        }).
        catch(error => {
            this.error = error;
        });
    }

}