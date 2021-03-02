@IsTest
private with sharing class TestCustomRelatedListController {
    @IsTest
    static void getAll(){
        Contact a = new Contact(LastName = 'Con', FirstName ='Sam');
        insert a;
        
        List<Contact> con = customRelatedListController.getRecords('Con', 'LastName', 'Contact', 'FirstName');
        Integer resultlength = con.size();
        System.assertEquals(true, resultlength > 0);
    }

}