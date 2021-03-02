import { LightningElement, track, wire, api } from 'lwc';
import getAll from '@salesforce/apex/TimelineEventController.getAll';
import getByWord from '@salesforce/apex/TimelineEventController.getByLike';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

const columns =  [
    { label: 'Timeline Number', fieldName: 'Name', sortable: "true" },
    {
        label: "Title",
        fieldName: "titleUrl", //field2
        type: "url",
        sortable: "true",
        typeAttributes: {
          label: { fieldName: "Title__c" }, //field1
          target: "_self",
          tooltip: { fieldName: "Title__c" },
        }
      },
    {label: 'Sbutitle', fieldName: 'Subtitle__c',type: "richText", wrapText: true , sortable: "true"},
    {label: 'Event Date', fieldName: 'Event_Date__c', type: 'date', sortable: "true"},
    {label: 'Description', fieldName: 'Description__c',sortable: "true"}
];

export default class TimelineList extends NavigationMixin(LightningElement) {

    @track recordId = '';
    @track objectApiName;

    @track columns = columns;
    @track recordFound= true;
    @track data;
    @track sortBy;
    @track sortDirection;
    @track error;
    @track currentDate;
    @track showLoadingSpinner = false;
    @track renderedCallbackExecuted = false;
    @track recordCount = 0;
    @track recordFetchedTime;

    @track searchWord;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
       if (currentPageReference) {
          this.recordId = currentPageReference.state.c__recordId;
          this.objectApiName = currentPageReference.state.c__objectApiName;
       }
    }

    connectedCallback(){
        var today = new Date();
        this.currentDate = today.toISOString; 
        this.showLoadingSpinner = true;
        this.getData();

    }
    
    getData()
    {
        let obj={'sobjectType':'Timeline_Event__c'};
        obj.Object_Id__c = this.recordId;

        getAll({ value: obj, autoNumber: null }).then(data => {
            this.recordCount = data.length;
            this.recordFetchedTime = new Date();
            this.data = data;
            this.data= data.map(record => ( { 
                titleUrl: `/${record.Related_Id__c}`  , ...record,
                } ) );    
            this.showLoadingSpinner = false;

        }).catch(error => { console.log(error);
            this.error = error;
            this.dispatchEvent( new ShowToastEvent({
                    title: error.message,
                    variant: 'error',
                }),
            );
        });
    }

    getDataByCondition()
    {
        getByWord({ id: this.recordId, searchTerm: this.searchWord }).then(data => {
            this.recordCount = data.length;
            this.recordFetchedTime = new Date();
            this.data = data;
            this.showLoadingSpinner = false;

        }).catch(error => { console.log(error);
            this.error = error;
            this.dispatchEvent( new ShowToastEvent({
                    title: error.message,
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

    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.searchWord = evt.target.value;
            if(this.searchWord === null || this.searchWord === '')
                this.getData();
            else
                this.getDataByCondition();
        }
    }
}