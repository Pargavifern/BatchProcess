public with sharing class LoanController  implements IController {
    @AuraEnabled
    public static List<SObject> getAll(){
        return [SELECT
                    Name,Amount__c, Application__c,Account__c,Undisbursed_Amount__c,Recommitted_Amount__c ,
                    Contact__c,Balance_Fees__c, Balance_Interest__c, Balance_Principal__c, 
                    Fund__c, LastModifiedById,Notes__c,Paid_Date__c,Total_Fees__c, Total_Interest__c, 
                    Loan_Product__c,Rating__c,Reason__c,CreatedById,Status__c,Decommitted_Amount__c,
                    Number_of_Payments__c, Total_Disbursed_Interest__c,Total_Disbursed__c,Last_Interest_Charged_Date__c,
                    Total_Paid__c,Total_Reversed__c,Total_Principal_Positive__c,Refinanced__c,
                    Total_Transferred__c,Maturity_Date__c,Total_Fees_Positive__c,Total_Interest_Positive__c,Total_Paid_Positive__c,
                	Insurance__c, Cash_Flow_Forecast__c,Business_Licence__c,Financial_Information__c
                FROM Loan__c
                ORDER BY CreatedDate DESC
                LIMIT 1000];                         
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }
    public static List<SObject> getAll(SObject value,String autoNumber){
        Loan__c param;
        if(value ==  null )
            param = new Loan__c();
        else
            param = (Loan__c)value;
        String queryString = 'Select Name,Amount__c, Application__c,Undisbursed_Amount__c,Decommitted_Amount__c,Last_Interest_Charged_Date__c,'+
                        'Contact__c,Balance_Fees__c, Balance_Interest__c, Balance_Principal__c,Recommitted_Amount__c ,'+
                        'Fund__c, LastModifiedById,Notes__c,Paid_Date__c,Total_Fees_Positive__c,Total_Interest_Positive__c,Total_Paid_Positive__c,'+
                        'Loan_Product__c,Rating__c,Reason__c,CreatedById,Status__c,Total_Disbursed_Interest__c,Total_Disbursed__c,'+ 
                        'Number_of_Payments__c, Total_Fees__c, Total_Interest__c, Total_Principal__c,'+
                        'Total_Paid__c,Total_Reversed__c,Total_Principal_Positive__c,Insurance__c, Cash_Flow_Forecast__c,Business_Licence__c,Financial_Information__c,'+
                        'Total_Transferred__c,Maturity_Date__c,Refinanced__c from Loan__c where';

        if(!string.isBlank(autoNumber)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
        if(param.Amount__c  != Null){
            queryString += ' Amount__c = '+ param.Amount__c +' AND';
        }
        
        if (!string.isBlank(param.Application__c)) {
            queryString += ' Application__c = \'' + String.escapeSingleQuotes(param.Application__c) + '\' AND';
        }
         if (!string.isBlank(param.Account__c)) {
            queryString += ' Account__c = \'' + String.escapeSingleQuotes(param.Account__c) + '\' AND';
        }
        if (!string.isBlank(param.Contact__c)) {
            queryString += ' Contact__c = \'' + String.escapeSingleQuotes(param.Contact__c) + '\' AND';
        }
        if (!string.isBlank(param.Fund__c)) {
            queryString += ' Fund__c = \'' + String.escapeSingleQuotes(param.Fund__c) + '\' AND';
        }     
        
        if (!string.isBlank(param.Loan_Product__c)) {
            queryString += ' Loan_Product__c = \'' + String.escapeSingleQuotes(param.Loan_Product__c) + '\' AND';
        }

        if (!string.isBlank(param.Reason__c)) {
            queryString += ' Reason__c = \'' + String.escapeSingleQuotes(param.Reason__c) + '\' AND';
        }
        
        if (!string.isBlank(param.Status__c)) {
            queryString += ' Status__c = \'' + String.escapeSingleQuotes(Param.Status__c) + '\'';
        }

        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' where');
		List<SObject> entities=Database.query(queryString);
        return entities;
    }

    @AuraEnabled
    public static SObject getById(Id id){
       SObject entity = [SELECT
                            Name,Amount__c, Application__c,Balance__c,Disbursed_Date__c,Account__c,Undisbursed_Amount__c,
                            Contact__c,Balance_Fees__c, Balance_Interest__c, Balance_Principal__c,Recommitted_Amount__c ,Decommitted_Amount__c,
                            Fund__c, LastModifiedById,Notes__c,Paid_Date__c,Total_Fees_Positive__c,Total_Interest_Positive__c,Total_Paid_Positive__c,
                            Loan_Product__c,Rating__c,Reason__c,CreatedById,Status__c,Insurance__c, Cash_Flow_Forecast__c,Business_Licence__c, 
                            Number_of_Payments__c,Total_Fees__c, Total_Interest__c, Total_Principal__c,Financial_Information__c,Last_Interest_Charged_Date__c,
                            Total_Paid__c,Total_Reversed__c,Total_Disbursed_Interest__c,Total_Disbursed__c,
                            Total_Transferred__c,Maturity_Date__c,Total_Principal_Positive__c, Refinanced__c 
                        FROM Loan__c
                        WHERE Id=:id];
        return entity; 
    }

    public Id create(SObject value) {
        //Loan__c entity = (Loan__c)value;
        return null; //entity.Id;
    }

    public Boolean createMany(List<SObject> values) {
        //List<Loan__c> entities = (List<Loan__c>)values;
        //insert entities;
        return true;
    }

    public static Boolean edit(SObject value) {
        Loan__c entity = (Loan__c)value;
        update entity;
        return true;
    }

    public Boolean editMany(List<SObject> values) {
       // List<Loan__c> entities = (List<Loan__c>)values;
       // update entities;
        return true;
    }

    public Boolean remove(Id id) {
       // Loan__c entity = [SELECT Id FROM Loan__c WHERE Id=:id];
       // delete entity; 
        return true;
    }

    @AuraEnabled
    public static SObject chart(Id id){
   		sObject entities= [SELECT Total_Jobs_Created__c,Total_Jobs_Lost__c,Total_Jobs_Maintained__c, Application__r.Total_Jobs_Created__c,Application__r.Total_Jobs_Lost__c,Application__r.Total_Jobs_Maintained__c
  					FROM Loan__c  WHERE Id=:id];

   		return entities;
	}  
}