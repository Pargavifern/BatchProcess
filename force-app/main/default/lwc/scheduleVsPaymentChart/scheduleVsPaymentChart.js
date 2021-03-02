import { LightningElement, track, api,wire } from 'lwc';
import chartjs from '@salesforce/resourceUrl/chart';
import momentjs from '@salesforce/resourceUrl/moment';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllScheduled from '@salesforce/apex/ScheduledTransactionController.getAll';
import getAllActual from '@salesforce/apex/LoanTransactionController.getAll';
import { getRecord } from 'lightning/uiRecordApi';
import CURRENCY from '@salesforce/i18n/number.currencySymbol';


export default class scheduleVsPaymentChart extends LightningElement {
    
    @api recordId;
    @track isChartJsInitialized;
    @track chart;
    @track scheduledPayment = [];
    @track actualPayment = [];
    @track config;
    @track xAxisStep = 10000;
    


    @wire(getRecord, { recordId: '$recordId', fields: ['Application__c.Id'] })
    getChart({ data, error }) {
       if(data){
        this.getSchedulePayments();          
       }
    }

    updateChart(){
        this.chart.data.datasets[0].data = this.scheduledPayment;
        this.chart.data.datasets[1].data = this.actualPayment;
        //this.chart.options.scales.yAxes[0].ticks.stepSize = this.xAxisStep;
        this.chart.update();
    }

    

    drawGraph() {

        if (this.isChartJsInitialized) {
            this.updateChart();
            return;
        }
        this.isChartJsInitialized = true;
        this.config = {
            type: 'line',
            data: {
                datasets: [{
                    fill: false,
                    label: 'Schedule',
                    data: this.scheduledPayment,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)'
                    ],
                    pointBackgroundColor: 'rgba(255, 99, 132, 0.2)',
                    pointBorderColor: 'rgba(255, 99, 132, 1)'
                },
                {
                    fill: false,
                    label: 'Payment',
                    data:this.actualPayment,
                    backgroundColor: [
                        '#80aaff'
                    ],
                    borderColor: [
                        'blue'
                    ],
                    pointBackgroundColor: '#80aaff',
                    pointBorderColor: 'blue'
                }
                ]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                           // parser: 'MM/DD/YYYY HH:mm',
                            tooltipFormat: 'MM/DD/YYYY',
                            //unit: 'Year',
                           // unitStepSize: 1,
                            displayFormats: {
                              'Month':  'MM/DD/YYYY'
                            }
                        }
                    }],
                    yAxes: [{
                        type: 'linear',
                        ticks: {
                           // autoSkip: true,
                          //  suggestedMin: 0,
                            //stepSize: this.xAxisStep,
                            callback: function (value) {
                                return CURRENCY + value;
                            }
                        }
                    }]
                },
            }
        };
        

        Promise.all([
            loadScript(this, momentjs)
        ]).then(() => {
            Promise.all([
                loadScript(this, chartjs)
            ]).then(() => {
                const ctx = this.template.querySelector('canvas.linechart').getContext('2d');
                this.chart = new window.Chart(ctx, this.config);
                this.chart.canvas.parentNode.style.height = '100%';
                this.chart.canvas.parentNode.style.width = '100%';
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

    getSchedulePayments(){
        let tranObject={'sobjectType':'Scheduled_Transaction__c'};
        tranObject.Loan__c =this.recordId,

        getAllScheduled({ value:tranObject, autoNumber: null }).then(data=>{
            if(data.length > 0){
                this.scheduledPayment = [];
                let totalAmount = 0;
                for(let i=0;i<data.length;i++){
                    let  gData = { y:0, x:new Date()};
                    gData.y = data[i].Remaining_Balance__c;
                    totalAmount = data[i].Remaining_Balance__c + totalAmount;
                    gData.x = new Date(data[i].Payment_Date__c);
                    this.scheduledPayment.push(gData);
                }
                
                let average  = parseInt(totalAmount / data.length);

                if(average < 1000 && data.length > 12)
                {
                    this.xAxisStep = parseInt(average * 4);
                }
                else if(average > 1000 && data.length > 12)
                {
                    this.xAxisStep = parseInt(totalAmount / 5);
                }
                
            }
            //this.drawGraph();
            this.getActualPaymemts();       
        });
        
    }

    getActualPaymemts(){
        let tranObject={'sobjectType':'Loan_Transaction__c'};
        tranObject.Loan__c =this.recordId;
        tranObject.Type__c ='Payment';
        getAllActual({ value:tranObject, autoNumber: null }).then(data=>{
            if(data.length > 0){
                this.actualPayment = [];
                for(let i=0;i<data.length;i++){
                    let  gData = { y:0, x:new Date()};
                    gData.y = data[i].Closing_Balance__c;
                    gData.x = new Date(data[i].Transaction_Date__c);
                    this.actualPayment.push(gData);
                }               
            }
              this.drawGraph();
        });
    }
}