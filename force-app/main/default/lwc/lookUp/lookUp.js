import lookUp from '@salesforce/apex/LookupController.lookUp';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue  } from 'lightning/uiRecordApi';
import { api, LightningElement, track, wire } from 'lwc';
import Contact_DpPlaceholder from '@salesforce/resourceUrl/Contact_DpPlaceholder';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';


export default class LookupLwc extends LightningElement {

    @api objName;
    @api iconName;
    @api labelName;
    @api readOnly = false;
    @api filter = '';
    @api showLabel = false;
    @api required;
    objLabelName;
    @api uniqueKey;

    /*Create Record Start*/
    @api createRecord;

    @track newRecordId;
    @track objFieldName;
    @track placeHolder;

    searchTerm;
    @track valueObj;
    href;
    @track options; //lookup values
    @track isValue;
    @track blurTimeout;

    blurTimeout;

    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';

    @wire(CurrentPageReference) pageRef;

    connectedCallback(){
        registerListener("new_record_value", this.newRecord, this);
    }

    newRecord(args){
        if(args.key==this.uniqueKey){
            this.valueObj=args.selectedValue;
            this.isValue=true;

            let selectedId =args.selectedId;
            let selectedValue=args.selectedValue
            let key=this.uniqueKey;
            const valueSelectedEvent = new CustomEvent('valueselect', {
                detail: { selectedId, selectedValue, key },
             });
            this.dispatchEvent(valueSelectedEvent);
        }
        
    }

    renderedCallback() {
        if(this.objName) {
            let temp = this.objName;
            if(temp.includes('__c')){
                let newObjName = temp.replace(/__c/g,"");
                if(newObjName.includes('_')) {
                    let vNewObjName = newObjName.replace(/_/g," ");
                    this.objLabelName = vNewObjName;
                }else {
                    this.objLabelName = newObjName;
                }
                
            }else {
                this.objLabelName = this.objName;
            }
            this.placeHolder='Search '+this.objLabelName+'s...';
        }
    }

    @wire(lookUp, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
    wiredRecords({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            this.options = this.record;
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("wire.error",this.error);
        }
    }

    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open'; 
    }

    inblur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        let ele = event.currentTarget;
        this.valueObj=ele.dataset.value;
        this.isValue=true;
 

        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';

        let selectedId = ele.dataset.id;
        let selectedValue=ele.dataset.value;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, selectedValue },
        });
        this.dispatchEvent(valueSelectedEvent);
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

    handleRemovePill() {
        this.isValue=false;
        let selectedId = '';
        let selectedValue='';
        let key=this.uniqueKey;
        const valueSelectedEvent = new CustomEvent('valueselect', {
            detail: { selectedId, selectedValue, key },
        });
        this.dispatchEvent(valueSelectedEvent);
    }

    createRecordFunc() {
        const parameters={
            open: true,
            objLabelName: this.objLabelName,
            key: this.uniqueKey
        }
        fireEvent(this.pageRef,"modal", parameters);
    }
}