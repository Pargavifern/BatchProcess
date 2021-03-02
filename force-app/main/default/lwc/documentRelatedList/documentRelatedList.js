import { LightningElement, track, api, wire } from 'lwc';
import saveFile from '@salesforce/apex/DocumentController.saveFile';
import relatedFiles from '@salesforce/apex/DocumentController.relatedFiles';
import relatedFilesbyType from '@salesforce/apex/DocumentController.relatedFilesbyType';
import getTypes from '@salesforce/apex/DocumentController.getTypes';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteFile from '@salesforce/apex/DocumentController.deleteFile';
import { CurrentPageReference } from 'lightning/navigation';
import { updateRecord } from 'lightning/uiRecordApi';

const actions = [
    { label: 'View', name: 'record_details' },
    { label: 'Delete', name: 'delete' }
];

const columns = [{
        label: 'File Name',
        fieldName: 'View__c',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Title' } },
        sortable: false
    },
    { label: 'Type', fieldName: 'Type__c' },
    { label: 'Expiry Date', fieldName: 'Expiry_Date__c'},
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'auto'
        }
    }

];

export default class documentRelatedList extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track fileType='';
    @track columns = columns;
    @track data;
    @track fileName = '';
    @track UploadFile = 'Upload File';
    @track showLoadingSpinner = false;
    @track isTrue = false;
    @track recordFound = false;
    @track recordCount = 0;
    @track _options = [];
    @track expiryDate;
    @track description;
    @track filterOptions = [];
    @track filterValue;
    selectedRecords;
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;
    @track loanRecord = false;

    @track isModalOpen = false;

    fields=['Name'];

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        if(this.objectApiName === 'Loan__c'){
            this.loanRecord = true;
        }else{
            this.loanRecord = false;
        }
        this.getFileTypes();
        this.getRelatedFiles();
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name;

        window.console.log('actionName ====> ' + actionName);

        let row = event.detail.row;

        window.console.log('row ====> ' + row);
        // eslint-disable-next-line default-case
        switch (actionName) {
            case 'record_details':
                window.open('/lightning/r/' + row.ContentDocumentId + '/view')
                break;
            case 'delete':
                this.deleteCons(row);
                break;
        }
    }

    deleteCons(currentRow) {
        deleteFile({ id: currentRow.Id })
            .then(data => {
                if (data) {

                    this.showLoadingSpinner = true;
                    this.getRelatedFiles();
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Deleted Successfully.',
                            variant: 'success',
                        }),
                    );
                }
            })
    }

    updateRecordView(recordId) {
        updateRecord({fields: { Id: recordId }});
    }

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.fileName='';
        this.fileType='';
        this.isModalOpen = false;
    }

    selectedDocument(event){
        this.fileType =event.detail.selectedId; //id of the document type
        //this.fileType=event.detail.selectedValue; // selected document name 
    }
    descriptionChange(event) {
        this.description = event.target.value;
    }
    dateChange(event) {
        this.expiryDate = event.target.value;
    }

    // getting file 
    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    handleSave() {
        if(this.fileType!=='' && this.fileType!==null){
            const allValid = [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
    
            if (allValid) {
                this.uploadHelper();
            }
        }
        else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Please select the document type',
                    variant: 'error',
                }),
            );
        }
        
    }

    uploadHelper() {
        this.file = this.filesUploaded[0];
        let fileInput=this.template.querySelector('.fileUploader');
        fileInput.setCustomValidity('');

        if (this.file.size > this.MAX_FILE_SIZE) { 
            fileInput.setCustomValidity('File Size is too long');
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'File Size is too long',
                    variant: 'error',
                }),
            );
            window.console.log('File Size is too long');
            return;
        }
        this.showLoadingSpinner = true;
        // create a FileReader object 
        this.fileReader = new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);

            // call the uploadProcess method 
            this.saveToFile();
        });

        this.fileReader.readAsDataURL(this.file);
    }

    // Calling apex class to insert the file
    saveToFile() {
        this.isModalOpen = false;
        saveFile({
                idParent: this.recordId,
                strFileName: this.file.name,
                base64Data: encodeURIComponent(this.fileContents),
                type: this.fileType,
                eDate: this.expiryDate,
                description: this.description

            })
            .then(result => {
                this.fileType = '';
                this.expiryDate = null;
                window.console.log('result ====> ' + result);
                // refreshing the datatable
                this.getFileTypes();
                this.getRelatedFiles();
                
                this.isTrue = true;

                // Showing Success message after file insert
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'File "'+this.file.name + '" Uploaded Successfully.',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                // Showing errors if any while inserting the files
                window.console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while uploading File',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });

    }

    // Getting releated files of the current record
    getRelatedFiles() {
        //this.loadForm();
        this.updateRecordView(this.recordId);
        this.filterValue = 'All';
        relatedFiles({ idParent: this.recordId })
            .then(data => {
                this.data = data;
                this.setData(data);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!!',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    setData(data){
        if (data != null && data != undefined && data.length > 0) {
            this.recordCount = data.length;
            let d = JSON.parse(JSON.stringify(data));
            
            for(let i = 0; i< this.recordCount; i++){
                d[i].Type__c = d[i]["Type__r"].Name;
            }
            this.data = d;
            this.recordFound = true;
        }
      
        this.showLoadingSpinner = false;
    }

    getFileTypes() {	
        getTypes({ ObjectValue: this.objectApiName })	
            .then(data => {	
                this.fillTypes(data);	
            }).catch(error=>{
                console.log(error);
            })	;
    }	

    fillTypes(data) {	
        this.filterOptions = [ { label : 'All', value : 'All'} ];	

        (data).forEach(element => {	
            var option = { label: '', value: '' };	
            option.label = element.Name;	
            option.value = element.Id;
            this.filterOptions.push(option);	
        });	
    }

    // Getting selected rows to perform any action
    getSelectedRecords(event) {
        let conDocIds;
        const selectedRows = event.detail.selectedRows;
        conDocIds = new Set();
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++) {
            conDocIds.add(selectedRows[i].ContentDocumentId);
        }

        this.selectedRecords = Array.from(conDocIds).join(',');

        window.console.log('selectedRecords =====> ' + this.selectedRecords);
    }

    filterChange(event){
        var selectedValue = event.detail.value;
        if(selectedValue === 'All'){
            this.getRelatedFiles();
        }
        else{
            this.getFilesbyType(selectedValue);
        }
    }

    getFilesbyType(selectedType){
        relatedFilesbyType({ idParent: this.recordId, filterType: selectedType })
            .then(data => {
                this.data = data;
                this.setData(data);
            })
            .catch(error => {
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: error.message,
                        variant: 'error',
                    }),
                );
            });
    }
}