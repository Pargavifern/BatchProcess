public with sharing  class BenefitController implements IController{
    @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Name,Contact__c,Amount__c	
                FROM Benefit__c	
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        Benefit__c param;
        if(value == null)
            param = new Benefit__c();
        else
            param  = (Benefit__c)Value;
        String queryString = 'Select Name,Contact__c,Amount__c from Benefit__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
       
        if (!string.isBlank(param.Contact__c)) {
            queryString += ' Contact__c   = \'' + String.escapeSingleQuotes(param.Contact__c) + '\' AND';
        }
        if(param.Amount__c  != Null){
            queryString += ' Amount__c = '+ param.Amount__c;
        } 


        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');

        return Database.query(queryString);
    }

    @AuraEnabled
    public static SObject getById(Id id){
        /*SObject entity = [SELECT Name,Contact__c,Amount__c       
                        FROM Benefit__c
                        WHERE Id=:id];*/
        return null;// entity; 
    }

    public Id create(SObject value) {
        //Benefit__c entity = (Benefit__c)value;
        return null;//entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
       // List<Benefit__c> entities = (List<Benefit__c>)values;
       // insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        //Benefit__c entity = (Benefit__c)value;
        //update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
       // List<Benefit__c> entities = (List<Benefit__c>)values;
        //update entities;
        return true;
    }

    public Boolean remove(Id id) {
       // Benefit__c entity = [SELECT Id FROM Benefit__c WHERE Id=:id];
       // delete entity; 
        return true;
    }  
}