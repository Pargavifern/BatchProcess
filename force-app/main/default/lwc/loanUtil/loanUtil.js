/* LoanUtil.js */
/**
 * Returns whether provided value is a function
 */
export function getDayInterest(interestCompoundingFrequency, dayCount, repaymentFrequency, rate, amount, calculationMethod) {

    var dc = 0;
    var compoundPeriod = 3;
    var compoundNum = 1;
    var repaymentPeriod = 3;
    var repaymentNum = 1;
    var compound = 1;
    var p, c, _i;
    var repaymentPOY;
    var compoundPOY;


    function daysInYear(dayCount) {
        switch (dayCount) {
            case 0:
                return 365.25;
            case 1:
                return 365;
            case 2:
                return 360;
            case 3:
                return 360;
            case 4:
                return 365.25;
            default:
                return 365;
        }
    }


    function getDayInterest() {

        var returnVal;

        repaymentPOY = partOfYear(dc, repaymentPeriod);
        compoundPOY = partOfYear(dc, compoundPeriod);
        //var termPOY = partOfYear(dc, termPeriod);

        p = repaymentPOY / repaymentNum;
        c = compoundPOY / compoundNum;


        _i = rate / 100;

        if (compound === 0) {
            //simple
            returnVal = calculateInterestSimple();
        } else {
            //compound
            returnVal = calculateInterestCompound();
        }
        return returnVal;
    }

    function calculateInterestCompound() {
        return amount * (Math.pow(Math.pow(1 + (_i / compoundPOY), compoundPOY), 1 / daysInYear(dc)) - 1);

        // return amount * (Math.pow(1 + (_i / c), c / daysInYear(dc)) - 1);
    }

    function calculateInterestSimple() {
        return amount * _i * (1 / daysInYear(dc));
    }

    function SwitchValues() {

        switch (dayCount) {
            case "Actual / Actual":
                dc = 0;
                break;
            case "Actual / 365":
                dc = 1;
                break;
            case "30 / 360":
                dc = 2;
                break;
            case "Actual / 360":
                dc = 3;
                break;
            case "Actual / 365.25":
                dc = 4;
                break;
            default:
                dc = 69;
        }

        switch (calculationMethod) {
            case "Simple":
                compound = 0;
                break;
            case "Compound":
                compound = 1;
                break;
            default:
                compound = 1;
                break;
        }

        switch (interestCompoundingFrequency) {
            case 'Daily': //daily
                compoundPeriod = 1;
                compoundNum = 1;
                break;
            case 'Weekly': //weekly
                compoundPeriod = 2;
                compoundNum = 1;
                break;
            case 'Fortnightly': //fortnightly
                compoundPeriod = 2;
                compoundNum = 2;
                break;
            case 'Monthly': //monthly
                compoundPeriod = 3;
                compoundNum = 1;
                break;
            case 'Quarterly': //quarterly
                compoundPeriod = 3;
                compoundNum = 3;
                break;
            case 'Annual': //yearly
                compoundPeriod = 4;
                compoundNum = 1;
                break;
            default: //monthly
                compoundPeriod = 3;
                compoundNum = 1;
                break;
        }

        switch (repaymentFrequency) {
            case 'Daily':
                repaymentPeriod = 1;
                repaymentNum = 1;
                break;
            case 'Weekly': //weekly
                repaymentPeriod = 2;
                repaymentNum = 1;
                break;
            case 'Fortnightly': //fortnightly
                repaymentPeriod = 2;
                repaymentNum = 2;
                break;
            case 'Monthly': //monthly
                repaymentPeriod = 3;
                repaymentNum = 1;
                break;
            case 'Quarterly': //quarterly
                repaymentPeriod = 3;
                repaymentNum = 3;
                break;
            case 'Yearly': //yearly
                repaymentPeriod = 4;
                repaymentNum = 1;
                break;
            default: //monthly
                repaymentPeriod = 3;
                repaymentNum = 1;

                break;
        }
    }

    function getNumberOfDays(period) {
        switch (period) {
            case 1: // Day
                return 1;
            case 2: // Week
                return 7;
            case 3: // MOnth
                return 30.4166666667;
            case 4: // Year
                return 365;
            default:
                return 0;
        }
    }

    function partOfYear(dayCount, period) {
        var numberOfDays = getNumberOfDays(period);
        switch (dayCount) {
            case 0:
                return 365.25 / numberOfDays;
            case 1:
                return 365 / numberOfDays;
            case 2:
                return period === 3 ? 12 : 360 / numberOfDays;
            case 3:
                return 360 / numberOfDays;
            case 4:
                return 365.25 / numberOfDays;
            default:
                return 365 / numberOfDays;
        }
    }







    SwitchValues();

    return getDayInterest();

    //return (_iop * amount) / getNumberOfDays(repaymentPeriod);
}