public interface IController {
   

   // to get all records by search parameters. 
   // value => object type paramter for all field search 
   // autoNumber => to search auto number field
   List<SObject> getAll(SObject value, String autoNumber);

   //to get records by its id
   SObject getById(Id id);

   //to instert single object
   Id create(SObject value);
   
   //to instert array of objects
   Boolean createMany(List<SObject> values);
   
   //to update single object
   Boolean edit(SObject value);

   //to update array of objects
   Boolean editMany(List<SObject> values);

   //to recomve the objects by its id
   Boolean remove(Id id);

}