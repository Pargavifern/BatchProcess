@IsTest
private with sharing class TestRiskRatingController {
	static IController controller = new RiskRatingController();
    static RiskRatingController ctrl = new RiskRatingController();
    static SampleDataObjects dataSet = new SampleDataObjects();

    static Risk_Rating__c risk = new Risk_Rating__c();
	
    @IsTest
    static void testCreate(){
        Id Id = controller.create(null);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
		risk = (Risk_Rating__c) dataSet.createRiskRating();
        Risk_Rating__c rt = new Risk_Rating__c(Category__c = 'test', Account__c = risk.Account__c);
        List<Risk_Rating__c> rsList  = new List<Risk_Rating__c>();
        rsList.add(rt);
        boolean isTrue = controller.createMany(rsList);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        boolean isTrue = controller.edit(risk);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){
        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        Risk_Rating__c orisk = (Risk_Rating__c)controller.getById(risk.Id);
        System.assertEquals(null, orisk);

    }

    @IsTest
    static void testGetAll(){
        List<Risk_Rating__c> risks = new List<Risk_Rating__c>();
        
        Integer resultlength ;
        
        risk = (Risk_Rating__c) dataSet.createRiskRating();
        risks = (List<Risk_Rating__c>)controller.getAll(risk,'RIS-000000');
        resultlength = risks.size();
        System.assertNotEquals(true, resultlength > 0);
        
        risks = (List<Risk_Rating__c>)RiskRatingController.getAll();
        resultlength = risks.size();
        System.assertEquals(true, resultlength>0);
        
        risks = (List<Risk_Rating__c>)RiskRatingController.getAll(null);
        resultlength = risks.size();
        System.assertEquals(true, resultlength>0);
    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}