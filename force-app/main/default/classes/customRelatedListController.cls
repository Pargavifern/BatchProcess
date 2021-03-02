public with sharing class customRelatedListController {
    
    @AuraEnabled 
    public static List<SObject> getRecords(string filterId, string relatedFieldApiName, string objectApiName,String fields){
        String query = 'Select '+fields+' From '+objectApiName+' WHERE ' +relatedFieldApiName+ '= :filterId';
        return Database.query(String.escapeSingleQuotes(query));
    }
}