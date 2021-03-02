@IsTest
private with sharing class TestAccountController {
	static IController controller = new accountController();
    static iprofilePicture controllerExtention = new accountController();
    static Account acc = new Account();
    static accountController ctrl = new accountController();
    
    static void create(){
        acc.Name = 'testAcc1';
        insert acc;
    }
  
    @IsTest
    static void testCreate(){
        acc.Name = 'testAcc';
        Id Id = controller.create(acc);
        System.assertEquals(null, Id);
    }
    
    @IsTest
    static void testCreateMany(){
        acc.Name = 'testAcc1';

        List<Account> listAcc = new List<Account>(); 
        listAcc.add(acc);

        boolean isTrue = controller.createMany(listAcc);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEdit(){
        create();
        acc.Name = 'testAcc1';

        boolean isTrue = controller.edit(acc);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testEditMany(){
        create();

        acc.Name = 'testAcc2';
        List<Account> listAcc = new List<Account>(); 
        listAcc.add(acc);

        boolean isTrue = controller.editMany(listAcc);
        System.assertNotEquals(false, isTrue);
    }

    @IsTest
    static void testGetById(){
        create();

        Account acc = (Account)controller.getById(acc.Id);
        System.assertNotEquals(null, acc);

    }
    
    @IsTest
    static void testGetAllEmpty(){
        create();

        List<Account> accs = (List<Account>)ctrl.getAll();
        Integer resultlength = accs.size();
        System.assertNotEquals(true, resultlength > 0);

    }

    @IsTest
    static void testGetAll(){
        create();
		acc.Name = 'k';
        List<Account> accs = (List<Account>)ctrl.getAll(acc);
        Integer resultlength = accs.size();
        System.assertNotEquals(true, resultlength > 0);

    }
    
    @IsTest
    static void testGetAllNull(){
        List<Account> accs = (List<Account>)ctrl.getAll(null);
        Integer resultlength = accs.size();
        System.assertNotEquals(true, resultlength > 0);
    }

    @IsTest
    static void testRemove(){
        create();

        Id id = acc.Id;
        boolean isTrue = controller.remove(id);
        System.assertEquals(true, isTrue);
    }
    
    @IsTest
    static void testgetBillingAddress(){
        create();
        Account a = new Account();
        acc = accountController.getBillingAddress(acc.Id);
        System.assertEquals(true, acc != a);
    }
    
    @IsTest
    static void testgetProfileGender(){
        accountController aCtrl = new accountController();
		string a = aCtrl.getProfileGender(acc.Id);
        System.assertEquals(true, a == 'none');
    }
    
    @IsTest
    static void testupdateProfilePictureId(){
		string a = controllerExtention.updateProfilePictureId(null,'test');
        System.assertEquals('test',a);
    }
    
    @IsTest
    static void testgetProfilePictureId(){
		string a = controllerExtention.getProfilePictureId(acc.Id);
        System.assertEquals('',a);
    }
}