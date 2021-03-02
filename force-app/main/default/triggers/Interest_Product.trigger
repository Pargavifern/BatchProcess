trigger Interest_Product on Interest_Product__c (after insert,before update, before insert) {
    IController iRateCtrl=new InterestRateController();
	if(trigger.isAfter && trigger.isInsert){   
        List<Interest_Rate__c> irList=new List<Interest_Rate__c>();
        
        for(Interest_Product__c ip: Trigger.New){
            Interest_Rate__c ir=new Interest_Rate__c();
            DateTime dT=ip.CreatedDate;
            
            ir.Interest_Product__c=ip.Id;
            ir.Effective_Date__c=date.newinstance(dT.year(), dT.month(), dT.day());
            ir.Rate__c=ip.Current_Rate__c;
            irList.add(ir);
        }
        iRateCtrl.createMany(irList);
    }
    if(trigger.isBefore && trigger.isUpdate){
        for(Interest_Product__c ip: Trigger.New){
            Interest_Rate__c ir=new Interest_Rate__c();
            ir.Interest_Product__c=ip.Id;
            ir.Effective_Date__c=ip.Rate_Last_Changed__c;
            ir.Rate__c=ip.Current_Rate__c;
            List<Interest_Rate__c> irResult=iRateCtrl.getAll(ir,null);
            if(irResult.size()<=0){
                ip.adderror('You cannot change the rate');
            }
           
        }
    }
    // if(trigger.isBefore && trigger.isInsert)
    // {
    //     for(Interest_Product__c ip: Trigger.New)
    //     {
    //          if(ip.Minimum_Rate__c > ip.Current_Rate__c ||ip.Maximum_Rate__c < ip.Current_Rate__c )
    //         {
    //             ip.adderror('Please ensure that Current Rate is between ' + ip.Minimum_Rate__c + '% and ' + ip.Maximum_Rate__c + '% Rate');

    //         }
    //     }
    // }

}