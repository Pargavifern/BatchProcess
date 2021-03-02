public inherited sharing class DocumentController {
    
    @AuraEnabled
    public static ContentVersion saveFile(Id idParent, String strFileName, String base64Data, String type,Date eDate, String description) {
        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        // inserting file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = idParent;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        cv.Type__c = type; 
        cv.Description = description;
        cv.Expiry_Date__c = eDate;
        Insert cv;

        return cv;
    }
    
    @AuraEnabled
    public static list<contentversion> relatedFiles(Id idParent){
        return relatedFilesbyType(idParent,null);
    }

    @AuraEnabled
    public static list<contentversion> relatedFilesbyType(Id idParent, string filterType){
        list<id> lstConDocs = new list<id>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:idParent]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {  
            String queryString = 'SELECT Id, Title, ContentDocumentId,Type__r.Name,View__c,Expiry_Date__c FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs';
 
             if(filterType != Null){
                 queryString += ' AND Type__c = \'' + String.escapeSingleQuotes(filterType) + '\'';
             }
            List<SObject> files=Database.query(queryString);
         	return files;
        }
        else {
            return null;
        }
    }

    @AuraEnabled
    public static list<Document_Type__c> getTypes(String ObjectValue){
        return [SELECT Name FROM Document_Type__c WHERE Object__c includes(:ObjectValue) OR Object__c='' order by Name];
    }

    @AuraEnabled
    public static Boolean deleteFile(Id id){
        
        ContentVersion cv = [Select Id,ContentDocumentId from ContentVersion where Id =:id];
        ContentDocument cd=[Select Id from ContentDocument where Id =:cv.ContentDocumentId ];

        delete cd;
        return true;
    }    

    @AuraEnabled
    public static list<Document_Template__c> getDocumentTemplate(String ObjectValue){
        return [SELECT Id, Template_Name__c, Template_Page__c FROM Document_Template__c
        WHERE Object__c =:ObjectValue OR Object__c='' order by Name];
    }
    
    @AuraEnabled
    public static void setLoanFields(sObject obj){
        ContentVersion cv = (ContentVersion)obj;
        Loan__c lrecord = (Loan__c)LoanController.getById(cv.FirstPublishLocationId);
        string dtype = [select Name from Document_Type__c where Id=: cv.Type__c].Name;
        
        if(dtype == 'Financial Information'){
            lrecord.Financial_Information__c = true;
        }
        else if(dtype == 'Cash Flow Forecast'){
            lrecord.Cash_Flow_Forecast__c = true;
        }
        else if(dtype == 'Insurance'){
            lrecord.Insurance__c = true;
        }
        else if(dtype == 'Business Licence'){
            lrecord.Business_Licence__c = true;
        }
        LoanController.edit(lrecord);
        
    }
    
    @AuraEnabled
    public static void deleteLoanFields(sObject obj){
        ContentVersion cv = (ContentVersion)obj;
        
        List<ContentVersion> cvList = [select Id, Type__c from ContentVersion where Type__c =: cv.Type__c and FirstPublishLocationId=: cv.FirstPublishLocationId];

        if(cvList.size()<=1){   
            Loan__c lrecord = (Loan__c)LoanController.getById(cv.FirstPublishLocationId);
            string dtype = [select Name from Document_Type__c where Id=: cv.Type__c].Name;
            
            if(dtype == 'Financial Information' && lrecord.Financial_Information__c == true){
                lrecord.Financial_Information__c = false;
            }
            else if(dtype == 'Cash Flow Forecast' && lrecord.Cash_Flow_Forecast__c == true){
                lrecord.Cash_Flow_Forecast__c = false;
            }
            else if(dtype == 'Insurance' && lrecord.Insurance__c == true){
                lrecord.Insurance__c = false;
            }
            else if(dtype == 'Business Licence' && lrecord.Business_Licence__c == true){
                lrecord.Business_Licence__c = false;
            }
            LoanController.edit(lrecord); 
        }
    }
    
    @AuraEnabled
    public static void updateLoanFields(sObject obj, sObject objOld){
        ContentVersion cv = (ContentVersion)obj;
        ContentVersion cvOld = (ContentVersion)objOld;
        //cvOld.FirstPublishLocationId = cv.FirstPublishLocationId;
        //cvOld.Type__c = oldDocuType;
        
        DocumentController.deleteLoanFields(cvOld); // for deleting the field if there is change the type
        DocumentController.setLoanFields(cv); // update for checklist if it is new
        
    }
}