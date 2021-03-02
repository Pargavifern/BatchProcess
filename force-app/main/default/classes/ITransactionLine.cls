public interface ITransactionLine {
	List<sObject> getAllRelatedLoan(Id id);
    List<SObject> getAllRelatedByLimit(Id id,Integer lim);
    List<SObject> getAllRelatedByDay(Id id,Integer days);
    List<SObject> getAllRelatedLoan(Id id, Integer lim, Integer days); 
}