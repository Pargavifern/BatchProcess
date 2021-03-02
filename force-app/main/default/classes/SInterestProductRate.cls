global class SInterestProductRate implements Schedulable {
    global void execute(SchedulableContext SC){
        IInterestRateController interestRateCtlr=new InterestRateController();
        IController interestProductCtlr=new InterestProductController();
        IInterestProduct interestCtlr=new InterestProductController();
        List<Interest_Product__c> records = interestProductCtlr.getAll(null, null);
        
        for(Interest_Product__c record : records)
        {
            interestCtlr.CurrentDateUpdate(record.Id);
       }
  	}

}