public with sharing class LoanProductController implements IController{

   @AuraEnabled (cacheable=true)
    public static List<SObject> getloanProducts() {
        IController LoanProductController = new LoanProductController();
        List<Loan_Product__c> lPrd = LoanProductController.getAll(null , null );
        return lPrd;
    }
    
    @AuraEnabled (cacheable=true)
    public static SObject getLoanProductCond(string lpName) {
        Id myId = Id.valueOf(lpName); 
        IController LoanProductController = new LoanProductController();
        return LoanProductController.getById(myId);
    }

    public List<SObject> getAll(){
        List<SObject> loanProducts = [SELECT
                Id, Name,                
                Minimum_Amount__c, Maximum_Amount__c, Default_Rate__c,Minimum_Rate__c,Maximum_Rate__c,
                Minimum_Term__c, Maximum_Term__c,Default_Term__c, Default_Amount__c,RecordType.Name,Interest_Product__r.Current_Rate__c,
                Interest_Calculation_Method__c, Day_Count__c, Interest_Compounding_Frequency__c
            FROM Loan_Product__c ORDER BY CreatedDate DESC LIMIT 1000];

        return loanProducts;                        
    }
    public List<SObject> getAll(SObject value){
        return getAll(value,null);
    }
    public List<SObject> getAll(SObject value,String autoNumber){
        Loan_Product__c param;
        if(value == null)
           param = new Loan_Product__c(); 
         else
           param = (Loan_Product__c)Value;
        String queryString = 'SELECT Id, Name,'+
                ' Minimum_Amount__c, Maximum_Amount__c,Minimum_Term__c, Maximum_Term__c,'+
                ' Interest_Calculation_Method__c, Day_Count__c, Interest_Compounding_Frequency__c'+
                ' FROM Loan_Product__c Where';

        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        } 
        if(!string.isBlank(param.Interest_Calculation_Method__c)){
            queryString += ' Interest_Calculation_Method__c = \'' + String.escapeSingleQuotes(param.Interest_Calculation_Method__c) +  '\' AND';
        }  
        if(!string.isBlank(param.Interest_Compounding_Frequency__c)){
            queryString += ' Interest_Compounding_Frequency__c = \'' + String.escapeSingleQuotes(param.Interest_Compounding_Frequency__c) +  '\' AND';
        }          
        if(param.Minimum_Amount__c  != Null){
            queryString += ' Minimum_Amount__c = '+ param.Minimum_Amount__c +' AND';
        }
        if(param.Maximum_Amount__c  != Null){
            queryString += ' Maximum_Amount__c = '+ param.Maximum_Amount__c +' AND';
        }
        if(param.Minimum_Term__c  != Null){
            queryString += ' Minimum_Term__c = '+ param.Minimum_Term__c +' AND';
        }
        if(param.Day_Count__c  != Null){
            queryString += ' Day_Count__c = \'' + String.escapeSingleQuotes( param.Day_Count__c) +  '\' ';
        }
        
        queryString = queryString.removeEnd(' AND');
        queryString = queryString.removeEnd(' Where');
        List<SObject> loanProducts = Database.query(queryString);
        System.debug(loanProducts);

        return loanProducts;
    }

    public SObject getById(Id id){
        SObject LoanProduct = [SELECT Id, Name,                
                Minimum_Amount__c, Maximum_Amount__c,
                Minimum_Term__c, Maximum_Term__c,
                Interest_Calculation_Method__c, Day_Count__c, Interest_Compounding_Frequency__c,RecordTypeId
            FROM Loan_Product__c where id=:id];
        return LoanProduct; 
    }

    public Id create(SObject value){
       // Loan_Product__c LoanProduct =  (Loan_Product__c)value;
        //insert LoanProduct;
        return null;//LoanProduct.id;
    }

    public Boolean createMany(List<SObject> values){
       // List<Loan_Product__c> loanProducts =  (List<Loan_Product__c>)values;
       // insert loanProducts;
        return true;
    }
    public Boolean edit(SObject value){
       // Loan_Product__c LoanProduct =  (Loan_Product__c)value;
       // update LoanProduct;
        return true;
    }

    public Boolean editMany(List<SObject> values){
       // List<Loan_Product__c> loanProducts =  (List<Loan_Product__c>)values;
       // update loanProducts;
        return true;
    }
    public Boolean remove(Id id){
       // Loan_Product__c LoanProduct = [Select Id from Loan_Product__c where id=:id];
       // delete LoanProduct; 
        return true;
    }

}