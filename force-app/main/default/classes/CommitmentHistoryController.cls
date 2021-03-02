public class CommitmentHistoryController implements IController{
@AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Name, Amount__c, Reason__c, Loan__c, Date__c, Type__c, Amount_Sign__c
                FROM Commitment_History__c
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        Commitment_History__c param = (Commitment_History__c)value;
        String queryString = 'Select Name, Amount__c, Reason__c, Loan__c, Date__c, Type__c, Amount_Sign__c'+
                        'Total_Transferred__c,Maturity_Date__c,Refinanced__c from Commitment_History__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
        if(param.Amount__c  != Null){
            queryString += ' Amount__c = '+ param.Amount__c +' AND';
        }
        
        if (!string.isBlank(param.Loan__c)) {
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(param.Loan__c) + '\' AND';
        }
        if (param.Date__c != Null) {
            queryString += ' Date__c = '+ param.Date__c +' AND';
        }        
        if (!string.isBlank(param.Type__c)) {
            queryString += ' Type__c = \'' + String.escapeSingleQuotes(param.Type__c) + '\' AND';
        }

        if (!string.isBlank(param.Reason__c)) {
            queryString += ' Reason__c = \'' + String.escapeSingleQuotes(param.Reason__c) + '\' AND';
        }

        queryString = queryString.removeEnd(' AND');
		List<SObject> entities=Database.query(queryString);
        return entities;
    }

    @AuraEnabled
    public static SObject getById(Id id){
        SObject entity = [SELECT
                            Name, Amount__c, Reason__c, Loan__c, Date__c, Type__c, Amount_Sign__c 
                        FROM Commitment_History__c
                        WHERE Id=:id];
        return entity; 
    }

    public Id create(SObject value) {
        Commitment_History__c entity = (Commitment_History__c)value;
        return entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        List<Commitment_History__c> entities = (List<Commitment_History__c>)values;
        insert entities;
        return true;
    }

    public Boolean edit(SObject value) {
        Commitment_History__c entity = (Commitment_History__c)value;
        update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
        List<Commitment_History__c> entities = (List<Commitment_History__c>)values;
        update entities;
        return true;
    }

    @AuraEnabled
    public static Boolean remove(Id id) {
        Commitment_History__c entity = [SELECT Id FROM Commitment_History__c WHERE Id=:id];
        delete entity; 
        return true;
    }
    
    @AuraEnabled
    public static List<SObject> getAllByLimit(Id id){
        List<sObject> entities=[SELECT
                      Name,Amount__c, Reason__c, Loan__c, Date__c, Type__c, Amount_Sign__c
                 FROM Commitment_History__c
                 WHERE Loan__c = :id
                 ORDER BY Id DESC
                 LIMIT :7]; 
        return entities;
    }
}