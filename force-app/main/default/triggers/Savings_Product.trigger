trigger Savings_Product on Savings_Product__c (before insert, before update) {
	if(trigger.isBefore)
     {
        for(Savings_Product__c sp: Trigger.New)
        {
            if(sp.Maximum_Interest_Rate__c < sp.Minimum_Interest_Rate__c)
            {
            	sp.Maximum_Interest_Rate__c.adderror('Maximum rate must be greater than '+sp.Minimum_Interest_Rate__c);
            }
            else if(sp.Minimum_Interest_Rate__c > sp.Default_Interest_Rate__c || sp.Maximum_Interest_Rate__c < sp.Default_Interest_Rate__c)
            {
            	sp.Default_Interest_Rate__c.adderror('Default rate must be between '+sp.Minimum_Interest_Rate__c+ ' and ' +sp.Maximum_Interest_Rate__c+ '');
            }
     	} 
     }
}