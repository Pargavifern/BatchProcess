@IsTest
private with sharing class TestDocumentController {
    private static ContentVersion cv;

    @IsTest
    private static Id testSaveFile(){
        Account account =new Account();
        account.Name ='Test';
        insert account;

        Document_Type__c type = new Document_Type__c();
        type.Name = 'Test';
        insert type;

        cv = DocumentController.saveFile(account.id,'testFile','blob', type.Id,Date.today(),'Description');

        System.assertNotEquals(null, cv.Id);
        return Account.Id;
    }
    
    @IsTest
    private static void testRelatedFiles(){
       
        Id id = testSaveFile();
        list<contentversion> cvList = DocumentController.relatedFiles(id);
        System.assertEquals(true, cvList.size()>0);
        
    }
    
    @IsTest
    private static void testGetTypes(){
        List<Document_Type__c> types = DocumentController.getTypes('');
        System.assertEquals(false, types.size()>0);
    }

    @IsTest
    private static void testDeleteFile(){
        Id id = testSaveFile();
        boolean isTrue = DocumentController.deleteFile(cv.id);
        System.assertEquals(true, isTrue);
    }
   
    @IsTest
    private static void testGetDocumentTemplate(){
        list<Document_Template__c> dTemplates = DocumentController.getDocumentTemplate('');
        System.assertEquals(false, dTemplates.size()>0);
        
    }
    
}