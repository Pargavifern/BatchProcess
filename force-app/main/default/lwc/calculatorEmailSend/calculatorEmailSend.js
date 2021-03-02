import { LightningElement, track, wire, api } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import mailApex from '@salesforce/apex/mailLoanApplicationCalculator.sendMail'
import getEmail from '@salesforce/apex/contactController.getEmailId'
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CalculatorEmailSend extends LightningElement {
    @track isModalOpen = false;
    @track ContactId;
    @track email = '';
    @track details;
    @track disabled = true;

    @api menuButton = '';

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener("pass_data_to_mail", this.assignValues, this);
    }

    assignValues(args) {
        var bodyContent, rate;
        this.disabled = false;
        rate = (args.interest * 100) + '%';

        bodyContent = {
            amount: args.amt,
            interest: rate,
            payment: args.payments,
            datePaid: args.datePaid,
            loanPrdName: args.loanPrdName,
            term: args.term,
            repayment: args.repayment,
            interestProductName: args.interestProductName,
            schedule: args.schedule
        }
        this.details = bodyContent;
    }

    disconnectedCallback() {
            unregisterAllListeners(this);
        }
        //sets the isModalOpen property to true, indicating that the Modal is Open
    showModal() {
        this.isModalOpen = true;
    }

    //sets the isModalOpen property to false, indicating that the Modal is Closed
    closeModal() {
        this.isModalOpen = false;
    }

    /* 
    can be used instead of the above two methods - showModal() & closeModal()
    just toggles the isModalOpen property - true if false, false if true 
    */
    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
    }

    //compute the CSS classes of the Modal(popup) based on the value of isModalOpen property
    get modalClass() {
        return `slds-modal ${this.isModalOpen ? "slds-fade-in-open" : ""}`;
    }

    //compute the CSS classes of the Modal Backdrop(grey overlay) based on the value of isModalOpen property
    get modalBackdropClass() {
        return `slds-backdrop ${this.isModalOpen ? "slds-backdrop_open" : ""}`;
    }

    selectedRecords(event) {
        this.ContactId = event.detail.selectedId;
        this.fetchEmail();
    }

    mailSend() {
        if (this.ContactId == null || this.ContactId === '') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Contact field value is missing',
                    variant: 'error',
                }),
            );
        } else {
            if (this.email == null || this.email === '') {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Email id is empty',
                        variant: 'warning',
                    }),
                );
            } else {
                mailApex({ cid: this.ContactId, details: this.details }).then(data => {
                    if (data !== "" && data !== 'null' && data !== 'undefined') {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Email was sent successfully',
                                variant: 'success',
                            }),
                        );
                        this.closeModal();
                    }
                }).catch(error => {
                    this.error = error;
                });
            }
        }
    }

    fetchEmail() {
        getEmail({ id: this.ContactId }).then(data => {
            this.email = data;
        }).catch(error => {
            this.error = error;
        });
    }
}