import { LightningElement ,track } from 'lwc';
import getAll from '@salesforce/apex/ApplicationController.getSource';
import updateMany from '@salesforce/apex/ApplicationController.editMany';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Application__c.Id';
import APPROVED_DATE from '@salesforce/schema/Application__c.Approved_Date__c';
import APPROVED_AMOUNT from '@salesforce/schema/Application__c.Approved_Amount__c';
import CANCEL_DATE from '@salesforce/schema/Application__c.Cancel_date__c';
import CANCEL_USER from '@salesforce/schema/Application__c.Cancel_user__c';
import CANCEL_REASON from '@salesforce/schema/Application__c.Cancel_Reason__c';
import COMPLETION_STATUS from '@salesforce/schema/Application__c.Completion_Status__c';
import STATUS_FIELD from '@salesforce/schema/Application__c.Status__c';
import Id from '@salesforce/user/Id'; 

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Approve', name: 'approve' },
    { label: 'Cancel', name: 'cancel' },
];
const columns =  [
    {
        label: 'Application Number',
        fieldName: 'nameUrl',
        type: 'url',
        sortable: "true",
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_blank'
          
     } },
    
     {
        label: "Contact",
        fieldName: "contactUrl", //field2
        type: "url",
        sortable: "true",
        typeAttributes: {
          label: { fieldName: "contact" }, //field1
          target: "_blank"
        }
      },
      {
        label: "Account",
        fieldName: "AccountUrl", //field2
        type: "url",
        sortable: "true",
        typeAttributes: {
          label: { fieldName: "Account" }, //field1
          target: "_blank"
        }
      },
   
    {label: 'Application Date', fieldName: 'Application_Date__c', sortable: "true"},
    {label: 'Amount', fieldName: 'Amount__c',sortable: "true"},
    {label: 'Status', fieldName: 'Completion_Status__c',sortable: "true"},  
  
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'auto'
        },
    }

];

export default class MembersAccessListView extends NavigationMixin (LightningElement) {
    userId = Id;

    @track columns = columns;
    @track recordFound= true;
    @track data;
    @track sortBy;
    @track sortDirection;
    @track error;
    @track applicationId;
    @track selectedRowList;
    @track selectedRowCount = 0;
    @track multipleRecords = [];
    @track currentDate;
    @track showLoadingSpinner = false;
    @track renderedCallbackExecuted = false;
    @track recordCount = 0;
    @track recordFetchedTime;
    

    constructor() {
        super();
        this.columns = [{
            label: 'Application Number',
            fieldName: 'nameUrl',
            type: 'url',
            sortable: "true",
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_blank'
              
         } },
        
         {
            label: "Contact",
            fieldName: "contactUrl", //field2
            type: "url",
            sortable: "true",
            typeAttributes: {
              label: { fieldName: "contact" }, //field1
              target: "_blank"
            }
          },
          {
            label: "Account",
            fieldName: "AccountUrl", //field2
            type: "url",
            sortable: "true",
            typeAttributes: {
              label: { fieldName: "Account" }, //field1
              target: "_blank"
            }
          },
       
        {label: 'Application Date', fieldName: 'Application_Date__c', sortable: "true"},
        {label: 'Amount', fieldName: 'Amount__c',sortable: "true"},
        {label: 'Status', fieldName: 'Completion_Status__c',sortable: "true"},  
            { type: 'action', typeAttributes: { rowActions: this.getRowActions, menuAlignment: 'right' } },
        ]
    }

    getRowActions(row, doneCallback) {
        const actions = [];
            if (typeof row['Completion_Status__c'] !== 'undefined') {
                actions.push({ label: 'View', name: 'view' });
            } else {
                actions.push({ label: 'View', name: 'view' },
                { label: 'Approve', name: 'approve' },
                { label: 'Cancel', name: 'cancel' });
            }
            doneCallback(actions);
    }


    connectedCallback(){
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
            
        this.currentDate =  yyyy + '-' + mm + '-' + dd ;
        this.showLoadingSpinner = true;
        this.getData();
    }
             
    renderedCallback() {
        if (!this.renderedCallbackExecuted) {
            const style = document.createElement('style');
            style.innerText = `.flexipageHeader .slds-page-header .uiBlock .oneAnchorHeader {
                display : none;
            }`;
            this.template.querySelector('.container').appendChild(style);
            this.renderedCallbackExecuted = true;
        }
    }
       getData()
    {
     getAll().then(data => {
        this.recordFound = true;
        this.recordCount = data.length;
        this.recordFetchedTime = new Date();
        this.data= data.map(record => ( { contact: record.Contact__r ? record.Contact__r.Name : '',
                contactUrl: record.Contact__c ? `/${record.Contact__c}` : '' , ...record,
                Account: record.Account__r ? record.Account__r.Name : '',
                AccountUrl: record.Account__c ? `/${record.Account__c}` : '' , ...record,
                nameUrl: `/${record.Id}`, ...record,
                } ) );    
                    
        this.showLoadingSpinner = false;
        }).catch(error => { console.log(error);
            this.error = error;
            this.dispatchEvent( new ShowToastEvent({
                    title: 'Error!!',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }
    handleApprovalApplications(){
        this.setmultiRecords('approve');
    }

    handleCancelApplications(){
        this.setmultiRecords('cancel');
    }

    setmultiRecords(mtype){
        if(this.selectedRowCount === 0 ||this.selectedRowCount === null){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Please select a records to process',
                    variant: 'warning'
                })
            );
        }
        else{
            this.showLoadingSpinner = true;
            if(mtype === 'approve'){
                for(let i = 0; i < this.selectedRowCount; i++){
                    if(typeof this.selectedRowList[i].Completion_Status__c === 'undefined'){
                        let record = {'sobjectType':'Application__c'};
                        record.Approved_Date__c = this.currentDate;
                        record.Approved_Amount__c = this.selectedRowList[i].Amount__c;
                        record.Status__c = 'Complete';
                        record.Completion_Status__c = 'Approved';
                        record.Id = this.selectedRowList[i].Id;
                        this.multipleRecords.push(record);
                    }
                }
            }
            else{
                for(let i = 0; i < this.selectedRowCount; i++){
                    if(typeof this.selectedRowList[i].Completion_Status__c === 'undefined'){
                        let record = {'sobjectType':'Application__c'};
                        record.Cancel_date__c = this.currentDate;
                        record.Cancel_Reason__c = 'Declined';
                        record.Cancel_user__c = this.userId;
                        record.Status__c = 'Complete';
                        record.Completion_Status__c = 'Canceled';
                        record.Id = this.selectedRowList[i].Id;
                        this.multipleRecords.push(record);
                    }
                }
            } 
            if(this.multipleRecords.length > 0){
                this.updateManyRecords();
            }
            else{
                this.showLoadingSpinner = false;
                this.multipleRecords = [];
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Please select an incomplete records to process',
                        variant: 'warning'
                    })
                );
            }
            
        }
    }

    getSelectedRecords(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedRowList = selectedRows;
        this.selectedRowCount = selectedRows.length;
    }

    handleRowActions(event) {
        const actionName = event.detail.action.name;
        const  row = event.detail.row;
        this.applicationId = row.Id;

        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.applicationId;
        fields[STATUS_FIELD.fieldApiName] = 'Complete';

        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                        attributes: {
                            recordId: this.applicationId,
                            actionName: 'view'
                        }
                });
                break;
            case 'approve':   
                this.showLoadingSpinner = true;
                    fields[COMPLETION_STATUS.fieldApiName] = 'Approved';                   
                    fields[APPROVED_DATE.fieldApiName] = this.currentDate;
                    fields[APPROVED_AMOUNT.fieldApiName] = row.Amount__c;
                    this.updateList(fields);
                    break;
            case 'cancel':
                this.showLoadingSpinner = true;
                    fields[COMPLETION_STATUS.fieldApiName] = 'Canceled';      
                    fields[CANCEL_REASON.fieldApiName] = 'Declined';
                    fields[CANCEL_DATE.fieldApiName] = this.currentDate;
                    fields[CANCEL_USER.fieldApiName] = this.userId;
                    this.updateList(fields);
                    break;
        } 
    }

        updateList(fields){
            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Record updated successfully',
                            variant: 'success'
                        })
                    );
                    this.getData();
                    })
                .catch(error => {
                    console.log(JSON.stringify(error));
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: error.body.message,
                            variant: 'error'
                        })
                    );
                });
        }

        updateManyRecords(){
            updateMany({values:this.multipleRecords }).then(data => {
                this.multipleRecords = [];
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Records updated successfully',
                        variant: 'success'
                    })
                );
                this.getData();
                }).catch(error => { console.log(error);
                this.error = error;
                this.dispatchEvent( new ShowToastEvent({
                        title: error.body.message,
                        variant: 'error',
                    }),
                );
            });
        }

        handleSortdata(event) {   
            this.sortBy = event.detail.fieldName;// field name   
            this.sortDirection = event.detail.sortDirection; // sort direction        
            this.sortData(event.detail.fieldName, event.detail.sortDirection);// calling sortdata function to sort the data based on direction and selected field
        }
        
        sortData(fieldname, direction) {    
            let parseData = JSON.parse(JSON.stringify(this.data)); // serialize the data before calling sort function    
            let keyValue = (a) => { return a[fieldname]; }; // Return the value stored in the field    
            let isReverse = direction === 'asc' ? 1: -1; // cheking reverse direction 
                
            parseData.sort((x, y) => { // sorting data 
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
                y = keyValue(y) ? keyValue(y) : '';    
                return isReverse * ((x > y) - (y > x)); // sorting values based on direction
            });
                
            this.data = parseData;// set the sorted data to data table data
        }
    }