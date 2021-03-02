public with sharing class SampleDataObjects {
    static Contact con = new Contact();
    static Account acc = new Account();
    static Loan_Product__c lPrd = new Loan_Product__c();
    static Application__c app = new Application__c();
    static Bank_Account__c bacc =  new Bank_Account__c();
    static Loan__c loan = new Loan__c();
	static Loan_Transaction__c tr = new Loan_Transaction__c();
    static Timeline_Event__c timeline = new Timeline_Event__c();
    static Benefit__c beni =  new Benefit__c();
    static Employment__c emp = new Employment__c();
	static Expense__c exp= new Expense__c();
    static Fund__c fund = new Fund__c();
    static Grant_Product__c gp = new Grant_Product__c();
    static Owner__c owner = new Owner__c();
    static Risk_Rating__c risk = new Risk_Rating__c();
    static Transaction_Line__c tline = new Transaction_Line__c(); 
    static WriteOff__c wOff =  new WriteOff__c();
    
    public sObject createTimeline(){
        createContact();
        timeline = new Timeline_Event__c();
        timeline.Event_Type__c ='New';
        timeline.Event_Date__c = date.today();
        timeline.Related_User_Id__c =UserInfo.getUserId();
        timeline.Title__c = 'test record';
        timeline.Event_Date__c = date.today();
        timeline.Related_Id__c = con.Id;
        timeline.Related_User_Id__c = con.LastModifiedById;
        timeline.Object_Id__c = con.Id;
        insert timeline;
        return timeline;
    }
  
    public sObject createContact(){
        con = new Contact();
        con.FirstName = 'First';
        con.LastName = 'Second';
        con.Email = 'abc@sample.com';
        con.Gender__c = 'Male';
        con.MobilePhone = '9989778877';
        con.Investment_Knowledge__c = 'High';
        insert con;
        return con;
    }
    
    public sObject createAccount(){
        acc = new Account();
        acc.Name = 'Account 1';
        insert acc;
        return acc;
    }
    
    public sObject createGrantProduct(){
        gp = new Grant_Product__c();
        gp.Name = 'GP';
        gp.Minimum_Amount__c = 100;
        gp.Maximum_Amount__c = 10000;
        insert gp;
        return gp;
    }
    
    public sObject createGrantApplication(string obj){
        createGrantProduct();
        app = new Application__c();
        if(obj == 'Contact'){
            createContact();
            app.Contact__c = con.Id;
            app.RecordTypeId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Personal Grant').getRecordTypeId();
        }
        else{
            createAccount();
            app.Account__c = acc.Id;
            app.RecordTypeId = Schema.SObjectType.Application__c.getRecordTypeInfosByName().get('Business Grant').getRecordTypeId();
        }
        app.Grant_Product__c = gp.Id;
        app.Application_Date__c = date.today();
        app.Amount__c = 1500;
        app.Status__c = 'New';
        app.Source__c = 'Online';
        insert app;
        
        return app;
    }
    
    public sObject createLoanProduct(string type){
        lPrd = new Loan_Product__c();
        lPrd.Minimum_Amount__c = 100;
        lPrd.Maximum_Amount__c = 100000;
        lprd.Maximum_Rate__c = 3;
        lPrd.Minimum_Rate__c = 5;
        lPrd.Minimum_Term__c = 4;
        lPrd.Maximum_Term__c = 34;
        lPrd.Name = 'LPRD';
        lPrd.Day_Count__c = 'Actual / Actual';
        if(type == 'Simple'){
            lPrd.Interest_Calculation_Method__c = 'Simple';
        	lPrd.Interest_Compounding_Frequency__c = '';
        }
        else{
            lPrd.Interest_Calculation_Method__c = 'Compound';
        	lPrd.Interest_Compounding_Frequency__c = 'Daily';
        }
        
        insert lPrd;
        return lPrd;
    }
    
    public sObject createApplication(string obj,string type){
        CreateLoanProduct(type);
        app = new Application__c();
        if(obj == 'contact'){
            createContact();
            app.Contact__c = con.Id;
        }
        else{
            createAccount();
            app.Account__c = acc.Id;
        }
        app.Loan_Product__c = lPrd.Id;
        app.Amount__c = 25000;
        app.Term__c = 10;
        app.Rate__c = 4;
        app.Application_Date__c = date.today();
        app.Status__c = 'New';
        app.Source__c = 'Online';
        ApplicationController.create(app);
        return app;
    }
    
    public sObject createBankAccount(string obj){
        bacc = new Bank_Account__c();
        if(obj == 'Contact'){
            bacc.Client__c = con.Id;
        }
        else{
            bacc.Account__c = acc.Id;
        }
        bacc.Account_Type__c = 'Savings';
        insert bacc;
        return bacc;
    }
    
    public sObject createFund(){
        fund = new Fund__c();
        fund.Name = 'Fund 1';
        insert fund;
        return fund;
    }
    
    public sObject createLoan(string obj, string type){
        createApplication(obj, type);
        createFund();
        loan = new Loan__c();
        if(obj == 'Contact'){
            loan.Contact__c = con.Id;
        }
        else{
            loan.Account__c = acc.Id;
        }
        loan.Application__c = app.Id;
        loan.Amount__c = 25000;
        loan.Status__c = 'Pending';
        loan.Loan_Product__c = lPrd.Id;
        loan.Reason__c = 'Other';
        loan.Fund__c = fund.Id;
        insert loan;
        return loan;
    }
    
    public sObject createTransaction(string obj, string type){
        createLoan(obj,type);
        tr = new Loan_Transaction__c();
        tr.Closing_Balance__c = 100;
        tr.Type__c = 'Disbursal';
        tr.Created_Date__c = date.today();
        tr.Loan_lineNumber__c = 1;
        tr.Loan__c = loan.Id;
        tr.Transaction_Date__c = date.today();
        insert tr;
        
        return tr;
    }
    
    public sObject createTransactionLine(string obj, string type){
        createTransaction(obj,type);
        tline = new Transaction_Line__c();
        tline.Type__c = 'Principal';
        tline.Amount__c = 100;
        tline.Transaction__c = tr.Id;
        insert tline;
        
        loan.Disbursed_Date__c = date.today(); // for schedule this needed
        loan.Status__c = 'Live';
        update loan;
        
        return tline;
    }

    public sObject createBenefit(){
        createContact();
        beni =  new Benefit__c();
        beni.Name = 'lottery';
        beni.Contact__c = con.Id;
        beni.Amount__c = 2500;
        insert beni;
        return beni;
    }
    
    public sObject createEmployment(){
        createContact();
        Date d = date.today();
        emp = new Employment__c();
        emp.Name = 'Employer';
        emp.Contact__c = con.Id;
        emp.Type__c = 'Student';
        emp.Start_Date__c = d;
        emp.End_Date__c = d.addDays(10);
        insert emp;
        return emp;
    }
    
    public sObject createExpense(){
        createContact();
        exp= new Expense__c();
        exp.Name = 'Purchase';
        exp.Amount__c = 2300;
        exp.Contact__c = con.Id;
        insert exp;
        return exp;
    }
    
    public sObject createOwner(){
        createContact();
        createAccount();
        owner = new Owner__c();
        owner.Contact__c = con.Id;
        owner.Account__c = acc.Id;
        owner.Share__c = 20;
        insert owner;
        return owner;
    }
    
    public sObject createRiskRating(){
        createAccount();
        risk = new Risk_Rating__c();
        risk.Account__c = acc.Id;
        risk.Category__c = 'Management';
        insert risk;
        return risk;
    }
    
    public sObject createWriteOff(string obj, string type){
        createLoan(obj,type);
        wOff.Loan__c = loan.Id;
        wOff.Principal__c = 40;
        wOff.Interest__c = 10;
        wOff.Fee__c = 10;
        insert wOff;
        return wOff;
    }
}