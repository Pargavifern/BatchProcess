public with sharing class DateUtility {
    public static String formatDate(Date value, String formatString) {
        String formatedDate = Datetime.newInstance(value.year(), value.month(), value.day()).format(formatString);
        return formatedDate;
    }

    public static String formatDateTime(DateTime value, String formatString) {
        String formatedDate = value.format(formatString);
        return formatedDate;
    }
}