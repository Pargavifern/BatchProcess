import { LightningElement, api, wire, track } from 'lwc';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStatusHistory from '@salesforce/apex/LoanHistoryTrackController.getAll';

export default class PathAssistant extends LightningElement {
    @api recordId;
    @api objectApiName;

    @api dependentField; //this field is used to change the status value shown at last
    @api picklistField;
    @api picklistLabel;
    @api closedWon;
    @api closedLost;
    @api showButton=false;

    @track activePicklistValue;
    @track dependendPicklistValue;
    @track recType;

    @track picklistWithObject;
    @track depenedWithObject;

    @track count;
    @track objectPicklist=[{}];
    @track disableButton=false;
    @track activeIndex;

    @track selectedValue='';
    @track selectedIndex=-1;

    @track disableButton=false;

    @track updatingPicklistValue='';

    @track statusHistory=[];
    @track statusHistoryCount=0;

    @track error='';

    @track statusred;
    @track statuscount;



    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'], modes: ['View'] })
    wiredRecord({data,error}) {
         if (data) {
            var result = JSON.parse(JSON.stringify(data));
            this.picklistWithObject =this.objectApiName+'.'+this.picklistField;

            this.recType=result.recordTypeId;
            this.activePicklistValue=getFieldValue(data, this.picklistWithObject);

            if(this.dependentField != null){
              this.depenedWithObject = this.objectApiName + '.' + this.dependentField;
              this.dependendPicklistValue = getFieldValue(data, this.depenedWithObject);
            }

            const sendRecType = new CustomEvent("getrecordtypeid", {
              detail: this.recType
            });
            this.dispatchEvent(sendRecType);
            this.getActiveIndex(); // rerender the path component due to value changed
        }
        else{
          this.error=error;
          console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recType', fieldApiName: '$picklistWithObject' })
    getPicklistInfo({ data, error}) {
      if (data) {
        this.processPickListLabels(data.values);
      }
      else if (error) {
        this.error = error;
      }
    }

    processPickListLabels(picklistArray) { // assign picklist values to  the custom variable
        this.count=picklistArray.length;

        for(let i=0;i<this.count;i++){
          this.objectPicklist[i]={};
          this.objectPicklist[i].Stages=picklistArray[i].label;
          this.objectPicklist[i].pathLabel=picklistArray[i].label;
          this.objectPicklist[i].index=i;
        }
        this.getActiveIndex();
      }

      setDependentValue(){
        if(this.objectPicklist.length > 1){
          if(this.dependendPicklistValue !== null && typeof this.dependendPicklistValue !== 'undefined'){
            this.objectPicklist[this.count-1].pathLabel = this.dependendPicklistValue;
          }
        }
      }

      getActiveIndex(){ //get active  picklist index    
        this.setDependentValue();
        this.activeIndex=this.objectPicklist.findIndex(opt=>opt.Stages===this.activePicklistValue);
        if(this.objectApiName=='Loan__c')
          this.setstatusHistory();
        else
          this.setClassStyle();
      }

      setstatusHistory(){
        let loanTrack={'sobjectType':'Loan_History_Track__c'};
        loanTrack.Loan__c=this.recordId;

        getStatusHistory({ value:loanTrack, autoNumber:null }).then(data=>{
          if(data!==''&& data!== 'null' && data!=='undefined'){
              let d=JSON.parse(JSON.stringify(data));
              this.statusHistoryCount = d.length; console.log(JSON.parse(JSON.stringify(data)));

              for(let i=0;i<this.statusHistoryCount;i++){
                  this.statusHistory[i]=d[i].OldValue__c;
              }

              this.setClassStyle();
          }
        } ).catch(error => {
            this.error = error;
            console.log(error);
        });
      }

      connectedCallback(){
          if(this.closedLost != null)
            {
              this.statusred = this.closedLost.split(",");
              this.statusred[0];
           }      
      }

      setClassStyle(){  // set the class style for each picklist value
        try{
          if(typeof this.objectPicklist[1]!=='undefined'){
            for(let i=0;i<this.count;i++){
                let classText = 'slds-path__item';

                if (i==this.selectedIndex) {
                    classText += ' slds-is-active';
                }
                if (i==this.activeIndex) 
                {
                  classText += ' slds-is-current';
                  if(this.closedLost != null)
                  {
                    this.statuscount = this.statusred.length;
                    for(let r=0;r<this.statuscount;r++)
                    {                   
                      if(this.activePicklistValue == this.statusred[r] || this.dependendPicklistValue == this.statusred[r])
                      {
                        classText +=' slds-is-lost slds-is-active';//show it as red
                      }
                    }
                  }
                  if(this.activePicklistValue == this.closedWon || this.dependendPicklistValue == this.closedWon){ // show it as dark green
                    classText +=' slds-is-won slds-is-active';
                  }
                  if (this.selectedIndex==-1) {
                      // if user didn't select any step this is also the active one
                      classText += ' slds-is-active';
                  }
          
                }
                else if (i<this.activeIndex){
                    if(this.objectApiName=='Loan__c'){ //this is especially for the loan status path
                      for(let j=0; j < this.statusHistoryCount; j++){
                        if(this.objectPicklist[i].Stages == this.statusHistory[j])
                          classText += ' slds-is-complete';
                        else
                          classText += ' slds-is-incomplete';
                      }
                    }
                    else{
                      classText += ' slds-is-complete';
                    }
                } 
                else {// not yet completed
                    classText += ' slds-is-incomplete';
                }
                this.objectPicklist[i].classStyle=classText;
            }
            this.disableStatusButton();
          }
        }
        catch(e){
          console.log(e);
        }
      }


    changePicklist(event){
      this.selectedValue=event.currentTarget.getAttribute('data-value');
      this.selectedIndex=this.objectPicklist.find(opt=>opt.Stages===this.selectedValue).index;

      this.setClassStyle();

      this.disableStatusButton(); // enable and disable the button based on the selection;
    }

//check if the active picklist is the last one and disable the button
    disableStatusButton(){
      var last=this.count-1;
      if(this.activeIndex==last && (this.selectedIndex==last || this.selectedIndex<0)){
        this.disableButton=true;
      }
      else{
        this.disableButton=false;
      }
    }

    getupdatingValue(){
      if(this.selectedValue === '' || this.selectedValue===this.activePicklistValue){
        this.updatingPicklistValue = this.objectPicklist[this.activeIndex+1].Stages;
      }
      else{
        this.updatingPicklistValue = this.selectedValue;
      }

      const sendUpdateValue = new CustomEvent("updatevalue", { // send the Updating value to parent component
        detail:  this.updatingPicklistValue
      });
      this.dispatchEvent(sendUpdateValue);
    }

    @api
    updatingRecord(newFields){
      let fieldCount=0;
      const fields = {};
            fields['Id'] = this.recordId;
            fields[this.picklistField]=this.updatingPicklistValue;

      if(newFields!==null){
         fieldCount=newFields.length;
         for(let i=0;i<fieldCount;i++){
           fields[newFields[i].field]=newFields[i].value;
         }
      }

      return this._update(fields)
    }

    _update(fields){
      let eMessage='';
      const recordInput = { fields };
      return updateRecord(recordInput)
                .then(() => {
                    this.selectedIndex=-1; // clear the selected value
                    this.selectedValue='';
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: this.picklistLabel+' changed successfully.',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                  console.log(JSON.parse(JSON.stringify(error)));
                  //split the error message and shown in the toast
                  if(error.body.message !== null){
                    eMessage = error.body.message;
                  }
                  if(error.body.output.errors.length>0){
                    eMessage=error.body.output.errors[0].message;
                  }
                  else{
                    for(var e in error.body.output.fieldErrors){
                      eMessage=error.body.output.fieldErrors[e][0].message;
                    }
                    if(eMessage==''){
                      eMessage=error.body.message;
                    }
                  }
                  this.dispatchEvent(
                    new ShowToastEvent({
                        title: eMessage,
                        variant: 'error'
                    })
                );
                reject('error');
              });
    }
}