import { LightningElement, track, api } from 'lwc';
import getDocumentTemplates from '@salesforce/apex/DocumentController.getDocumentTemplate';


const actions = [
    { label: 'Generate', name: 'generate_download' },
    { label: 'Generate And Save', name: 'generate_save' }
];

const columns = [{
        label: 'Template Name',
        fieldName: 'Template_Name__c'
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'auto'
        }
    }

];
export default class DocumentGenerator extends LightningElement {

    @api recordId;
    @api objectApiName
    @track columns = columns;
    @track data;
    @track recordCount;


    getDocumentTemplateList() {
        getDocumentTemplates({ ObjectValue: this.objectApiName })
            .then(data => {
                this.data = data;
                if (data != null && data != undefined && data.length > 0) {
                    this.recordCount = data.length;
                }
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

    handleRowActions(event) {
        let actionName = event.detail.action.name;

        window.console.log('actionName ====> ' + actionName);

        let row = event.detail.row;

        window.console.log('row ====> ' + row);
        // eslint-disable-next-line default-case
        switch (actionName) {
            case 'generate_download':
                window.open('/apex/' + row.Template_Page__c + '?Id=' + this.recordId);
                break;
            case 'generate_save':
                break;
        }
    }

    connectedCallback() {
        this.getDocumentTemplateList();
    }


}