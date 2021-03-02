public with sharing class accountController implements iprofilePicture, IController{
      
     @AuraEnabled
     public static Account getBillingAddress(Id id){
            Account account=[ Select BillingAddress,Name from Account where  Id=:id ];
            return  account;    
    }

     public String getProfileGender(Id id){ // not used anywhwere
            return 'None';    
    }

    public String  updateProfilePictureId(Id id, String documentId) {
            //Account account=[ Select Id,Profile_picture_id__c from Account where  Id=:id ];
            //account.Profile_picture_id__c = documentId;
            //update account;
            return documentId;      
    }

    public String getProfilePictureId(Id id){
            //Account account=[ Select Profile_picture_id__c from Account where  Id=:id ];
            //return account.Profile_picture_id__c;
            return '';
    }

    public List<SObject> getAll(){
        List<SObject> accounts = new List<SObject>() ;//= [SELECT
                //Id, Name, AccountNumber, OwnerId, Site,Rating,Ownership,Website,NumberOfEmployees,Sic,
                //AccountSource, AnnualRevenue,Twitter__c,Type,Email__c,Provincial_Business_Number__c,
               // Description, Facebook__c,Legal_Name__c,Legal_Type__c,Phone,Profile_picture_id__c
           // FROM Account ORDER BY CreatedDate DESC LIMIT 1000];

        return accounts;                        
    }
    public List<SObject> getAll(SObject value){
        return getAll(value,null);
    }
    public List<SObject> getAll(SObject value,String autoNumber){
        Account param;
        if(value == null){
            param = new Account();
        }else{
             param = (Account)Value;
        }
        /*String queryString = 'SELECT'+
                'Id, Name, AccountNumber, OwnerId, Site,Rating,Ownership,Website,NumberOfEmployees,Sic'+
                'AccountSource, AnnualRevenue,Twitter__c,Type,Email__c,Provincial_Business_Number__c,'+
                'Description, Facebook__c,Legal_Name__c,Legal_Type__c,Phone,Profile_picture_id__c'+
                'FROM Account where';

        if(param.AnnualRevenue  != Null){
            queryString += ' AnnualRevenue = '+ param.AnnualRevenue +' AND';
        }  
         if(param.Rating  != Null){
            queryString += ' Rating = '+ param.Rating +' AND';
        }  
        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        } 
        if(!string.isBlank(param.Phone)){
            queryString += ' Phone = \'' + String.escapeSingleQuotes(param.Phone) +  '\' AND';
        } 
        if(!string.isBlank(param.Legal_Type__c)){
            queryString += ' Legal_Type__c = \'' + String.escapeSingleQuotes(param.Legal_Type__c) +  '\' AND';
        } 
        if(!string.isBlank(param.Legal_Name__c)){
            queryString += ' Legal_Name__c = \'' + String.escapeSingleQuotes(param.Legal_Name__c) +  '\' AND';
        } 
        if(!string.isBlank(param.Facebook__c)){
            queryString += ' Facebook__c = \'' + String.escapeSingleQuotes(param.Facebook__c) +  '\' AND';
        } 
        if(!string.isBlank(param.Description)){
            queryString += ' Description = \'' + String.escapeSingleQuotes(param.Description) +  '\' AND';
        } 
        if(!string.isBlank(param.Provincial_Business_Number__c)){
            queryString += ' Email__c = \'' + String.escapeSingleQuotes(param.Provincial_Business_Number__c) +  '\' AND';
        } 
         if(!string.isBlank(param.Email__c)){
            queryString += ' Email__c = \'' + String.escapeSingleQuotes(param.Email__c) +  '\' AND';
        } 
         if(!string.isBlank(param.Site)){
            queryString += ' Site = \'' + String.escapeSingleQuotes(param.Site) +  '\' AND';
        } 
         if(!string.isBlank(param.Twitter__c)){
            queryString += ' Twitter__c = \'' + String.escapeSingleQuotes(param.Twitter__c) +  '\' AND';
        }
         if(!string.isBlank(param.AccountSource)){
            queryString += ' AccountSource = \'' + String.escapeSingleQuotes(param.AccountSource) +  '\' AND';
        }
         if(!string.isBlank(param.Sic)){
            queryString += ' Sic = \'' + String.escapeSingleQuotes(param.Sic) +  '\' AND';
        } 
         if(!string.isBlank(param.Website)){
            queryString += ' Website = \'' + String.escapeSingleQuotes(param.Website) +  '\' AND';
        } 
        if(!string.isBlank(param.Ownership)){
            queryString += ' Ownership = \'' + String.escapeSingleQuotes(param.Ownership) +  '\' AND';
        }   
        if(!string.isBlank(param.AccountNumber)){
            queryString += ' AccountNumber = \'' + String.escapeSingleQuotes(param.AccountNumber) +  '\' AND';
        }  
        if(!string.isBlank(param.OwnerId)){
            queryString += ' Interest_Compounding_Frequency__c = \'' + String.escapeSingleQuotes(param.OwnerId) +  '\'';
        } 

        queryString = queryString.removeEnd(' AND');
		queryString = queryString.removeEnd(' where');
        List<SObject> accounts = Database.query(queryString);
        System.debug(accounts);*/

        List<SObject> accounts = new List<SObject>();
        return accounts;
    }

    public SObject getById(Id id){
        SObject accountData = [SELECT
                Id, Name, AccountNumber, OwnerId, Site,Rating,Ownership,Website,NumberOfEmployees,Sic,
                AccountSource, AnnualRevenue,Twitter__c,Type,Email__c,Provincial_Business_Number__c,
                Description, Facebook__c,Legal_Name__c,Legal_Type__c,Phone,Profile_picture_id__c
            FROM Account where id=:id];
        return accountData; 
    }

    public Id create(SObject value){
        Id a;
       // Account accountData =  (Account)value;
       // insert accountData;
       // return accountData.id;
       return a;
    }

    public Boolean createMany(List<SObject> values){
        //List<Account> accounts =  (List<Account>)values;
        //insert accounts;
        return true;
    }
    public Boolean edit(SObject value){
        //Account accountData =  (Account)value;
        //update accountData;
        return true;
    }

    public Boolean editMany(List<SObject> values){
       // List<Account> accounts =  (List<Account>)values;
        //update accounts;
        return true;
    }
    public Boolean remove(Id id){
        //Account accountData = [Select Id from Account where id=:id];
        //delete accountData; 
        return true;
    }
}