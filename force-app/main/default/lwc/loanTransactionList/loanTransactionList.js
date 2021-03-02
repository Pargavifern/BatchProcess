import { LightningElement, track, api, wire } from 'lwc';
import getAllTransaction from '@salesforce/apex/TransactionLineController.getAllRelatedLoan';
import getTransactionByLimit from '@salesforce/apex/TransactionLineController.getAllRelatedByLimit';
import getTransactionByDays from '@salesforce/apex/TransactionLineController.getAllRelatedByDay';
import { getRecord } from 'lightning/uiRecordApi';
import { loadStyle } from 'lightning/platformResourceLoader';
import customStyle from '@salesforce/resourceUrl/customStyle';

const COLS = [
    {
        type: 'button-icon', 
        typeAttributes: {
            iconName: 'action:preview',
            title: 'View',
            variant: 'bare',
            alternativeText: 'View',
            class: {fieldName: 'showButton'}, 
        }
    },
    { label: 'Line No.', fieldName: 'LineNumber', type: 'number', cellAttributes: { class: { fieldName: 't1' } }},
    { label: 'Date', fieldName: 'transactionDate', type: 'date', cellAttributes: { class: { fieldName: 't1' } }, alignment: 'left', sortable: true },
    { label: 'Type', fieldName: 'type', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Amount', fieldName: 'Amount', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    // { label: 'Credit', fieldName: 'totalCredit', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    // { label: 'Debit', fieldName: 'totalDebit', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Prin. Paid', fieldName: 'paidPrincipal', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Int. Paid', fieldName: 'paidInterest', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Closing Prin.', fieldName: 'closingPrincipal', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Closing Int.', fieldName: 'closingInterest', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },
    { label: 'Closing Balance', fieldName: 'closingBalance', type: 'currency', cellAttributes: { class: { fieldName: 't1' }, alignment: 'left' } },

];

export default class LoanTransactionList extends LightningElement {
    @track gridColumns = COLS;
    @api recordId;
    @track error;
    @track tranCount;
    @track loading = false;
    @track gridData = [];
    @track transactionLine = [];

    @track dataPresent = false;
    @track showFooter = false;

    @track transactionId;


    @track record = {};
    @track bShowModal = false;

    filterName = 'All';

    get filterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Recent', value: 'Recent' },
            { label: '6 Months', value: '6 Months' },
            { label: '1 Year', value: 'Year' },
        ];
    }

    handleRowAction(event) {
        const row = event.detail.row;
        this.record = row;
        this.transactionId = event.detail.row.id;
        this.bShowModal = true; // display modal window
    }
 
    // to close modal window set 'bShowModal' tarck value as false
    closeModal() {
        this.bShowModal = false;
    }

    handleChange(event) {
        this.filterName = event.detail.value;
        switch (this.filterName) {
            case 'All':
                this.callbyAll();
                break;
            case 'Recent':
                this.callbyDays(30);
                break;
            case '6 Months':
                this.callbyDays(180);
                break;
            case 'Year':
                this.callbyDays(365);
                break;
        }
    }


    @wire(getRecord, { recordId: '$recordId', fields: ['Loan__c.Name'] })
    getRollupSummary({ data, error }) {
        if (data) {
            this.filterName = 'All';
            this.callbyAll();
        } else {
            this.errorContent(error);
        }
    }

    connectedCallback() {
        this.filterName = 'All';
        this.callbyAll();
        loadStyle(this, customStyle)
            .then(() => {

            })
    }

    callbyAll() {
        this.loading = true;
        getAllTransaction({ id: this.recordId }).then(data => {
            if (data !== "" && data !== undefined) {
                this.error = '';
                this.createTable(data);
            }
        }).catch(error => {
            this.errorContent(error);
        });
    }

    // this method is only necessary when we need a record based on limit
   /* callbyLimit() {
        this.loading = true;
        this.filterName = 'Recent';
        getTransactionByLimit({ id: this.recordId, lim: 5 }).then(data => {
            if (data !== "" && data !== undefined) {
                this.error = '';
                this.createTable(data);
            }
        }).catch(error => {
            this.errorContent(error);
        });
    } */

    callbyDays(days) {
        this.loading = true;
        getTransactionByDays({ id: this.recordId, days: days }).then(data => {
            if (data !== "" && data !== undefined) {
                this.error = '';
                this.createTable(data);
            }
        }).catch(error => {
            this.errorContent(error);
        });
    }

    createTable(data) {
        this.tranCount = 0;
        var j = 0,
            details = [],
            allData = [];
        this.transactionLine = [];
        this.gridData = [];

        details = JSON.stringify(data);
        this.transactionLine = JSON.parse(details);
        this.tranCount = this.transactionLine.length;
        while (j < this.tranCount) {
            var item = {};

            item["id"] = this.transactionLine[j].Id;
            item["LineNumber"] = this.transactionLine[j].Loan_lineNumber__c;
            item["transactionDate"] = this.transactionLine[j].Transaction_Date__c;
            item["type"] = this.transactionLine[j].Type__c;
            item["Amount"] = this.transactionLine[j].Amount_P__c;
            item["paidPrincipal"] = this.transactionLine[j].Balance_Principal__c;
            item["paidInterest"] = this.transactionLine[j].Balance_Interest__c;
            item["closingBalance"] = this.transactionLine[j].Closing_Balance__c;
            item["closingPrincipal"] = this.transactionLine[j].Closing_Principal__c;
            item["closingInterest"] = this.transactionLine[j].Closing_Interest__c;
             
            
            if (typeof this.transactionLine[j]["Transaction_Lines__r"] !== 'undefined' && this.transactionLine[j].Amount_P__c !== 0) {
                var fullSubItem = [],
                    child = [];
                child = this.transactionLine[j]["Transaction_Lines__r"];
                let childCount = child.length;
                for (let k = 0; k < childCount; k++) {
                    var subItem = {};
                    subItem["showButton"] = 'slds-hide';
                    subItem["id"] = this.transactionLine[j]["Transaction_Lines__r"][k].Id;
                    subItem["type"] = this.transactionLine[j]["Transaction_Lines__r"][k].get_fee_name__c;
                    var Amount = this.transactionLine[j]["Transaction_Lines__r"][k].Amount__c;
                    if (Amount < 0) {
                        subItem["Amount"] = -1 * this.transactionLine[j]["Transaction_Lines__r"][k].Amount__c;
                    } else {
                        subItem["Amount"] = this.transactionLine[j]["Transaction_Lines__r"][k].Amount__c;
                    }

                    fullSubItem.push(subItem);
                }
                item["_children"] = fullSubItem;

                if (this.transactionLine[j].Type__c == 'Disbursal') {
                    item["t1"] = 'myCustomCls';
                }
            }
        
            allData.push(item);
            j++;
        }
        this.loading = false;
        this.gridData = allData;
        this.tranCount = this.gridData.length;
        if (this.tranCount > 0) {
            this.dataPresent = true;
        }
    }

    errorContent(err) {
        this.error = err;
        this.loading = false;
        console.log(err);
    }
}