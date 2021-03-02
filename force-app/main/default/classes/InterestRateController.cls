public with sharing class InterestRateController implements IController,IInterestRateController {
    
    public Interest_Rate__c getCurrentRate(Id InterestProductId){
        try{        
            Interest_Rate__c record = [Select Rate__c,Effective_Date__c 
            from  Interest_Rate__c
             where Interest_Product__c=:InterestProductId
             And Effective_Date__c <=TODAY
             ORDER BY Effective_Date__c DESC LIMIT 1 ];
            return record;
        }
        catch(Exception ex){
            return null;
        }
    }
    public List<SObject> getAll(){
        List<SObject> interestRates = [Select Rate__c,LastModifiedById, Name,Interest_Product__c,Effective_Date__c,CreatedById from Interest_Rate__c ORDER BY CreatedDate DESC LIMIT 1000];
        return interestRates;                        
    }
    public List<SObject> getAll(SObject value){
        return getAll(value,null);
    }

    public List<SObject> getAll(SObject value,String autoNumber){
        Interest_Rate__c param = (Interest_Rate__c)Value;
        String queryString = 'Select Rate__c,LastModifiedById, Name,Interest_Product__c,Effective_Date__c,CreatedById from Interest_Rate__c where';

        
        if(!string.isBlank(autoNumber)){
            queryString +=' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(param.Rate__c  != Null){
            queryString += ' Rate__c = '+ param.Rate__c +' AND';
        }
        if(!string.isBlank(param.Interest_Product__c)){
            queryString += ' Interest_Product__c = \'' + String.escapeSingleQuotes(param.Interest_Product__c) +  '\' AND';
        }
        if(param.Effective_Date__c != Null){       
            Date eDate = Date.valueOf(param.Effective_Date__c);
            queryString += ' Effective_Date__c =: eDate';
        }

        queryString = queryString.removeEnd(' AND');
        List<SObject> interestRates = Database.query(queryString);
        System.debug(interestRates);

        return interestRates;
    }

    public SObject getById(Id id){
        SObject interestRate = [Select Rate__c,LastModifiedById, Name,Interest_Product__c,Effective_Date__c,CreatedById from Interest_Rate__c where id=:id];
        return interestRate; 
    }

    public Id create(SObject value){
        Interest_Rate__c interestRate =  (Interest_Rate__c)value;
        insert interestRate;
        return interestRate.id;
    }

    public Boolean createMany(List<SObject> values){
        List<Interest_Rate__c> interestRates =  (List<Interest_Rate__c>)values;
        insert interestRates;
        return true;
    }
    public Boolean edit(SObject value){
        Interest_Rate__c interestRate =  (Interest_Rate__c)value;
        update interestRate;
        return true;
    }

    public Boolean editMany(List<SObject> values){
        List<Interest_Rate__c> interestRates =  (List<Interest_Rate__c>)values;
        update interestRates;
        return true;
    }
    public Boolean remove(Id id){
        Interest_Rate__c interestRate = [Select Id from Interest_Rate__c where id=:id];
        delete interestRate; 
        return true;
    }
}