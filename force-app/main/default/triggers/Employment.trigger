trigger Employment on Employment__c (after insert) {
List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    IController conCtrl=new contactController();
    
	for(Employment__c emp:Trigger.New){
        Timeline_Event__c tEvent=new Timeline_Event__c();
        string rtype='', subtitle='';
    
        if(Trigger.isInsert){
            sObject c=conCtrl.getById(emp.Contact__c);
            subtitle=c.get('Name')+' started working '+ emp.Type__c.toLowercase();
            tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(emp, emp.Name , subtitle,emp.Description__c, 'Started Employment','insert','employment');
            timelineList.add(tEvent);
        }
    }
    tobj.createMany(timelineList);
}