public with sharing class ArrayUntility {
    public static Boolean listContains(Object[] source, Object target) {
        return (new Set<Object>(source)).contains(target);
    }
}