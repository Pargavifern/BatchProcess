public with sharing class UserController implements IUser{
     public SObject getById(Id id){
         SObject entity = [SELECT
                              Name,IsActive,ProfileId,UserRoleId
                         FROM User
                         WHERE Id=:id];
         return entity; 
     }
}