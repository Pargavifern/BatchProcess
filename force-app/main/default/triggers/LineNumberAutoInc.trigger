trigger LineNumberAutoInc on Loan_Transaction__c (before insert)
{
  if(trigger.isBefore && Trigger.isInsert )
     {
        for(Loan_Transaction__c tr: Trigger.New)
        {
            List<Loan_Transaction__c> trans = [select Loan_lineNumber__c  from Loan_Transaction__c 
                                         Where Loan__c =: tr.Loan__c
                                         order by Loan_lineNumber__c desc limit 1] ;
                
          if(trans!=null && !trans.isEmpty()) 
                {
                    Loan_Transaction__c topRecord = trans[0] ;
                    tr.Loan_lineNumber__c =   topRecord.Loan_lineNumber__c + 1;
                }
                else
                {
                    tr.Loan_lineNumber__c = 1;
                }
       } 
     }
}