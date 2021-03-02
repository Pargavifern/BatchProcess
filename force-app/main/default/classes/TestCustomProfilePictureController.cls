@IsTest
private with sharing class TestCustomProfilePictureController {
	static customProfilePictureController ctrl; //= new customProfilePictureController();
    static Contact con = new Contact();
    static Application__c app = new Application__c();
    static Collateral__c col = new Collateral__c();
    
    static void createContact(){
        con.LastName = 'Contact 1';
        con.Profile_picture_id__c = 'sample';
        insert con;
    }
    
    static void createApplication(){
        createContact();
        
        id recId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Line of Credit').getRecordTypeId();
        
        app.RecordTypeId = recId;
        app.Contact__c = con.Id;
        app.Amount__c = 25000;
        app.Application_Date__c = date.today();
        app.Status__c = 'New';
        insert app; 
    }
    
    static void createCollateral(){
        createApplication();
        
        col = new Collateral__c();
        col.Application__c = app.Id;
        col.Issue_Date__c = date.toDay();
        col.Collateral_Type__c = 'Other';
        col.Picture_Id__c = 'sample';
        insert col;
    }
    
    @IsTest
    static void updateProfilePictureId(){
        createContact();
        string a = customProfilePictureController.updateProfilePictureId(con.Id,'documentId','Contact');
        system.assertNotEquals(null, a);
    }
    
    @IsTest
    static void updateProfilePictureIdCol(){
        createCollateral();
        string a = customProfilePictureController.updateProfilePictureId(col.Id,'documentId','Collateral__c');
        system.assertNotEquals(null, a);
    }
    
    @IsTest
    static void getProfilePictureId(){
        createCollateral();
        
        string a = customProfilePictureController.getProfilePictureId(col.Id,'Collateral__c');
        system.assertEquals('sample', a);
    }
    
    @IsTest
    static void getProfilePictureIdContact(){
        createContact();
        
        string a = customProfilePictureController.getProfilePictureId(con.Id,'Contact');
        system.assertEquals('sample', a);
    }
    
     @IsTest
    static void getPlaceholderUrl(){
        string a = customProfilePictureController.getPlaceholderUrl('Collateral__c');
        system.assertNotEquals(null, a);
    }
}