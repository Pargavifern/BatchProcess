global class SCollateralExpired implements Schedulable {
    global void execute(SchedulableContext SC){
        ICollateral colCtrl=new CollateralController();
        colCtrl.setExpired();
    }
}