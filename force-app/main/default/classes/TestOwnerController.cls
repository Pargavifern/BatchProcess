@IsTest
private with sharing class TestOwnerController {
	static IController controller = new OwnerController();
    static OwnerController ctrl = new OwnerController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Owner__c owner = new Owner__c();
	
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
        boolean isTrue = controller.edit(owner);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        Owner__c owner = (Owner__c)controller.getById(owner.Id);
        System.assertEquals(null, owner);

    }

    @IsTest
    static void testGetAll(){
        List<Owner__c> owners = new List<Owner__c>();
        
        Integer resultlength ;
        
        owner = (Owner__c) dataSet.createOwner();
        owners = (List<Owner__c>)controller.getAll(owner,'OWN-000000');
        resultlength = owners.size();
        System.assertNotEquals(true, resultlength > 0);
        
        owners = (List<Owner__c>)OwnerController.getAll();
        resultlength = owners.size();
        System.assertEquals(true, resultlength>0);
        
        owners = (List<Owner__c>)OwnerController.getAll(null);
        resultlength = owners.size();
        System.assertEquals(true, resultlength>0);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

    @IsTest
    static void sameContact(){
        owner = (Owner__c) dataSet.createOwner();
        Owner__c own = new Owner__c();
        own.Account__c = owner.Account__c;
        own.Contact__c = owner.Contact__c;
        own.Share__c = 120;
        try{
            insert own;
        }
        catch(Exception e){ }
    }
}