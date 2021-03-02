@IsTest
private with sharing class TestCollateralController {
static IController controller = new CollateralController();
    static ICollateral iCtrl = new CollateralController();
    static Collateral__c col = new Collateral__c();

    static void create(){
        Date d = date.today();
        Application__c app = new Application__c();
        Contact con = new Contact(LastName= 'Sam');
        insert con;
        
        id recId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Line of Credit').getRecordTypeId();
        
        app.RecordTypeId = recId;
        app.Contact__c = con.Id;
        app.Amount__c = 25000;
        app.Application_Date__c = date.today();
        app.Status__c = 'New';
        insert app; 
        
        col.Application__c = app.Id;
        col.Amount__c = 2900;
        col.Collateral_Type__c = 'Other';
        col.Issue_Date__c = d.addDays(-4);
        col.Expiration_Date__c = d.addDays(-2);
        insert col;
    }
    
        
    @IsTest
    static void setExpired(){
        create(); 
        Boolean t = CollateralController.setExpired();
        System.assertEquals(true, t);
    }
  
    @IsTest
    static void testCreate(){
        Id Id = controller.create(col);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        boolean isTrue = controller.edit(col);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        create();

        col.Collateral_Type__c = 'Insurance';
        List<Collateral__c> listCol = new List<Collateral__c>(); 
        listCol.add(col);

        boolean isTrue = controller.editMany(listCol);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){

        Collateral__c col = (Collateral__c)controller.getById(col.Id);
        System.assertEquals(null, col);

    }

    @IsTest
    static void testGetAll(){
        List<Collateral__c> cols = (List<Collateral__c>)CollateralController.getAll(col);
        System.assertEquals(null, cols);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        List<Collateral__c> cols = (List<Collateral__c>)CollateralController.getAll();
        System.assertEquals(null, cols);

    }
 

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(col.id);
        System.assertEquals(true, isTrue);
    }
}