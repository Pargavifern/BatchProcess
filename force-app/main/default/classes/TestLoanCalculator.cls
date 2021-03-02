@isTest
private with sharing class TestLoanCalculator {
static LoanCalculator param; 
static List<Scheduled_Transaction__c> scheduledTransactions;

static void createParam(){
        param =new LoanCalculator();
        param.calculationMethod ='Simple';//Compound;
        param.dayCount='Actual / Actual';// Actual / 365,30 / 360,Actual / 360,Actual / 365.25,else;
        param.repaymentFrequency='Monthly';//Daily,Monthly,Quarterly,Annually,'Weekly','Fortnightly',else;
        param.seasonalPeriods='';//'1,2';
        param.interestCompoundingFrequency='Annual';//Annual,Semi_Annual,Quarterly,Monthly,Semi_Monthly,Bi_Weekly,Weekly,Daily,else;
        param.term = 12;
        param.periodsDeferredWithGrace = null;//2;
        param.Rate = 12;
        param.balloonAmount = 0;
        param.seasonalPaymentAmount = 0;
        param.seasonalInterestPaid = False;
        param.seasonalRepeat = False;
        param.amount = 10000;
        param.initialPaymentDate = null;
        param.disbursalDate =  null;
}

    @IsTest
    static Void TestCalculationMethod(){
        createParam();

        String paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.calculationMethod ='Compound';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.calculationMethod ='';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        System.assertNotEquals(0,scheduledTransactions.size());

    } 

    @IsTest
    static Void TestDayCount(){
        createParam();

        String paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.dayCount ='Actual / 365';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.dayCount ='30 / 360';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.dayCount ='Actual / 360';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.dayCount ='Actual / 365.25';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.dayCount ='';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        System.assertNotEquals(0,scheduledTransactions.size());

    }

    @IsTest
    static Void TestRepaymentFrequency(){
        createParam();

        String paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        //Daily,Monthly,Quarterly,Annually,'Weekly','Fortnightly',else;
        param.repaymentFrequency ='Daily';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.repaymentFrequency ='Quarterly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.repaymentFrequency ='Annually';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.repaymentFrequency ='Weekly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.repaymentFrequency ='Fortnightly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        

        System.assertNotEquals(0,scheduledTransactions.size());
    }
   
 
    @IsTest
    static Void TestInterestCompoundingFrequency(){
        createParam();
        
        //Annual,Semi_Annual,Quarterly,Monthly,Semi_Monthly,Bi_Weekly,Weekly,Daily,else;
        param.interestCompoundingFrequency ='Quarterly';
        string paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Monthly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Semi_Annual';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Semi_Monthly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Bi_Weekly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Weekly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Fortnightly';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='Daily';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.interestCompoundingFrequency ='';
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        System.assertNotEquals(0,scheduledTransactions.size());

    }
    
    @IsTest
    static void TestPeriodsDeferredWithGrace(){

        createParam();

        param.periodsDeferredWithGrace =2;
        string paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

    }

    @IsTest
    static void TestBalloonAmount(){

        createParam();

        param.balloonAmount =9999;
        string paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

    }

    @IsTest
    static void TestSeasonalPeriod(){
        createParam();

        param.seasonalPeriods ='1,2';
        string paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

        param.seasonalPaymentAmount =1000;
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

        param.seasonalInterestPaid = true;
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

        param.seasonalInterestPaid = true;
        param.seasonalRepeat = true;
        param.term=60;
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

    }
    @IsTest
    static void TestIntialDisbDates(){
        createParam();
        param.initialPaymentDate = Date.Today();
        param.disbursalDate =  Date.Today() + 1;
        string paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);

        param.initialPaymentDate = null;
        param.disbursalDate =  Date.Today() + 1;
        paramString = JSON.serialize(param);
        scheduledTransactions = LoanCalculator.getScheduledTrasactions(paramString);
        System.assertNotEquals(0,scheduledTransactions.size());

        LoanCalculator clac=new LoanCalculator();
        clac.getScheduledTrasactions(paramString,'a138E000000N9dr');

    }
    

}