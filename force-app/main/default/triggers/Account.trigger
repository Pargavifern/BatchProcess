trigger Account on Account (after insert) {
	if(Trigger.isAfter && Trigger.isInsert){
        List<Risk_Rating__c> rateList=new List<Risk_Rating__c>();
        List<String> riskRate = new List<String>{'Management','Age of Business','Market','Credit History','Capacity of the Owners (Staying Power)','Home Ownership','Financial Debt Leverage','Working Capital','Repayment Ability','Security','Industry'};
        
         List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
         TimelineEventController tobj=new TimelineEventController();
         ITimelineEventController timeAssignCtrl=new TimelineEventController();
         IController riskCtrl = new RiskRatingController();
            
         for(Account acc:Trigger.New){
             Timeline_Event__c tEvent=new Timeline_Event__c();
             string rtype='', subtitle='',uname='';
             
             uname=timeAssignCtrl.getUserName(acc.CreatedById);
             subtitle=timeAssignCtrl.aLink(acc.CreatedById, uname)+' created the Account '+ timeAssignCtrl.aLink(acc.id, acc.Name);
             tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(acc,'Created', subtitle, acc.Description, 'New','insert','account');
             timelineList.add(tEvent);
             
             for(String r: riskRate){
                 rateList.add(new Risk_Rating__c(Account__c = acc.Id,Category__c = r));
             }
          } 
        
        if(!rateList.isEmpty()){
            riskCtrl.createMany(rateList);
        }
        tobj.createMany(timelineList);
    }
        
}