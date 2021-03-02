trigger TransactionAct on Loan_Transaction__c (after insert) {
    List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    
    
  	for( Loan_Transaction__c trans :Trigger.New){
        Timeline_Event__c tEvent=new Timeline_Event__c();
               string rtype='', subtitle='';
        
        if( Trigger.isInsert){
            

            if(trans.Type__c=='Disbursal'){
                subtitle=rtype+'Disbursal Amount';
      tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(trans, 'Disbursal Transaction', subtitle,'', '','insert','trans');

             timelineList.add(tEvent);
            }    
            else if(trans.Type__c=='Payment'){
                 subtitle=rtype+'Payment Amount';
    tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(trans,'Payment Transaction', subtitle,'', '','insert','trans');

                timelineList.add(tEvent);
            }
            
            
        }
 
          }
   tobj.createMany(timelineList);  

}