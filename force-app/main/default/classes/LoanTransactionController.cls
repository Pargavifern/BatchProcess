public class LoanTransactionController implements IController {
@AuraEnabled
 public static List<SObject> getAll() {
        return
            [SELECT
                Name, CreatedById, Created_Date__c,
                 LastModifiedById, 	Loan_lineNumber__c,Loan__c,
                Transaction_Date__c,Type__c,Total_Credit__c,Total_Debit__c
            FROM Loan_Transaction__c
            ORDER BY CreatedDate DESC
            LIMIT 1000];                       
    }

    @AuraEnabled
    public static List<SObject> getAll(SObject value) {
        return getAll(value, null);
    }

    public static List<SObject> getAll(SObject value, String autoNumber) {
        Loan_Transaction__c param;
        if(value == null)
            param = new Loan_Transaction__c();
        else
           param = (Loan_Transaction__c)value;

        String queryString =
            'SELECT Loan_lineNumber__c , Name, CreatedById,' +
            'Created_Date__c,  LastModifiedById,' +
            'Loan__c, Transaction_Date__c, Type__c,Total_Credit__c,Total_Debit__c,Balance_Principal__c,Closing_Balance__c'+
            ' FROM Loan_Transaction__c WHERE';

        if (!string.isBlank(autoNumber)) {
            queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
        }
        if (!string.isBlank(param.Type__c)) {
            queryString += ' Type__c = \'' + String.escapeSingleQuotes(param.Type__c) +  '\' AND';
        }

        if (!string.isBlank(param.Loan__c)) {
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(param.Loan__c) + '\' AND';
        }

        if (param.Transaction_Date__c != Null) {       
            String formattedDate = DateUtility.formatDateTime(param.Transaction_Date__c, 'yyyy-MM-dd\'T\'hh:mm:ss\'Z\'');
            queryString += ' Transaction_Date__c = '+ formattedDate +' AND';
        }

        if (param.Created_Date__c != Null) {       
            String formattedDate = DateUtility.formatDateTime(param.Created_Date__c, 'yyyy-MM-dd\'T\'hh:mm:ss\'Z\'');
            queryString += ' Created_Date__c = ' + formattedDate + ' AND';
        }

        if (!string.isBlank(param.Type__c)) {
            queryString += ' Type__c = \'' + String.escapeSingleQuotes(param.Type__c) +  '\'';
        }
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' WHERE');
		queryString+=' order by CreatedDate desc';
        return Database.query(queryString);
    }

    public static SObject getById(Id id) {
        SObject entity =
            [SELECT 
                Name, CreatedById, Created_Date__c,
                 LastModifiedById, 	Loan_lineNumber__c ,Loan__c,
                Transaction_Date__c,Type__c,Total_Credit__c,Total_Debit__c
            FROM Loan_Transaction__c
            WHERE id=:id];

        return entity; 
    }

    public static Id create(SObject value) {
        //Loan_Transaction__c entity = (Loan_Transaction__c)value;
        //insert entity;
        return null; //entity.id;
    }

    public static Boolean createMany(List<SObject> values) {
        //List<Loan_Transaction__c> entities = (List<Loan_Transaction__c>)values;
       // insert entities;
        return true;
    }

    public static Boolean edit(SObject value) {
        //Loan_Transaction__c entity = (Loan_Transaction__c)value;
       // update entity;
        return true;
    }

    public static Boolean editMany(List<SObject> values) {
       // List<Loan_Transaction__c> entity = (List<Loan_Transaction__c>)values;
        //update entity;
        return true;
    }

    public static Boolean remove(Id id) {
       // Loan_Transaction__c entity = [SELECT Id FROM Loan_Transaction__c WHERE Id=:id];
       // delete entity; 
        return true;
    }
}