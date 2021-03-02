@IsTest
private with sharing class TestLoanController {
	static IController controller = new LoanController();
    static LoanController ctrl = new LoanController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Loan__c loan = new Loan__c();
	
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
        loan =(Loan__c) dataSet.createLoan('Contact','Simple');
        boolean isTrue = controller.edit(loan);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
		loan = (Loan__c) dataSet.createLoan('Contact','Simple');
        Loan__c loan = (Loan__c)controller.getById(loan.Id);
        System.assertNotEquals(null, loan);

    }

    @IsTest
    static void testGetAll(){
        List<Loan__c> loans = new List<Loan__c>();
        
        Integer resultlength ;
        
        loan = (Loan__c) dataSet.createLoan('Contact','Simple');
        loans = (List<Loan__c>)controller.getAll(loan,'L-000000');
        resultlength = loans.size();
        System.assertNotEquals(true, resultlength > 0);
        
        Loan__c a = new Loan__c();
        a.Application__c = loan.Application__c;
        a.Status__c = 'Pending';
        a.Loan_Product__c = loan.Loan_Product__c;
        a.Contact__c = loan.Contact__c;
        
        try{
            insert a;
        }
        catch(Exception e){
            
        }
        
        loan = (Loan__c) dataSet.createLoan('Account','Simple');
        loans = (List<Loan__c>)controller.getAll(loan,'L-000000');
        resultlength = loans.size();
        System.assertNotEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        List<Loan__c> loans = (List<Loan__c>)LoanController.getAll();
        Integer resultlength = loans.size();
        System.assertNotEquals(true, resultlength>0);
    }
    
    @IsTest
    static void testGetAll1(){
        List<Loan__c> loans = (List<Loan__c>)LoanController.getAll(null);
        Integer resultlength = loans.size();
        System.assertNotEquals(true, resultlength>0);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

    @IsTest
    static void testChart(){
		loan = (Loan__c) dataSet.createLoan('Contact','Simple');
        
        Loan__c loans = (Loan__c)LoanController.chart(loan.Id);
        System.assertNotEquals(null, loans);

    }
}