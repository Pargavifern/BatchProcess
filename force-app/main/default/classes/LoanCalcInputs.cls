public with sharing class LoanCalcInputs {
    public String calculationMethod;
    public String dayCount;
    public String repaymentFrequency;
    public String seasonalPeriods = '';
    
    public String interestCompoundingFrequency;   
    public Integer term = 0;
    public Integer periodsDeferredWithGrace;
    public Decimal Rate = 0;

    public Decimal balloonAmount;
    public Decimal seasonalPaymentAmount;

    public Boolean seasonalInterestPaid = false;
    public Boolean seasonalRepeat = false;
    public Decimal amount;
}