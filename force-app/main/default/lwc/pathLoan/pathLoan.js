import { LightningElement, track, api } from 'lwc';

export default class PathLoan extends LightningElement {
    @api recordId;
    @api objectApiName;

    updatePicklist(event){
        this.template.querySelector('c-path-assistant').updatingRecord(null);
    }
}