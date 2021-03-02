@IsTest
private with sharing class TestGrantProductController {
	static IController controller = new GrantProductController();
    static GrantProductController ctrl = new GrantProductController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Grant_Product__c gp = new Grant_Product__c();
	
    @IsTest
    static void testCreate(){
        Id Id = controller.create(null);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){

        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        boolean isTrue = controller.edit(gp);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        gp = (Grant_Product__c) dataSet.createGrantProduct();
        Grant_Product__c gp = (Grant_Product__c)controller.getById(gp.Id);
        System.assertNotEquals(null, gp);

    }

    @IsTest
    static void testGetAll(){
        List<Grant_Product__c> gps = new List<Grant_Product__c>();
        
        gps = (List<Grant_Product__c>)GrantProductController.getAll();
        System.assertNotEquals(true, gps.size() > 0);
        
        gps = (List<Grant_Product__c>)GrantProductController.getAll(null);
        System.assertEquals(null, gps);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }
}