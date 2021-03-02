public with sharing class ScheduledTransactionController implements IController, IScheduledTransaction{
    
    @AuraEnabled
    public static List<SObject> getAll(){
        List<SObject> transactions = [Select Total_Payment__c,Loan__c,Payment_Date__c,Payment_Number__c,Type__C, Paid_Percentage__c, Scheduled_Date__c 
        FROM Scheduled_Transaction__c ORDER BY CreatedDate DESC LIMIT 1000];
        return transactions;                        
    }
    
    @AuraEnabled
    public static List<SObject> getAll(SObject value){
        return getAll(value,null);
    }
  
    @AuraEnabled
    public static List<SObject> getAll(SObject value,String autoNumber){
        Scheduled_Transaction__c param = (Scheduled_Transaction__c)Value;
        String queryString = 'Select Id,Total_Payment__c, Remaining_Balance__c,Paid__c,Fees__c,Interest__c,Principal__c,Loan__c, Scheduled_Date__c, '+
            					'Amount__c, Paid_Principal__c, Paid_Interest__c, Paid_Fees__c, Paid_Total_Amount__c, Paid_Percentage__c, '+
            					'Payment_Date__c,Payment_Number__c,Type__C FROM Scheduled_Transaction__c where';
  
        if(!string.isBlank(param.Loan__c)){
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(param.Loan__c) +  '\' AND';
        }
        if(!string.isBlank(param.Type__C)){
            queryString += ' Type__C = \'' + String.escapeSingleQuotes(param.Type__C) +  '\' AND';
        }
        if(param.Scheduled_Date__c != Null){       
          String formatedDate = DateUtility.formatDate(param.Scheduled_Date__c, 'YYYY-MM-DD');
          queryString += ' Scheduled_Date__c = '+ formatedDate +' AND';
        }
        if(param.get('Paid__c') != Null){
        queryString += ' Paid__c = '+ param.Paid__c;
        }
        
        
        queryString = queryString.removeEnd(' AND');
        queryString = queryString + ' order by Scheduled_Date__c';
        List<SObject> transactions = Database.query(queryString);
        return transactions;
    }
    
    @AuraEnabled
    public static SObject getById(Id id){
        SObject transactionData = [Select Loan__c,Scheduled_Date__c,Total_Payment__c,Payment_Date__c,Payment_Number__c,Type__C, Paid_Percentage__c 
        							FROM Scheduled_Transaction__c where id=:id];
        return transactionData; 
    }
    
    @AuraEnabled
    public static Id create(SObject value){
        Scheduled_Transaction__c transactionData =  (Scheduled_Transaction__c)value;
        return transactionData.id;
    }
    
    @AuraEnabled
    public static Boolean createMany(List<SObject> values){
        List<Scheduled_Transaction__c> transactions =  (List<Scheduled_Transaction__c>)values;
        insert transactions;
        return true;
    }
    
    @AuraEnabled
    public static Boolean edit(SObject value){
        Scheduled_Transaction__c transactionData =  (Scheduled_Transaction__c)value;
        update transactionData;
        return true;
    }
      
    @AuraEnabled
    public static Boolean editMany(List<SObject> values){
        List<Scheduled_Transaction__c> transactions =  (List<Scheduled_Transaction__c>)values;
        update transactions;
        return true;
    }
      
    @AuraEnabled
    public static Boolean remove(Id id){
        Scheduled_Transaction__c transactionData = [Select Id from Scheduled_Transaction__c where id=:id];
        delete transactionData; 
        return true;
    }
    
    @AuraEnabled
    public static List<SObject> getMissedPayment(SObject value){
        Scheduled_Transaction__c param = (Scheduled_Transaction__c)Value;
        param.Scheduled_Date__c=date.today();
        String queryString = 'Select Id FROM Scheduled_Transaction__c where Paid__c=false AND';
  
        if(!string.isBlank(param.Loan__c)){
            queryString += ' Loan__c = \'' + String.escapeSingleQuotes(param.Loan__c) +  '\' AND';
        }
        
        if(param.Scheduled_Date__c != Null){       
          Date pDate = Date.valueOf(param.Scheduled_Date__c);
          queryString += ' Scheduled_Date__c <: pDate';
        }
        
        queryString = queryString.removeEnd(' AND');

        List<SObject> transactions = Database.query(queryString);
        return transactions;
    }
    
    @InvocableMethod(label='Update paid scheduled payment')
    public static void markPayments(scheduledPaymentInputs[] inputs){
        
        Decimal principal = 0,interest = 0,fees = 0, totalPaid = 0, principalActual = 0, interestActual = 0, feeActual = 0;
		Id loanId;
        IController ctrl=new ScheduledTransactionController();
        
        for(scheduledPaymentInputs ins:inputs){
            principal = ins.principalAmt;
            interest = ins.interestAmt;
            fees = ins.feesAmt;
            loanId = ins.loanId;
        }
        
        Scheduled_Transaction__c sObj = new Scheduled_Transaction__c();
        sObj.Loan__c = loanId;
        sObj.Paid__c = false;
        
        List<Scheduled_Transaction__c> stranList = ctrl.getAll(sObj, null);
        List<Scheduled_Transaction__c> updateList = new List<Scheduled_Transaction__c>();

        for(Scheduled_Transaction__c st:stranList){
            Scheduled_Transaction__c oneRecord = st;
            totalPaid = oneRecord.Total_Payment__c;
            if(principal != null || principal != 0){
                principalActual = st.Principal__c - st.Paid_Principal__c;
                if(principal <= principalActual){
                    oneRecord.Paid_Principal__c = principal + st.Paid_Principal__c;
                    principal = 0;
                }
                else{
                    oneRecord.Paid_Principal__c = principalActual + st.Paid_Principal__c;
                    principal = principal - principalActual;
                }
			}
            
            if(interest != null || interest != 0){
                interestActual = st.Interest__c - st.Paid_Interest__c;
                if(interest <= interestActual){
                    oneRecord.Paid_Interest__c = interest + st.Paid_Interest__c;
                    interest = 0;
                }
                else{
                    oneRecord.Paid_Interest__c = interestActual + st.Paid_Interest__c;
                    interest = interest - interestActual;
                }
			}
            
            if(fees != null || fees != 0){
                feeActual = st.Fees__c - st.Paid_Fees__c;
                if(fees <= st.Fees__c){
                    oneRecord.Paid_Fees__c = fees + st.Paid_Fees__c;
                    fees = 0;
                }
                else{
                    oneRecord.Paid_Fees__c = feeActual + st.Fees__c;
                	fees = fees - feeActual;
                }
			}
            
            totalPaid = oneRecord.Paid_Fees__c + oneRecord.Paid_Interest__c + oneRecord.Paid_Principal__c;
            if(oneRecord.Amount__c == totalPaid){
                oneRecord.Paid__c = true;
            }
            
            updateList.add(oneRecord);
            if(principal == 0 && fees == 0 && interest == 0){
                break;
            }  
        }
        ctrl.editMany(updateList);
    }
}