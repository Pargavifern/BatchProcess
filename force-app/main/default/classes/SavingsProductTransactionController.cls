public class SavingsProductTransactionController implements IController{
 @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Name, Type__c, Savings_Account__c, Transaction_Date__c, Reversed__c, Reversed_Transaction__c, 
                (SELECT Id, Amount__c, Type__c, Description__c FROM Savings_Transaction_Lines__r) 
                FROM Savings_Product_Transaction__c	
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        Savings_Product_Transaction__c param = (Savings_Product_Transaction__c)Value;
        String queryString = 'Select Name, Type__c, Savings_Account__c, Transaction_Date__c, Reversed__c, Reversed_Transaction__c,'+
            				' (Select Id, Amount__c, Type__c, Description__c FROM Savings_Transaction_Lines__r)'+
            					' FROM Savings_Product_Transaction__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
       
        if (!string.isBlank(param.Type__c)) {
            queryString += 'Type__c   = \'' + String.escapeSingleQuotes(param.Type__c) + '\' AND';
        }
        
        if (!string.isBlank(param.Savings_Account__c)) {
            queryString += ' Savings_Account__c = \'' + String.escapeSingleQuotes(param.Savings_Account__c) + '\' AND';
        }

        if(param.get('Reversed__c') != Null){
        	queryString += ' Reversed__c = '+ param.Reversed__c;
        }
        
        queryString = queryString.removeEnd(' AND');
		queryString += ' ORDER BY Name desc';
        
        return Database.query(queryString);
    }

    @AuraEnabled
    public static SObject getById(Id id){
        SObject entity = [SELECT 
                          Name, Type__c, Savings_Account__c, Transaction_Date__c, Reversed__c, Reversed_Transaction__c,
                          (SELECT Id, Amount__c, Type__c, Description__c FROM Savings_Transaction_Lines__r)
                        FROM Savings_Product_Transaction__c
                        WHERE Id=:id];
        return entity; 
    }

    public Id create(SObject value) {
        Savings_Product_Transaction__c entity = (Savings_Product_Transaction__c)value;
        return entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        List<Savings_Product_Transaction__c> entities = (List<Savings_Product_Transaction__c>)values;
        insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        Savings_Product_Transaction__c entity = (Savings_Product_Transaction__c)value;
        update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
        List<Savings_Product_Transaction__c> entities = (List<Savings_Product_Transaction__c>)values;
        update entities;
        return true;
    }

    public Boolean remove(Id id) {
        Savings_Product_Transaction__c entity = [SELECT Id FROM Savings_Product_Transaction__c WHERE Id=:id];
        delete entity; 
        return true;
    }
}