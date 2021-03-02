trigger Application on Application__c ( before update,before insert,after insert,after update) {
  List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
  IController timelineCtrl=new TimelineEventController();
  IController LoanProductCtlr = new LoanProductController();
  IController interestProductCtlr=new InterestProductController();
  IController applicationCtlr=new ApplicationController();
  ITimelineEventController timeAssignCtrl=new TimelineEventController();
  IController contactCtrl=new contactController();
  IController accCtrl=new accountController();
  IController GrantProductCtlr=new GrantProductController();

    for(Application__c app:Trigger.New){        

      Timeline_Event__c tEvent=new Timeline_Event__c();
      string rtype='', subtitle='',describe='';    
      sObject Obj;
        
      if(trigger.isBefore && (trigger.isInsert || trigger.isUpdate) )
      {
        if(app.RecordTypeId==Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Grant').getRecordTypeId()
        || app.RecordTypeId==Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Business Grant').getRecordTypeId()){
            Grant_Product__c GrantPrd = (Grant_Product__c)GrantProductCtlr.getById(app.Grant_Product__c);  
             if(app.Amount__c <GrantPrd.Minimum_Amount__c || app.Amount__c >GrantPrd.Maximum_Amount__c){
                  app.Amount__c.adderror('Please ensure that Amount is between ' + GrantPrd.Minimum_Amount__c + ' and ' +GrantPrd.Maximum_Amount__c);
             }
        }
        else if(app.RecordTypeId==Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Loan').getRecordTypeId()
        || app.RecordTypeId==Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Business Loan').getRecordTypeId()){
            Loan_Product__c LoanPrd = (Loan_Product__c)LoanProductCtlr.getById(app.Loan_Product__c);
             if(app.Term__c <LoanPrd.Minimum_Term__c || app.Term__c >LoanPrd.Maximum_Term__c){
              app.Term__c.adderror('Please ensure that Term is between ' + LoanPrd.Minimum_Term__c+ ' and ' +LoanPrd.Maximum_Term__c+ ' months' );
             }
              
            if(app.Amount__c <LoanPrd.Minimum_Amount__c || app.Amount__c >LoanPrd.Maximum_Amount__c){
              app.Amount__c.adderror('Please ensure that Amount is between ' + LoanPrd.Minimum_Amount__c + ' and ' +LoanPrd.Maximum_Amount__c);
            }
            
            if(app.Completion_Status__c=='Approved' && app.Approved_Amount__c <LoanPrd.Minimum_Amount__c || app.Approved_Amount__c >LoanPrd.Maximum_Amount__c){
              app.Approved_Amount__c.adderror('Please ensure that Approved Amount is between ' + LoanPrd.Minimum_Amount__c + ' and ' +LoanPrd.Maximum_Amount__c);
            }
            
            if(app.Completion_Status__c=='Approved' && (app.Application_Date__c > app.Approved_Date__c || app.Approved_Date__c > Date.today())){
                Date d=app.Application_Date__c;
              	app.Approved_Amount__c.adderror('Approved date must be between the application date ' + d.format() + ' and the current date');
            }
            if(app.Completion_Status__c == 'Canceled' && (app.Application_Date__c > app.Cancel_date__c))
            {
                app.Cancel_date__c.adderror('Cancel date cannot be before application date');
            }
        }
      } 
      // get the account or contact name by using record type 
      //if(app.RecordTypeId==Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Business Loan').getRecordTypeId()){
      if(app.get('Account__c')!=null){
         Obj=(Account)accCtrl.getById(app.Account__c);
      }
      else{
          Obj=(Contact)contactCtrl.getById(app.Contact__c);
      }
        rtype=Schema.SObjectType.Application__c.getRecordTypeInfosById().get(app.RecordTypeId).getName();
        
        if(Trigger.isInsert && Trigger.isAfter){
            if(app.Status__c=='New'){
                describe=rtype+' application was created successfully';
                subtitle=timeAssignCtrl.aLink(Obj.Id,(string)Obj.get('Name')) +' applied for '+timeAssignCtrl.aLink(app.Id,rtype);
                tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(app,'Application started', subtitle, describe, 'Applied for Loan','insert','application');
                timelineList.add(tEvent);
            }
        }
        if(Trigger.isUpdate && Trigger.isAfter){
            describe='No further information available';
            if(app.Status__c=='Complete' && app.Completion_Status__c=='Approved'){
                subtitle=rtype+' was approved';
                tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(app,'Application approved', subtitle, describe , ' ','update','application');
                timelineList.add(tEvent);
            }
            else if(app.Status__c=='Complete' && app.Completion_Status__c=='Canceled'){
                subtitle=rtype+' was cancelled';
                tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(app,'Application cancelled', subtitle, describe, 'Cancelled Loan Application','update','application');
                timelineList.add(tEvent);
            }
            
        }
    }
    timelineCtrl.createMany(timelineList);
}