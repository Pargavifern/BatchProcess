trigger Last_Transaction_Date on Bank_Account_Transaction__c ( after insert) {
for(Bank_Account_Transaction__c bankact:trigger.new){

Bank_Account__c bankacc= [select Last_Transaction_Date_time__c from Bank_Account__c where id=:bankact.Bank_Account__c ];
bankacc.Last_Transaction_Date_time__c = bankact.Transaction_Date__c;	
    
 BankAccountController BAC= new BankAccountController();
    
    BAC.edit (bankacc);
    
}
}