import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chart';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';
import getAll from '@salesforce/apex/ExpenseController.getAll';
import getIn from '@salesforce/apex/BenefitController.getAll';
import getEmployment from '@salesforce/apex/EmploymentController.getActiveIncome';
import MOMENT_JS from '@salesforce/resourceUrl/moment';
 
export default class IncomeExpenseChart extends LightningElement {
    @track currencySymbol = CURRENCY;
    
    @track error='';
    @track chart;
    @track config;
    @api recordId;
    @track Amount;
    @track loading=true;
    @track dataPresent=true;
    @track expense=[];
    @track income=[];
    @track dateTimeValue;
    
    chartjsInitialized = false;

    connectedCallback() {
        this.expenseAmount();
        this.config = {
            type:'horizontalBar',
            data:
                {
                labels: ['Total Income (' + this.currencySymbol + ')', 'Total Expenses (' + this.currencySymbol + ')'],
                    datasets: [{
                         backgroundColor:["#00614c", "#B70024"],
                         data: [this.income,this.expense]
                    }]
             },
             options: {
                maintainAspectRatio: false,
                  legend: {
                      
                    display: false
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };
    }

    renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }

        this.chartjsInitialized = true;
        this.createChart();

         
    }

    expenseAmount() {
        this.loading=true;
        var expTotalAmount=0,dString,dObject;
        let ExAmt={'sobjectType':'Expense__c'};
        ExAmt.Contact__c=this.recordId,
        getAll({ value:ExAmt, autoNumber: null }).then(data=>{
        if(data!==''&& data!== 'null' && data!=='undefined'){  
            dString=JSON.stringify(data);
            dObject=JSON.parse(dString);
 
            let expenseCount=dObject.length;
            
            if(expenseCount==0){
                this.dataPresent=false;
                this.loading=false;
            }
            else{
                for(let i=0;i<expenseCount;i++){
                    expTotalAmount=expTotalAmount+dObject[i].Amount__c;
                }
                this.expense[0]=expTotalAmount;
                this.benefitAmount();
            }
        }
        } ).catch(error => {
            this.errorMessage(error);
        });
    }

    benefitAmount(){
        var benTotalAmont=0,benefitString,benefitObject;
        let BeAmt={'sobjectType':'Benefit__c'};
        BeAmt.Contact__c=this.recordId,          
        getIn({ value:BeAmt, autoNumber: null }).then(data=>{
        if(data!==''&& data!== 'null' && data!=='undefined'){
            
        benefitString=JSON.stringify(data);                            
        benefitObject=JSON.parse(benefitString);
        let benefitCount=benefitObject.length;

        for(let i=0;i<benefitCount;i++){
            benTotalAmont=benTotalAmont+benefitObject[i].Amount__c;
        }
        
        this.income[0]=benTotalAmont;  
        this.employmentAmount(benefitCount);
        }
        } ).catch(error => {
            this.errorMessage(error);
        });
    }

    employmentAmount(benefit) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm  + '-' + dd;
        
        var empTotalAmount=0,empString,empObject;
        let Emp={'sobjectType':'Employment__c'};
        Emp.Contact__c=this.recordId;
        Emp.End_Date__c=today;
        getEmployment({ value:Emp, autoNumber: null }).then(data=>{
        if(data!==''&& data!== 'null' && data!=='undefined'){  
            empString=JSON.stringify(data);
            empObject=JSON.parse(empString);

            let empCount=empObject.length;
            
            for(let i=0;i<empCount;i++){
                empTotalAmount=empTotalAmount+empObject[i].Monthly_Income__c;
            }
            this.loading=false;
            if(benefit!==0 || empCount!==0){ 
                this.income[0]=this.income[0]+empTotalAmount;
                if(this.dataPresent){
                    this.updateChart();
                }
                else{
                    this.dataPresent=true;
                    this.createChart();
                }  
            }
            else{
                this.dataPresent=false;
                this.chartjsInitialized=false;
            }            
        }
        } ).catch(error => {
            this.errorMessage(error);
        });
    }
    
    updateChart(){
        var today = new Date();
        var date =new Date().toLocaleString();
       
        var dateTime = date
        this.dateTimeValue=dateTime;

  this.chart.data.datasets[0].data = [this.income,this.expense];
   this.chart.update();
    }
       

    createChart(){
        loadScript(this, chartjs)
        .then(() => {
            const canvas = document.createElement('canvas');
            this.template.querySelector('div.chart').appendChild(canvas);
            const ctx = canvas.getContext('2d');
            this.chart = new window.Chart(ctx, this.config);
        })
        .catch(error => {
            this.errorMessage(error);
        });
    }

    today(){
        this.expenseAmount();
    }

    errorMessage(msg){
        this.loading=false;
        this.dataPresent=false;
        this.error=msg;
        console.log(msg);
    }
}