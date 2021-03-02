import { LightningElement, api, track, wire } from 'lwc';
import getBillAddress from '@salesforce/apex/accountController.getBillingAddress';
import { getRecord } from 'lightning/uiRecordApi';
import pholder from '@salesforce/resourceUrl/mapImage';

export default class BillingAddressAccountMap extends LightningElement {
    @api recordId;
    @track billAddress;
    @track mapMarkers = [];
    @track noAddress=false;
    @track message='';
    @track imageSrc;

    zoomLevel = 15;

    @wire(getRecord,{ recordId: '$recordId',fields: ['Account.Name'] })
    getAccountAddress({data,error}){
        if(data){
            this.getAddress();
        }
        else{
            console.log(JSON.stringify(error));  
        }  
    }

    connectedCallback(){
        this.getAddress();
    }

    renderedCallback(){
        var tag;
        const style = document.createElement('style');
        style.innerText = `c-billing-address-account-map .slds-map{
            min-width:15.5rem !important;
        }`;
        tag = this.template.querySelector('lightning-map');
        if (tag != null) {
            tag.appendChild(style);
        }
    }

    getAddress(){
        getBillAddress({ id: this.recordId}).then(data => {
            if (data !=="" && data !== 'null' && data!=='undefined') {
                this.mapMarkers=[];
                this.billAddress=JSON.stringify(data);
                var address=JSON.parse(this.billAddress);
                var adCheck=address["BillingAddress"]; //check if the billing address is null or not

                if(typeof adCheck == 'undefined'){
                    this.showImage('No billing address has been provided');
                }
                else{
                    var country=address["BillingAddress"]["country"];
                    var state=address["BillingAddress"]["state"];
                    var city=address["BillingAddress"]["city"];
                    var postalcode=address["BillingAddress"]["postalCode"];
                    var street=address["BillingAddress"]["street"];

                    if(typeof country == 'undefined' && typeof city == 'undefined' && typeof state == 'undefined' && typeof postalcode == 'undefined'){
                        this.showImage('More Billing Address details are needed in order to show the users location on the map');
                    }
                    else{
                        this.noAddress=false;
                        this.mapMarkers = [
                            {
                                location: {
                                    Street: street,
                                    City: city,
                                    State: state,
                                    Country: country,
                                    PostalCode: postalcode,
                                },
                                title: address.Name,                      
                            },
                        ];   
                    }  
                }               
            }
        }).catch(error => {
            console.log(error.message);
        });
    }
    showImage(msg){
        this.message=msg;
        this.noAddress=true;
        this.imageSrc=pholder;
    }

}