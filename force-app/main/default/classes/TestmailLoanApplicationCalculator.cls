@IsTest
private with sharing class TestmailLoanApplicationCalculator {
	static SampleDataObjects dataSet = new SampleDataObjects();
    
    static Contact con = new Contact();
    static Map<String,String> details = new  Map<String,String>();
    static string t;
    
    static void create(){
        con = (Contact) dataset.createContact();
        t = 'paymentNumber,paymentDate,remainingBalance,interestPaid,principal,totalPayment,'+
          		  '"1","20 Mar 2021","77551.55","267.28","38665.45","38932"';
        details.put('paymentNumber','1');
        details.put('datePaid','17 May 2021');
        details.put('interest','6');
        details.put('loanPrdName','ASP');
        details.put('payment','1');
        details.put('repayment','Monthly Payment');
        details.put('schedule',t);
        details.put('term','1');
        details.put('interestProductName', 'interest product');
    }
    
    @IsTest(SeeAllData=true)
    static void testsendEmailValidation(){
        create();
        try{
            string a = (string) mailLoanApplicationCalculator.sendMail(con.Id, details);
        	System.assertEquals('success', a);
        }
        catch(Exception e){
            
        }        
    }
    
    @IsTest(SeeAllData=true)
    static void testsendEmail(){
        create();
        t +=',"2","17 Apr 2021","58234.54","222.15","29013.79","29235.94",'+
				'"3","17 May 2021","29142.1","143.49","29092.45","29235.94",'+
				'"4","17 Jun 2021","0","74.2","29142.1","29216.3"';
        details.put('schedule',t);
        details.put('amount','789787');
        details.put('payment','4');
        details.put('term','4');
        string a = (string) mailLoanApplicationCalculator.sendMail(con.Id, details);
       	System.assertEquals('success', a);       
    }
}