trigger Expenses on Expense__c (after insert) {
	List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    
	for(Expense__c exp:Trigger.New){
        Timeline_Event__c tEvent=new Timeline_Event__c();
        string rtype='', subtitle='';
    
        if(Trigger.isInsert){
            subtitle='New expense '+ timeAssignCtrl.aLink(exp.Id,exp.Name) +' created';
            tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(exp,'Expense Created', subtitle, '', '','insert','expense');
            timelineList.add(tEvent);
        }
    }
    tobj.createMany(timelineList);
}