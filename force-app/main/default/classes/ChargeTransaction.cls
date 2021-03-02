public with sharing class ChargeTransaction 
{
 @AuraEnabled
        public static List<SObject> getAll()
        {
	    List<SObject> fee = [Select Id,Name, Amount__C,Default_Amount__C, Maximum__c,Minimum__c, Formula__c, Percentage__c,RecordType.Name FROM Fee__c ORDER BY CreatedDate DESC LIMIT 1000];
        return fee;                           
    }    
}