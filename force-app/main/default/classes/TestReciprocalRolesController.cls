@IsTest
private with sharing  class TestReciprocalRolesController {
	static IContactRelation controllerExtention =  new ReciprocalRolesController();
    static IController controller =  new ReciprocalRolesController();
    static ReciprocalRolesController ctrl = new ReciprocalRolesController();
    static Reciprocal_Role__c reciprocalRole = new Reciprocal_Role__c();
    
    static void create(){
       reciprocalRole = new Reciprocal_Role__c();
       reciprocalRole.Name = 'Dad';
       reciprocalRole.Inverse_Role__c = 'Son';
       reciprocalRole.Create_Inverse_Role__c = true;
       insert reciprocalRole;
    }
    
    @IsTest
    static void testCreate(){
        Id Id = controller.create(null);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testTriggerValidation(){
        create();
        try
        {
            create();
        }
        
        //Validate error is thrown
        catch(Exception e)
        {
            System.Assert(e.getMessage().contains('Already there is a role exist'));
        }
    }
    
    @IsTest
    static void testCreateMany(){
        List<Reciprocal_Role__c> listReciprocalRole;

        boolean isTrue = controller.createMany(listReciprocalRole);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        create();
        
        reciprocalRole.Name = 'Dad';
        boolean isTrue = controller.edit(reciprocalRole);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){
        List<Reciprocal_Role__c> listReciprocalRole;

        boolean isTrue = controller.editMany(listReciprocalRole);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        create();
        reciprocalRole = (Reciprocal_Role__c)controller.getById(reciprocalRole.Id);
        System.assertNotEquals(null, reciprocalRole);

    }
    
    @IsTest
    static void testGetAllNone(){
        List<Reciprocal_Role__c> reciprocalRoles = (List<Reciprocal_Role__c>)ReciprocalRolesController.getAll();
        Integer resultlength = reciprocalRoles.size();
        System.assertNotEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAll(){
        List<Reciprocal_Role__c> reciprocalRoles = (List<Reciprocal_Role__c>)ReciprocalRolesController.getAll(null);
        Integer resultlength = reciprocalRoles.size();
        System.assertNotEquals(true, resultlength > 0);

    }

    @IsTest
    static void testGetAllPara(){
        create();
        
        Reciprocal_Role__c r = reciprocalRole;
        r.InverseRelationship__c = r.Id;
        
        List<Reciprocal_Role__c> reciprocalRoles = (List<Reciprocal_Role__c>)controller.getAll(reciprocalRole,reciprocalRole.Name);
        Integer resultlength = reciprocalRoles.size();
        System.assertNotEquals(true, resultlength > 0);

    }

    @IsTest
    static void testRemove(){
        create();
        
        boolean isTrue = controller.remove(reciprocalRole.Id);
        System.assertEquals(true, isTrue);
    }
}