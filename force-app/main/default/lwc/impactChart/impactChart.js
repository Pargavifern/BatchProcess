import { LightningElement, api, wire, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chart';
import momentjs from '@salesforce/resourceUrl/moment';
import chart from '@salesforce/apex/LoanController.chart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
 
export default class impactChart extends LightningElement {
        
    @track error='';
    @track chart;
    @track config;
    @api recordId;
    @track loading=true;
    @track dataPresent=true;
    @track LLostjobsValue=[];
    @track LCreatedjobsValue=[];
    @track LMaintainedjobsValue=[];
    @track ALostjobsValue=[];
    @track ACreatedjobsValue=[];
    @track AMiantainedjobsValue=[];
    @track isChartJsInitialized;
    @track impacts;
    @track loading=true;
    @track dataPresent=true;
    @track lastUpdated;
    lastUpdateTimeKey = 'lastUpdateTime';
     lastUpdated;
   
   
    chartjsInitialized = false;
    
    updateChart(){
        var today = new Date();
        var date =new Date().toLocaleString();
        var dateTime = date
        this.dateTimeValue=dateTime;
        this.chart.data.datasets[0].data =[this.LCreatedjobsValue,this.LMaintainedjobsValue,this.LLostjobsValue];
        this.chart.data.datasets[1].data =[this.ACreatedjobsValue,this.AMiantainedjobsValue,this.ALostjobsValue];
     
     
       
    }
    connectedCallback(){
        this.loanImpactjobs();
             
        }

           draw(){
       
        this.isChartJsInitialized =true;
        this.config = {
            type:'horizontalBar',
            data:
                {
                labels: ["Created","Maintained","Lost"],
                datasets: [
                    {
                   
                          label: "Actual",
                      backgroundColor: "#00815D",
                      data:[this.LCreatedjobsValue,this.LMaintainedjobsValue,this.LLostjobsValue]
                      
                      
                    }, {
                     
                      label: "Estimate",
                      backgroundColor: "#c98c02",
                      data:[this.ACreatedjobsValue,this.AMiantainedjobsValue,this.ALostjobsValue]
                   
                    }
                    
                  ]
                },
             options: {
                  title: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: false
                    }]
                },
                legend: {
                    position: 'bottom'
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

      createChart(){      
        Promise.all([
            loadScript(this, momentjs)
        ]).then(() => {
            Promise.all([
                loadScript(this, chartjs)
            ]).then(() => {
                const canvas = document.createElement('canvas');
                this.template.querySelector('div.chart').appendChild(canvas);
                const ctx = canvas.getContext('2d');
                this.chart = new window.Chart(ctx, this.config);
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading momentJS',
                    message: error.message,
                    variant: 'error',
                }),
            );
        }); 
       
    }

   
    loanImpactjobs() {
            this.loading=true;
            chart({id:this.recordId }).then(data=>{
           if(data!==''&& data!==undefined){
         this.impacts=JSON.stringify(data);
         var dObject=JSON.parse(this.impacts);  
                         
               this.LCreatedjobsValue=dObject["Total_Jobs_Created__c"];
             
               this.LLostjobsValue=dObject["Total_Jobs_Lost__c"];
             
               this.LMaintainedjobsValue=dObject["Total_Jobs_Maintained__c"];
               
               this.ACreatedjobsValue=dObject["Application__r"]["Total_Jobs_Created__c"];
               
               this.ALostjobsValue=dObject.Application__r.Total_Jobs_Lost__c;
        
               this.AMiantainedjobsValue=dObject["Application__r"]["Total_Jobs_Maintained__c"];

               this.loading=false;
              if(this.LCreatedjobsValue!==0 || this.LMaintainedjobsValue!==0 || this.LLostjobsValue!==0 ){
               
               this.draw();
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
                this.chartjsInitialized=true;
             }
              
           }
           } ).catch(error => {
               this.errorMessage(error);
           });
       }
       refreshChart(){
        this.loanImpactjobs();
    }

    errorMessage(msg){
        this.loading=false;
        this.dataPresent=false;
        this.error=msg;
        console.log(msg);
      }
}