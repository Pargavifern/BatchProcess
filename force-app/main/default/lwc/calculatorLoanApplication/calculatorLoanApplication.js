import { LightningElement, track, wire, api } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import insertValues from '@salesforce/apex/ApplicationController.create';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPLICATION_OBJECT from '@salesforce/schema/Application__c';


export default class CalculatorLoanApplication extends NavigationMixin(LightningElement) {
    @track amount;
    @track rate;
    @track term;
    @track loanPrdId;
    @track ContactId;
    @track today;
    @track LoanPrdName;
    @track interest;
    @track balloonAmount;
    @track periodsDeferredWithGrace;
    @track seasonalPeriods;
    @track seasonalInterestPaid;
    @track seasonalRepeat;
    @track seasonalPaymentAmount;
    @track repaymentFrequency;
    @track interestProduct;
    @track interestProductText;
    @track finalRate;
    @track accountId;
    @track AppInfo;
    @track initialpaymentdate;
    @track disbursalDate;

    @api menuButton = '';


    @wire(CurrentPageReference) pageRef;
    @wire(getObjectInfo, { objectApiName: APPLICATION_OBJECT, })
    AppInfo;

    @track isModalOpen = false;
    @track isOptionModelOpen = false;

    @track selectedOption = "Person";
    @track isForPersonal = true;
    @track loanRecordType

    getRecordTypeId(recordTypeName) {

        let recordtypeinfo = this.AppInfo.data.recordTypeInfos;
        let recordTypeId;

        for (var eachRecordtype in recordtypeinfo) {
            if (recordtypeinfo[eachRecordtype].name === recordTypeName) {
                recordTypeId = recordtypeinfo[eachRecordtype].recordTypeId;
                break;
            }
        }

        return recordTypeId;
    }

    get options() {
        return [
            { label: 'Person', value: 'Person' },
            { label: 'Business', value: 'Business' }
        ];
    }

    handleChange(event) {
        this.selectedOption = event.detail.value;
        if (this.selectedOption == "Person") {
            this.isForPersonal = true;
            this.loanRecordType = this.getRecordTypeId('Personal Loan');
        } else {
            this.isForPersonal = false;
            this.loanRecordType = this.getRecordTypeId('Business Loan');
        }
    }

    //sets the isModalOpen property to true, indicating that the Modal is Open
    showModal() {
        if (this.loanPrdId == null || this.loanPrdId === '') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Please choose the Loan product to calculate and apply for loan',
                    variant: 'warning',
                }),
            );
        } else {
            this.isOptionModelOpen = true;
        }
    }

    clickNext() {
        const allValid = [...this.template.querySelectorAll('lightning-combobox')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {
            this.isOptionModelOpen = false;
            this.isModalOpen = true;
        }
    }
    clickBack() {
        this.isOptionModelOpen = true;
        this.isModalOpen = false;
    }

    //sets the isModalOpen property to false, indicating that the Modal is Closed
    closeModal() {
        this.isModalOpen = false;
        this.isOptionModelOpen = false;
    }

    /* 
    can be used instead of the above two methods - showModal() & closeModal()
    just toggles the isModalOpen property - true if false, false if true 
    */
    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
    }

    //compute the CSS classes of the Modal(popup) based on the value of isModalOpen property
    get modalClass() {
        return `slds-modal ${this.isModalOpen ? "slds-fade-in-open" : ""}`;
    }

    //compute the CSS classes of the Modal Backdrop(grey overlay) based on the value of isModalOpen property
    get modalBackdropClass() {
        return `slds-backdrop ${this.isModalOpen ? "slds-backdrop_open" : ""}`;
    }

    connectedCallback() {
        registerListener("handle_calculate", this.handleCalculate, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleCalculate(args) {
        this.interest = (args.selectedRate) / 100;
        this.amount = args.amount;
        this.term = args.term;
        this.rate = args.selectedRate;
        this.loanPrdId = args.loanPrdId;
        this.today = new Date();
        this.initialpaymentdate = args.initialpaymentdate;
        this.LoanPrdName = args.loanProductName;
        this.balloonAmount = args.balloonAmount;
        this.periodsDeferredWithGrace = args.periodsDeferredWithGrace;
        this.seasonalPeriods = args.seasonalPeriods;
        this.seasonalInterestPaid = args.seasonalInterestPaid;
        this.seasonalRepeat = args.seasonalRepeat;
        this.seasonalPaymentAmount = args.seasonalPaymentAmount;
        this.repaymentFrequency = args.repaymentFrequencylabel;
        this.interestProduct = args.interestProduct;
        this.interestProductText = args.interestProductText;
        this.finalRate = args.Rate / 100;
        this.disbursalDate = args.disbursalDate;
    }

    selectedContact(event) {
            this.ContactId = event.detail.selectedId;
            this.accountId = null;    
    }

    selectedAccount(event){
        this.accountId =event.detail.selectedId;
        this.ContactId = null;
    }

    saveRecord() {
        if (this.selectedOption == "Person") {
            this.accountId = null;
            if (this.ContactId === null || this.ContactId === "" || typeof this.ContactId === 'undefined') {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Contact field value is missing',
                        variant: 'error',
                    }),
                );
                return;
            }
            
        } else {
            this.ContactId = null;
            if (this.accountId === null || this.accountId === "" || typeof this.accountId === 'undefined') {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Account field value is missing',
                        variant: 'error',
                    }),
                );
                return;
            }
        }

        let loanAppRec = { 'sobjectType': 'Application__c' };
        loanAppRec.Rate__c = this.rate;
        loanAppRec.Term__c = this.term;
        loanAppRec.Date__c = this.today;
        loanAppRec.Initial_Payment_Date__c	 = this.initialpaymentdate;
        loanAppRec.Loan_Product__c = this.loanPrdId;
        loanAppRec.Contact__c = this.ContactId;
        loanAppRec.Account__c = this.accountId;
        loanAppRec.Amount__c = this.amount;
        loanAppRec.Balloon_Amount__c = parseFloat(this.balloonAmount);
        loanAppRec.Pay_Seasonal_Interest__c = this.seasonalInterestPaid;
        loanAppRec.Periods_Deferred_with_Grace__c = parseInt(this.periodsDeferredWithGrace);
        loanAppRec.Repeat_Seasonal_Periods__c = this.seasonalRepeat;
        loanAppRec.Seasonal_Payment_Amount__c = this.seasonalPaymentAmount;
        loanAppRec.Seasonal_Periods__c = this.seasonalPeriods;
        loanAppRec.Repayment_Frequency__c = this.repaymentFrequency;
        loanAppRec.Interest_Product__c = this.interestProduct;
        loanAppRec.RecordTypeId = this.loanRecordType;
        loanAppRec.Disbursal_Date__c = this.disbursalDate;
        insertValues({ value: loanAppRec }).then(
            result => {
                this.message = result;
                this.error = undefined;
                this.ContactId='';
                this.accountId='';
                if (this.message !== null && this.message !== 'undefined') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Loan Application Record was created',
                            variant: 'success',
                        }),
                    );
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: this.message,
                            actionName: 'view'
                        }
                    });
                    this.closeModal();
                }
            }
        ).catch(error => {
            this.message = undefined;
            this.error = error;
            console.log(JSON.parse(JSON.stringify(error)));
        });
    }
}