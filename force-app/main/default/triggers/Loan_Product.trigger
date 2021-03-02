trigger Loan_Product on Loan_Product__c (before insert)
{
     if(trigger.isBefore && trigger.isInsert)
     {
        for(Loan_Product__c fp: Trigger.New)
        {
            if(fp.Minimum_Amount__c > fp.Default_Amount__c || fp.Maximum_Amount__c < fp.Default_Amount__c)
         	{
                ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
                string a=orgSettings.UserSettings.currencySymbol;
                fp.adderror('Default Amount must be between '+a+''+fp.Minimum_Amount__c+ ' and ' +a+'' +fp.Maximum_Amount__c+ '');
           	}
            if(fp.Minimum_Term__c > fp.Default_Term__c || fp.Maximum_Term__c < fp.Default_Term__c)
            {
                fp.adderror('Default term must be between ' +fp.Minimum_Term__c+ ' and ' +fp.Maximum_Term__c);
            }
            if(fp.Minimum_Rate__c > fp.Default_Rate__c || fp.Maximum_Rate__c < fp.Default_Rate__c)
            {
            	fp.adderror('Default rate must be between '+fp.Minimum_Rate__c+ ' and ' +fp.Maximum_Rate__c+ '');
            }
     	} 
     }
}