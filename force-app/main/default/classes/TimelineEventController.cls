public class TimelineEventController implements IController, ITimelineEventController{
    
    @AuraEnabled
    public static List<SObject> getAll(){
         return [SELECT
                      Name,Event_Date__c,Event_Type__c,Related_Id__c,Related_Object_Name__c,
                      Related_User_Id__c,Title__c,Description__c,Object_Id__c
                 FROM Timeline_Event__c
                 ORDER BY Name DESC
                 LIMIT 1000];                         
     }
 
     @AuraEnabled
     public static List<SObject> getAll(SObject value){
         return getAll(value,null);
     }
 
     public static List<SObject> getAll(SObject value,String autoNumber){
         Timeline_Event__c param = (Timeline_Event__c)value;
         String queryString = 'Select Name,Event_Date__c,Event_Type__c,Related_Id__c,Object_Id__c,'+
                               'Related_User_Id__c,Title__c,Subtitle__c,Description__c,Related_Object_Name__c'+
                         ' from Timeline_Event__c where';
 
         if(!string.isBlank(autoNumber)){
             queryString += ' Name = \'' + String.escapeSingleQuotes(autoNumber) +  '\' AND';
         }
         if(param.Event_Date__c  != Null){
             Date formatedDate = date.valueOf(param.Event_Date__c);
             queryString += ' Event_Date__c =: formatedDate AND';
         }
         if (!string.isBlank(param.Object_Id__c)) {
             queryString += ' Object_Id__c = \'' + String.escapeSingleQuotes(param.Object_Id__c) + '\' AND';
         }
         
         if (!string.isBlank(param.Event_Type__c)) {
             queryString += ' Event_Type__c = \''+ String.escapeSingleQuotes(param.Event_Type__c) + '\' AND';
         }
 
         if (!string.isBlank(param.Related_Id__c)) {
             queryString += ' Related_Id__c = \'' + String.escapeSingleQuotes(param.Related_Id__c) + '\' AND';
         }
 
         if (!string.isBlank(param.Related_User_Id__c)) {
             queryString += ' Related_User_Id__c = \'' + String.escapeSingleQuotes(param.Related_User_Id__c) + '\' AND';
         }
 
         if (!string.isBlank(param.Title__c)) {
             queryString += ' Title__c = \'' + String.escapeSingleQuotes(param.Title__c) + '\'';
         }
 		
         queryString = queryString.removeEnd(' AND');
         queryString = queryString.removeEnd(' where');
         
         queryString  += ' ORDER BY Name DESC LIMIT 1000';
         
         List<SObject> timeline=Database.query(queryString);
         return timeline;
     }
 
     @AuraEnabled
     public static SObject getById(Id id){
         SObject entity = [SELECT
                             Name,Event_Date__c,Event_Type__c,Related_Id__c,Object_Id__c,
                              Related_User_Id__c,Title__c,Subtitle__c,Description__c, Related_Object_Name__c
                         FROM Timeline_Event__c
                         WHERE Id=:id];
         return entity; 
     }
    
   
     public Id create(SObject value) {
         Timeline_Event__c entity = (Timeline_Event__c)value;
         insert entity;
         return entity.Id;
     }
 
     public Boolean createMany(List<SObject> values) {
         List<Timeline_Event__c> entities = (List<Timeline_Event__c>)values;
         insert entities;
         return true;
     }
 
     public Boolean edit(SObject value) {
         Timeline_Event__c entity = (Timeline_Event__c)value;
         update entity;
         return true;
     }
 
     public Boolean editMany(List<SObject> values) {
         List<Timeline_Event__c> entities = (List<Timeline_Event__c>)values;
         update entities;
         return true;
     }
     public Boolean remove(Id id) {
         Timeline_Event__c entity = [SELECT Id FROM Timeline_Event__c WHERE Id=:id];
         delete entity; 
         return true;
     }
 
    @AuraEnabled
    public static List<SObject> getAllByLimit(Id id,Integer l){
        List<sObject> entities=[SELECT
                      Name,Event_Date__c,Event_Type__c,Related_Id__c,Object_Id__c,
                      Related_User_Id__c,Title__c,Subtitle__c,Description__c, Related_Object_Name__c
                 FROM Timeline_Event__c
                 WHERE Object_Id__c = :id
                 ORDER BY Id DESC
                 LIMIT :l]; 
        return entities;
    }
    
    
    public static SObject timelineTrigger(SObject obj,string tit,string sub,string des,string etype,string dml,string objName){
        Timeline_Event__c tobj=new Timeline_Event__c();
        SObject sObj;
    
        string objId='';
        if(objName=='application'){
        	sObj=(Application__c)obj;   
            tobj.Related_Object_Name__c='Application__c';
            if(sObj.get('Account__c')!=null){
                tobj.Object_Id__c=(string)sObj.get('Account__c');
            }
            else{
                tobj.Object_Id__c=(string)sObj.get('Contact__c');
            }
        }
        else if(objName=='bank'){
            sObj=(Bank_Account__c)obj;
            tobj.Related_Object_Name__c='Bank_Account__c';
            if(sObj.get('Account__c')!=null){
                tobj.Object_Id__c=(string)sObj.get('Account__c');
            }
            else{
                tobj.Object_Id__c=(string)sObj.get('Client__c');
            }
        }
        else if(objName=='benefit'){
            sObj=(Benefit__c)obj;
            tobj.Related_Object_Name__c='Benefit__c';
            tobj.Object_Id__c=(string)sObj.get('Contact__c');
        }
        else if(objName=='contact'){
            sObj=(Contact)obj;
            tobj.Related_Object_Name__c='Contact';
            tobj.Object_Id__c=(string)sObj.get('Id');
        }
        else if(objName=='account'){
            sObj=(Account)obj;
            tobj.Related_Object_Name__c='Account';
            tobj.Object_Id__c=(string)sObj.get('Id');
        }
        else if(objName=='employment'){
            sObj=(Employment__c)obj;
            tobj.Related_Object_Name__c='Employment__c';
            tobj.Object_Id__c=(string)sObj.get('Contact__c');
        }
        else if(objName=='expense'){
            sObj=(Expense__c)obj;
            tobj.Related_Object_Name__c='Expense__c';
            tobj.Object_Id__c=(string)sObj.get('Contact__c');
        }
        else if(objName=='loan'){
            sObj=(Loan__c)obj;
            tobj.Related_Object_Name__c='Loan__c';
            if(sObj.get('Account__c')!=null){
                tobj.Object_Id__c=(string)sObj.get('Account__c');
            }
            else{
                tobj.Object_Id__c=(string)sObj.get('Contact__c');
            }
        }
      else if(objName=='trans'){
   		IController Transloan=new LoanController();
        Loan__c tloan=new Loan__c();
        sObj=(Loan_Transaction__c)obj;
        tobj.Related_Object_Name__c='Loan_Transaction__c';
        tloan=(Loan__c)Transloan.getById((string)sObj.get('Loan__c'));
        if(tloan.Account__c!=null){
            tobj.Object_Id__c=tloan.Account__c;
            }
            else{
                 tobj.Object_Id__c=tloan.Contact__c;
            }
       } 
       
        if(objName=='employment'){
             tobj.Event_Date__c=(DateTime)sObj.get('Start_Date__c');
        }
        else if(dml=='insert'){
            tobj.Event_Date__c=(DateTime)sObj.get('CreatedDate');
        }
        else{
            tobj.Event_Date__c=(DateTime)sObj.get('LastModifiedDate');
        }
        
        tobj.Subtitle__c=sub;
        tobj.Event_Type__c=etype;
        tobj.Title__c=tit;
        tobj.Related_Id__c=(Id)sObj.get('Id');
        tobj.Related_User_Id__c=(Id)sObj.get('LastModifiedById');
		tobj.Description__c=des;
       
        return tobj;
    
    }
    
    public static string aLink(Id lid,String word){
        return '<a href="/lightning/r/'+ lid +'/view" target="_self">'+ word +'</a>';
    }
    
    @AuraEnabled
    public static string getIdPrefix(){
        //Schema.DescribeSObjectResult k=Application__c.sObjectType.getDescribe();
        return ''; //k.getKeyPrefix();
    }
    
    @AuraEnabled
    public static string getUserName(Id id){
        //UserController userObj=new UserController();
        //User userDetails= (User)userObj.getById(id); 
        return '';// userDetails.Name;
    }
  
    @AuraEnabled
    public static List<SObject> getByLike(Id id,String searchTerm){
       string queryString = 'SELECT Name,Event_Date__c,Event_Type__c,Related_Id__c,Object_Id__c, Related_User_Id__c,'
           				+'Title__c,Subtitle__c,Description__c, Related_Object_Name__c'
                       +' FROM Timeline_Event__c'
                       +' WHERE';
        
       if(!string.isBlank(id)){
            queryString += ' Object_Id__c = \'' + String.escapeSingleQuotes(id) +  '\' AND';
        }
       if(!string.isBlank(searchTerm)){
            string removeQuotes = String.escapeSingleQuotes(searchTerm);
            queryString += ' Title__c LIKE  \'%' + removeQuotes +  '_%\'';
        }
       queryString += ' ORDER BY Id DESC LIMIT 1000';
       List<sObject> entities = Database.query(queryString);
       return entities;
    }
}