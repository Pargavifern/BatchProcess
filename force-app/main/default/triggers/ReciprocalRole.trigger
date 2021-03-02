trigger ReciprocalRole on Reciprocal_Role__c (before insert, after insert, after delete) {
    IContactRelation rrCtrl=new ReciprocalRolesController();
    IController rrelationCtrl=new ReciprocalRolesController();
    
    if(Trigger.isBefore && Trigger.isInsert){
     	for(Reciprocal_Role__c rr: Trigger.New){
            Reciprocal_Role__c rRelation=new Reciprocal_Role__c();
            rRelation.Name=rr.Name;
            rRelation.Inverse_Role__c=rr.Inverse_Role__c;
            List<Reciprocal_Role__c> rrList=rrelationCtrl.getAll(rRelation, null);
            
            rRelation.Name=rr.Inverse_Role__c;
            rRelation.Inverse_Role__c=rr.Name;
            List<Reciprocal_Role__c> rrList1=rrelationCtrl.getAll(rRelation, null);
            
            if((rrList!=null && !rrList.isEmpty()) || (rrList1.size()>1)){
                  rr.addError('Already there is a role exist');
            }
    	}   
    }
    
    if(Trigger.isAfter && Trigger.isInsert){
        for(Reciprocal_Role__c rrLoop: Trigger.New){
            if(rrLoop.Create_Inverse_Role__c){
                rrCtrl.createInverse(rrLoop);  
            }
        }
    }
    
    if(Trigger.isAfter && Trigger.isDelete){
        for(Reciprocal_Role__c rrLoop: Trigger.Old){
            if(rrLoop.InverseRelationship__c!=null){
                rrelationCtrl.remove(rrLoop.InverseRelationship__c);
            }
        }
    }
}