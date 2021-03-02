@IsTest
private with sharing class TestLoanProductController {
	static IController controller = new LoanProductController();
    static LoanProductController ctrl = new LoanProductController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Loan_Product__c lprd = new Loan_Product__c();
    
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
        lPrd =(Loan_Product__c) dataSet.createLoanProduct('Simple');
        boolean isTrue = controller.edit(lPrd);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
		lPrd = (Loan_Product__c) dataSet.createLoanProduct('Simple');
        Loan_Product__c lprds = (Loan_Product__c)controller.getById(lPrd.Id);
        System.assertNotEquals(null, lprds);
        
        Loan_Product__c lps = (Loan_Product__c)LoanProductController.getLoanProductCond(lPrd.Id);
        System.assertNotEquals(null, lprds);

    }

    @IsTest
    static void testGetAll(){
        List<Loan_Product__c> ls = new List<Loan_Product__c>();
        
        Integer resultlength ;
        
        lPrd = (Loan_Product__c) dataSet.createLoanProduct('Simple');
        ls = (List<Loan_Product__c>)controller.getAll(lPrd,'LPRD');
        resultlength = ls.size();
        System.assertEquals(true, resultlength > 0);
        
        
        lprd = (Loan_Product__c) dataSet.createLoanProduct('Compound');
        ls = (List<Loan_Product__c>)ctrl.getAll(lPrd);
        resultlength = ls.size();
        System.assertEquals(true, resultlength > 0);

        List<Loan_Product__c> lprds = (List<Loan_Product__c>)LoanProductController.getloanProducts();
        System.assertNotEquals(null,lprds);
        
        List<Loan_Product__c> ls1 = (List<Loan_Product__c>)ctrl.getAll();
        System.assertNotEquals(null,ls1);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}