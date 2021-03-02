trigger Loan on Loan__c (before insert,after insert,after update) {
    List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
    TimelineEventController tobj=new TimelineEventController();
    IController LoanProductCtlr = new LoanProductController();
    IController scheduledTransactionCtlr = new  ScheduledTransactionController();
    IController applicationCtlr = new  ApplicationController();
    ITimelineEventController timeAssignCtrl=new TimelineEventController();
    IController loanTrackCtrl = new  LoanHistoryTrackController();
    List<Scheduled_Transaction__c> scheduledTransactions=new List<Scheduled_Transaction__c>();
    IController loanCtlr = new  LoanController();
    
    if(Trigger.isBefore){
        Loan__c l=new Loan__c();
        for(Loan__c lLoop:Trigger.New){
            if(lLoop.Application__c != null){
                l.Application__c=lLoop.Application__c;
                List<Loan__c> loanRecord=loanCtlr.getAll(l, null);
                
                if(loanRecord!=null && !loanRecord.isEmpty()){
                    lLoop.addError('Unable to create Loan record for this Application as one already exists');
                }
            }
        }
    }
    
    if(Trigger.isAfter){
        List<Loan__c> loanList=new List<Loan__c>();
        List<Loan_History_Track__c> loanTrackList = new List<Loan_History_Track__c>();
        
        for(Loan__c loanApp:Trigger.New){
            Timeline_Event__c tEvent=new Timeline_Event__c();
            Loan_History_Track__c lTrack = new Loan_History_Track__c();
            
            string rtype='', subtitle='';
        
            if(Trigger.isInsert){
                lTrack.Loan__c = loanApp.Id;
                lTrack.NewValue__c = loanApp.Status__c;
                lTrack.OldValue__c = ' ';
                loanTrackList.add(lTrack);
            }
            else if(Trigger.isUpdate){
                Loan__c loanOld = Trigger.oldMap.get(loanApp.Id);
                if(loanApp.Status__c != loanOld.Status__c){ // creating new record whenever status changed
                    lTrack.Loan__c = loanApp.Id;
                    lTrack.NewValue__c = loanApp.Status__c;
                    lTrack.OldValue__c = loanOld.Status__c;
                    loanTrackList.add(lTrack);
                }
                if(loanApp.Status__c=='Live' && loanOld.Status__c=='Pending'){ //only once the timeline for live will be created
                    subtitle='Received loan '+ timeAssignCtrl.aLink(loanApp.id,loanApp.Name);
                    tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(loanApp,'Loan Received', subtitle, 'You successfully received the loan', 'Received Loan','insert','loan');
                    timelineList.add(tEvent);
                }
                if(loanApp.Status__c=='Paid'){
                    subtitle='Paid off the loan '+ timeAssignCtrl.aLink(loanApp.id,loanApp.Name);
                    tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(loanApp,'Loan Paid Off', subtitle, 'You paid off the loan', 'Paid off Loan','update','loan');
                    timelineList.add(tEvent);
                }
                if(loanApp.Status__c=='Refinanced'){ // update the refinanced checkbox
                    if(loanApp.Refinanced__c != true){
                        Loan__c loanRecord=(Loan__c)loanCtlr.getById(loanApp.Id);
                        loanRecord.Refinanced__c = true;
                        loanList.add(loanRecord);
                    } 
                }
            }
        }
        tobj.createMany(timelineList);
        loanCtlr.editMany(loanList); // update the refinanced value
        loanTrackCtrl.createMany(loanTrackList); // creating a loan history track for status
    }
}