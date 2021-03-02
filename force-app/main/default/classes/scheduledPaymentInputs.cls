public with sharing class scheduledPaymentInputs {
	@InvocableVariable(label='Principal Paid' required=true)
    public Decimal principalAmt;

    @InvocableVariable(label='Interest Paid' required=true)
    public Decimal interestAmt;
    
	@InvocableVariable(label='Fees Paid' required=true)
    public Decimal feesAmt;

    @InvocableVariable(label='Loan ID' required=true)
    public Id LoanId;
}