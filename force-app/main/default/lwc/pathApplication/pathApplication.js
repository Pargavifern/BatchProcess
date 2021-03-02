import { LightningElement, api, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PICKLIST_FIELD from '@salesforce/schema/Application__c.Completion_Status__c';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import Id from '@salesforce/user/Id';


export default class PathApplication extends LightningElement {
    @track currentUserId = Id;
    @api recordId;
    @api objectApiName;
    recType;
    rectypeid;
   
    @track completionStatus=[];
    @track showFields=false;
    @track aAmount;
    @track aAmountDefault;
    @track currentDate;

    @track isModalOpen = false;

    @track selectedCS;
    @track showcancelFields= false;


    getRecordTypeId(event){    
        this.recType =event.detail;
        this.rectypeid = event.detail;
    }

    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'], modes: ['View'] })
    wiredRecord({data,error}) {
         if (data) { 
        
            this.aAmountDefault=getFieldValue(data, 'Application__c.Amount__c');
           
            if(data.recordTypeInfo.name =='Personal Line of Credit'|| data.recordTypeInfo.name =='Business Line of Credit'){

              this.aAmountDefault=getFieldValue(data,'Application__c.Credit_Limit__c');
            }
       }
        else{
          console.log(JSON.stringify(error));
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recType', fieldApiName: PICKLIST_FIELD })
    getPicklistInfo2({ data, error}) {
      if (data) {
        let arrayList=data.values;
        let options=[{ label:'--None--' }];
        arrayList.forEach(item => {
          options.push({ label:item.label, value:item.label});
        });
        this.completionStatus=options;
      } else if (error) {
        this.error = error;
      }
    }

    connectedCallback(){
        let today = new Date();
        this.currentDate = today.toISOString();
    }

    updatePicklist(event){
        var statusValue=event.detail;
        if(statusValue=='Complete'){
            this.showModal();    
        }
        else{
            var t=this.template.querySelector('c-path-assistant').updatingRecord(null);
            t.then(()=>{
                this.closeModal();
               }).catch(()=>{ 
                   console.log('error occured');
            });
        }
    }

    handleChange(event) {
        this.selectedCS = event.target.value;
        if(this.selectedCS=="Approved"){
            this.showFields=true; //Approved
            this.showcancelFields=false; //Cancel
        }
        else if(this.selectedCS == "Canceled"){
            this.showFields=false; //Approved
            this.showcancelFields=true; //Cancel
        }
        else{
            this.showFields = false;
            this.showcancelFields = false;
       
        }
    }

    handleSubmit(event){
        event.preventDefault();      
        const fields = event.detail.fields;
        this.updateCompleteStatus(fields);
    }

    updateCompleteStatus(fields){     
        var newFields=[];
        newFields[0]={'field':'Completion_Status__c', 'value':this.selectedCS};
        if(this.selectedCS=="Approved"){
            newFields[1]={'field':'Approved_Date__c', 'value':fields.Approved_Date__c};
            newFields[2]={'field':'Approved_Amount__c', 'value':fields.Approved_Amount__c};
            newFields[3]={'field':'Credit_Limit__c', 'value':fields.Credit_Limit__c};
        }
        else  if (this.selectedCS == "Canceled"){
            newFields[1]={'field': 'Cancel_date__c', 'value': fields.Cancel_date__c};
            newFields[2]={'field': 'Cancel_user__c', 'value': fields.Cancel_user__c};
            newFields[3]={'field': 'Cancel_Reason__c', 'value': fields.Cancel_Reason__c};
           
        }
        var t=this.template.querySelector('c-path-assistant').updatingRecord(newFields); //send new fields to the update method
        t.then(()=>{
            this.closeModal();
           }).catch(()=>{ 
               console.log('error occured');
        });
    }
 
    cancelButton(){ 
        this.selectedCS='';
        this.showFields=false;
        this.showcancelFields = false;
        this.closeModal();
    }

      //modal pop up coding
    showModal() {
        this.isModalOpen = true;
    }
  
    closeModal() {
        this.isModalOpen = false;
        this.cancelButton();
    }
  
    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
    }
  
    get modalClass() {
        return `slds-modal ${this.isModalOpen ? "slds-fade-in-open" : ""}`;
    }
  
    get modalBackdropClass() {
        return `slds-backdrop ${this.isModalOpen ? "slds-backdrop_open" : ""}`;
    }
}