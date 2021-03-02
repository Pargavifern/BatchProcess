trigger contentDocumentT on ContentDocument (before delete) {
    Schema.DescribeSObjectResult k=Loan__c.sObjectType.getDescribe();
	String loanPrefix =  k.getKeyPrefix(), tempString;
    
    if(Trigger.isBefore && Trigger.isDelete){
        for(ContentDocument cd:Trigger.Old){
            ContentVersion cv = [select Id, FirstPublishLocationId, Type__c from ContentVersion Where ContentDocumentId =: cd.Id];
            tempString = cv.FirstPublishLocationId;
            if(loanPrefix == tempString.substring(0,3)){
                DocumentController.deleteLoanFields(cv);
            }
        }
    }
}