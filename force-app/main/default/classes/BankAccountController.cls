public with sharing  class BankAccountController implements IController {
    @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Account_Type__c,Client__c	
                FROM Bank_Account__c	
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        /*Bank_Account__c param;
        if(value == null)
            param = new Bank_Account__c();
        else
            param  = (Bank_Account__c)Value;
        String queryString = 'Select Name, Account_Type__c, Client__c from Bank_Account__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
       
        if (!string.isBlank(param.Account_Type__c)) {
            queryString += 'Account_Type__c   = \'' + String.escapeSingleQuotes(param.Account_Type__c) + '\' AND';
        }
        
        if (!string.isBlank(param.Client__c)) {
            queryString += ' Client__c = \'' + String.escapeSingleQuotes(param.Client__c) + '\' AND';
        }


        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');*/

        return null; //Database.query(queryString);
    }

    @AuraEnabled
    public static SObject getById(Id id){
       /* SObject entity = [SELECT Name, Account_Type__c, Client__c
                           
                        FROM Bank_Account__c
                        WHERE Id=:id];*/
        return null;// entity; 
    }

    public Id create(SObject value) {
        //Bank_Account__c entity = (Bank_Account__c)value;
        return null;// entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        //List<Bank_Account__c> entities = (List<Bank_Account__c>)values;
        //insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        Bank_Account__c entity = (Bank_Account__c)value;
        update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
        //List<Bank_Account__c> entities = (List<Bank_Account__c>)values;
        //update entities;
        return true;
    }

    public Boolean remove(Id id) {
        //Bank_Account__c entity = [SELECT Id FROM Bank_Account__c WHERE Id=:id];
        //delete entity; 
        return true;
    }
}