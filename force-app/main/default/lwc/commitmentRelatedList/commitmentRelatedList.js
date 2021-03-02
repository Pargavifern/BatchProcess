import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue  } from 'lightning/uiRecordApi';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import CNAME from '@salesforce/schema/Commitment_History__c.Name';
import  getAll from '@salesforce/apex/CommitmentHistoryController.getAllByLimit';
import deleteFile from '@salesforce/apex/CommitmentHistoryController.remove';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Type', fieldName: 'Type__c' },
    { label: 'Amount', fieldName: 'Amount_Sign__c', type: 'currency', cellAttributes: { alignment: 'left' } },
    { label: 'Commit Date', fieldName: 'Date__c', type: 'date' },
    { label: 'Reason', fieldName: 'Reason__c' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'auto'
        }
    }

];


export default class CommitmentRelatedList extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName;

    @track columns=columns;
    @track data;

    @track recordCount=0;
    @track isModalOpen = false;
    @track recordFound = false;
    @track error;
    @track newRecordId;

    @track recordCreate = false;
    @track recordDelete = false;

    @track selectedRow;

    @track heading="Add";
    @track popupClass;
    @track commitmentId;

    @wire(CurrentPageReference) pageRef;

    @wire(getRecord, { recordId: '$newRecordId', fields: [CNAME] })
    wiredOptions({ error, data }) { // used to get the inserted record name field
        if (data) {
            this.closeModal();
            let name=getFieldValue(data,CNAME);

            this.showToast('Commitment "'+ name +'" was created.', 'success');
            this.getData();
            this.navigateToRecordPage(this.newRecordId);
           
        } else if (error) {
            this.error = error;
            console.log("error occured while getting record", this.error);
        }
    }

    navigateToRecordPage(id) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: id,
                objectApiName: 'Commitment_History__c',
                actionName: 'view'
            },
        });
    }

    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.selectedRow = '';
        this.heading = '';
        this.commitmentId = '';
        this.recordDelete = false;
        this.recordCreate = false;
        this.isModalOpen = false;
        this.showLoadingSpinner = false;
    }

    handleSubmit() {
        this.showLoadingSpinner = true;
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    handleSuccess(event) {
        if(this.heading !== 'Edit'){
            this.newRecordId=event.detail.id;
        }else{
            this.showToast('Commitment was saved.', 'success');
            this.closeModal();
            this.getData();
        }
    }

    handleError(event) {
        console.log('error occured');
    }

    connectedCallback(){
        this.getData();
    }

    getData(){
        this.showLoadingSpinner = true;
        getAll()
            .then(data => {
                this.data=data;
                if (data !== null && data !== undefined && data.length > 0) {
                    this.recordFound = true;
                    this.recordCount = data.length;
                }
                this.showLoadingSpinner = false;
            })
            .catch(error => {
                this.error=error;
                console.log('error occured ',error);
            });
    }

    relatedListPage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Loan__c',
                relationshipApiName: 'Commitment_History__r',
                actionName: 'view'
            },
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
                this.commitmentId = row.Id;
                this.heading = 'Edit';
                this.openNewRecord();
                break;
            case 'delete':
                this.selectedRow = row;
                this.openRecordDelete();
                break;
        }
    }

    deleteRecord() {
        this.showLoadingSpinner = true;
        let currentRow=this.selectedRow;
        this.selectedRow='';
        deleteFile({ id: currentRow.Id })
            .then(data => {
                if (data) {
                    this.closeModal();
                    this.getData();
                    this.showToast('Commitment "'+ currentRow.Name +'" was deleted.', 'success');
                }
            }).catch(error=>{
                console.log('Delete error occured ',error);
            })
    }

    openNewRecord(){
        this.recordCreate = true;
        this.recordDelete = false;
        this.popupClass = "slds-modal slds-fade-in-open slds-modal_small";

        if(this.heading != 'Edit'){
            this.heading = 'Add';
        }
        this.openModal();
    }

    openRecordDelete(){
        this.recordCreate = false;
        this.recordDelete = true;
        this.heading = 'Delete';
        this.popupClass = "slds-modal slds-fade-in-open";
        this.openModal();
    }

    showToast(msg, type){
        this.dispatchEvent(
            new ShowToastEvent({
                title: msg,
                variant: type,
            }),
        );
    }

    loadForm(event){
        this.getData();
    }
}