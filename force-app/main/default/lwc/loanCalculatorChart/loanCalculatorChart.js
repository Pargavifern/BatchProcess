import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chart';

import CURRENCY from '@salesforce/i18n/number.currencySymbol';

export default class loanCalculatorChart extends LightningElement {
    @track loanCalculatorChart;
    @api chartprincipal = [];
    @api charttempinterest = [];
    @api chartremainingtotalbalance = [];
    @track config;
    @track chart;
    @api xAxis = [];
    @api repaymentLabel;

    @track currencySymbol = CURRENCY;

    chartjsInitialized = false;

    connectedCallback() {
        // var numberFormat = new Intl.NumberFormat(LOCALE, {
        //     style: 'currency',
        //     currency: CURRENCY,
        //     currencyDisplay: 'symbol'
        // });

        this.repaymentLabel = this.repaymentLabel + " Schedule";
        this.config = {
            type: 'bar',
            data: {
                labels: this.xAxis,
                datasets: [{
                        label: 'Balance (' + this.currencySymbol + ')',
                        backgroundColor: '#191919',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'B',
                        data: this.chartremainingtotalbalance,
                        type: 'line',
                        lineTension: 0
                    },
                    {
                        label: 'Principal (' + this.currencySymbol + ')',
                        backgroundColor: '#00815D',
                        stack: 'Stack 0',
                        yAxisID: 'A',
                        data: this.chartprincipal,
                        type: 'bar'
                    },
                    {
                        label: 'Interest (' + this.currencySymbol + ')',
                        backgroundColor: '#c98c02',
                        stack: 'Stack 0',
                        yAxisID: 'A',
                        data: this.charttempinterest,
                        type: 'bar'
                    }
                ]
            },
            options: {
                // title: {
                //     display: true,
                //     text: this.repaymentLabel
                // },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(t, d) {
                            var dstLabel = d.datasets[t.datasetIndex].label;
                            var yLabel = t.yLabel;

                            yLabel = yLabel.toFixed(2);

                            return dstLabel + ': ' + yLabel;
                        }
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                    },
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: 'Amount (' + this.currencySymbol + ')'
                        }
                    }, {
                        id: 'B',
                        type: 'linear',
                        position: 'right',
                        display: false,
                        scaleLabel: {
                            display: true,
                            labelString: 'Remaining Amount (' + this.currencySymbol + ')'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Monthly'
                        }
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

        loadScript(this, chartjs)
            .then(() => {
                const canvas = document.createElement('canvas');
                this.template.querySelector('div.chart').appendChild(canvas);
                const ctx = canvas.getContext('2d');
                this.chart = new window.Chart(ctx, this.config);
            })
            .catch(error => {
                this.error = error;
            });
    }

    @api updatechart(xaxis, principal, interest, balance, repaymentlabel) {
        this.chart.config.data.labels = xaxis;
        this.chart.data.datasets[0].data = balance;
        this.chart.data.datasets[1].data = principal;
        this.chart.data.datasets[2].data = interest;
        // this.chart.options.title.text = repaymentlabel + " Schedule";
        this.chart.options.scales.xAxes[0].scaleLabel.labelString = repaymentlabel;
        this.chart.update();
    }
}