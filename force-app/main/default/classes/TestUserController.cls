@IsTest
private with sharing class TestUserController {
    @IsTest
    static private void TestGetById(){
        IUser userObject = new UserController();
        SObject user = userObject.getById(UserInfo.getUserId());
        System.assertEquals(true, user!=null);
    }
}