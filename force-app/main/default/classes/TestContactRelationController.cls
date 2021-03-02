@IsTest
private with sharing class TestContactRelationController {
	static IController controllerExtention=new ContactRelationController();
    static IController controller=new ContactRelationController();
    static Contact_Relationship__c cr = new Contact_Relationship__c();
    static Reciprocal_Role__c reciprocalRole = new Reciprocal_Role__c();
    static List<Contact> con = new List<Contact>();
   
    static void createRole(boolean inverse){
       createContact();
       reciprocalRole = new Reciprocal_Role__c();
       reciprocalRole.Name = 'Dad';
       reciprocalRole.Inverse_Role__c = 'Daughter';
       reciprocalRole.Create_Inverse_Role__c = inverse;
       insert reciprocalRole;
    }
    
    static void createContact(){
        con = new List<Contact>();
        Contact k;
        k = new Contact(LastName = 'Contact 1');
        con.add(k);
        k = new Contact(LastName = 'Contact 2');
        con.add(k);
        insert con;
    }
    
    static void create(boolean inverse){
        createRole(inverse);
        cr = new Contact_Relationship__c();
        cr.Contact__c = con[0].Id;
        cr.Related_Contact__c = con[1].Id;
        cr.Related_Role__c = reciprocalRole.Id;
        insert cr;
    }
  
    @IsTest
    static void testCreate(){

        Id Id = controller.create(cr);
        System.assertEquals(null, Id);
    }

	/*@IsTest
    static void testValidation(){
        create(true);
        try
        {
            create(true);
        }
        catch(Exception e)
        {
            System.Assert(e.getMessage().contains('Already there is an relationship exist between these two contacts'));
        }
    }*/
    
    @IsTest
    static void testCreateMany(){
        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        create(true);

        boolean isTrue = controller.edit(cr);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){

        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        
        create(true);

        Contact_Relationship__c cr1 = (Contact_Relationship__c)controller.getById(cr.Id);
        System.assertNotEquals(null, cr1);

    }

    @IsTest
    static void testGetAllParam1(){
        
        create(true);

        List<Contact_Relationship__c> crs = (List<Contact_Relationship__c>)controller.getAll(cr,'CR-000000');
        Integer resultlength = crs.size();
        System.assertNotEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAll(){
        create(true);
        List<Contact_Relationship__c> crs = (List<Contact_Relationship__c>)ContactRelationController.getAll();
        Integer resultlength = crs.size();
        System.assertEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAllParam2(){
        List<Contact_Relationship__c> crs = (List<Contact_Relationship__c>)ContactRelationController.getAll(null);
        Integer resultlength = crs.size();
        System.assertNotEquals(true, resultlength > 0);
    }

    @IsTest
    static void testRemove(){
        create(true);

        Id id = cr.Id;
        boolean isTrue = controller.remove(id);
        System.assertEquals(true, isTrue);
    }

}