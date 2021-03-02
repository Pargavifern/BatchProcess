public class taskController {
    @InvocableMethod(label='Delete Collateral task' description='used to delete the task of application collateral to loan')
    public static void updateTaskCollateral(List<Id> appId){
        Id app = appId[0];
        List<Task> tlist = [select Id, WhatId, Subject from Task where WhatId =: app and Subject like '%Follow-up: Collateral Expiration%'];
        delete tlist;
    }
}