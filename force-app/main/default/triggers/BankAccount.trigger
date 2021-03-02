trigger BankAccount on Bank_Account__c (after insert) {
	List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    
	for(Bank_Account__c baccount:Trigger.New){
        UserController userObj=new UserController();
        User userDetails= (User)userObj.getById(baccount.LastModifiedById);
        string userName=userDetails.Name;

        Timeline_Event__c tEvent=new Timeline_Event__c();
     	string rtype='', subtitle=''; 
    
        if(Trigger.isInsert){
            subtitle='New bank account '+ timeAssignCtrl.aLink(baccount.id,baccount.Name) + ' created ';    
            tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(baccount,'Bank Account opened', subtitle,'', 'Opened Bank Account','insert','bank');
            timelineList.add(tEvent);
        }
    }
    tobj.createMany(timelineList);
}