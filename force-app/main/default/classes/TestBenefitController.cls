@IsTest
private with sharing class TestBenefitController {
static IController controller = new BenefitController();
    static BenefitController ctrl = new BenefitController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Benefit__c beni = new Benefit__c();
	
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
        beni =(Benefit__c) dataSet.createBenefit();
        boolean isTrue = controller.edit(beni);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        Benefit__c beni = (Benefit__c)controller.getById(null);
        System.assertEquals(null, beni);

    }

    @IsTest
    static void testGetAll(){
        List<Benefit__c> benis = new List<Benefit__c>();
        
        Integer resultlength ;
        
        beni = (Benefit__c) dataSet.createBenefit();
        benis = (List<Benefit__c>)controller.getAll(beni,'lottery');
        resultlength = benis.size();
        System.assertEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        List<Benefit__c> benis = (List<Benefit__c>)BenefitController.getAll();
        Integer resultlength = benis.size();
        System.assertNotEquals(true, resultlength>0);
    }
    
    @IsTest
    static void testGetAll1(){
        List<Benefit__c> benis = (List<Benefit__c>)BenefitController.getAll(null);
        Integer resultlength = benis.size();
        System.assertNotEquals(true, resultlength>0);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}