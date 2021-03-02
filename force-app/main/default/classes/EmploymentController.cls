public with sharing class EmploymentController implements IController, IEmployment{
    @AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> employments = [Select Name,Contact__c,End_Date__c,LastModifiedById,
                                      CreatedById, Monthly_Income__c,Start_Date__c from Employment__c ORDER BY CreatedDate DESC LIMIT 1000];

        return employments;                        
    }
    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
       /* Employment__c param = (Employment__c)Value;
        String queryString = 'Select Name,Contact__c,End_Date__c,LastModifiedById,'+
                                      'CreatedById, Monthly_Income__c,Start_Date__c from Employment__c Where';

        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(!string.isBlank(param.LastModifiedById)){
            queryString += ' LastModifiedById = \'' + String.escapeSingleQuotes(param.LastModifiedById) +  '\' AND';
        }
        if(!string.isBlank(param.Contact__c)){
            queryString += ' Contact__c = \'' + String.escapeSingleQuotes(param.Contact__c) +  '\' AND';
        }
        if(!string.isBlank(param.CreatedById)){
            queryString += ' CreatedById = \'' + String.escapeSingleQuotes(param.CreatedById) +  '\'';
        }
        if(param.End_Date__c != Null){       
            String formatedDate = DateUtility.formatDate(param.End_Date__c, 'YYYY-MM-DD');
            queryString += ' End_Date__c = '+ formatedDate +' AND';
        }
        if(param.Start_Date__c != Null){       
            String formatedDate = DateUtility.formatDate(param.Start_Date__c, 'YYYY-MM-DD');
            queryString += ' Start_Date__c = '+ formatedDate +' AND';
        }
        if(param.Monthly_Income__c  != Null){
            queryString += ' Monthly_Income__c = '+ param.Monthly_Income__c +' AND';
        }
    
        queryString = queryString.removeEnd(' AND');
        List<SObject> employments = Database.query(queryString);
        System.debug(employments);*/

        return null; //employments;
    }

    public SObject getById(Id id){
        //SObject employment = [Select Name,Contact__c,End_Date__c,LastModifiedById,
                                     // CreatedById, Monthly_Income__c,Start_Date__c from Employment__c where id=:id];
        return null; //employment; 
    }

    public Id create(SObject value){
       // Employment__c employment =  (Employment__c)value;
       // insert employment;
        return null; //employment.id;
    }

    public Boolean createMany(List<SObject> values){
        //List<Employment__c> employments =  (List<Employment__c>)values;
        //insert employments;
        return true;
    }
    public Boolean edit(SObject value){
       // Employment__c employment =  (Employment__c)value;
        //update employment;
        return true;
    }

    public Boolean editMany(List<SObject> values){
       // List<Employment__c> employments =  (List<Employment__c>)values;
        //update employments;
        return true;
    }
    public Boolean remove(Id id){
       // Employment__c employment= [Select Id from Employment__c where id=:id];
        //delete employment; 
        return true;
    }
    
    @AuraEnabled
    public static List<SObject> getActiveIncome(SObject value){
        Employment__c param = (Employment__c)value;
        String queryString = 'Select Monthly_Income__c from Employment__c Where';
        if(!string.isBlank(param.Contact__c)){
            queryString += ' Contact__c = \'' + String.escapeSingleQuotes(param.Contact__c) +  '\' AND';
        }
		if(param.End_Date__c != Null){       
            Date eDate = Date.valueOf(param.End_Date__c);
            queryString += ' (End_Date__c >=: eDate OR End_Date__c=null)';
        }
        List<SObject> employments = Database.query(queryString);
		System.debug(employments);
        return employments;
    }
}