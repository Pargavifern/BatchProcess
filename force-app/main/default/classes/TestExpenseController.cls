@IsTest
private with sharing class TestExpenseController {
	static IController controller = new ExpenseController();
    static ExpenseController ctrl = new ExpenseController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Expense__c exp = new Expense__c();
	
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
        boolean isTrue = controller.edit(exp);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        Expense__c exp = (Expense__c)controller.getById(exp.Id);
        System.assertEquals(null, exp);

    }

    @IsTest
    static void testGetAll(){
        List<Expense__c> exps = new List<Expense__c>();
        
        Integer resultlength ;
        
        exp = (Expense__c) dataSet.createExpense();
        exps = (List<Expense__c>)controller.getAll(exp,'Purchase');
        resultlength = exps.size();
        System.assertEquals(true, resultlength > 0);
        
        exps = (List<Expense__c>)ExpenseController.getAll();
        resultlength = exps.size();
        System.assertEquals(true, resultlength>0);
        
        exps = (List<Expense__c>)ExpenseController.getAll(null);
        resultlength = exps.size();
        System.assertEquals(true, resultlength>0);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }
}