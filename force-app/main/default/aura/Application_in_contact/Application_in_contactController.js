({
    handleChange: function (cmp, event, helper) {
        cmp.set("v.recordValue",event.getParam("value"));  
    },
    
    NextPage: function(component, event, helper) {
        var recordTypeValue=component.get("v.recordValue");
        helper.getRecordId(component, event, helper,recordTypeValue);
    },
    
     cancelForm: function(component, event, helper) {
          $A.get("e.force:closeQuickAction").fire();
    }
})