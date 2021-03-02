trigger Contact on Contact (before insert,before update,after insert) {  
    if(Trigger.isInsert){
        if(Trigger.isBefore){
            for(Contact c:Trigger.New){
                if(c.Investment_Knowledge__c != null || c.Investment_Objective__c != null ||
                    c.Time_Horizon__c!= null || c.Risk_Tolerance__c!= null || c.Income_Situation__c != null){
                        c.Last_Updated_Date__c=DateTime.now();
                 }
          	}
        }
        if(Trigger.isAfter){
            List<Timeline_Event__c> timelineList=new List<Timeline_Event__c>();
            TimelineEventController tobj=new TimelineEventController();
            ITimelineEventController timeAssignCtrl=new TimelineEventController();
            
            for(Contact con:Trigger.New){
        
                Timeline_Event__c tEvent=new Timeline_Event__c();
                string rtype='', subtitle='',cname='',uname='';
                
                if(Trigger.isInsert){
                    if(con.FirstName!=null){
                        cname=con.FirstName;
                    }
                    cname=cname+' '+con.LastName;
                    uname=timeAssignCtrl.getUserName(con.CreatedById);
                    subtitle=timeAssignCtrl.aLink(con.CreatedById, uname)+' created the Contact '+ timeAssignCtrl.aLink(con.id, cname);
                    tevent=(Timeline_Event__c)timeAssignCtrl.timelineTrigger(con,'Created', subtitle, con.Description , 'New','insert','contact');
                    timelineList.add(tEvent);
                } 
            }
            tobj.createMany(timelineList);
        }
        
    }
    if(Trigger.isUpdate){
        if(Trigger.isBefore){
            for(Contact c:Trigger.New){
                Contact cold=Trigger.oldMap.get(c.Id);
                if(c.Investment_Knowledge__c != cold.Investment_Knowledge__c || c.Investment_Objective__c != cold.Investment_Objective__c ||
                    c.Time_Horizon__c!= cold.Time_Horizon__c || c.Risk_Tolerance__c!= cold.Risk_Tolerance__c || c.Income_Situation__c != cold.Income_Situation__c
                     || c.Employment_Status__c != cold.Employment_Status__c){
                        c.Last_Updated_Date__c=DateTime.now();
                 }
          	}
        } 
    }
	
}