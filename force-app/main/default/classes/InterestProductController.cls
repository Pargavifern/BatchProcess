public with sharing class InterestProductController implements IController ,IInterestProduct{

    public List<SObject> getAll(SObject value,String autoNumber){
        Interest_Product__c param = (Interest_Product__c)Value;
        String queryString = 'Select Active__c,CreatedById, Current_Rate__c,LastModifiedById,'+
	                        'Name,OwnerId,Rate_Last_Changed__c from Interest_Product__c where';

        if(!string.isBlank(param.Name)){
            queryString += ' Name = \'' + String.escapeSingleQuotes(param.Name) +  '\' AND';
        }
        if(param.Active__c  != Null){
            queryString += ' Active__c = '+ param.Active__c +' AND';
        }
        if(param.Current_Rate__c  != Null){
            queryString += ' Current_Rate__c = '+ param.Current_Rate__c +' AND';
        }
        if(param.Rate_Last_Changed__c != Null){       
            String formatedDate = DateUtility.formatDate(param.Rate_Last_Changed__c, 'yyyy-MM-dd');
            queryString += ' Rate_Last_Changed__c = '+ formatedDate +' AND';
        }
        if(!string.isBlank(param.OwnerId)){
            queryString += ' OwnerId = \'' + String.escapeSingleQuotes(param.OwnerId) +  '\' AND';
        }

        queryString = queryString.removeEnd(' AND');
        System.debug(queryString);
        List<SObject> products = Database.query(queryString);
        System.debug(products);

        return products;
    }

    public SObject getById(Id id){
        SObject product = [Select Active__c,CreatedById, Current_Rate__c,LastModifiedById,
                                Name,OwnerId,Rate_Last_Changed__c
                                from Interest_Product__c where id=:id];
        return product; 
    }

    public Id create(SObject value){
        Interest_Product__c product =  (Interest_Product__c)value;
        insert product;
        return product.id;
    }

    public Boolean createMany(List<SObject> values){
        List<Interest_Product__c> products =  (List<Interest_Product__c>)values;
        insert products;
        return true;
    }
    public Boolean edit(SObject value){
        Interest_Product__c product =  (Interest_Product__c)value;
        update product;
        return true;
    }

    public Boolean editMany(List<SObject> values){
        List<Interest_Product__c> products =  (List<Interest_Product__c>)values;
        update products;
        return true;
    }
    public Boolean remove(Id id){
        Interest_Product__c product = [Select Id from Interest_Product__c where id=:id];
        delete product; 
        return true;
    }
  
    public static void CurrentDateUpdate(Id Id){
        
         IInterestRateController interestRateSch=new InterestRateController();
         IController interestProductSch=new InterestProductController(); 
        
        Interest_Rate__c currentRateRecord =  interestRateSch.getCurrentRate(Id);
        Interest_Product__c product= (Interest_Product__c)interestProductSch.getById(Id);
        
        if(currentRateRecord !=  null){
            
            product.Rate_Last_Changed__c = currentRateRecord.Effective_Date__c;
            product.Current_Rate__c = currentRateRecord.Rate__c;                 
        }
       
        interestProductSch.edit(product);
          
    }
}