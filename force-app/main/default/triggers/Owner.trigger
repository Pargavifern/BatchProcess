trigger Owner on Owner__c (before insert, before update) 
{ 
    if((Trigger.isInsert || Trigger.isUpdate) && Trigger.isBefore){
        for(Owner__c ac:Trigger.new)
        {
            Decimal sh=0;
           // sh=ac.Share__c; 
            Owner__c  own= new Owner__c();
            own.Account__c=ac.Account__c;
            List<Owner__c> acList=OwnerController.getAll(own, null);
            if(acList!=null && !acList.isEmpty())
            {
                system.debug(acList);
                for(Owner__C oc:acList)
                {
                    if(oc.Id!=ac.Id)
                    { // while updating it fetches the current record detail.To avoid adding the same record share
                        	sh=sh+oc.Share__c; 
                        	
                	}
                   
                }
                decimal unshare=sh+ac.Share__c;
                 if(unshare > 100)
                	{
                        decimal sharing=100-sh;
                        ac.addError('Owners share must be less than or equal to '+ sharing +'%');
                	}
            }      
             Owner__c ow=new Owner__c();
              ow.Account__c=ac.Account__c;
              ow.Contact__c=ac.Contact__c;
              List<Owner__c> ccList=OwnerController.getAll(ow);
              if((Trigger.isInsert && ccList != null && !ccList.isEmpty()) || (Trigger.isUpdate && ccList.size()>1) )
              {
                  ac.addError('This contact is already an owner');  
              }
   
        }
          }         
    }