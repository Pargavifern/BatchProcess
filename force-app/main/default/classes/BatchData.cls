public class BatchData {
	@AuraEnabled
    public static List<sObject> getAll(){
        List<Account> a = [select Id, Name, BillingCity,  billingcountry from Account];
        return a;
    }
    
    @AuraEnabled
   	public static void setData(List<sObject> data){
		List<Contact> contacts = (List<Contact>) data; 
        BatchProcess bp = new BatchProcess(contacts);
        Database.executeBatch(bp);
	}
}