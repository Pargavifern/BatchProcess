@IsTest
private with sharing class TestInterestProductController {
    static IController controller = new InterestProductController();
    static IInterestProduct controllerExtention = new InterestProductController();
    static Interest_Product__c interestProduct = new Interest_Product__c();

    static void create(){
        interestProduct.Name = 'testInterestProduct1';
        interestProduct.Current_Rate__c = 5;
        interestProduct.Rate_Last_Changed__c = date.today();
        insert interestProduct;
    }
  
    @IsTest
    static void testCreate(){
        interestProduct.Name = 'testInterestProduct';
        interestProduct.Current_Rate__c = 5;
        Id Id = controller.create(interestProduct);
        System.assertNotEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
        interestProduct.Name = 'testInterestProduct1';
        interestProduct.Current_Rate__c = 5;

        List<Interest_Product__c> listInterestproduct = new List<Interest_Product__c>(); 
        listInterestproduct.add(interestProduct);

        boolean isTrue = controller.createMany(listInterestproduct);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        create();
        interestProduct.Name = 'testInterestProduct1';
       // interestProduct.Current_Rate__c = 6;

        boolean isTrue = controller.edit(interestProduct);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        create();

        interestProduct.Name = 'testInterestProduct2';
        List<Interest_Product__c> listInterestproduct = new List<Interest_Product__c>(); 
        listInterestproduct.add(interestProduct);

        boolean isTrue = controller.editMany(listInterestproduct);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        
        create();

        Interest_Product__c interestProduct = (Interest_Product__c)controller.getById(interestProduct.Id);
        System.assertNotEquals(null, interestProduct);

    }

    @IsTest
    static void testGetAll(){
        
        create();

        interestProduct = new Interest_Product__c();
        interestProduct.Name = 'testInterestProduct1';
        interestProduct.Current_Rate__c = 5;
        interestProduct.Active__c =true;
        interestProduct.Rate_Last_Changed__c = date.today();
        interestProduct.OwnerId = UserInfo.getUserId();
        List<Interest_Product__c> interestproducts = (List<Interest_Product__c>)controller.getAll(interestProduct,null);
        Integer resultlength = interestproducts.size();
        System.assertEquals(true, resultlength > 0);

    }
    @IsTest
    static void testCurrentDateUpdate(){
        create();

        Id id = interestProduct.Id;
        controllerExtention.CurrentDateUpdate(id);
    }

    @IsTest
    static void testRemove(){
        create();

        Id id = interestProduct.Id;
        boolean isTrue = controller.remove(id);
        System.assertEquals(true, isTrue);
    }
}