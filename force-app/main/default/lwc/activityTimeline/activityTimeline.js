/* eslint-disable no-console */
/* eslint-disable no-alert */
import { LightningElement,track,api, wire } from 'lwc';
import getAll from '@salesforce/apex/TimelineEventController.getAllByLimit';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class ActivityTimeline extends NavigationMixin(LightningElement) {
    @track error;
    @api recordId;
    @api objectApiName;

    @track eventDetail=[];

    @track i=0;
    @track recordCount=8;

    @track eventCount=0;
    @track enableFooter=true;
    @track loading=false;

    @wire(CurrentPageReference) pageRef;

    connectedCallback(){
        this.TimelineEvent();
    }

    TimelineEvent(){   
        let classNameSet='isExpendable slds-timeline__item_expandable';
        getAll({ id: this.recordId, l: this.recordCount }).then(data1=>{
            if (data1 !=="" && data1 !== 'null' && data1!=='undefined') {
                this.error='';
                this.eventDetail=JSON.parse(JSON.stringify(data1));
                this.eventCount=this.eventDetail.length;
    
               /* if(this.eventCount === this.recordCount){ // remove one record from the list
                    this.eventDetail.splice(-1,1);
                    this.eventCount--;
                    this.enableFooter=true;
                } 
                else{
                    this.enableFooter=false;
                }*/
                for(let i=0;i<this.eventCount;i++){
                    console.log("1");

                    this.eventDetail[i].EventIcon=this.eventIcon(this.eventDetail[i].Event_Type__c);
                    this.eventDetail[i].tLink="/lightning/r/"+ this.eventDetail[i].Related_Id__c +"/view"; //this is used as a title href

                    //open the section if the description is found
                    let objName=this.eventDetail[i].Related_Object_Name__c;
                    if(objName=='Application__c' || objName=='Employment__c' || objName=='Loan_Transaction__c' ){ 
                        console.log("2")
                        this.eventDetail[i].showForm=true;
                        this.eventDetail[i].timeClass=this.eventDetail[i].Name+' '+ classNameSet +' slds-is-open'; 
                    }
                    else if(this.eventDetail[i].Description__c!=null){
                        this.eventDetail[i].timeClass=this.eventDetail[i].Name+' '+ classNameSet +' slds-is-open'; 
                    }
               
                  
                    else{
                        this.eventDetail[i].timeClass=this.eventDetail[i].Name+' '+ classNameSet;
                    }
              
             


                }
                this.loading=false;
            }
        }).catch(error1=>{
            this.errorContent(error1,'Timeline Event Object');
        })
    }
    expandActivity(event){  
        var butId='.'+event.target.value;
        this.template.querySelector(butId).classList.toggle('slds-is-open');
    }

    eventIcon(eventType){
        switch(eventType){
            case 'Applied for Loan':
                return "action:new_contact";
            case 'Cancelled Loan Application':
                return "action:reject";
            case 'Loan Application Denied':
                return "action:remove_relationship";
            case 'Received Loan':
                return "action:download";
            case 'Paid off Loan':
                return "action:approval";
            case 'Opened Bank Account':
                return "action:new_person_account";
            case 'Closed Bank Account':
                return "action:close";
            case 'Started Employment':
                return "action:new_note";
            case 'Ended Employment':
                return "action:remove_relationship";
            case 'New':
                return "action:new";
            default:
                return "action:following";
        }
    }
    
    loadMoreData(){
        this.recordCount=this.recordCount+3;
        this.TimelineEvent();
    }

    errorContent(err,obj){
        this.error=err;
        this.loading=false;
        console.log(obj);
        console.log(err);
    }

    navigateToTabPage() {
        // Navigate to a specific CustomTab.
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'TimeLine_List'
            },
            state: {
                c__recordId: this.recordId,
                c__objectApiName: this.objectApiName
           }
        });
    }
}