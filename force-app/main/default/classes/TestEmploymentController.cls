@IsTest
private with sharing class TestEmploymentController {
static IController controller = new EmploymentController();
    static EmploymentController ctrl = new EmploymentController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Employment__c emp = new Employment__c();
	
    @IsTest
    static void testCreate(){
        Id Id = controller.create(null);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void getactiveIncome(){ 
        IEmployment iCtrl = new EmploymentController();
        emp = (Employment__c)dataSet.createEmployment();
        emp.End_Date__c = date.today();
        
        List<Employment__c> e = (List<Employment__c>) iCtrl.getActiveIncome(emp);
        System.assertEquals(true, e.size() > 0);
    }
    
    @IsTest
    static void testCreateMany(){

        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        boolean isTrue = controller.edit(emp);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
		emp = (Employment__c) dataSet.createEmployment();
        Employment__c emp = (Employment__c)controller.getById(emp.Id);
        System.assertEquals(null, emp);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        Integer resultlength;
        List<Employment__c> emps = (List<Employment__c>)EmploymentController.getAll();
        resultlength = emps.size();
        System.assertNotEquals(true, resultlength>0);
        
        List<Employment__c> emps1 = (List<Employment__c>)EmploymentController.getAll(null);
        System.assertEquals(null, emps1);
    }
    
    @IsTest
    static void testGetAll1(){
        List<Employment__c> emps = (List<Employment__c>)EmploymentController.getAll(null);
        System.assertEquals(null, emps);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}