import { LightningElement, track, api } from 'lwc';
import  getTransaction from '@salesforce/apex/SavingsProductTransactionController.getAll';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class SavingsTransactionReversalDropdown extends LightningElement {
    @track _savingsTransactionId;
    @api recordId;
    @track options=[];

    @track currencySymbol = CURRENCY;

    @api 
    get savingsTransactionId(){
        return this._savingsTransactionId;
    }

    set savingsTransactionId(val){
        this._savingsTransactionId=val;
    }

    connectedCallback(){
        this.getData();
    }

    getData(){
        let Record = { 'sobjectType': 'Savings_Product_Transaction__c' };
        Record.Savings_Account__c=this.recordId;
        Record.Reversed__c=false;
        getTransaction({ value:Record, autoNumber: null}).then(data=>{
            if (data !== "" && data !== undefined) {
                var transactionList=JSON.parse(JSON.stringify(data));
                let count=transactionList.length;
                var optionList=[];
                console.log(transactionList);
                for(let i=0;i<count;i++){
                    let row={};
                    let d = new Date(transactionList[i].Transaction_Date__c); //formatting payment date
                    let type = transactionList[i].Type__c;
                    let optionLabel = ' ' ;
                    if(type === 'Reversal'){
                        optionLabel = transactionList[i]["Savings_Transaction_Lines__r"][0].Type__c;
                    }
                    row["label"]=d.toDateString().substr(4,12) + '- '+ transactionList[i].Type__c+' ('+ optionLabel + ' ' +this.currencySymbol + Number(transactionList[i]["Savings_Transaction_Lines__r"][0].Amount__c).toLocaleString('en') +')';
                    row["value"]=transactionList[i].Id;
                    optionList.push(row);
                }
                this._savingsTransactionId=transactionList[0].Id;
                this.options=optionList;
            }
        }).catch(error=>{
            console.log('error '+JSON.stringify(error));
        });
    }

    handleChange(event) {
        this._savingsTransactionId = event.target.value;
    }

}