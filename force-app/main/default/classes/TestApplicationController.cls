@IsTest
private with sharing class TestApplicationController {
static IController controller = new ApplicationController();
    static ApplicationController ctrl = new ApplicationController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Application__c app = new Application__c();
    static List<Application__c> appList = new List<Application__c>();
    
    static Date d = date.today();
	
    @IsTest
    static void testCreate(){
        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        System.assertNotEquals(null, app.Id);
    }
    
    @IsTest
    static void testCreateMany(){

        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        app.Status__c = 'Complete';
        app.Completion_Status__c = 'Canceled';
        app.Cancel_date__c = d;
        app.Cancel_user__c = UserInfo.getUserId();
        app.Cancel_Reason__c = 'Declined';
        boolean isTrue = controller.edit(app);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){
        app =(Application__c) dataSet.CreateGrantApplication('Contact');
        app.Status__c = 'Complete';
        app.Completion_Status__c = 'Approved';
        app.Approved_Amount__c = 900;
        app.Approved_Date__c = d;
        
        appList.add(app);
        
        boolean isTrue = controller.editMany(appList);
        System.assertNotEquals(false, isTrue);
    }
    
    @IsTest
    static void basicValidationContact(){
        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        app.Amount__c = 23423233;
        app.Term__c = 90;
        try{
            update app;
        }
        catch(Exception e){
            
        }
    }
    
    @IsTest
    static void basicValidationAccount(){
        app =(Application__c) dataSet.CreateApplication('Account','Simple');
        app.RecordTypeId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Business Loan').getRecordTypeId();
        app.Amount__c = 23423233;
        app.Term__c = 90;
        try{
            update app;
        }
        catch(Exception e){
            
        }
    }
    
    @IsTest
    static void grantValidation(){
        app =(Application__c) dataSet.CreateGrantApplication('Contact');
        app.Amount__c = 1200000;
        try{
            update app;
        }
        catch(Exception e){
            
        }
    }
    
    @IsTest
    static void cancelValidation(){

        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        app.Status__c = 'Complete';
        app.Completion_Status__c = 'Canceled';
        app.Cancel_date__c = d.addDays(-2);
        try{
            update app;
        }
        catch(Exception e){
            
        }
    }
    
    @IsTest
    static void approveValidation(){
        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        app.Status__c = 'Complete';
        app.Completion_Status__c = 'Approved';
        app.Approved_Amount__c = 23234322;
        app.Approved_Date__c = d.addDays(-2);
        try{
            update app;
        }
        catch(Exception e){
            
        }
    }

    @IsTest
    static void testGetById(){
		app = (Application__c) dataSet.CreateApplication('Contact','Simple');
        Application__c app = (Application__c)controller.getById(app.Id);
        System.assertNotEquals(null, app);

    }

    @IsTest
    static void testGetAll(){
        Integer resultlength;
        app =(Application__c) dataSet.CreateApplication('Contact','Simple');
        
        appList = (List<Application__c>)ApplicationController.getAll(null);
        System.assertEquals(null, appList);
        
        appList = (List<Application__c>)ApplicationController.getAll();
        System.assertNotEquals(null, appList);

        appList = (List<Application__c>)ApplicationController.getSource();
        System.assertEquals(true,appList.size()>0);

    }

    @IsTest
    static void testRemove(){
        app = (Application__c) dataSet.CreateApplication('Contact','Simple');
        boolean isTrue = controller.remove(app.Id);
        System.assertEquals(true, isTrue);
    }

}