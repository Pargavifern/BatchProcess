@IsTest
private with sharing class TestTimelineEventController {
	static IController controller = new TimelineEventController();
    static ITimelineEventController controllerExtention = new TimelineEventController();
    static Timeline_Event__c timeline = new Timeline_Event__c();
    static Contact con = new Contact();
    static Account acc = new Account();
    static Loan_Product__c lPrd = new Loan_Product__c();
    static Application__c app = new Application__c();
    static Bank_Account__c bacc =  new Bank_Account__c();
    static Loan__c loan = new Loan__c();
	static Loan_Transaction__c tr = new Loan_Transaction__c();
    
    static void create(){
        createContact();
        timeline.Event_Type__c ='New';
        timeline.Event_Date__c = date.today();
        timeline.Related_User_Id__c =UserInfo.getUserId();
        timeline.Title__c = 'test record';
        timeline.Event_Date__c = date.today();
        timeline.Related_Id__c = con.Id;
        timeline.Related_User_Id__c = con.LastModifiedById;
        timeline.Object_Id__c = con.Id;
        insert timeline;
    }
  
    static void createContact(){
        con.LastName = 'Contact 1';
        insert con;
    }
    
    static void createAccount(){
        acc.Name = 'Account 1';
        insert acc;
    }
    
    static void createLoanProduct(){
        lPrd.Minimum_Amount__c = 234;
        lPrd.Maximum_Amount__c = 34534545;
        lprd.Maximum_Rate__c = 3;
        lPrd.Minimum_Rate__c = 5;
        lPrd.Minimum_Term__c = 4;
        lPrd.Maximum_Term__c = 34;
        lPrd.Name = 'LPRD';
        lPrd.Interest_Calculation_Method__c = 'Simple';
        lPrd.Interest_Compounding_Frequency__c = '';
        insert lPrd;
    }
    
    @IsTest
    static void testCreate(){
        timeline.Title__c = 'test record';
        timeline.Event_Date__c = date.today();
        Id Id = controller.create(timeline);
        System.assertNotEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
        timeline.Title__c = 'test record';
        timeline.Event_Date__c = date.today();

        List<Timeline_Event__c> listTimeline = new List<Timeline_Event__c>(); 
        listTimeline.add(timeline);

        boolean isTrue = controller.createMany(listTimeline);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        create();
        timeline.Event_Type__c = 'New';

        boolean isTrue = controller.edit(timeline);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        create();

        timeline.Event_Type__c = 'New';
        List<Timeline_Event__c> listTimeline = new List<Timeline_Event__c>(); 
        listTimeline.add(timeline);

        boolean isTrue = controller.editMany(listTimeline);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        create();

        Timeline_Event__c timeline = (Timeline_Event__c)controller.getById(timeline.Id);
        System.assertNotEquals(null, timeline);

    }
    
    @IsTest
    static void testGetAll1(){
        create();
        
        List<Timeline_Event__c> timelines = TimelineEventController.getAll();
        Integer resultlength = timelines.size();
        System.assertEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAll2(){
        create();
		timeline = new Timeline_Event__c();
        timeline.Event_Type__c ='Started';
        
        List<Timeline_Event__c> timelines = TimelineEventController.getAll(timeline);
        Integer resultlength = timelines.size();
        System.assertNotEquals(true, resultlength > 0);
    }

    @IsTest
    static void testGetAll(){
        create();
		Timeline_Event__c timeline1 = new Timeline_Event__c();
        timeline1.Event_Type__c ='Started';
        timeline1.Event_Date__c = date.today();
        timeline1.Related_User_Id__c = UserInfo.getUserId();
        timeline1.Object_Id__c = con.Id;
        timeline1.Related_Id__c = con.Id;
        timeline1.Title__c ='test record';
        
        List<Timeline_Event__c> timelines = controller.getAll(timeline1,'Evt-0000000');
        Integer resultlength = timelines.size();
        System.assertEquals(false, resultlength > 0);

    }

    @IsTest
    static void testRemove(){
        create();

        Id id = timeline.Id;
        boolean isTrue = controller.remove(id);
        System.assertEquals(true, isTrue);
    }
    
    @IsTest
    static void testAllByLimit(){ 
        create();

        List<Timeline_Event__c> timelines = (List<Timeline_Event__c>)controllerExtention.getAllByLimit(null,1);
        Integer resultlength = timelines.size();
        System.assertNotEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testalink(){
        string link = controllerExtention.aLink(null,'hello');
        System.assertNotEquals(null, link);
    }
    
    @IsTest
    static void testGetbylike(){ 
        create();

        List<Timeline_Event__c> timelines = (List<Timeline_Event__c>)controllerExtention.getByLike(con.Id,'test');
        Integer resultlength = timelines.size();
        System.assertEquals(false, timelines.IsEmpty());

    }
    
    static void createApplication(string obj){
        app = new Application__c();
        if(obj == 'contact'){
            app.Contact__c = con.Id;
        }
        else{
            app.Account__c = acc.Id;
        }
        app.Loan_Product__c = lPrd.Id;
        app.Amount__c = 25000;
        app.Term__c = 10;
        app.Rate__c = 4;
        app.Application_Date__c = date.today();
        app.Status__c = 'New';
        insert app;
        
    }
    
    static void createBankAccount(string obj){
        bacc = new Bank_Account__c();
        if(obj == 'Contact'){
            bacc.Client__c = con.Id;
        }
        else{
            bacc.Account__c = acc.Id;
        }
        bacc.Account_Type__c = 'Savings';
        insert bacc;
    }
    
    static void createLoan(string obj){
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
        insert loan;
    }
    
    static void createTransaction(){
        tr = new Loan_Transaction__c();
        tr.Closing_Balance__c = 100;
        tr.Type__c = 'Disbursal';
        tr.Created_Date__c = date.today();
        tr.Loan_lineNumber__c = 1;
        tr.Loan__c = loan.Id;
        insert tr;
    }
    
    @IsTest
    static void testTimelineTrigger(){ 
        createContact();
        CreateAccount();
        createLoanProduct();
		
        Timeline_Event__c timeLines =  new Timeline_Event__c();
        
        
        // application object
        createApplication('contact');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(app,'Application started','sample' , 'sample', 'Applied for Loan','insert','application');
        System.assertEquals(true, timelines != null);
        
        createLoan('Contact');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(loan,'Loan Received', 'sample', 'You successfully received the loan', 'Received Loan','insert','loan');
        System.assertEquals(true, timelines != null);

		createTransaction();
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(tr, 'Disbursal Transaction', 'disbursal','', '','insert','trans');
        System.assertEquals(true, timelines != null);
        
        //application - account
        createApplication('account');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(app,'Application started','sample' , 'sample', 'Applied for Loan','insert','application');
        System.assertEquals(true, timelines != null);
       
        createLoan('Account');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(loan,'Loan Received', 'sample', 'You successfully received the loan', 'Received Loan','insert','loan');
        System.assertEquals(true, timelines != null);
        
        createTransaction();
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(tr, 'Disbursal Transaction', 'disbursal','', '','insert','trans');
        System.assertEquals(true, timelines != null);
        
        //bank account object
        createBankAccount('contact');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(bacc,'Bank Account opened', 'sample','', 'Opened Bank Account','insert','bank');
        System.assertEquals(true, timelines != null);
        
        
        createBankAccount('account');
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(bacc,'Bank Account opened', 'sample','', 'Opened Bank Account','update','bank');
        System.assertEquals(true, timelines != null);
        
        //benefit object
        Benefit__c beni =  new Benefit__c();
        beni.Name = 'lottery';
        beni.Contact__c = con.Id;
        beni.Amount__c = 2500;
        insert beni;
        
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(beni,'Bank Account opened', 'sample','', 'Opened Bank Account','insert','benefit');
        System.assertEquals(true, timelines != null);

        //contact
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(con,'Created', 'sample', '' , 'New','insert','contact');
        System.assertEquals(true, timelines != null);
        
        //account
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(acc,'Created', 'sample', '', 'New','insert','account');
        System.assertEquals(true, timelines != null);
        
        //employment
        Employment__c emp = new Employment__c();
        emp.Name = 'Employer';
        emp.Contact__c = con.Id;
        emp.Type__c = 'Student';
        emp.Start_Date__c = date.today();
        insert emp;
        
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(emp, emp.Name ,'sample' ,emp.Description__c, 'Started Employment','insert','employment');
        System.assertEquals(true, timelines != null);
        
        //expense
        Expense__c exp= new Expense__c();
        exp.Name = 'Purchase';
        exp.Amount__c = 2300;
        exp.Contact__c = con.Id;
        insert exp;
        timelines = (Timeline_Event__c)controllerExtention.timelineTrigger(exp,'Expense Created', 'sample', '', '','insert','expense');
        System.assertEquals(true, timelines != null);
    }
    
    @IsTest
    static void testGetPrefix(){ 
        string a = controllerExtention.getIdPrefix();
        System.assertEquals(true, a == '');
    }
}