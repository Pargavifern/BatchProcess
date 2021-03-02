Public class UpdateContactAddresses implements Database.Batchable<sObject>, Database.Stateful {
    // instance member to retain state across transactions
    public Integer recordsProcessed = 0;
    public string query ;
    public List<Batch_Process__c> logs = new List<Batch_Process__c>();
    
    public UpdateContactAddresses(string q){
        query=q;
    }
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT ID, Name, BillingStreet, BillingCity, BillingState, ' +
            'BillingPostalCode from Account ' +
            'Where billingcity = \''+query+'\''
        );
    }
    public void execute(Database.BatchableContext bc, List<Account> scope){
        integer j = 0;
        // process each batch of records
        List<Contact> contacts = new List<Contact>();
        logs = new List<Batch_Process__c>();
        for (Account account1 : scope) {
            Contact b = new Contact();
            b.mailingCity = account1.billingCity;
            b.AccountId = account1.Id;
            
                b.FirstName = account1.Name;
                //string a = account1.Name;
                b.LastName = 'Contact '+j;
                b.Email = 'asdfa@gmail.com';
            if(j == 50)
                b.Email = 'adsfds' + j; // for generating error
            contacts.add(b);
                // increment the instance member counter
            recordsProcessed = recordsProcessed + 1;
            j++;

        }
        Database.SaveResult[] srList ;//= Database.insert(contacts, false);
        
        
 		Integer s = 0;
        // Iterate through each returned result
        for (Database.SaveResult sr : srList) {
            Batch_Process__c bp = new Batch_Process__c();
            if (sr.isSuccess()) {
                bp.Status__c = 'Success';
                bp.Contact__c = sr.getId();
                // Operation was successful, so get the ID of the record that was processed
                System.debug('Successfully inserted account. Account ID: ' + sr.getId());
            }
            else {
                bp.Status__c = 'Failure';
                bp.Account__c = contacts.get(s).AccountId;
                
                // Operation failed, so get all errors                
                for(Database.Error err : sr.getErrors()) {
                    bp.Error_Message__c = err.getStatusCode() + ': ' + err.getMessage();
                    bp.Fields__c = err.getFields()[0];
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Account fields that affected this error: ' + err.getFields()[0]);
                }
                
            }
            logs.add(bp);
            s++;
        }
        //insert logs;
    }
    public void finish(Database.BatchableContext bc){
        System.debug(recordsProcessed + ' records processed. Shazam!');
        system.debug('------error size------'+ logs.size());
        system.debug('---------'+logs);
        AsyncApexJob job = [SELECT Id, Status, NumberOfErrors,
            JobItemsProcessed,
            TotalJobItems, CreatedBy.Email
            FROM AsyncApexJob
            WHERE Id = :bc.getJobId()];
        
        system.debug('Match Merge Batch ' + job.Status);
        system.debug('Total Records Processed : '+ recordsProcessed +' records processed : ' + job.TotalJobItems +
           ' with '+ job.NumberOfErrors + ' failures.');
        
       /* Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            String[] toAddresses = new String[] {'pargavi.selvaraj@fernsoftware.com'};
            mail.setToAddresses(toAddresses);
            mail.setSubject('Match Merge Batch ' + job.Status);
            mail.setPlainTextBody('Total Records Processed : '+ recordsProcessed +' records processed : ' + job.TotalJobItems +
           ' with '+ job.NumberOfErrors + ' failures.');
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });*/
    }
}