@IsTest
private with sharing class TestLoanTransactionController {
static IController controller = new LoanTransactionController();
    static LoanTransactionController ctrl = new LoanTransactionController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Loan_Transaction__c lTr = new Loan_Transaction__c();
	
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
        lTr =(Loan_Transaction__c) dataSet.createTransaction('Contact','Simple');
        boolean isTrue = controller.edit(lTr);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
		lTr = (Loan_Transaction__c) dataSet.createTransaction('Contact','Simple');
        Loan_Transaction__c lTr = (Loan_Transaction__c)controller.getById(lTr.Id);
        System.assertNotEquals(null, lTr);

    }

    @IsTest
    static void testGetAll(){
        List<Loan_Transaction__c> lTrs = new List<Loan_Transaction__c>();
        
        Integer resultlength ;
        
        lTr = (Loan_Transaction__c) dataSet.createTransaction('Contact','Simple');
        lTrs = (List<Loan_Transaction__c>)controller.getAll(lTr,'L-000000');
        resultlength = lTrs.size();
        System.assertNotEquals(true, resultlength > 0);
        
        lTrs = (List<Loan_Transaction__c>)LoanTransactionController.getAll(null);
        System.assertEquals(null,null);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        List<Loan_Transaction__c> lTrs = (List<Loan_Transaction__c>)LoanTransactionController.getAll();
        Integer resultlength = lTrs.size();
        System.assertEquals(null,null);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}