trigger TransactionLine on Transaction_Line__c(after insert) {
    List < Scheduled_Transaction__c > scheduledTransactions = new List < Scheduled_Transaction__c > ();
    IController LoanProductCtlr = new LoanProductController();
    IController scheduledTransactionCtlr = new ScheduledTransactionController();
    IController applicationCtlr = new ApplicationController();
    IController loanController = new LoanController();
    IController transactionController = new LoanTransactionController();
    List<Transaction_Line__c> transactionLines = new List<Transaction_Line__c>();

    //Scheduled Transaction generation for 
    for (Transaction_Line__c transactionLine: Trigger.New) {
        Loan_Transaction__c loanTransaction = (Loan_Transaction__c)transactionController.getById(transactionLine.Transaction__c);
        Integer j = 0;
        Scheduled_Transaction__c param = new Scheduled_Transaction__c(Loan__c = loanTransaction.Loan__c, Paid__c=false);
        List<Scheduled_Transaction__c> filteredTransactions = scheduledTransactionCtlr.getAll(param, null);
        
        if((transactionLine.Type__c == 'Principal' && transactionLine.Amount__c>0 && loanTransaction.Type__c!='Reversal'  && loanTransaction.Type__c!='Adjustment')
           //|| (loanTransaction.Type__c=='Write Off' && transactionLine.Type__c == 'Principal' && transactionLine.Amount__c<0) type name changed
          ){ 
            
            Loan__c loanApp = (Loan__c)loanController.getById(loanTransaction.Loan__c);
    
    		List<Scheduled_Transaction__c> deleteRecords = filteredTransactions;
            List<Integer> deleteIndex = new List<Integer>();
            Decimal term = 0, partialAmount = 0;
            Application__c loanApplication = (Application__c) applicationCtlr.getById(loanApp.Application__c);                                         
    
            Datetime initialPaymentDate = Null, dateTimeValue = NULL;
            Integer LastRepaymentNumber = 1;
            
            dateTimeValue = loanTransaction.Transaction_Date__c; // assign direct value
            term = loanApplication.Term__c; 
              
              
            if (filteredTransactions.size() > 0) {
               term = LoanCalculator.timeToMonth(filteredTransactions.size(),loanApplication.Repayment_Frequency__c);
               initialPaymentDate = filteredTransactions[0].Scheduled_Date__c; // assign first unpaid schedule date to newly generating schedule
               LastRepaymentNumber = (Integer) filteredTransactions[0].Payment_Number__c;
                if(loanApplication.Term__c == term){
                  initialPaymentDate = loanTransaction.Transaction_Date__c;
                  dateTimeValue = loanApp.Disbursed_Date__c;
               }               
               Delete filteredTransactions;
            }
    
            LoanCalculator calculator = new LoanCalculator();
            Loan_Product__c LoanProduct = (Loan_Product__c) LoanProductCtlr.getById(loanApp.Loan_Product__c);
    
            calculator.calculationMethod = LoanProduct.Interest_Calculation_Method__c;
            calculator.dayCount = LoanProduct.Day_Count__c;
    
            calculator.repaymentFrequency = loanApplication.Repayment_Frequency__c;
            calculator.seasonalPeriods = loanApplication.Seasonal_Periods__c;
            calculator.term = term;
            calculator.periodsDeferredWithGrace = Integer.valueOf(loanApplication.Periods_Deferred_with_Grace__c);
            calculator.Rate = loanApplication.Final_Rate__c;
            calculator.balloonAmount = loanApplication.Balloon_Amount__c;
            calculator.seasonalPaymentAmount = loanApplication.Seasonal_Payment_Amount__c;
            calculator.seasonalInterestPaid = loanApplication.Pay_Seasonal_Interest__c;
            calculator.seasonalRepeat = loanApplication.Repeat_Seasonal_Periods__c;
            calculator.amount = (transactionLine.Amount__c + loanApp.Balance_Principal__c);
            calculator.disbursalDate = dateTimeValue.date();
            
            dateTimeValue = initialPaymentDate;
            
            if(dateTimeValue!=null)
            	calculator.initialPaymentDate = dateTimeValue.date();
            if (calculator.calculationMethod == 'Compound') {
                calculator.interestCompoundingFrequency = LoanProduct.Interest_Compounding_Frequency__c;
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
            List < LoanSchedule > loanScheduleList = calculator.loanScheduleList;
    
            Decimal totalInterest = 0.00;
            Integer i = 0;
            for (LoanSchedule loanSchedule: loanScheduleList) {
                Scheduled_Transaction__c scheduledTransaction = new Scheduled_Transaction__c();
    
                if(loanSchedule.type !='Disbursal'){
                    scheduledTransaction.Loan__c = loanApp.Id;
                    scheduledTransaction.Scheduled_Date__c = loanSchedule.paymentDate;
                    scheduledTransaction.Payment_Number__c = LastRepaymentNumber;
                    scheduledTransaction.Type__c = loanSchedule.type;
                    scheduledTransaction.Principal__c = loanSchedule.principal;
                    scheduledTransaction.Interest__c = loanSchedule.interestPaid;
                    scheduledTransaction.Fees__c = 0;
                    scheduledTransaction.Total_Payment__c = loanSchedule.totalPayment;
                    scheduledTransaction.Remaining_Balance__c = LoanSchedule.remainingBalance;
                    if(deleteRecords.size()>0){
                        scheduledTransaction.Paid_Principal__c = deleteRecords[i].Paid_Principal__c;
                        scheduledTransaction.Paid_Interest__c = deleteRecords[i].Paid_Interest__c;
                        scheduledTransaction.Paid_Fees__c = deleteRecords[i].Paid_Fees__c; 
                        i++;
                    }
                    
                    scheduledTransactions.add(scheduledTransaction);
                    LastRepaymentNumber++;
                	totalInterest = totalInterest + LoanSchedule.interestPaid;
                }
            }
        }
        scheduledTransactionCtlr.createMany(scheduledTransactions);
	}
}