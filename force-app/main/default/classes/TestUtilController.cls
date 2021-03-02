@isTest
private with sharing class TestUtilController {
    
    @IsTest
    private static void TestGetObjectName(){
        Account account = new Account();
        account.Name = 'TestAccount';

        Insert account;
        Account account1 = new Account();
        account1.Name = 'TestAccount1';

        Insert account1;

        List<string> ids=new List<string>();
        ids.add(account.Id);
        ids.add(account1.Id);

        List<string> objectNames = UtilController.getObjectName(ids);
        System.assertEquals(true, objectNames.size()>0);

    }
}