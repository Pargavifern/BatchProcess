trigger ContentVersionT on ContentVersion (after insert, after update) {
    
    Schema.DescribeSObjectResult k=Loan__c.sObjectType.getDescribe();
	String loanPrefix =  k.getKeyPrefix(), tempString;	
    
    if(Trigger.isAfter && Trigger.isInsert){
        for(ContentVersion cv:Trigger.New){
            tempString = cv.FirstPublishLocationId;
            if(loanPrefix == tempString.substring(0,3)){
                DocumentController.setLoanFields(cv);
            }
        }
    }

    if(Trigger.isAfter && Trigger.isUpdate){
        for(ContentVersion cv:Trigger.New){
            ContentVersion cvOld ;
            tempString = cv.FirstPublishLocationId;
            if(loanPrefix == tempString.substring(0,3) && cv.Type__c != Trigger.oldMap.get(cv.Id).Type__c){
                DocumentController.updateLoanFields(cv, Trigger.oldMap.get(cv.Id));
            }
        }
    }
}