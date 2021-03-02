public class ReciprocalRolesController implements IController, IContactRelation{
    
    public static boolean createInverse(SObject value){    
        IController rrCtrl=new ReciprocalRolesController();
        Reciprocal_Role__c rRole =  (Reciprocal_Role__c)value;
        if(Recursion.quoteRecursion) // to avoid recursion
              return false;
        Recursion.quoteRecursion = true; 
       
        Reciprocal_Role__c rrNew = new Reciprocal_Role__c(); // assign values for a new recirprocal role record
        rrNew.Name=rRole.Inverse_Role__c;
        rrNew.Inverse_Role__c=rRole.Name;
        rrNew.InverseRelationship__c=rRole.Id;
        insert rrNew;
        
        Reciprocal_Role__c rrGet =  new Reciprocal_Role__c();
        rrget.Id = rRole.Id; // update the current record value
        rrGet.InverseRelationship__c=rrNew.Id;
        rrCtrl.edit(rrGet);
        
        return true;
    }
    
	@AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> rRole = [Select Name, Inverse_Role__c, InverseRelationship__c from Reciprocal_Role__c ORDER BY CreatedDate DESC LIMIT 1000];
        return rRole;                        
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }

    public static List<SObject> getAll(SObject value,String autoNumber){
        Reciprocal_Role__c param; 
        if(value == null){
            param = new Reciprocal_Role__c();
        }else{
            param = (Reciprocal_Role__c)value;
        }
        
        String queryString = 'Select Name, Inverse_Role__c, InverseRelationship__c from Reciprocal_Role__c where';

        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(!string.isBlank(param.Inverse_Role__c)){
            queryString += ' Inverse_Role__c = \'' + String.escapeSingleQuotes(param.Inverse_Role__c) +  '\' AND';
        }
        if(!string.isBlank(param.InverseRelationship__c)){
            queryString += ' InverseRelationship__c = \'' + String.escapeSingleQuotes(param.InverseRelationship__c) +  '\' AND';
        }
    
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');
        List<SObject> rRole = Database.query(queryString);
        System.debug(rRole);

        return rRole;
    }

    @AuraEnabled
    public static SObject getById(Id id){
        SObject rRole = [Select Name, Inverse_Role__c, InverseRelationship__c  from Reciprocal_Role__c where id=:id]; 
        return rRole; 
    }
    @AuraEnabled
    public static Id create(SObject value){
        //Reciprocal_Role__c rRole =  (Reciprocal_Role__c)value;
        //insert rRole;
        return null;//rRole.id;
    }

    public Boolean createMany(List<SObject> values){
        //List<Reciprocal_Role__c> rRole =  (List<Reciprocal_Role__c>)values;
        //insert rRole;
        return true;
    }
    public Boolean edit(SObject value){
        Reciprocal_Role__c rRole =  (Reciprocal_Role__c)value;
        update rRole;
        return true;
    }

    public Boolean editMany(List<SObject> values){
        //List<Reciprocal_Role__c> rRole =  (List<Reciprocal_Role__c>)values;
        //update rRole;
        return true;
    }
    public Boolean remove(Id id){ // it is used in trigger
        Reciprocal_Role__c rRole = [Select Id from Reciprocal_Role__c where id=:id];
        delete rRole; 
        return true;
    }

}