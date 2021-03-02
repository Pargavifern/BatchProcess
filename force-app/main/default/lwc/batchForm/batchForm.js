import { api, LightningElement, track } from 'lwc';
import  getAll from '@salesforce/apex/BatchData.getAll';
import  passData from '@salesforce/apex/BatchData.setData';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'City', fieldName: 'BillilngCity' },
    { label: 'Country', fieldName: 'BillingCountry' }
];

export default class BatchForm extends LightningElement {

    @track columns=columns;
    @track data;
    @track recordCount=0;
    @track recordFound = false;
    @track error;
    @track showLoadingSpinner;
    @track selectedRowList = [];
    @track selectedRowCount = 0;
    @track recordsList = [];

    getData(){
        this.showLoadingSpinner = true;
        getAll()
            .then(data => {
                this.data=data;
                if (data !== null && data !== undefined && data.length > 0) {
                    this.recordFound = true;
                    this.recordCount = data.length;
                }
                this.showLoadingSpinner = false;
            })
            .catch(error => {
                this.error=error;
                console.log('error occured ',error);
            });
    }

    settingData(){
        this.showLoadingSpinner = true;
        passData({ data: this.recordsList })
            .then()
            .catch(error => {
                this.error=error;
                console.log('error occured ',error);
            });
    }

    getSelectedRecords(event) {
        
        const selectedRows = event.detail.selectedRows;
        this.selectedRowList = selectedRows;
        this.selectedRowCount = selectedRows.length;
        console.log('----count record----'+this.selectedRowCount);
      /*  for(let i = 0; i<this.selectedRowCount; i++){
            let con={'sobjectType':'Contact'};
            con.AccountId = selectedRows[i].Id;
            con.FirstName = selectedRows[i].Name;
            con.LastName = 'Contact - '+i;
            con.Email = 'contact'+i+'@gmail.com';
            con.MailingCity = selectedRows[i].BillingCity;
            if(i==5)
                con.Email = 'contact';
            this.recordsList.push(con);
        }*/
        console.log(JSON.parse(JSON.stringify(this.recordsList)));
    }

    assignValues(values){
        let count = values.length;
        this.recordsList = [];
        for(let i = 0; i<count; i++){
            let con={'sobjectType':'Contact'};
            con.AccountId = values[i].Id;
            con.FirstName = values[i].Name;
            con.LastName = 'Contact - '+i;
            con.Email = 'contact'+i+'@gmail.com';
            con.MailingCity = values[i].BillingCity;
            if(i==5)
                con.Email = 'contact';
            this.recordsList.push(con);
        }
    }

    @api
    validate(){
        var isValid = true;

        if (!isValid) {
            return {
                isValid: false,
                errorMessage: errorAll
            };
        } else {
            if(this.selectedRowCount != 0)
                this.assignValues(this.selectedRowList);
            else
                this.assignValues(data);
            this.settingData();
            return {
                isValid: true,
                errorMessage: "error"
            };
        }
    }

}