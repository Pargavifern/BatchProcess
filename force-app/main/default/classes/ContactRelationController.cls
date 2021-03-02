public class ContactRelationController implements IController, IContactRelation{
    
    public static boolean createInverse(SObject value){    
        IController crCtrl=new ContactRelationController();
        IController rrCtrl=new ReciprocalRolesController();
        Contact_Relationship__c crLoop =  (Contact_Relationship__c)value;
      
        if(Recursion.quoteRecursion) // to avoid recursion
              return false;
        Recursion.quoteRecursion = true; 
       
        Contact_Relationship__c crNew=new Contact_Relationship__c(); // assign values for a new recirprocal role record
            
        crNew.Contact__c=crLoop.Related_Contact__c;
        crNew.Related_Contact__c=crLoop.Contact__c;
        crNew.InverseRelationship__c=crLoop.Id;
          
        Reciprocal_Role__c rrGet=(Reciprocal_Role__c) rrCtrl.getById(crLoop.Related_Role__c); // get the inverse relation role
         if(rrGet.InverseRelationship__c!=null){ // if there is inverse relation for the role.
        	crNew.Related_Role__c=rrGet.InverseRelationship__c;
        }
        else{ // if there is no inverse role, assign the related role for the second contact also
            crNew.Related_Role__c=crLoop.Related_Role__c;
        }
        
        insert crNew;       
        
        Contact_Relationship__c crGet = new Contact_Relationship__c();//(Contact_Relationship__c)crCtrl.getById(crLoop.Id);
        crGet.Id = crLoop.Id;
         // update the current record value
        crGet.InverseRelationship__c=crNew.Id;
        crCtrl.edit(crGet);
        
        return true;
    }
    
	@AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> cRelationship = [Select Name, InverseRelationship__c, Contact__c, Related_Contact__c, Related_Role__c from Contact_Relationship__c ORDER BY CreatedDate DESC LIMIT 1000];
        return cRelationship;                        
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }

    public static List<SObject> getAll(SObject value,String autoNumber){
        Contact_Relationship__c param;
        if(value == null){
            param = new Contact_Relationship__c();
        }
        else{
           param = (Contact_Relationship__c)value;
        }
        
        String queryString = 'Select Name, InverseRelationship__c, Contact__c, Related_Contact__c, Related_Role__c  from Contact_Relationship__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
         if(!string.isBlank(param.Contact__c)){
            queryString += ' Contact__c = \'' + String.escapeSingleQuotes(param.Contact__c) +  '\' AND';
        }
          if(!string.isBlank(param.Related_Contact__c)){
            queryString += ' Related_Contact__c = \'' + String.escapeSingleQuotes(param.Related_Contact__c) +  '\' AND';
        }
        if(!string.isBlank(param.Related_Role__c)){
            queryString += ' Related_Role__c = \'' + String.escapeSingleQuotes(param.Related_Role__c) +  '\' AND';
        }
    
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');
        List<SObject> cRelationship = Database.query(queryString);
        System.debug(cRelationship);

        return cRelationship;
    }

    @AuraEnabled
    public static SObject getById(Id id){

        SObject cRelationship = [Select Name, InverseRelationship__c, Contact__c, Related_Contact__c, Related_Role__c  from Contact_Relationship__c where id=:id]; 
        
        return cRelationship; 
    }
    @AuraEnabled
    public static Id create(SObject value){
        //Contact_Relationship__c cRelationship =  (Contact_Relationship__c)value;
        //insert cRelationship;
        return null; //cRelationship.id;
    }

    public Boolean createMany(List<SObject> values){
        //List<Contact_Relationship__c> cRelationship =  (List<Contact_Relationship__c>)values;
        //insert cRelationship;
        return true;
    }
    public Boolean edit(SObject value){
        Contact_Relationship__c cRelationship =  (Contact_Relationship__c)value;
        update cRelationship;
        return true;
    }

    public Boolean editMany(List<SObject> values){
        //List<Contact_Relationship__c> cRelationship =  (List<Contact_Relationship__c>)values;
       // update cRelationship;
        return true;
    }
    public Boolean remove(Id id){
        Contact_Relationship__c cRelationship = [Select Id from Contact_Relationship__c where id=:id];
        delete cRelationship; 
        return true;
    }
}