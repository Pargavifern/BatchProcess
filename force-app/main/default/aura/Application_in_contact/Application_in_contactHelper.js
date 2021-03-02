({
	getRecordId : function(component, event, helper, recordName) {
		var action = component.get("c.getByName");       
		action.setParams({  na : recordName  });
        action.setCallback(this, function(data){
            var dataObject=data.getReturnValue();
            var dataString=JSON.stringify(dataObject);
            var rId=JSON.parse(dataString);
            var bid=component.get("v.recordId");
            
            var createRecordEvent = $A.get("e.force:createRecord");
    		createRecordEvent.setParams({
                "entityApiName": "Application__c",  
                 "recordTypeId":rId.Id,
                "defaultFieldValues": {
                    'Contact__c' : bid
                }
    		});
   			createRecordEvent.fire();
            
        });       
        $A.enqueueAction(action);
	},
})