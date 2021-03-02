import { LightningElement, api, track } from 'lwc';

export default class TransactionDropdown extends LightningElement {
    
    @track renderedExecuted = false;

    @api enabledFilter=false;

    @api 
    get loanStatus(){
        return this._loanStatus;
    }
    set loanStatus(val){
        this._loanStatus=val;
    }

    @api 
    get transactionType(){
        return this.value;
    }

    set transactionType(val){
        this.value = val;
    }

    @track _loanStatus;
    @track options;
    @track value;

    handleChange(event) {
        this.value = event.target.value;
    }

    setDropdown(){
        if(!this.enabledFilter)
        {
             if(this._loanStatus==='Pending')
            {

                this.options=[ 
                { label: 'Disbursal', value: 'Disbursal' },
                { label: 'Charge', value: 'Charge' }
                ];
               this.value = 'Disbursal';
            }
         else if(this._loanStatus==='Written Off'){
                this.options=[
                    { label: 'Recovery', value: 'Recovery' },
                    { label: 'Adjustment', value: 'Adjustment' },
                    { label: 'Charge', value: 'Charge' },
                    { label: 'Reversal', value: 'Reversal' }
                ];
                this.value='Recovery';
            }
            else if(this._loanStatus==='Live'){
               this.options= [
                    { label: 'Payment', value: 'Payment' },
                    { label: 'Charge', value: 'Charge' },
                    { label: 'Disbursal', value: 'Disbursal' },
                    { label: 'Transfer', value: 'Transfer' },
                    { label: 'Capitalisation', value: 'Capitalisation' },
                    { label: 'Write Off', value: 'Write Off' },
                    { label: 'Suspend Interest', value: 'Suspend Interest'},
                    { label: 'Adjustment', value: 'Adjustment' },
                    { label: 'Reversal', value: 'Reversal' }
                ];
                this.value='Payment';
            }
            else if(this._loanStatus==='Suspended'){
                this.options= [
                     { label: 'Payment', value: 'Payment' },
                     { label: 'Charge', value: 'Charge' },
                     { label: 'Disbursal', value: 'Disbursal' },
                     { label: 'Transfer', value: 'Transfer' },
                     { label: 'Capitalisation', value: 'Capitalisation' },
                     { label: 'Write Off', value: 'Write Off' }
                 ];
                 this.value='Payment';
             }
            else if(this._loanStatus==='Refinanced'){
               this.options= [
                    { label: 'Payment', value: 'Payment' },
                    { label: 'Charge', value: 'Charge' },
                    { label: 'Transfer', value: 'Transfer' },
                    { label: 'Capitalisation', value: 'Capitalisation' },
                    { label: 'Write Off', value: 'Write Off' },
                    { label: 'Suspend Interest', value: 'Suspend Interest'}
                ];
                this.value = 'Payment';
            }
        }
        else
        {
            this.options= [
                { label: 'Payment', value: 'Payment' },
                { label: 'Charge', value: 'Charge' },
                { label: 'Disbursal', value: 'Disbursal' },
                { label: 'Transfer', value: 'Transfer' },
                { label: 'Capitalisation', value: 'Capitalisation' },
                { label: 'Write Off', value: 'Write Off' },
                { label: 'Suspend Interest', value: 'Suspend Interest'},
                { label: 'Adjustment', value: 'Adjustment' },
                { label: 'Reversal', value: 'Reversal' },
                { label: 'Recovery', value: 'Recovery' }
            ];
            this.value='Payment';
        }
    }

    renderedCallback(){
        if(!this.renderedExecuted){
            this.renderedExecuted = true;
            this.setDropdown();
        }
    }
}