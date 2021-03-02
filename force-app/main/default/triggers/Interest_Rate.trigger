trigger Interest_Rate on Interest_Rate__c (before insert,after insert,after update,after delete) {
    IInterestRateController interestRateCtlr=new InterestRateController();
    IController interestProductCtlr=new InterestProductController();
    IInterestProduct ischedule=new InterestProductController();
    IController iRateCtlrAll=new InterestRateController();

    if(trigger.isInsert && trigger.isBefore){
        for(Interest_Rate__c ipNew: Trigger.New){
            Interest_Rate__c ir=new Interest_Rate__c();
	        ir.Effective_Date__c=ipNew.Effective_Date__c;
            ir.Interest_Product__c=ipNew.Interest_Product__c;
            
            List<Interest_Rate__c> ipResult=iRateCtlrAll.getAll(ir,null);
            if(ipResult!=null && !ipResult.isEmpty()){
                ipNew.addError('Already record exist for this effective date');
            }
        }
    }
    
    if(trigger.isAfter){
        List<Interest_Rate__c> rateList = new  List<Interest_Rate__c>();
        if(trigger.isInsert || trigger.isUpdate){
            rateList = Trigger.new;
        }
        else if(trigger.isDelete){
            rateList = Trigger.old;
        }
    
        for(Interest_Rate__c rate: rateList)
        {
            ischedule.CurrentDateUpdate(rate.Interest_Product__c);
        }
    }
}