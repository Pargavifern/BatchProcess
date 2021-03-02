public class BatchProcess implements
    Database.Batchable<sObject>, Database.Stateful{
	 // instance member to retain state across transactions
    public Integer recordsProcessed = 0;
    public List<Contact> contacts = new List<Contact>();
    public List<Batch_Process__c> logs = new List<Batch_Process__c>();
        
    @InvocableMethod(label='exuete the batch ContactBatch' description='This method will be execute ContactBatch')
	public static void executeBatchMethod(List<string> lst) {
        //Database.executeBatch(new BatchProcess());
    }
    
    public BatchProcess(List<sObject> records) {
        contacts = records;
    }    
    
    public List<sObject> start(Database.BatchableContext bc) {
        return contacts;
    }
        
    public void execute(Database.BatchableContext bc, List<Contact> scope){
        integer j = 0;
        logs = new List<Batch_Process__c>();
        
        recordsProcessed = contacts.size();
        Database.SaveResult[] srList = Database.insert(contacts, false);
        
 		Integer s = 0;
        // Iterate through each returned result
        for (Database.SaveResult sr : srList) {
            Batch_Process__c bp = new Batch_Process__c();
            if (sr.isSuccess()) {
                bp.Status__c = 'Success';
                bp.Contact__c = sr.getId();
                // Operation was successful, so get the ID of the record that was processed
            }
            else {
                bp.Status__c = 'Failure';
                bp.Account__c = contacts.get(s).AccountId;

                // Operation failed, so get all errors                
                for(Database.Error err : sr.getErrors()) {
                    bp.Error_Message__c = err.getStatusCode() + ': ' + err.getMessage();
                    bp.Fields__c = err.getFields()[0];
                }
            }
            logs.add(bp);
            s++;
        }
        insert logs;
    }
    public void finish(Database.BatchableContext bc){
        system.debug('----record set ---'+contacts.size());
        system.debug('----records------ after---'+contacts);
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