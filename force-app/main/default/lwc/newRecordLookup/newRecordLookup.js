import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue  } from 'lightning/uiRecordApi';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class NewRecordLookup extends LightningElement {

    @api uniqueKey;
    @api objName;
    @api fields;
    createRecordOpen;

    @wire(CurrentPageReference) pageRef;

    @track recordTypeOptions;
   // @track createRecordOpen;
    @track recordTypeSelector;
    @track mainRecord;
    @track recordTypeId='';
    @track objLabelName;
    @track newRecordId;
    @track objFieldName;

    @track errorMsg=[];
    @track errorPresent=false;
    @track error;


    @wire(getObjectInfo, { objectApiName: '$objName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            
            let recordTypeInfos = Object.entries(this.record.recordTypeInfos);
            if (recordTypeInfos.length > 1) {
                let temp = [];
                recordTypeInfos.forEach(([key, value]) => {
                    if (value.available === true && value.master !== true) {
                        temp.push({"label" : value.name, "value" : value.recordTypeId});
                    }
                });
                this.recordTypeOptions = temp;
            }
            this.recordTypeId = this.record.defaultRecordTypeId;
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("this.error", this.error);
        }
    }

    @wire(getRecord, { recordId: '$newRecordId', fields: '$objFieldName' })
    wiredOptions({ error, data }) { // used to get the inserted record name field
        if (data) {
            this.isValue=true;
            let name=getFieldValue(data,this.objFieldName);

            this.dispatchEvent(
                new ShowToastEvent({
                    title : this.objLabelName+' "'+ name +'" was created.',
                    variant : 'success',
                }),
            )
            const parameters={
                selectedId: this.newRecordId,
                selectedValue: name,
                key: this.uniqueKey
            };
            fireEvent(this.pageRef,"new_record_value", parameters);
           
        } else if (error) {
            this.error = error;
            console.log("this.error", this.error);
        }
    }

    connectedCallback(){
        registerListener("modal", this.handleModal, this); 
    }

    handleModal(args){
        if(args.open==true && args.key==this.uniqueKey){
            this.objLabelName=args.objLabelName;
            if (this.recordTypeOptions) {
                this.recordTypeSelector = true;
            }else {
                this.recordTypeSelector = false;
                this.mainRecord = true;
            }
            this.createRecordOpen = true;
        }   
    }

    createRecordMain() {
        this.recordTypeSelector = false;
        this.mainRecord = true;
    }

    handleRecTypeChange(event) {
        this.recordTypeId = event.target.value;
    }
    
    handleLoad(event) {
        let details = event.detail;
    }

    handleSubmit() {
        this.errorPresent=false;
        this.template.querySelector('lightning-record-form').submit();
    }

    handleSuccess(event) {
        this.newRecordId=event.detail.id;
        this.objFieldName=this.objName+'.Name';

        this.createRecordOpen = false;
        this.mainRecord = false;  

        this.errorMsg=[];
        this.errorPresent=false;
    }

    handleError(event) {
        this.errorMsg=[];
        var tag;
        const style = document.createElement('style');
        style.innerText = `c-new-record-lookup .slds-notify-container, .slds-notify_container,{
            display: none;
        }`;
        tag = this.template.querySelector('lightning-record-form');
        if (tag != null) {
            tag.appendChild(style);
        }
        this.errorPresent=true;
        let error=JSON.parse(JSON.stringify(event.detail));
        
        if(error.output.errors.length>0){
            for(let k in error.output.errors){
                this.errorMsg.push(error.output.errors[k].message);
            }
        }
        else{
            for(var e in error.output.fieldErrors){
                this.errorMsg.push(error.output.fieldErrors[e][0].message);
            }
        }
    }

    closeModal() {
        this.createRecordOpen = false; //---alternative
        this.recordTypeSelector = false;
        this.mainRecord = false;
        this.errorPresent=false;
        this.errorMsg=[];
        this.recordTypeId='';
    }
}