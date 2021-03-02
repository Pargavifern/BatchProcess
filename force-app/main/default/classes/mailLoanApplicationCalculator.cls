public with sharing class mailLoanApplicationCalculator{
    
    @AuraEnabled
    public static string sendMail(Id cid, Map<String,String> details){     
        
        mailLoanApplicationCalculator sameCtrl = new mailLoanApplicationCalculator();
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage(); 
        try{
            string trSchedule='style="border:1px solid #dddddd; padding:0.5rem;"';
            string schedule=details.get('schedule'),rowDetail, dummy;
            
            string quote=schedule.remove('"');
            string slash=quote.remove('\\');
            string removeLine=slash.replaceAll('\n', ',');
            List<string> stable=removeLine.split(',');
            
            Integer r=6,row,n=1;
            row=Integer.valueOf(details.get('payment'));  

            string scheduleDetails=' ';
             while(n <= row){
                 if(math.mod(n, 2)==0){
                     //color the even row
                     scheduleDetails= scheduleDetails +'<tr style="background-color:#f2fff7;" align="right">';
                 }
                 else{
                     scheduleDetails= scheduleDetails +'<tr align="right">';
                 }      
                Integer x=0;
                while(x < 6){
                    scheduleDetails = scheduleDetails +'<td '+trSchedule;
                    dummy = stable[r];
                    if(x == 0){
                        //align the payment no in center
                        scheduleDetails += 'align="center">';
                    }
                    else{
                        scheduleDetails +='>';
                        if(x!=1)
                            dummy = mailLoanApplicationCalculator.currecySeparator(Decimal.valueOf(stable[r])) ;
                        
                    }
                     scheduleDetails += dummy +'</td>';
                    x++;
                    r++;
                }
                scheduleDetails=scheduleDetails +'</tr>';
                n++;
            }   
            
            EmailTemplate template = [select id, subject, HTMLValue from EmailTemplate where Name = 'loan calculator details'];
            
            email.setTreatBodiesAsTemplate(true);
            email.setSubject(template.subject);
            
            email.setTargetObjectId(cid);
            email.setTemplateId(template.Id);
            email.setSenderDisplayName('Baytree');
            email.setSaveAsActivity(true);          
                
            String messageBody =template.HTMLValue +'<html> <body>'+
                '<h3 style="color:black;"> Summary </h3>'+
                ' <hr style="border: solid thin #008a39;" />'+
                '<table style="width:40%; height:12rem;">'+
                		'<tr> <td> Loan Amount </td> <td> '+mailLoanApplicationCalculator.currencySign() + mailLoanApplicationCalculator.currecySeparator(Decimal.valueOf(details.get('amount'))) +'</td> </tr> '+
                        '<tr> <td> Loan Product </td> <td> '+ details.get('loanPrdName') +'</td> </tr> ' ;
            if(details.get('interestProductName') != null){
               messageBody +='<tr> <td> Interest Product </td> <td> '+ details.get('interestProductName') +'</td> </tr> ';
            }
                
                messageBody += '<tr> <td> Interest Rate </td> <td> '+ details.get('interest') +'</td> </tr> '+
                		'<tr> <td> Term (Months) </td> <td> '+ details.get('term') +'</td> </tr> '+
                		'<tr> <td> Number of Payments </td> <td> '+ details.get('payment') +'</td> </tr> '+
                		'<tr> <td> Repayment Frequency </td> <td> '+ details.get('repayment') +'</td> </tr> '+
                		'<tr> <td> Date Paid Off </td> <td> '+ details.get('datePaid') +'</td> </tr> </table>'+

                        '<h3 style="color:black;"> Schedule </h3>'+
                '<table style="border-collapse:collapse; width:100%;"> '+
                '<tr style="background-color:#02724C; color:white; font-size:11pt;"> '+
                		'<th '+trSchedule+'> Payment Number </th>' +
                		'<th '+trSchedule+'> Payment Date </th>' +
                		'<th '+trSchedule+'> Balance </th>' +
                		'<th '+trSchedule+'> Interest </th>' +
                		'<th '+trSchedule+'> Principal </th>' +
                		'<th '+trSchedule+'> Total Payment </th> </tr> ' + scheduleDetails +
                 		'</table> '+
                    '<br /> This email is for information purposes only. The schedule is valid only if all payments are made on the due date and then only for the date shown.'+
                    'Any other transactions, payments or adjustments will affect the accuracy of the schedule. Please contact lender for more detailed information.'+
                '</body></html>';
			email.setHtmlBody(messageBody);
            
           Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {email};
           Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
            if (results[0].success) {
                System.debug('The email was sent successfully.');
            } else {
                System.debug('The email failed to send: '
                      + results[0].errors[0].message);
            }
            return 'success';
        }
        catch (Exception e) {
            System.debug(Logginglevel.ERROR, e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }  
    }
    
    public static string currecySeparator(Decimal currencyFormat){
        return currencyFormat.format().contains('.')?currencyFormat.format():(currencyFormat.format()+'.00') ;
    }
    
    public static string currencySign(){
        ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
        return orgSettings.UserSettings.currencySymbol; // currency symbol
    }
}