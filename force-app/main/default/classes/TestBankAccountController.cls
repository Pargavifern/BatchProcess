@IsTest
private with sharing class TestBankAccountController {
static IController controller = new BankAccountController();
    static BankAccountController ctrl = new BankAccountController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Bank_Account__c bacc = new Bank_Account__c();
	
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
        bacc =(Bank_Account__c) dataSet.createBankAccount('Contact');
        
        boolean isTrue = controller.edit(bacc);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        Bank_Account__c bacc = (Bank_Account__c)controller.getById(null);
        System.assertEquals(null, bacc);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        List<Bank_Account__c> baccs = (List<Bank_Account__c>)BankAccountController.getAll();
        Integer resultlength = baccs.size();
        System.assertNotEquals(true, resultlength>0);
    }
    
    @IsTest
    static void testGetAll1(){
        List<Bank_Account__c> baccs = (List<Bank_Account__c>)BankAccountController.getAll(null);
        //Integer resultlength = baccs.size();
        System.assertEquals(null, baccs);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}