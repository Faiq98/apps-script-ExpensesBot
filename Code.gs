var token = ""; //bot token !
var telegramUrl = "https://api.telegram.org/bot"+token;
var webAppUrl = ""; //spreadsheet webApp Url !

function setWebhook(){
  var url = telegramUrl+"/setWebhook?url="+webAppUrl;
  var response = UrlFetchApp.fetch(url);
}

function sendMessage(id, text, keyBoard){
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(id),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot'+token+'/', data);
}

function doPost(e){
  
  var contents = JSON.parse(e.postData.contents);
  var ssId = ""; //spreadshit id !
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName("Expenses"); //expenses sheet
  var reportSheet = SpreadsheetApp.openById(ssId).getSheetByName("Report"); //report sheet
  var sheet5 = SpreadsheetApp.openById(ssId).getSheetByName("Sheet5"); //testing sheet
  var sheetUrl = "https://docs.google.com/spreadsheets/d/"+ssId;
  
  //date
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  var nowDate = new Date();
  var date = (nowDate.getMonth()+1)+'/'+nowDate.getDate();
  
  //Display inline keyboard
  var keyBoard = {
    "inline_keyboard":[
      [{
        "text":"Expenses",
        "callback_data":"expenses"
      }],
      [{
        "text":"Others",
        "callback_data":"others"
      }]
    ]
  };
  
  if(contents.callback_query){
    var id = contents.callback_query.from.id;
    var data = contents.callback_query.data;
    
    if(id == /*User ID !*/){
      
      if(data == "others"){
        var keyBoard = {
          "keyboard":[
            [{
              "text":"Save Total Expenses"
            },
             {
               "text":"View Monthly Expenses"
             },
             {
               "text":"Delete Monthly Expenses"
             }],
            [{
              "text":"Delete Last Expenses"
            },
             {
               "text":"Delete All Expenses"
             }],
            [{
              "text":"Help"
            }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        };
        return sendMessage(id,"Please choose any option below 👇", keyBoard);
      }
      
      //display expenses list
      else if(data == "expenses"){
        var budget = sheet.getDataRange().getCell(1, 2).getValue();
        var savings = sheet.getDataRange().getCell(3, 2).getValue();
        var totalExpenses = sheet.getDataRange().getCell(2, 2).getValue();
        var message = "";
        for(i=5; i<=sheet.getLastRow(); i++){
          var dateValue = sheet.getRange(i, 1).getValue();
          var item = sheet.getRange(i, 2).getValue();
          var expenses = sheet.getRange(i, 3).getValue();
          message += (dateValue.getMonth()+1)+"/"+dateValue.getDate()+" : RM"+expenses+" ~ "+item+"\n";
        }
        return sendMessage(id, "Budget: RM"+budget+"\nSaving: RM"+savings+"\nExpenses: RM"+totalExpenses+"\n\nExpenses List: \n"+message, keyBoard);
      }
      
      //delete confirmation = yes
      else if(data == "yes"){
        while(true){
          if(sheet.getLastRow() !== 4.0){
            sheet.deleteRow(sheet.getLastRow());
          }else{
            return sendMessage(id, "Done delete all your expenses..", keyBoard);
          }
        }
      }
      
      //delete confirmation = no
      else if(data == "No"){
        return sendMessage(id, "The delete process has been cancel..", keyBoard);
      }
      
    }
  }
    
    else if(contents.message){
      var id = contents.message.from.id;
      var text = contents.message.text;
      
      if(id == /*User ID !*/){
        
        //handle /start text
        if(text == "/start"){
          return sendMessage(id, "Welcome to Duits \nPlease set your budget first: \nEg: -b 200", keyBoard);
        }
        
        //display myduits basic manual
        else if(text == "Help"){
          return sendMessage(
            id,
            "Basic manual: "+
            "\n"+
            "\n-b price : Add or update budget"+
            "\n---------------------------------------"+
            "\nitem -e price : Add expenses"+
            "\n---------------------------------------"+
            "\nExpenses : Display your expenses list"+
            "\n---------------------------------------"+
            "\nOthers : Display others button"+
            "\n---------------------------------------"+
            "\n"+
            "\nGoogle Sheet:"+
            "\n"+sheetUrl,
            keyBoard
          );
        }
        
        //add Expenses
        else if(text.indexOf("-e") !== -1){
          var item = text.split("-e");
          sheet.appendRow([date,item[0],item[1]]);
          return sendMessage(id, "Done add your expenses", keyBoard);
        }
        
        //add Budget in Expenses sheet
        else if(text.indexOf("-b") !== -1){
          if(sheet.getRange(1, 2).getValue() == ""){
            var item = text.split("-b");
            sheet.getRange(1, 2).setValue(item[1]);
            return sendMessage(id, "Done add your budget", keyBoard);
          }else{
            var item = text.split("-b");
            sheet.getRange(1, 2).setValue(item[1]);
            return sendMessage(id, "Done update your budget", keyBoard);
          }
        }
        
        //save total expenses
        else if(text == "Save Total Expenses"){
          var expenses = sheet.getDataRange().getCell(2, 2).getValue();
          var savings = sheet.getDataRange().getCell(3, 2).getValue();
          reportSheet.appendRow([monthNames[nowDate.getMonth()],expenses,savings]);
          return sendMessage(id, "Save expenses:\nExpenses: RM"+expenses+"\nSaving: RM"+savings, keyBoard);
        }
        
        //view monthly expenses
        else if(text == "View Monthly Expenses"){
          var message = "";
          for(i=2; i<=reportSheet.getLastRow(); i++){
            var month = reportSheet.getRange(i, 1).getValue();
            var expenses = reportSheet.getRange(i, 2).getValue();
            var savings = reportSheet.getRange(i, 3).getValue();
            message += month+"\nExpenses: RM"+expenses+"\nSaving: RM"+savings+"\n\n";
          }
          return sendMessage(id, message, keyBoard);
        }
        
        //delete last row expenses
        else if(text == "Delete Last Expenses"){
          if(sheet.getLastRow() !== 4.0){
            sheet.deleteRow(sheet.getLastRow());
            return sendMessage(id, "Last row of expenses has been delete..", keyBoard);
          }else{
            return sendMessage(id, "No record to be delete..", keyBoard);
          }
        }
        
        else if(text == "Delete All Expenses"){
          var keyBoard = {
            "inline_keyboard":[
              [{
                "text":"Yes",
                "callback_data":"yes"
              },
               {
                 "text":"No",
                 "callback_data":"No"
               }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
            remove_keyboard: true
          };
          return sendMessage(id,"Seriously 🤔", keyBoard);
        }
        
        //delete budget value in sheet1
        else if(text == "deleteb"){
          sheet.getRange(1, 2).clearContent();
          return sendMessage(id, "budget has been delete..", keyBoard);
        }
        
        //delete last report value in reportSheet
        else if(text == "Delete Monthly Expenses"){
          if(reportSheet.getLastRow() !== 1.0){
            reportSheet.deleteRow(reportSheet.getLastRow());
            return sendMessage(id, "Last row of monthly expenses has been delete..", keyBoard);
          }else{
            return sendMessage(id, "No record to be delete..", keyBoard);
          }
        }
        
        //handle Wrong Format
        else{
          return sendMessage(id, "Wrong Format! Example: apple -e 10", keyBoard);
        }
      }
    }
  }