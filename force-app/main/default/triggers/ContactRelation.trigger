trigger ContactRelation on Contact_Relationship__c (before insert, after insert,after update,after delete) {
    IContactRelation crCtrl=new ContactRelationController();
    IController crelationCtlr = new  ContactRelationController(); 
    IController rrCtrl=new ReciprocalRolesController();
    
    if(Trigger.isBefore && Trigger.isInsert){
     	for(Contact_Relationship__c cr: Trigger.New){
            Contact_Relationship__c cRelation=new Contact_Relationship__c();
            cRelation.Contact__c=cr.Contact__c;
            cRelation.Related_Contact__c=cr.Related_Contact__c;
            List<Contact_Relationship__c> crList=crelationCtlr.getAll(cRelation, null);
            
            if(crList!=null && !crList.isEmpty()){
                  cr.addError('Already there is an relationship exist between these two contacts');
            }
            
            cRelation.Contact__c=cr.Related_Contact__c;
            cRelation.Related_Contact__c=cr.Contact__c;
            List<Contact_Relationship__c> crList1=crelationCtlr.getAll(cRelation, null);
            
            if( crList1.size()>1){
                  cr.addError('Already there is an relationship exist between these two contacts');
            }
    	}   
    }
    
    if(Trigger.isAfter && Trigger.isInsert){
        for(Contact_Relationship__c crLoop: Trigger.New){
            crCtrl.createInverse(crLoop);
        }
    }
    
    if(Trigger.isAfter && Trigger.isUpdate){
        for(Contact_Relationship__c crNew: Trigger.New){
            Contact_Relationship__c crOld=Trigger.oldMap.get(crNew.Id);
            if(crOld.Related_Contact__c != crNew.Related_Contact__c){
                crCtrl.createInverse(crNew);
                crelationCtlr.remove(crOld.InverseRelationship__c);
            }
            else if(crOld.Related_Role__c != crNew.Related_Role__c){
                Contact_Relationship__c crGet =  (Contact_Relationship__c)crelationCtlr.getById(crNew.InverseRelationship__c); // get the related contact
                Reciprocal_Role__c rrGet =  (Reciprocal_Role__c)rrCtrl.getById(crNew.Related_Role__c); // fetch the role record to get the inverse role
                if(rrGet.InverseRelationship__c!=null){ // if there is inverse relation for the role.
                    crGet.Related_Role__c=rrGet.InverseRelationship__c;
                }
                else{ // if there is no inverse role, assign the related role for the second contact also
                    crGet.Related_Role__c=crNew.Related_Role__c;
                }

                crelationCtlr.edit(crGet);
            }
        }
    }
    
    if(Trigger.isAfter && Trigger.isDelete){
        for(Contact_Relationship__c crLoop: Trigger.Old){
            if(crLoop.InverseRelationship__c != null){
                //crelationCtlr.remove(crLoop.InverseRelationship__c);
                Contact_Relationship__c crGet =  (Contact_Relationship__c)crelationCtlr.getById(crLoop.InverseRelationship__c); // get the related contact
                if(crLoop.Id==crGet.InverseRelationship__c || crGet.InverseRelationship__c==null){ //verify if both are related 
                    crelationCtlr.remove(crLoop.InverseRelationship__c);
                }
            }
        }
    }
}