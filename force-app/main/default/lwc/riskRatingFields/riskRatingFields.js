import { LightningElement, track, api, wire } from 'lwc';
import getAll from '@salesforce/apex/RiskRatingController.getAll';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' }
];

const COLS = [
    { label: 'Category', fieldName: 'Category__c', cellAttributes: { alignment: 'left' }, sortable: true, initialWidth: 396 },
    { label: 'Category Weight', fieldName: 'Category_Weight__c', type: 'decimal', cellAttributes: { alignment: 'left' } },
    { label: 'Risk Rating', fieldName: 'Risk_Rating__c', type: 'decimal', cellAttributes: { alignment: 'left' } },
    { label: 'Rating', fieldName: 'Rating__c', type: 'decimal', cellAttributes: { alignment: 'left' } },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'auto'
        },
        cellAttributes: { class: { fieldName: 'cssClass' } }
    }
];

export default class RiskRatingFields extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName;

    @track loading = false;
    @track columns = COLS;
    @track data;
    @track recordCount = 0;
    @track isModalOpen = false;
    @track recordFound = false;
    @track error;
    @track gridExpandedRows = [];

    @track popupClass;
    @track riskId;

    @wire(CurrentPageReference) pageRef;

    navigateToRecordPage(id) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: id,
                objectApiName: 'Risk_Rating__c',
                actionName: 'view'
            },
        });
    }

    renderedCallback() {
        if (!this.renderedExecuted) {
            var tag;
            const style = document.createElement('style');
            style.innerText = `c-risk-rating-fields .hideAction{
                display:none; 
            }`;
            tag = this.template.querySelector('lightning-tree-grid');
            if (tag != null) {
                tag.appendChild(style);
            }
        }

    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.riskId = '';
        this.isModalOpen = false;
        this.showLoadingSpinner = false;
    }
    handleDownload() {
        window.open(
            '/apex/riskRating?Id=' + this.recordId,
            '_blank' // <- This is what makes it open in a new window.
        );
    }
    handleSubmit() {
        this.showLoadingSpinner = true;
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    handleSuccess(event) {
        this.showToast('Risk Rating was saved.', 'success');
        this.closeModal();
        this.getData();
    }

    handleError(event) {
        console.log('error occured');
    }

    connectedCallback() {
        this.getData();
    }

    getData() {
        this.showLoadingSpinner = true;
        let obj = { 'sobjectType': 'Risk_Rating__c' };
        obj.Account__c = this.recordId;
        getAll({ value: obj, autoNumber: null })
            .then(data => {
                this.showLoadingSpinner = false;
                this.data = data;
                if (data !== null && data !== undefined && data.length > 0) {
                    this.recordFound = true;
                    let d = JSON.parse(JSON.stringify(data));
                    this.recordCount = data.length;

                    for (let i = 0; i < this.recordCount; i++) {
                        if (typeof d[i].Rationale__c !== 'undefined') {
                            d[i]._children = [{
                                Id: d[i].Id,
                                Category__c: d[i].Rationale__c,
                                cssClass: 'hideAction'
                            }];
                            this.gridExpandedRows.push(d[i].Id);
                        }
                    }
                    this.data = d;
                }
            })
            .catch(error => {
                this.showLoadingSpinner = false;
                this.error = error;
                console.log('error occured ', error);
            });
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        switch (actionName) {
            case 'view':
                this.navigateToRecordPage(row.Id);
                break;
            case 'edit':
                this.riskId = row.Id;
                this.openModal();
                break;
        }
    }

    showToast(msg, type) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: msg,
                variant: type,
            }),
        );
    }

    loadForm(event) {
        this.getData();
    }
}