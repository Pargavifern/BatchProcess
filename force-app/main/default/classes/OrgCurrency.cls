public class OrgCurrency {
    public string orgCurr {get; set;}
    
    public OrgCurrency(){ //get currency symbol
        ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
        orgCurr = orgSettings.UserSettings.currencySymbol;
        //orgCurr = UserInfo.getDefaultCurrency();
    }
}