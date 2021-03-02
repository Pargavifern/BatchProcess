public with sharing class writeoffSummaryResult {
 	@InvocableVariable(label='Principal Sum')
    public Decimal principalAmt;

    @InvocableVariable(label='Interest Sum')
    public Decimal interestAmt;
    
	@InvocableVariable(label='Fees Sum')
    public Decimal feesAmt;
}