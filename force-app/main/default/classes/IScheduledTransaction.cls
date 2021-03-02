public interface IScheduledTransaction {
	List<SObject> getMissedPayment(SObject value);
    void markPayments(scheduledPaymentInputs[] inputs);
}