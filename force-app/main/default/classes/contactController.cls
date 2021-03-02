public with sharing class contactController implements iprofilePicture , IController {
  
  @AuraEnabled
     public static String getEmailId(Id id){
        try {
            Contact contact=[ Select Email from Contact where  Id=:id ];
            return contact.Email;
        }
        catch(Exception e){
            System.debug(Logginglevel.ERROR, e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }      
    }
     
    public String  updateProfilePictureId(Id id, String documentId) {// covered in customprofile picture test
            Contact contact=[ Select Id,Profile_picture_id__c from Contact where  Id=:id ];
            contact.Profile_picture_id__c = documentId;
            update contact;
            return documentId;      
    }

    @AuraEnabled
     public static String getMobileNumber(Id id){
            Contact contact=[ Select MobilePhone from Contact where  Id=:id ];
            return contact.MobilePhone;     
    }
    
    
     public static String getProfilePictureId(Id id){ // covered in customprofile picture test
            Contact contact=[ Select Profile_picture_id__c from Contact where  Id=:id ];
            return contact.Profile_picture_id__c;   //
    }

      public static String getProfileGender(Id id){
            Contact contact=[ Select Gender__c from Contact where  Id=:id ];
            return contact.Gender__c;    
    }
     
	@AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> contacts = [Select AccountId,AssistantPhone,Birthdate,
	                                OwnerId,CreatedById,Department,Description,DoNotCall,Email,Email_Consent__c,
	                                HasOptedOutOfEmail,HasOptedOutOfFax,Facebook__c,Fax,Gender__c,HomePhone,
                                    LastModifiedById,LinkedIn__c,Mail_Consent__c,MobilePhone,OtherPhone,Title,
                                    Twitter__c,SMS_Consent__c,Target_Group__c from Contact ORDER BY CreatedDate DESC LIMIT 1000];
        return contacts;                        
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }
    
	@AuraEnabled
    public static List<SObject> getAll(SObject value,String autoNumber){
       /* Contact param;
        if(param == null)
			param = new Contact();
		else
			param = (Contact)Value;
		
        String queryString = 'Select FirstName,LastName, AccountId,Birthdate,'+
	                        'OwnerId,CreatedById,Department,Description,Email,Email_Consent__c,'+
	                        'HasOptedOutOfEmail,HasOptedOutOfFax,Facebook__c,Fax,Gender__c,HomePhone,'+
                            'LastModifiedById,LinkedIn__c,Mail_Consent__c,MobilePhone,OtherPhone,Title,'+
                            'Twitter__c,SMS_Consent__c,Target_Group__c from Contact where';

        if(param.HasOptedOutOfFax  != Null){
            queryString += ' HasOptedOutOfEmail = '+ param.HasOptedOutOfEmail +' AND';
        }
        if(param.HasOptedOutOfEmail  != Null){
            queryString += ' HasOptedOutOfEmail = '+ param.HasOptedOutOfEmail +' AND';
        }
        if(param.SMS_Consent__c  != Null){
            queryString += ' SMS_Consent__c = '+ param.SMS_Consent__c +' AND';
        }
        if(param.Mail_Consent__c  != Null){
            queryString += ' Mail_Consent__c = '+ param.Mail_Consent__c +' AND';
        }
        if(param.Email_Consent__c  != Null){
            queryString += ' Email_Consent__c = '+ param.Email_Consent__c +' AND';
        }
        if(!string.isBlank(param.FirstName)){
            queryString += ' FirstName = \'' + String.escapeSingleQuotes(param.FirstName) +  '\' AND';
        }
        if(!string.isBlank(param.LastName)){
            queryString += ' LastName = \'' + String.escapeSingleQuotes(param.LastName) +  '\' AND';
        }
        if(!string.isBlank(param.OwnerId)){
            queryString += ' OwnerId = \'' + String.escapeSingleQuotes(param.OwnerId) +  '\' AND';
        }
        if(!string.isBlank(param.CreatedById)){
            queryString += ' CreatedById = \'' + String.escapeSingleQuotes(param.CreatedById) +  '\' AND';
        }
        if(!string.isBlank(param.Department)){
            queryString += ' Department = \'' + String.escapeSingleQuotes(param.Department) +  '\' AND';
        }
        if(!string.isBlank(param.Description)){
            queryString += ' Description = \'' + String.escapeSingleQuotes(param.Description) +  '\' AND';
        }
        if(!string.isBlank(param.Email)){
            queryString += ' Email = \'' + String.escapeSingleQuotes(param.Email) +  '\'';
        }
        if(!string.isBlank(param.Facebook__c)){
            queryString += ' Facebook__c = \'' + String.escapeSingleQuotes(param.Facebook__c) +  '\' AND';
        }
        if(!string.isBlank(param.Fax)){
            queryString += ' Fax = \'' + String.escapeSingleQuotes(param.Fax) +  '\' AND';
        }
        if(!string.isBlank(param.Gender__c)){
            queryString += ' Gender__c = \'' + String.escapeSingleQuotes(param.Gender__c) +  '\' AND';
        }
        if(!string.isBlank(param.HomePhone)){
            queryString += ' HomePhone = \'' + String.escapeSingleQuotes(param.HomePhone) +  '\' AND';
        }
        if(!string.isBlank(param.LastModifiedById)){
            queryString += ' LastModifiedById = \'' + String.escapeSingleQuotes(param.LastModifiedById) +  '\' AND';
        }
        if(!string.isBlank(param.LinkedIn__c)){
            queryString += ' LinkedIn__c = \'' + String.escapeSingleQuotes(param.LinkedIn__c) +  '\' AND';
        }
        if(!string.isBlank(param.MobilePhone)){
            queryString += ' MobilePhone = \'' + String.escapeSingleQuotes(param.MobilePhone) +  '\' AND';
        }
        if(!string.isBlank(param.OtherPhone)){
            queryString += ' OtherPhone = \'' + String.escapeSingleQuotes(param.OtherPhone) +  '\' AND';
        }
        if(!string.isBlank(param.Title)){
            queryString += ' Title = \'' + String.escapeSingleQuotes(param.Title) +  '\' AND';
        }
        if(!string.isBlank(param.AccountId)){
            queryString += ' AccountId = \'' + String.escapeSingleQuotes(param.AccountId) +  '\' AND';
        }
        if(!string.isBlank(param.Target_Group__c)){
            queryString += ' Target_Group__c = \'' + String.escapeSingleQuotes(param.Target_Group__c) +  '\'';
        }
        queryString = queryString.removeEnd(' AND');
		queryString = queryString.removeEnd(' where');
        List<SObject> contacts = Database.query(queryString);
        System.debug(contacts);*/

        return null;// contacts;
    }

    public SObject getById(Id id){
        SObject contactData = [Select AccountId,AssistantPhone,Birthdate,Name,
	                                OwnerId,CreatedById,Department,Description,DoNotCall,Email,Email_Consent__c,
	                                HasOptedOutOfEmail,HasOptedOutOfFax,Facebook__c,Fax,Gender__c,HomePhone,
                                    LastModifiedById,LinkedIn__c,Mail_Consent__c,MobilePhone,OtherPhone,Title,
                                    Twitter__c,SMS_Consent__c,Target_Group__c from Contact where id=:id];
        return contactData; 
    }

    public Id create(SObject value){
        //Contact contactData =  (Contact)value;
       // insert contactData;
        return null; //contactData.id;
    }

    public Boolean createMany(List<SObject> values){
       // List<Contact> contacts =  (List<Contact>)values;
       // insert contacts;
        return true;
    }
    public Boolean edit(SObject value){
       // Contact contactData =  (Contact)value;
        //update contactData;
        return true;
    }

    public Boolean editMany(List<SObject> values){
       // List<Contact> contacts =  (List<Contact>)values;
       // update contacts;
        return true;
    }
    public Boolean remove(Id id){
       //Contact contactData = [Select Id from Contact where id=:id];
        //delete contactData; 
        return true;
    }
}