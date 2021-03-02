public with sharing class LoanCalculator {
    
    integer repaymentPeriod;
    integer repaymentNum;
    integer compoundPeriod;
    integer compoundNum;
    integer dc = 0;
    integer compound;   
    Integer oddDays;    
    Integer seasonalNoInterest = 0;  
    Decimal termNum;
    Integer ldc;
    Integer termPeriod=3;

    Boolean balloonBool= false;
    Boolean continuousCompounding = false;

    Decimal c;
    Decimal li;
    Decimal balloonPayment;
    Decimal repaymentPOY;
    Decimal compoundPOY;
    Decimal termPOY;
    Decimal p;
    Decimal n;
    Decimal pn;
    Decimal lpn;
    Decimal ans = 0;
    Decimal lans;
    Decimal ansP = 0;    
    Decimal lr;
    Decimal liop;
    Decimal s;
    Decimal ls;
    Decimal lansP;
    Decimal lan;
    Decimal numLoanRepayment = 0.0;
    Decimal numLoanRepaymentFormatted = 0.0;
    Decimal remainingPayments;   
    Decimal tem = null;

    String repaymentLabel;

    Date datePayedOff;
    DateTime tempDate;

    List<Decimal> seasonalNoPayment;
    List<Integer> seasonalNoPaymentTerm;

    // input variables
    public String calculationMethod;
    public String dayCount;
    public String repaymentFrequency;
    public String seasonalPeriods = '';
    
    public String interestCompoundingFrequency;   
    public Decimal term = 0;
    public Integer periodsDeferredWithGrace;
    public Decimal Rate = 0;

    public Decimal balloonAmount;
    public Decimal seasonalPaymentAmount;

    public Boolean seasonalInterestPaid = false;
    public Boolean seasonalRepeat = false;
    public Decimal amount;
    public Date disbursalDate;
    public Date initialPaymentDate;
    public Boolean initialDate=true;

    public List<LoanSchedule> loanScheduleList;
    
    @AuraEnabled
    public static List<Scheduled_Transaction__c> getScheduledTrasactions(String params){
        LoanCalculator clac=new LoanCalculator();
        return clac.getScheduledTrasactions(params,null);
    }


    public List<Scheduled_Transaction__c> getScheduledTrasactions(String params, Id LoandId){

        LoanCalculator param=(LoanCalculator)JSON.deserialize(params, LoanCalculator.class);
        this.calculationMethod= param.calculationMethod;
        this.dayCount= param.dayCount;
        this.repaymentFrequency= param.repaymentFrequency;
        this.seasonalPeriods= param.seasonalPeriods;
    
        this.interestCompoundingFrequency= param.interestCompoundingFrequency;   
        this.term = param.term;
        this.periodsDeferredWithGrace= param.periodsDeferredWithGrace;
        this.Rate = param.Rate;

        this.balloonAmount= param.balloonAmount;
        this.seasonalPaymentAmount= param.seasonalPaymentAmount;

        this.seasonalInterestPaid= param.seasonalInterestPaid;
        this.seasonalRepeat = param.seasonalRepeat;
        this.amount= param.amount;
         this.initialPaymentDate = param.initialPaymentDate;
         this.disbursalDate = param.disbursalDate;
        handleCalculate();
        List<Scheduled_Transaction__c> scheduledTransactions=new List<Scheduled_Transaction__c>();
        
        for(LoanSchedule loanSchedule:loanScheduleList){
            Scheduled_Transaction__c scheduledTransaction = new Scheduled_Transaction__c();
            
            scheduledTransaction.Principal__c = loanSchedule.principal;
            scheduledTransaction.Interest__c = loanSchedule.interestPaid;
            scheduledTransaction.Fees__c = 0;
            if(LoandId!=null){            
                scheduledTransaction.Loan__c = LoandId;
            }
            scheduledTransaction.Total_Payment__c = loanSchedule.totalPayment;
            Date dateTimeValue= loanSchedule.paymentDate;
            scheduledTransaction.Scheduled_Date__c = date.newinstance(dateTimeValue.year(), dateTimeValue.month(), dateTimeValue.day());
            // if(initialPaymentDate != null)
            // {
            //     scheduledTransaction.Payment_Date__c = initialPaymentDate.date();
            //     initialPaymentDate = null;
            //     //initialDate = true;
            // }
            //initialDate = false;
            scheduledTransaction.Payment_Number__c = loanSchedule.paymentNumber;
            scheduledTransaction.Remaining_Balance__c = loanSchedule.remainingBalance;
            scheduledTransaction.Type__c = loanSchedule.type;
            scheduledTransactions.add(scheduledTransaction);
        }

        return scheduledTransactions;
    }

    public Void handleCalculate() {
        this.balloonPayment = 0.0;
        this.oddDays = 0;
        this.seasonalNoPayment = new List<Decimal>();
        this.seasonalNoPaymentTerm =  new List<Integer>();
        this.seasonalNoInterest = 0;
        this.lans = 0;
        this.lansP = 0;
        this.tem = null;
        if (this.balloonAmount > 0) {
            this.balloonBool = true;
        }

        this.switchcalculationMethod(this.calculationMethod);
        this.switchDayCount(this.dayCount);
        this.switchRepaymentFrequency(this.repaymentFrequency);
        this.switchInterestCompoundingFrequency(this.interestCompoundingFrequency);
        this.continuousCompounding = false;

        //loan caluculation
        this.termNum = this.term;
        this.repaymentPOY = this.partOfYear(this.dc, this.repaymentPeriod);
        this.compoundPOY = this.partOfYear(this.dc, this.compoundPeriod);
        this.termPOY = this.partOfYear(this.dc, this.termPeriod);

        this.p = this.repaymentPOY / this.repaymentNum;
        this.c = this.compoundPOY / this.compoundNum;
        this.n = this.termNum / this.termPOY;

        this.lpn = (this.p * this.n).setScale(0);

        this.createSeasonalPayments();
     

        if (this.seasonalInterestPaid == true) {
            this.lpn -= this.seasonalNoPaymentTerm.size(); // Same as decreasing the term of the loan.
        }
        if(this.periodsDeferredWithGrace == null){
            this.periodsDeferredWithGrace = 0;
        }
        this.pn = 0 - (this.lpn - this.periodsDeferredWithGrace);

        this.remainingPayments = Math.ceil(this.lpn);

        this.li = this.Rate / 100;

        if (this.compound == 1) {
            this.liop = Math.pow(Math.pow(1 + (this.li / this.compoundPOY).doubleValue(), this.compoundPOY.doubleValue()), (1 / this.repaymentPOY).doubleValue()) - 1;
            //this.liop = Math.pow((1 + (this.li / this.c)).doubleValue(), (this.c / this.p).doubleValue()) - 1;
        } else {
            this.liop = this.li * (this.numberOfDaysSimple() / this.daysInYear(this.dc).doubleValue());
        }

       // this.liop = Math.pow((1 + (this.li / this.c)).doubleValue(), (this.c / this.p).doubleValue()) - 1;
        this.lr = 1 + this.liop;

        this.lan = (1 - Math.pow(this.lr.doubleValue(), this.pn.doubleValue()));
        if (this.seasonalInterestPaid == false && this.seasonalNoPaymentTerm.size() > 0) {
            for (this.s = 0; this.s < this.seasonalNoPaymentTerm.size(); this.s++) {
                this.ls = 0 - this.s;
                this.tem = this.seasonalNoPaymentTerm[Integer.valueOf(this.s)];
                this.ans = 0;
                this.lans += Math.pow(this.lr.doubleValue(), -this.tem.doubleValue()) - Math.pow(this.lr.doubleValue(), (1 - this.tem).doubleValue());
                this.lansP += Math.pow(this.lr.doubleValue(), -this.tem.doubleValue()) - Math.pow(this.lr.doubleValue(), (1 - this.tem).doubleValue());
            }
            this.lan = this.lan + this.lans;
        }
        this.lan = this.lan / (this.lr - 1);
        this.lansP = this.lansP / (this.lr - 1);
        this.numLoanRepayment = this.calculateLoanRepayment(this.amount);
        this.numLoanRepaymentFormatted = this.numLoanRepayment.setScale(2);
        this.loanScheduleList = this.createLoanSchedule();
    }

     Void createSeasonalPayments() {

        seasonalNoPayment = new List<Decimal>();
        seasonalNoPaymentTerm = new List<Integer>();
        Integer s = 0;
        Decimal t = 0;
        if (this.seasonalPeriods == null || this.seasonalPeriods.replaceAll( '\\s+', '').length() == 0) {
            return;
        }

        List<String> seasonalArray = this.seasonalPeriods.split(',');
        for(Integer j=0;j<seasonalArray.size();j++){
            this.seasonalNoPayment.add(Integer.valueOf(seasonalArray[j]));
        }

        if (this.seasonalRepeat == true && this.seasonalPeriods.length() > 0) {
            Decimal p = this.repaymentPOY / this.repaymentNum;
            Decimal ps = Math.round(p);

            for (t = 0; t < this.lpn; t = t + ps) {
                for (s = 0; s < this.seasonalNoPayment.size(); s++) {
                    Decimal total = this.seasonalNoPayment[s] + t;
                    this.seasonalNoPaymentTerm.add(Integer.valueOf(total));
                }
            }
        } else {
            for (s = 0; s < this.seasonalNoPayment.size(); s++) {
                this.seasonalNoPaymentTerm.add(Integer.valueOf(this.seasonalNoPayment[s]));
            }
        }
    }

    List<LoanSchedule> createLoanSchedule() {
        Integer j = 0;
        List<LoanSchedule> tempSchedule = new List<LoanSchedule>();
        LoanSchedule temp;
        Decimal loanAmount = this.amount;
        Decimal totalInterest = 0;
        Decimal repaymentAmount = this.numLoanRepayment.setScale(2);
        Decimal intPaid = 0;
        Decimal loanPaid = 0;
        Date todaysDate = Date.today();
        Date interestStartDate =  todaysDate;

       
        Date paymentDate = todaysDate; // first payment is 1st of next month
        // if(disbursalDate!=null){
        //     paymentDate = disbursalDate;
        // }
        Decimal InterestCarried = 0;
        Integer i;

        this.tempDate = paymentDate;

        if (this.seasonalInterestPaid == true) {
            this.lpn = Math.round(this.lpn) + this.seasonalNoPaymentTerm.size();
        }

        Integer loopend =Integer.valueOf(this.lpn);
        if (this.disbursalDate!=null) {
            paymentDate = interestStartDate = this.disbursalDate;
        }
        
        for (i = 0; i <= loopend; i++) {
            
            temp= new LoanSchedule();
            temp.remainingBalance=loanAmount;
            temp.principal = temp.principal == null ? 0 : temp.principal;
            temp.totalPayment = temp.totalPayment == null ? 0 : temp.totalPayment;
            temp.paymentNumber =temp.paymentNumber == null ? 0 : temp.paymentNumber;
            temp.interestPaid = temp.interestPaid == null ? 0 : temp.interestPaid;
            temp.interestBalance = temp.interestBalance == null ? 0 : temp.interestBalance;
            temp.paymentDate = paymentDate;
            Boolean lastPayment= false;

    
            if (i > this.periodsDeferredWithGrace) {
                if (ArrayUntility.listContains(this.seasonalNoPaymentTerm,i) && this.seasonalPaymentAmount > 0) {
                    repaymentAmount = this.seasonalPaymentAmount;
                }
                Date endDate;
                if (this.initialPaymentDate!=null && i == 1) {
                    endDate = this.initialPaymentDate;
                } else {
                    endDate = this.nextPaymentDate(interestStartDate);
                }
               // temp.interestPaid = (this.liop * loanAmount); //not continuious compounding
                temp.interestPaid = calculateInterest(interestStartDate,endDate, loanAmount).setScale(2);
                temp.interestBalance += (temp.interestPaid + InterestCarried).setScale(2);

                //Integer test=1/0;// to debug

                intPaid = temp.interestBalance > repaymentAmount ? repaymentAmount : temp.interestBalance;
                loanPaid = repaymentAmount - intPaid;
                loanPaid = temp.remainingBalance > loanPaid ? loanPaid : temp.remainingBalance;

                if (ArrayUntility.listContains(this.seasonalNoPaymentTerm,i)) {
                    if (this.seasonalInterestPaid == true) {
                        temp.interestBalance -= intPaid;
                        temp.totalPayment = intPaid;
                    }
                    else if (this.seasonalPaymentAmount > 0) {
                        temp.interestBalance -= intPaid;
                        temp.principal = Math.max(repaymentAmount - intPaid, 0);
                        temp.totalPayment = temp.principal + intPaid;
                    } else {
                        temp.remainingBalance = loanAmount;
                        temp.principal = 0.00;
                        temp.totalPayment = 0.00;
                    }
                } else {
                    temp.interestBalance -= intPaid;
                    temp.principal = Math.max(repaymentAmount - intPaid, 0);
                    temp.totalPayment = temp.principal + intPaid;
                }

                if (loanAmount - temp.principal < 0) {
                    //last payment
                    temp.principal = loanAmount;
                    temp.totalPayment = loanAmount + intPaid;
                    i = (Integer.valueOf(this.lpn));
                   // lastPayment =true;
                }
                temp.remainingBalance = loanAmount - temp.principal;
            }

            if (i == this.lpn) {
                this.datePayedOff = paymentDate;
                temp.remainingBalance = 0;

                temp.principal = loanAmount;
                temp.totalPayment = loanAmount + intPaid;
            }

            if (i == 0) {
                //paymentDate = this.nextPaymentDate(paymentDate);
                temp.principal = loanAmount;
                temp.totalPayment = loanAmount;
                temp.paymentNumber = null;
                temp.interestPaid = null;
                temp.type='Disbursal';
                if (this.initialPaymentDate!=null) {
                    paymentDate = this.initialPaymentDate;
                } else {
                    if (this.disbursalDate!=null) {
                        paymentDate = this.nextPaymentDate(paymentDate);
                    } else {
                        paymentDate = this.nextPaymentDate(todaysDate);
                    }
                }

            } else {
                // if(i==1 && initialPaymentDate!=null){
                //     paymentDate = initialPaymentDate;
                //     temp.paymentDate = initialPaymentDate;         
                // }
                paymentDate = this.nextPaymentDate(paymentDate);
                interestStartDate = this.nextPaymentDate(interestStartDate);
                temp.type='Payment';
            }

            totalInterest = totalInterest + (temp.interestPaid == null ? 0 : temp.interestPaid);
            InterestCarried = temp.interestBalance;
            loanAmount = temp.remainingBalance;
            repaymentAmount = this.numLoanRepayment.setScale(2);

            temp.remainingBalance=temp.remainingBalance.setScale(2);
            temp.principal = temp.principal == null ? 0 : temp.principal.setScale(2);
            temp.totalPayment = temp.totalPayment == null ? 0 : temp.totalPayment.setScale(2);
            temp.paymentNumber = Integer.valueOf(i);
            temp.interestPaid = temp.interestPaid == null ? 0 : temp.interestPaid.setScale(2);
            temp.interestBalance = temp.interestBalance == null ? 0 : temp.interestBalance.setScale(2);
            //if (temp.type !='Disbursal') {
            tempSchedule.add(temp);
           // }
            lastPayment=false;
        }

        return tempSchedule;

    }
    
    Decimal calculateLoanRepayment(Decimal loanAmount) {
        
        Decimal tempVal = this.effectiveLoanAmount(loanAmount);
        return tempVal / this.lan;
    }
    Decimal effectiveLoanAmount(Decimal loanAmount) {

        Decimal tempVal = this.presentValueOfBalloonPayment();
        Decimal seasonTem = this.seasonalPaymentValue();
        Decimal totalDeduction = loanAmount - tempVal - seasonTem;
        return totalDeduction;
    }

    Decimal seasonalPaymentValue() {
        return this.seasonalPaymentAmount * this.lansP * - 1;
    }

    Decimal presentValueOfBalloonPayment() {
        return this.balloonAmount * Math.pow(this.lr.doubleValue(), this.pn.doubleValue());
    }

    Decimal calculateInterest(DateTime startDate,DateTime endDate, Decimal balance) {
        Decimal returnVal;
        if (this.compound == 0) {
            returnVal = this.calculateInterestSimple(startDate, endDate,balance);
        } else {
            returnVal = this.calculateInterestCompound(startDate,endDate, balance);
        }
        return returnVal;
    }

    Decimal calculateInterestCompound(DateTime startDate,DateTime endDate,Decimal balance) 
    {
        //  DateTime endDate ;
        // if(initialPaymentDate != null && initialDate == true)
        // {
        //     endDate = (initialPaymentDate);
        //     initialDate = false;
        // }
        // else
        // {
        //         endDate   = nextPaymentDate(startDate);

        // }
        Long differenceInDays = (endDate.getTime() - startDate.getTime()) / 86400000;

        return balance * (Math.pow(Math.pow(1 + (this.li / this.compoundPOY).doubleValue(), this.compoundPOY.doubleValue()), (1 / this.daysInYear(this.ldc)).doubleValue()) - 1) * differenceInDays;
       // return balance * (Math.pow((1 + (this.li / this.c)).doubleValue(), (this.c / this.daysInYear(this.dc)).doubleValue()) - 1) * differenceInDays;
  
    }
    Decimal calculateInterestSimple(DateTime startDate,DateTime endDate,Decimal balance)
    {
    //    DateTime endDate ;
    //     if(initialPaymentDate != null && initialDate == true)
    //     {
    //         endDate = (initialPaymentDate);
    //         initialDate = false;
    //     }
    //     else 
    //     {
    //             endDate   = nextPaymentDate(startDate);

    //     }
        Long daysElapsed = (endDate.getTime() - startDate.getTime()) / 86400000;
        return balance * this.li * (daysElapsed / this.daysInYear(this.dc));
    }

    
    Date nextPaymentDate(Date passedDate) {
        String f = this.repaymentFrequency;
        Date addedDate;
        if (f == 'Daily') {
            //add a day
            addedDate = passedDate.addDays(1);
        } else if (f == 'Weekly') {
            //add a week
            addedDate = passedDate.addDays(7);
        } else if (f == 'Fortnightly') {
            // add a fortnight
            addedDate = passedDate.addDays(14);
        } else if (f == 'Monthly'){
            //add a month
            addedDate = passedDate.addMonths(1);
        } else if (f == 'Quarterly') {
            addedDate = passedDate.addMonths(3);
        } else if (f == 'Annually') {
            //add a year
            addedDate = passedDate.addYears(1);
        }

        return addedDate;
    }

    void switchcalculationMethod(String calculationMethod){
        switch on calculationMethod {
            when 'Simple' {		
                this.compound = 0;
                
            }	
            when 'Compound' {		
                this.compound = 1;
                
            }
            when else {		 
                this.compound = 0;
                
            }
        }
    }

    Decimal daysInYear(integer dayCount) {
        switch on dayCount {
            when 0 {		
                return 365.25;
            }	
            when 1 {		
                return 365;
            }
            when 2 {		
                return 360;
            }
            when 3 {		
                return 360;
            }
            when 4 {		
                return 365.25;
            }
            when else {		
                return 365;
            }
        }
    }

    Decimal numberOfDays(Integer period) {
        decimal returnValue = 0;
        switch on period{
            when 1 {		
                returnValue =   1; 
            }
            when 2 {		
                returnValue =   7;
            }
            when 3 {		
                returnValue =   30.4166666667;
            }
            when 4 {		
                returnValue =   365;
            }
            // when else {		
            //     return 0;
            // }

            
        }
        return returnValue;
    }
    Decimal numberOfDaysSimple() {

        decimal returnValue = 30.4166666667;
        switch on repaymentFrequency  {
            when 'Daily'{//daily
                returnValue =  1;
            }
            when 'Weekly'{ //weekly
                returnValue =  7;
            }
            when 'Fortnightly'{ //fortnightly
                returnValue =  14;
            }
            when 'Monthly'{//monthly
                returnValue =  30.4166666667;
            }
            when 'Quarterly'{ //quarterly
                returnValue =  30.4166666667 * 3;
            }
            when 'Annually'{ //yearly
                returnValue =  365;
            }
        }

        return returnValue;
    }

    Decimal partOfYear(Integer dayCount, Integer period) {
        Decimal numberOfDays = this.numberOfDays(period);
        Decimal returnValue = (365 / numberOfDays);
        switch on dayCount {

            when 0 {	
                returnValue = (365.25 / numberOfDays);     
            }	
            when 1 {		
                returnValue = (365 / numberOfDays);    
            }
            when 2 {		
                returnValue = (period == 3 ? 12 : 360 / numberOfDays);
            }
            when 3 {		
                returnValue = (360 / numberOfDays);
            }
            when 4 {		
                returnValue = (365.25 / numberOfDays);
            }           
        }
        return returnValue;
    }

    void switchDayCount(String dayCount){
        
        switch on dayCount {
            when ('Actual / Actual') {		
                this.dc = 0;            
            }	
            when ('Actual / 365'){		
                this.dc = 1;              
            }
            when ('30 / 360'){		
                this.dc = 2;               
            }
            when ('Actual / 360') {		
                this.dc = 3;              
            }
            when ('Actual / 365.25') {		
                this.dc = 4;    
            }
            when else {		 
                this.dc = 0;
            }
        }
    }

    void switchInterestCompoundingFrequency(string interestCompoundingFrequency){
        switch on interestCompoundingFrequency {
            when 'Annual' {		
                this.compoundPeriod = 4;
                this.compoundNum = 1;
                
            }	
            when 'Semi_Annual' {		
                this.compoundPeriod = 3;
                this.compoundNum = 6;
            }
            when 'Quarterly' {		
                this.compoundPeriod = 3;
                this.compoundNum = 3;
                
            }
            when 'Monthly' {		
                this.compoundPeriod = 3;
                this.compoundNum = 1;
                
            }
            when 'Semi_Monthly' {		
                this.compoundPeriod = 3;
                this.compoundNum = 2; //? currently every other month
                
            }
            when 'Bi_Weekly' {		
                this.compoundPeriod = 2;
                this.compoundNum = 2;
                
            }
            when 'Weekly' {		
                this.compoundPeriod = 2;
                this.compoundNum = 1;
                
            }
            when 'Daily' {		
                this.compoundPeriod = 1;
                this.compoundNum = 1;
                
            }
            when else {		 
                this.compoundPeriod = 3; //monthly
                this.compoundNum = 1;
                
            }
        }
    }

    void switchRepaymentFrequency(String repaymentFrequency){
        switch on repaymentFrequency {
            when 'Daily' {		//daily
                this.repaymentPeriod = 1;
                this.repaymentNum = 1;
                this.repaymentLabel = 'Daily Repayment';
                
            }	
            when 'Weekly' {		//weekly
                this.repaymentPeriod = 2;
                this.repaymentNum = 1;
                this.repaymentLabel = 'Weekly Repayment';
                
            }
            when 'Fortnightly' {		//Fortnightly
                this.repaymentPeriod = 2;
                this.repaymentNum = 2;
                this.repaymentLabel = 'Fortnightly Repayment';
                
            }
            when 'Monthly' {		//monthly
                this.repaymentPeriod = 3;
                this.repaymentNum = 1;
                this.repaymentLabel = 'Monthly Repayment';
                
            }
            when 'Quarterly' {		//quarterly
                this.repaymentPeriod = 3;
                this.repaymentNum = 3;
                this.repaymentLabel = 'Quarterly Repayment';
                
            }
            when'Annually' {		  //yearly
                this.repaymentPeriod = 4;
                this.repaymentNum = 1;
                this.repaymentLabel = 'Yearly Repayment';
                
            }
            // when else {		  // default  //monthly
            //     this.repaymentPeriod = 3;
            //     this.repaymentNum = 1;
            //     this.repaymentLabel = 'Monthly Repayment';
                
            // }
        }
    }

     public static Decimal timeToMonth(Integer value, String frequency){
         switch on frequency {
             when 'Daily' {		//daily
                 return value / 30.4167;               
             }	
             when 'Weekly' {		//weekly
                 return value /4.345;     
                
             }
             when 'Fortnightly' {		//Fortnightly
                 return value /2.173;                   
             }
             when 'Monthly' {		//monthly
                 return value;
             }
             when 'Quarterly' {		//quarterly
                 return value * 3.0;                
             }
             when'Annually' {		  //yearly
                 return value * 12.0;
             }
             when else {		  // default  //monthly
                 return value;
             }
         }
     }

 //   Decimal power(Decimal d1, Decimal d2){
  //    return  Math.exp ( Math.log ((82125.49845) / (0 + 1)) + 14.083 * Math.log ((1 + ((2.84*1)/100)) / (1 + ((2.84*1)/100) + 0.005)) );
 //   }
}