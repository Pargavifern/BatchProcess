@IsTest
private with sharing class TestLookupController {
	static SampleDataObjects dataSet = new SampleDataObjects();
    
    @IsTest
    static void getValues(){
        Contact con = (Contact) dataSet.createContact();
        Integer resultlength = 0;
        
        List<Contact> cList = LookupController.lookUp('First', 'Contact', 'Gender__c = \'Male\'');
        resultlength = cList.size();
        System.assertEquals(true, resultlength > 0);
        
        List<Contact> cList2 = LookupController.lookUp('First', 'Contact', '');
        resultlength = cList2.size();
        System.assertEquals(true, resultlength > 0);
        
        List<Contact> cList1 = LookupController.lookUp(null, 'Contact',null);
        resultlength = cList1.size();
        System.assertEquals(true, resultlength > 0);
        
        
    }
}