@IsTest
private with sharing class TestTransactionLineController {
	static ITransactionLine controller = new TransactionLineController();
    static SampleDataObjects dataSet = new SampleDataObjects();
    
    static Transaction_Line__c tl = new Transaction_Line__c();
    static WriteOff__c wf = new WriteOff__c();
    
    @IsTest
    static void getAll(){
        List<Loan_Transaction__c> tlList = new List<Loan_Transaction__c>();
        
        tl = (Transaction_Line__c) dataSet.createTransactionLine('Contact','Simple');
		Loan_Transaction__c tr = [select Loan__c from Loan_Transaction__c where Id =: tl.Transaction__c];
        
        Integer resultlength ;
        tlList = (List<Loan_Transaction__c>)controller.getAllRelatedLoan(tr.Loan__c);
        resultlength = tlList.size();
        System.assertEquals(true, resultlength > 0);
        
        tlList = (List<Loan_Transaction__c>)controller.getAllRelatedByLimit(tr.Loan__c,1);
        resultlength = tlList.size();
        System.assertEquals(true, resultlength > 0);
        
        tlList = (List<Loan_Transaction__c>)controller.getAllRelatedByDay(tr.Loan__c,1);
        resultlength = tlList.size();
        System.assertEquals(true, resultlength > 0);
        
        Loan_Transaction__c tr1 =  new Loan_Transaction__c();
        tr1.Closing_Balance__c = 100;
        tr1.Type__c = 'Disbursal';
        tr1.Created_Date__c = date.today();
        tr1.Loan_lineNumber__c = 2;
        tr1.Loan__c = tr.Loan__c;
        tr1.Transaction_Date__c = date.today();
        insert tr1;
        
        Transaction_Line__c tl1 = new Transaction_Line__c();
        tl1.Transaction__c = tr1.Id;
        tl1.Type__c = 'Principal';
        tl1.Amount__c = 100;
        insert tl1;
    }
    
    @IsTest
    static void getWriteoffSum(){
        wf = (WriteOff__c) dataSet.createWriteOff('Contact','Simple');
        List<Id> ids = new List<Id>{wf.Loan__c};
        List<writeoffSummaryResult> res = TransactionLineController.getWriteoffSum(ids);
        System.assertNotEquals(null, res);
    }
    
    @IsTest
    static void forLineCoverage(){
        tl = (Transaction_Line__c) dataSet.createTransactionLine('Contact','Compound');
    }
}