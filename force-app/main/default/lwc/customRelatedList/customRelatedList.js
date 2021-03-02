import { LightningElement, api, track } from 'lwc';
import relatedList from '@salesforce/apex/customRelatedListController.getRecords';

export default class CustomRelatedList extends LightningElement {
    @track data;
    @track columns;

    @api objectApiName;
    @api fields;
    @api rowlabels;
    @api filterId;
    @api filterApiName;
    @api title;
    @api icon;
    @api fieldTypes

    connectedCallback() {
        let fieldNames = this.fields.split(',');
        let lablelNames = this.rowlabels.split(',');
        let fieldtypearr = this.fieldTypes.split(',');

        this.columns = [];

        for (var i = 0; i < fieldNames.length; i++) {
            this.columns.push({ label: lablelNames[i], fieldName: fieldNames[i], type: fieldtypearr[i] });
        }

        this.getRecords();
    }

    getRecords() {

        try {
            relatedList({
                filterId: this.filterId,
                relatedFieldApiName: this.filterApiName,
                objectApiName: this.objectApiName,
                fields: this.fields
            }).then(result => {
                if (result) {
                    this.data = result;
                }
            }).then(error => {
                if (error) {
                    console.debug(error);
                }
            })
        } catch (e) {
            console.debug(e);
        }
    }

}