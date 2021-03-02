public with sharing class CollateralController implements IController, ICollateral, iprofilePicture{
    public static Boolean setExpired(){
        IController col=new CollateralController();
        Date dt=Date.today();
        List<Collateral__c> uobj=new List<Collateral__c>();
        List<Collateral__c> cobj=[select Expired__c from Collateral__c where Expiration_Date__c <:dt];
        for(Collateral__c obj:cobj){
            obj.Expired__c=true;
            uobj.add(obj);
        }
        col.editMany(uobj);
        return true;
    }
    
    public static List<SObject> getAll(){
        //List<SObject> entity= [Select Application__c,Collateral_Type__c,Expiration_Date__c,Expired__c,Issue_Date__c,Reference_Number__c,	Amount__c,CreatedById from Collateral__c ORDER BY CreatedDate DESC LIMIT 1000];
        return null; // entity;                        
    }
    public static List<SObject> getAll(SObject Amount){
        return getAll(Amount,null);
    }

    public static List<SObject> getAll(SObject Amount,String autoNumber){
        /*Collateral__c param;
        if(Amount == null){
            param = new Collateral__c();
        }else{
             param = (Collateral__c)Amount;
        }
        String queryString; = 'Select Application__c,Collateral_Type__c,Expiration_Date__c,Expired__c,Issue_Date__c,Reference_Number__c,	Amount__c,CreatedById from Collateral__c where';
        
        if(!string.isBlank(autoNumber)){
            queryString +=' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(param.Amount__c  != Null){
            queryString += 'Amount__c = '+ param.Amount__c +' AND';
        }
        if(!string.isBlank(param.Application__c)){
            queryString += ' Application__c = \'' + String.escapeSingleQuotes(param.Application__c) +  '\' AND';
        }
        if(!string.isBlank(param.Collateral_Type__c)){
            queryString += ' Collateral_Type__c = \'' + String.escapeSingleQuotes(param.Collateral_Type__c) +  '\' AND';
        }
        if(param.Expiration_Date__c!=Null){
            String formatedDate = DateUtility.formatDateTime(param.Expiration_Date__c, 'yyyy-MM-dd');
            queryString += ' Expiration_Date__c = ' + formatedDate +  ' AND';
        }
        if(param.Expired__c!=Null){
            queryString += ' Expired__c = ' +param.Expired__c +  ' AND';
        }

        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');
        List<SObject> entity = Database.query(queryString);
        System.debug(entity);*/

        return null; // entity;
    }

    public SObject getById(Id id){
        //SObject entity = [Select Application__c,Collateral_Type__c,Expiration_Date__c,Expired__c,Issue_Date__c,Reference_Number__c,Amount__c,CreatedById from Collateral__c where id=:id];
        return null; // entity; 
    }

    public Id create(SObject Amount	){
        //Collateral__c entity =  (Collateral__c)Amount;
        //insert entity;
        return null;//entity.id;
    }

    public Boolean createMany(List<SObject> Amount){
        //List<Collateral__c> entity=  (List<Collateral__c>)Amount;
        //insert entity;
        return true;
    }
    public Boolean edit(SObject Amount){
        //Collateral__c entity =  (Collateral__c)Amount;
        //update entity;
        return true;
    }

    public Boolean editMany(List<SObject> Amount){
        List<Collateral__c> entity=  (List<Collateral__c>)Amount;
        update entity;
        return true;
    }
    public Boolean remove(Id id){
        //Collateral__c entity = [Select Id from Collateral__c where id=:id];
        //delete entity; 
        return true;
    }
  public String  updateProfilePictureId(Id id, String documentId) { // covered in customprofile picture test
            //Collateral__c collateral=[ Select Id,Picture_Id__c from Collateral__c where  Id=:id ];
            //collateral.Picture_Id__c = documentId;
            //update collateral;
            return documentId;       
    }

    public String getProfilePictureId(Id id){ // covered in customprofile picture test
            Collateral__c collateral=[ Select Picture_Id__c from Collateral__c where  Id=:id ];
            return collateral.Picture_Id__c;   
    }
}