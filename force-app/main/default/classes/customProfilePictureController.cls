public with sharing class customProfilePictureController {

    private static iprofilePicture profilePicture;

    public static void initObject(string objApiName) {
       switch on objApiName {
            when 'Contact' {
            profilePicture = new contactController();
            }
            when 'Collateral__c' {
            profilePicture = new CollateralController();
            }
        }
    }

    @AuraEnabled 
    public static String  updateProfilePictureId(Id id, String documentId, String objApiName) {
        initObject(objApiName);
        return profilePicture.updateProfilePictureId(id,documentId);
    }

    @AuraEnabled
    public static String getProfilePictureId(Id id, String objApiName){
       initObject(objApiName);
       return  profilePicture.getProfilePictureId(id);
    }

    @AuraEnabled
    public static String getPlaceholderUrl(String objApiName){
        String objectNameTrimmed = objApiName.replace('__c', '');
        String resourceName = objectNameTrimmed + '_DpPlaceholder';
       return  StaticResourceController.GetResourceURL(resourceName);
    }
}