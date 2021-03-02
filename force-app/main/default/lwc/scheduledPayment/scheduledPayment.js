import { LightningElement, track, api } from 'lwc';
import  getTransaction from '@salesforce/apex/ScheduledTransactionController.getAll';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class ScheduledPayment extends LightningElement {
    @track _transactionDate;
    @api recordId;
    @track options=[];

    @track currencySymbol = CURRENCY;

    @api 
    get transactionDate(){
        return this._transactionDate;
    }

    set transactionDate(val){
        this._transactionDate=val;
    }

    connectedCallback(){
        this.getData();
    }

    getData(){
        let Record = { 'sobjectType': 'Scheduled_Transaction__c' };
        Record.Loan__c=this.recordId;
        Record.Paid__c=false;
        getTransaction({ value:Record, autoNumber: null}).then(data=>{
            if (data !== "" && data !== undefined) {
                var transactionList=JSON.parse(JSON.stringify(data));
                let count=transactionList.length;
                var optionList=[];
                let percentage = 0;
                for(let i=0;i<count;i++){
                    let row={};
                    let d = new Date(transactionList[i].Scheduled_Date__c); //formatting payment date
                    if(transactionList[i].Paid_Percentage__c > 0.00){
                        percentage = ' - '+ (transactionList[i].Paid_Percentage__c * 100).toFixed(2) + '%';
                    }
                    else{
                        percentage = '';
                    }
                    row["label"]=d.toDateString().substr(4,12) + ' ('+ this.currencySymbol + Number(transactionList[i].Total_Payment__c).toLocaleString('en') +')' + percentage;
                    row["value"]=transactionList[i].Scheduled_Date__c;
                    optionList.push(row);
                }
                this._transactionDate=transactionList[0].Scheduled_Date__c;
                this.options=optionList;
            }
        }).catch(error=>{
            console.log('error '+JSON.stringify(error));
        });
    }

    handleChange(event) {
        this._transactionDate = event.target.value;
    }

}