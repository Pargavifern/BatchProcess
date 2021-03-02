public with sharing  class GrantProductController implements IController {
     @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                 	Maximum_Amount__c,Minimum_Amount__c,Name,CreatedById,LastModifiedById 
                FROM  Grant_Product__c
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
       /* Grant_Product__c param;
        if(value == null)
            param = new Grant_Product__c();
        else
            param = (Grant_Product__c) value;

     	String queryString = 'Maximum_Amount__c,Minimum_Amount__c,Name,CreatedById,LastModifiedById  from Grant_Product__c where';
      if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
                if(param.Maximum_Amount__c  != Null){
            queryString += ' Maximum_Amount__c = '+ param.Maximum_Amount__c +' AND';
        }
        if(param.Minimum_Amount__c  != Null){
            queryString += ' Minimum_Amount__c = '+ param.Minimum_Amount__c +' AND';
        }
         queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');*/

        return null;// Database.query(queryString);
    }
    @AuraEnabled
    public static SObject getById(Id id){
        SObject entity = [SELECT Maximum_Amount__c,Minimum_Amount__c,Name,CreatedById,LastModifiedById 
                FROM  Grant_Product__c WHERE Id=:id];
        return entity; 
    }

   public Id create(SObject value) {
       // Grant_Product__c entity = (Grant_Product__c)value;
        return null;// entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
       // List<Grant_Product__c> entities = (List<Grant_Product__c>)values;
       // insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
       // Grant_Product__c entity = (Grant_Product__c)value;
       // update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
       // List<Grant_Product__c> entities = (List<Grant_Product__c>)values;
       // update entities;
        return true;
    }

     public Boolean remove(Id id) {
       // Grant_Product__c entity = [SELECT Id FROM Grant_Product__c WHERE Id=:id];
       // delete entity; 
        return true;
    }
}