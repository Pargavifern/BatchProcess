import { LightningElement, track, api } from 'lwc';
import  getAll from '@salesforce/apex/LoCTransactionController.getAll';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class LoCTransactionReversalDropdown extends LightningElement {
 
    @track _LoCTransactionId;
    @api recordId;
    @track options=[];

    @track currencySymbol = CURRENCY;

    @api 
   

 
 
    get LoCTransactionId(){
        return this._LoCTransactionId;
    }

    set LoCTransactionId(val){
        this._LoCTransactionId=val;
    }

    connectedCallback(){
        this.getData();
    }

    getData(){
        let loc = { 'sobjectType': 'Line_of_Credit_Transaction__c' };
        loc.Line_of_Credit__c=this.recordId;
        loc.Reversed__c=false;
        getAll({ value:loc, autoNumber: null}).then(data=>{
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
                        console.log("hi");
                        optionLabel = transactionList[i]["Transaction_Lines__r"][0].Type__c;
                    }
                    row["label"]=d.toDateString().substr(4,12) + '- '+ transactionList[i].Type__c+' ('+ optionLabel + ' ' +this.currencySymbol + Number(transactionList[i]["Transaction_Lines__r"][0].Amount__c).toLocaleString('en') +')';
                    row["value"]=transactionList[i].Id;
                    optionList.push(row);
                }
                this._LoCTransactionId=transactionList[0].Id;
                this.options=optionList;
            }
        }).catch(error=>{
            console.log('error '+JSON.stringify(error));
        });
    }

    handleChange(event) {
        this._LoCTransactionId = event.target.value;
    }





}