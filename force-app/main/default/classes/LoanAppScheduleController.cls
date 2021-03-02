public class LoanAppScheduleController {

    public List<Scheduled_Transaction__c> scheduledTransactions {get;set;}
    public Application__c app {get;set;}

    public LoanAppScheduleController() {
        IController applicationCtlr=new ApplicationController();
        IController LoanProductCtlr=new LoanProductController();

        id Id = ApexPages.currentPage().getParameters().get('Id');
        app = (Application__c)applicationCtlr.getById(Id);
        Loan_Product__c LoanPrd = (Loan_Product__c)LoanProductCtlr.getById(app.Loan_Product__c);
        LoanCalculator calculator = new LoanCalculator();
    
        calculator.calculationMethod = LoanPrd.Interest_Calculation_Method__c;
        calculator.dayCount = LoanPrd.Day_Count__c;


        calculator.repaymentFrequency = app.Repayment_Frequency__c;
        calculator.seasonalPeriods = app.Seasonal_Periods__c;
        calculator.term = app.Term__c;
        calculator.periodsDeferredWithGrace = Integer.valueOf(app.Periods_Deferred_with_Grace__c);
        calculator.Rate = app.Final_Rate__c;
        calculator.balloonAmount = app.Balloon_Amount__c;
        calculator.seasonalPaymentAmount = app.Seasonal_Payment_Amount__c;
        calculator.seasonalInterestPaid = app.Pay_Seasonal_Interest__c;
        calculator.seasonalRepeat = app.Repeat_Seasonal_Periods__c;
        calculator.amount = app.Amount__c;
        calculator.disbursalDate = app.Disbursal_Date__c;
        calculator.initialPaymentDate = app.Initial_Payment_Date__c;
        if (calculator.calculationMethod == 'Compound') {
            calculator.interestCompoundingFrequency = LoanPrd.Interest_Compounding_Frequency__c;
        } else {
            calculator.interestCompoundingFrequency = 'Monthly';
        }

    
        calculator.balloonAmount =
            calculator.balloonAmount == null ? 0 : calculator.balloonAmount;
        calculator.seasonalPaymentAmount =
            calculator.seasonalPaymentAmount == null ? 0 : calculator.seasonalPaymentAmount;
        calculator.periodsDeferredWithGrace =
            calculator.periodsDeferredWithGrace == null ? 0 : calculator.periodsDeferredWithGrace;

        calculator.handleCalculate();
        List <LoanSchedule> loanScheduleList = calculator.loanScheduleList;
        Integer totalCount=loanScheduleList.size();

        scheduledTransactions = new List<Scheduled_Transaction__c>();
        Decimal LastRepaymentNumber = 1;
        for (LoanSchedule loanSchedule: loanScheduleList) {
            Scheduled_Transaction__c scheduledTransaction = new Scheduled_Transaction__c();

           // scheduledTransaction.Loan__c = loanApp.Id;
            if(loanSchedule.type != 'Disbursal'){
            scheduledTransaction.Scheduled_Date__c = loanSchedule.paymentDate;
            scheduledTransaction.Payment_Number__c = LastRepaymentNumber;
            scheduledTransaction.Type__c = loanSchedule.type;
            scheduledTransaction.Principal__c = loanSchedule.principal;
            scheduledTransaction.Interest__c = loanSchedule.interestPaid;
            scheduledTransaction.Fees__c = 0;
            scheduledTransaction.Total_Payment__c = loanSchedule.totalPayment;
            scheduledTransaction.Remaining_Balance__c = LoanSchedule.remainingBalance;
            LastRepaymentNumber++;
            }
            else{
                scheduledTransaction.Principal__c = loanSchedule.principal;
                scheduledTransaction.Remaining_Balance__c = LoanSchedule.remainingBalance;
                scheduledTransaction.Type__c = loanSchedule.type;
                scheduledTransaction.Scheduled_Date__c = loanSchedule.paymentDate;
            }
            scheduledTransactions.add(scheduledTransaction);
        }
      //  Integer val = 1/0;
    }
}