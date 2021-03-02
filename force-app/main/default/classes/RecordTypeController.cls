public with sharing class RecordTypeController {
    @AuraEnabled
    public static SObject getByName(String na){
        SObject entity = [SELECT Name
                        FROM RecordType
                        WHERE Name=:na];
        return entity; 
    }

}