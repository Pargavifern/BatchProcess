trigger Benefit on Benefit__c (after insert) {
	List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    
	for(Benefit__c benefit:Trigger.New){
        Timeline_Event__c tEvent=new Timeline_Event__c();
     	string rtype='', subtitle=''; 
    
        if(Trigger.isInsert){
            subtitle='New benefit '+ timeAssignCtrl.aLink(benefit.id,benefit.Name) + ' created ';
            tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(benefit,'Benefit Created', subtitle,'', '','insert','benefit');
            timelineList.add(tEvent);
        }
    }
    tobj.createMany(timelineList);
}