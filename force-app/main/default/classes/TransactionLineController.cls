public with sharing class TransactionLineController implements ITransactionLine {
  
    @AuraEnabled
    public static List<SObject> getAllRelatedLoan(Id id) {
        return getAllRelatedLoan(id,1000,0);
    }
    
    @AuraEnabled
    public static List<SObject> getAllRelatedByLimit(Id id,Integer lim) {
        return getAllRelatedLoan(id,lim,0);
    }
    
    @AuraEnabled
    public static List<SObject> getAllRelatedByDay(Id id,Integer days) {
        return getAllRelatedLoan(id,1000,days);
    }
    
    public static List<SObject> getAllRelatedLoan(Id id, Integer lim, Integer days){
        String queryString='SELECT Id, Loan_lineNumber__c , Type__c, Amount_P__c , Total_Credit__c, Total_Debit__c, Balance_Principal__c ,'+
            				' Balance_Interest__c , Closing_Balance__c, Transaction_Date__c,Closing_Principal__c,Closing_Interest__c, '+ 
            				' Name, Note__c, Payment_Method__c , CreatedById,'+
                           ' (SELECT Id, Amount__c,Fee__c,get_fee_name__c,Type__c FROM Transaction_Lines__r)'+
                           ' FROM Loan_Transaction__c WHERE';

        if (!string.isBlank(id)) {
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(Id) +  '\' AND';
        }
      
        if (days != 0) {
            
            List<Loan_Transaction__c> lastTransaction = [Select Transaction_Date__c from Loan_Transaction__c where Loan__c=:id Order by Transaction_Date__c desc Limit 1 ];
            if(lastTransaction.size()>0){
            DateTime lastTransactionDate = lastTransaction[0].Transaction_Date__c;
            DateTime limtedDate = lastTransactionDate.addDays((-1)*days);
            queryString += ' Transaction_Date__c >=: limtedDate and Transaction_Date__c <=:  lastTransactionDate ';
            }
        }
      
        queryString = queryString.removeEnd(' AND');
        queryString += ' ORDER BY Name DESC LIMIT ' + lim;
        
        return Database.query(queryString);
    }
    
    @InvocableMethod(label='Get Writeoff amount sum')
    public static List<writeoffSummaryResult>  getWriteoffSum(List<Id> loanId){
		//List<AggregateResult> amount = [select sum(Balance_Principal__c), sum(Balance_Interest__c), sum(Balance_Fees__c) 
                                        //from Loan_Transaction__c 
                                        //where Type__c LIKE '%Write Off - %' and Loan__c =: loanId[0]];
        List<AggregateResult> aggregate = [select sum(Principal__c) principal, sum(Interest__c) interest, sum(Fee__c) fee 
                                        from Writeoff__c
                                        where Loan__c =: loanId[0]];
        
        List<writeoffSummaryResult> res = new List<writeoffSummaryResult>();
        writeoffSummaryResult k = new writeoffSummaryResult();
        k.principalAmt = (Decimal) aggregate[0].get('principal');
        k.interestAmt = (Decimal) aggregate[0].get('interest');
		k.feesAmt = (Decimal) aggregate[0].get('fee');
        res.add(k);
      	return res;
    }
}