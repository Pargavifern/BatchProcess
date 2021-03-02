public with sharing  class OwnerController implements IController {
    @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Contact__c,Share__c,Account__c
                FROM Owner__c	
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value,String autoNumber){
        Owner__c param;
        if(value == null)
            param = new Owner__c();
        else
            param  = (Owner__c)Value;
        String queryString = 'Select Name, Contact__c, Share__c from Owner__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
       
        if (!string.isBlank(param.Contact__c)) {
            queryString += ' Contact__c   = \'' + String.escapeSingleQuotes(param.Contact__c) + '\' AND';
        }
         if (!string.isBlank(param.Account__c)) {
            queryString += ' Account__c   = \'' + String.escapeSingleQuotes(param.Account__c) + '\' AND';
        }
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');

        return Database.query(queryString);
    }

    @AuraEnabled
    public static SObject getById(Id id){
        /*SObject entity = [SELECT Name, Contact__c, Share__c,Account__c
                            FROM Owner__c
                        WHERE Id=:id];*/
        return null; //entity; 
    }

    public Id create(SObject value) {
        //Owner__c entity = (Owner__c)value;
        return null;// entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        //List<Owner__c> entities = (List<Owner__c>)values;
        //insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        //Owner__c entity = (Owner__c)value;
        //update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
        //List<Owner__c> entities = (List<Owner__c>)values;
       //update entities;
        return true;
    }

    public Boolean remove(Id id) {
        //Owner__c entity = [SELECT Id FROM Owner__c WHERE Id=:id];
       // delete entity; 
        return true;
    }
}