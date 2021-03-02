trigger CommitmentHistory on Commitment_History__c (before insert, before update) {
  	IController loanCtlr = new  LoanController();
    IController appCtlr = new  ApplicationController();
    
    ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
   	string currencySymbol=orgSettings.UserSettings.currencySymbol;
    
    if(Trigger.isBefore){
        for(Commitment_History__c ch:Trigger.New){
            Loan__c loan=(Loan__c) loanCtlr.getById(ch.Loan__c);
            Id appId;
            if(ch.Type__c=='Application Approved' && ch.Application__c != null)
                appId=ch.Application__c;
            else
                appId=loan.Application__c;
            Application__c app=(Application__c) appCtlr.getById(appId);
            decimal decommitAmount= loan.Decommitted_Amount__c ;
            decimal recommitAmount= loan.Recommitted_Amount__c ;
            decimal amountAvailableToRecommit = decommitAmount - recommitAmount;
                
            if(ch.Date__c < app.Approved_Date__c){
                Date d=app.Approved_Date__c;
                ch.Date__c.addError('Date must be greater than or equal to approved date '+ d.format());
            }
                
            if(ch.Amount__c > loan.Undisbursed_Amount__c && ch.Type__c=='Decommitment'){
                ch.Amount__c.addError('Amount must be less than or equal to undisbursed amount '+ currencySymbol +loan.Undisbursed_Amount__c);
            }
                
            if(decommitAmount ==0 && ch.Type__c=='Recommitment'){
               ch.Amount__c.addError('There is no amount to re-commit ');
            }
            else if(ch.Amount__c > amountAvailableToRecommit && ch.Type__c=='Recommitment'){
                // ch.Amount__c.addError('Amount must be less than or equal to '+ currencySymbol +decommitAmount);
                ch.Amount__c.addError('Available amount to recommit is ' + currencySymbol + amountAvailableToRecommit);
            }   
            
            if(ch.Type__c=='Decommitment' || ch.Type__c=='Disbursal')
                ch.Amount_Sign__c = ch.Amount__c * -1;
            else
                ch.Amount_Sign__c = ch.Amount__c;
        }
    }
}