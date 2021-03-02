public interface ITimelineEventController {
    //this is used to get multiple records using multiple id's
   List<SObject> getAllByLimit(Id id,Integer l);
    
    //used to assign timeline event values to this object
   SObject timelineTrigger(SObject obj,string tit,string sub,string des,string etype,string dml,string objName);
    
   string aLink(Id lid,String word); // create a link for the string
    
   string getIdPrefix(); // get object prefix to find which object it is
    
   string getUserName(Id id); // get user name
    
    List<SObject> getByLike(Id id,String searchTerm);
}