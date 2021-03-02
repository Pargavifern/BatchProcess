public class LoanHistoryTrackController implements IController{
@AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> lTrack = [Select Name, OldValue__c, NewValue__c, Loan__c from Loan_History_Track__c ORDER BY CreatedDate DESC LIMIT 1000];
        return lTrack;                        
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }

    public static List<SObject> getAll(SObject value,String autoNumber){
        Loan_History_Track__c param = (Loan_History_Track__c)value;
        String queryString = 'Select Name, OldValue__c, NewValue__c, Loan__c from Loan_History_Track__c where';

        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(!string.isBlank(param.OldValue__c)){
            queryString += ' OldValue__c = \'' + String.escapeSingleQuotes(param.OldValue__c) +  '\' AND';
        }
        if(!string.isBlank(param.NewValue__c)){
            queryString += ' NewValue__c = \'' + String.escapeSingleQuotes(param.NewValue__c) +  '\' AND';
        }
        if(!string.isBlank(param.Loan__c)){
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(param.Loan__c) +  '\' AND';
        }
    
        queryString = queryString.removeEnd(' AND');
        List<SObject> lTrack = Database.query(queryString);
        System.debug(lTrack);

        return lTrack;
    }

    @AuraEnabled
    public static SObject getById(Id id){
        SObject lTrack = [Select Name, OldValue__c, NewValue__c, Loan__c from Loan_History_Track__c where id=:id]; 
        return lTrack; 
    }
    @AuraEnabled
    public static Id create(SObject value){
        Loan_History_Track__c lTrack =  (Loan_History_Track__c)value;
        insert lTrack;
        return lTrack.id;
    }

    public Boolean createMany(List<SObject> values){
        List<Loan_History_Track__c> lTrack =  (List<Loan_History_Track__c>)values;
        insert lTrack;
        return true;
    }
    public Boolean edit(SObject value){
        Loan_History_Track__c lTrack =  (Loan_History_Track__c)value;
        update lTrack;
        return true;
    }

    public Boolean editMany(List<SObject> values){
        List<Loan_History_Track__c> lTrack =  (List<Loan_History_Track__c>)values;
        update lTrack;
        return true;
    }
    public Boolean remove(Id id){
        Loan_History_Track__c lTrack = [Select Id from Loan_History_Track__c where id=:id];
        delete lTrack; 
        return true;
    }
}