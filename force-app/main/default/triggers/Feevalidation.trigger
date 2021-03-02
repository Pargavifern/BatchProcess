trigger Feevalidation on Fee__c (before insert,before update) {
 
	 
        for(Fee__c fe: Trigger.New)
        {
            
      if(trigger.isBefore && (trigger.isInsert || trigger.isUpdate) )
      {
     if(fe.RecordTypeId==Schema.SObjectType.Fee__c.getRecordTypeInfosByName().get('Fixed').getRecordTypeId())
           {
           if(fe.Amount__c > fe.Maximum__c){
           fe.Amount__c.adderror('Amount should be less than or equal to ' + fe.Maximum__c);   
            }
         if( fe.Amount__c < fe.Minimum__c ){
           fe.Amount__c.adderror('Amount should be more than or equal to ' + fe.Minimum__c);   
            }           
       }
           if(fe.RecordTypeId==Schema.SObjectType.Fee__c.getRecordTypeInfosByName().get('Variable').getRecordTypeId())
           {
           if(fe.Default_Amount__c > fe.Maximum__c){
           fe.Default_Amount__c.adderror('Default Amount should be less than or equal to ' + fe.Maximum__c);   
            }
            if( fe.Default_Amount__c < fe.Minimum__c ){
           fe.Default_Amount__c.adderror('Default Amount should be more than or equal to  ' + fe.Minimum__c);   
            }  
           }
      }
 }
}