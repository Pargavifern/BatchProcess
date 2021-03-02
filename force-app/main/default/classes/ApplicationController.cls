public with sharing class ApplicationController implements IController {
    @AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> applications = [Select Name,Amount__c, 
                        Approved_Date__c,Contact__c,CreatedById,Rate__c,
                        LastModifiedById,OwnerId,Loan_Product__c,Reason__c,Repayment_Frequency__c,Status__c,
                        Term__c,Initial_Payment_Date__c, Completion_Status__c from Application__c ORDER BY CreatedDate DESC LIMIT 1000];
        return applications;                        
    }

     @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }

    public static List<SObject> getAll(SObject value,String autoNumber){
        /* Application__c param;
        if(value == null)
            param = new Application__c();
        else
            param = (Application__c)value;
        String queryString = 'Select Name, Amount__c, Account__r.Name, LastModifiedById, OwnerId, Application_Date__c,'+
                        'Contact__r.Name, Approved_Date__c, Reason__c, Repayment_Frequency__c, Source__c, Status__c,'+
                         'Term__c, Initial_Payment_Date__c, Loan_Product__c, Completion_Status__c from Application__c where';
                   
        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
         if(!string.isBlank(param.Contact__c)){
            queryString += ' Contact__c = \'' + String.escapeSingleQuotes(param.Contact__c) +  '\' AND';
        }
          if(!string.isBlank(param.Account__c)){
            queryString += ' Account__c = \'' + String.escapeSingleQuotes(param.Account__c) +  '\' AND';
        }
          if(!string.isBlank(param.CreatedById)){
            queryString += ' CreatedById = \'' + String.escapeSingleQuotes(param.CreatedById) +  '\' AND';
        }
        if(!string.isBlank(param.LastModifiedById)){
            queryString += ' LastModifiedById = \'' + String.escapeSingleQuotes(param.LastModifiedById) +  '\' AND';
        }
        if(!string.isBlank(param.OwnerId)){
            queryString += ' OwnerId = \'' + String.escapeSingleQuotes(param.OwnerId) +  '\' AND';
        }
        if(!string.isBlank(param.Loan_Product__c)){
            queryString += ' Loan_Product__c = \'' + String.escapeSingleQuotes(param.Loan_Product__c) +  '\' AND';
        }
         if(!string.isBlank(param.Reason__c)){
            queryString += ' Reason__c = \'' + String.escapeSingleQuotes(param.Reason__c) +  '\' AND';
        }
         if(!string.isBlank(param.Repayment_Frequency__c)){
            queryString += ' Repayment_Frequency__c = \'' + String.escapeSingleQuotes(param.Repayment_Frequency__c) +  '\' AND';
        }
         if(!string.isBlank(param.Status__c)){
            queryString += ' Status__c = \'' + String.escapeSingleQuotes(param.Status__c) +  '\' AND';
        }
         if(!string.isBlank(param.Source__c))
         {
            queryString += ' Source__c = \'' + String.escapeSingleQuotes(param.Source__c) +  '\' AND';
        }
        if(param.Amount__c  != Null){
            queryString += ' Amount__c = '+ param.Amount__c +' AND';
        }
        if(param.Term__c  != Null){
            queryString += ' Term__c = '+ param.Term__c +' AND';
        }
        if(param.Approved_Date__c != Null){       
            String formatedDate = DateUtility.formatDateTime(param.Approved_Date__c, 'yyyy-MM-dd\'T\'hh:mm:ss\'Z\' AND');
            queryString += ' Approved_Date__c = '+ formatedDate +' AND';
        }
        if(param.Initial_Payment_Date__c != Null)
        {
            String formatedDate = DateUtility.formatDateTime(param.Initial_Payment_Date__c, 'yyyy-MM-dd\'T\'hh:mm:ss\'Z\' AND');
            queryString += 'Initial_Payment_Date__c = ' + formatedDate +' AND';
        }
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');
        List<SObject> application = Database.query(queryString);
        System.debug(application); */
        return null;// application;
    }
    @AuraEnabled
    public static SObject getById(Id id){

        SObject application = [Select Name,Amount__c,
                                    Approved_Date__c,Contact__c,CreatedById,Rate__c,Final_Rate__c,Completion_Status__c,RecordType.Name,Account__r.Name,
                                    LastModifiedById,OwnerId,Loan_Product__c,Reason__c,Repayment_Frequency__c,Status__c,Disbursal_Date__c,recordTypeId,
                                    Account__r.ShippingStreet,Account__r.ShippingCity,Account__r.ShippingState,Account__r.ShippingCountry,
                               		Account__r.ShippingPostalCode, Contact__r.Name,Contact__r.MailingStreet,Contact__r.MailingCity,
                               		Contact__r.MailingState,Contact__r.MailingCountry,Contact__r.MailingPostalCode, Term__c, Periods_Deferred_with_Grace__c,
                               		Balloon_Amount__c,Seasonal_Payment_Amount__c,Pay_Seasonal_Interest__c,Repeat_Seasonal_Periods__c,
                                    Seasonal_Periods__c,Loan_Product__r.Interest_Calculation_Method__c,Loan_Product__r.Day_Count__c,
                                    Loan_Product__r.Interest_Compounding_Frequency__c,Initial_Payment_Date__c from Application__c
                               where id=:id]; 
        
        
        return application; 
    }
   @AuraEnabled
    public static List<SObject> getSource(){
        List<SObject> applications = [Select Name,Amount__c,
                                        Approved_Date__c,Contact__r.Name,CreatedById,Rate__c,
                                        LastModifiedById,OwnerId,Loan_Product__c,Reason__c,Application_Date__c,Repayment_Frequency__c,Status__c,
                                        Term__c,Initial_Payment_Date__c, Completion_Status__c from Application__c 
                                      where Status__c != 'Complete' AND Source__c='Online' 
                                      ORDER BY CreatedDate DESC LIMIT 1000];
        return applications;                       
    }
    @AuraEnabled
    public static Id create(SObject value){
        Application__c application =  (Application__c)value;
        application.Status__c='New';
        if(application.RecordTypeId == null){
            application.RecordTypeId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Loan').getRecordTypeId();     
        }
        insert application;
        return application.id;
    }

    public Boolean createMany(List<SObject> values){
       // List<Application__c> applications =  (List<Application__c>)values;
       // insert applications;
        return true;
    }
    public Boolean edit(SObject value){
        Application__c application =  (Application__c)value;
        update application;
        return true;
    }

    @AuraEnabled
    public static Boolean editMany(List<SObject> values){
        List<Application__c> applications =  (List<Application__c>)values;
        update applications;
        return true;
    }
    public static Boolean remove(Id id){
       // Application__c application = [Select Id from Application__c where id=:id];
      //  delete application; 
        return true;
    }
}