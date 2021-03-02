public class RiskRatingController implements IController{
	@AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                     Name, Account__c, Category__c, Category_Weight__c, Risk_Rating__c,Rationale__c, Rating__c	
                FROM Risk_Rating__c	
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        Risk_Rating__c param;
        if(value == null)
            param = new Risk_Rating__c();
        else
            param = (Risk_Rating__c)Value;
        String queryString = 'Select Name,  Account__c, Category__c, Category_Weight__c, Risk_Rating__c,Rationale__c, Rating__c from Risk_Rating__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
        
        if (!string.isBlank(param.Account__c)) {
            queryString += ' Account__c   = \'' + String.escapeSingleQuotes(param.Account__c) + '\' AND';
        }
       
        if (!string.isBlank(param.Category__c)) {
            queryString += ' Category__c   = \'' + String.escapeSingleQuotes(param.Category__c) + '\' AND';
        }
        
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');

        return Database.query(queryString);
    }

    @AuraEnabled
    public static SObject getById(Id id){
        /*SObject entity = [SELECT Name, Account__c, Category__c, Category_Weight__c, Risk_Rating__c,Rationale__c,Rating__c
                        FROM Risk_Rating__c
                        WHERE Id=:id];*/
        return null;// entity; 
    }

    public Id create(SObject value) {
        //Risk_Rating__c entity = (Risk_Rating__c)value;
        return null;// entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        List<Risk_Rating__c> entities = (List<Risk_Rating__c>)values;
        insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        //Risk_Rating__c entity = (Risk_Rating__c)value;
       // update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
       // List<Risk_Rating__c> entities = (List<Risk_Rating__c>)values;
        //update entities;
        return true;
    }

    public Boolean remove(Id id) {
       // Risk_Rating__c entity = [SELECT Id FROM Risk_Rating__c WHERE Id=:id];
       // delete entity; 
        return true;
    }
}