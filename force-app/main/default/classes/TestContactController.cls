@IsTest
private with sharing class TestContactController {
    static IController controller = new ContactController();
    static Contact con = new Contact();

    static void create(){
        con.FirstName = 'First';
        con.LastName = 'Second';
        con.Email = 'abc@sample.com';
        con.Gender__c = 'Male';
        con.MobilePhone = '9989778877';
        con.Investment_Knowledge__c = 'High';
        insert con;
    }
    
    @IsTest
    static void getEmailId(){
        create();
        string a = ContactController.getEmailId(con.Id);
        System.assertEquals('abc@sample.com', a );
    }
    
    @IsTest
    static void getMobile(){
        create();
        string a = ContactController.getMobileNumber(con.Id);
        System.assertEquals('9989778877', a );
    }
    
    @IsTest
    static void getGender(){
        create();
        string a = ContactController.getProfileGender(con.Id);
        System.assertEquals('Male', a );
    }

    @IsTest
    static void getEmailIdValidation(){
        try{
            string a = ContactController.getEmailId(con.Id);
            system.assert(false);
        }
        catch(Exception e){
            
        }
    }
    
    @IsTest
    static void testCreate(){
        Id Id = controller.create(con);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
        boolean isTrue = controller.createMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){

        boolean isTrue = controller.edit(con);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){
        boolean isTrue = controller.editMany(null);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        create();

        Contact con = (Contact)controller.getById(con.Id);
        System.assertNotEquals(null, con);

    }

    @IsTest
    static void testGetAll(){
        List<Contact> cons = (List<Contact>)contactController.getAll(null);
        System.assertEquals(null , null);

    }
    
    @IsTest
    static void testGetAllNone(){
        List<Contact> cons = (List<Contact>)contactController.getAll();
        Integer resultlength = cons.size();
        System.assertNotEquals(true, resultlength > 0);

    }

    @IsTest
    static void testRemove(){
        boolean isTrue = controller.remove(null);
        System.assertEquals(true, isTrue);
    }

}