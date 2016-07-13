function initSchedulerOptions(){
   jQuery(".scheduler_timePerUsersPerTaskSummary table");
   // timePerUserPerTask is defined in html
   setTimePerUsersPerTaskSummaryTable(timePerUserPerTask);
   
   function reinitializeTableAndSelects(unselectedUserList, selectedUserList, taskUserList, taskHandlerId)
   {
      var userList = jQuery("select.scheduler_userList");
      var userTable = jQuery(".scheduler_addedUsers table tbody");
      
      jQuery(".scheduler_messageSave").text("");
      
      // Disable select2
      userList.select2("destroy");
      userList.empty();

      // Set unselected user list
      if(null != unselectedUserList)
      {
         for(var userId in unselectedUserList)
         {
            var userOption = document.createElement("option");
            userOption.setAttribute("value", userId);
            userOption.innerHTML = unselectedUserList[userId];

            // Add element to select list
            userList.append(userOption);
         }
      }
      userList.select2();

      // Set selected user list
      userTable.empty();
      if(null != selectedUserList && null != taskUserList)
      {
         for(var userId in selectedUserList)
         {
            if(userId == taskHandlerId)
            {
               addUser(userId, selectedUserList[userId], taskUserList[userId], false);
            }
            else
            {
               addUser(userId, selectedUserList[userId], taskUserList[userId], true);
            }
            
         }
      }
      
      checkTotalEffort();
   }
   
   // Add a user to the selected user table
   function addUser(userId, userName, time, removable)
   {
      var autoAffectation = false;
      if(0 > time)
      {
         time = 0;
      }
      
      if("" == time)
      {
         autoAffectation = true;
      }
      
      if(null == removable)
      {
         removable = true;
      }
      
      var addedUsers = jQuery(".scheduler_addedUsers");
      var userList = jQuery("select.scheduler_userList");
      
      var trUser = document.createElement("tr");
      trUser.setAttribute("data-userId", userId);
      
      // Remove column
      var tdRemoveUser = document.createElement("td");
      tdRemoveUser.setAttribute("class", "ui-state-error-text");
      trUser.appendChild(tdRemoveUser);
      
      if(removable)
      {
         var removeButton = document.createElement("a");
         removeButton.setAttribute("class", "ui-icon"); 
         tdRemoveUser.appendChild(removeButton);
      }
      
      // Username column
      var tdName = document.createElement("td");
      tdName.innerHTML = "" + userName;
      tdName.setAttribute("class", "scheduler_userName"); 
      trUser.appendChild(tdName);
      
      // Time column
      var tdTimeIput = document.createElement("td");
      tdTimeIput.setAttribute("class", "scheduler_userTime");
      trUser.appendChild(tdTimeIput);
      
      var timeInput = document.createElement("input");
      timeInput.setAttribute("type", "text"); 
      timeInput.setAttribute("value", time);
      timeInput.disabled = autoAffectation;
      tdTimeIput.appendChild(timeInput);
      
      // Button time column
      var tdAddTime = document.createElement("td");
      tdAddTime.setAttribute("class", "scheduler_addTime");
      trUser.appendChild(tdAddTime);
      
      var minusButton = document.createElement("input");
      minusButton.setAttribute("type", "button"); 
      minusButton.setAttribute("value", "-");
      minusButton.setAttribute("class", "scheduler_minusButton");
      minusButton.disabled = autoAffectation;
      tdAddTime.appendChild(minusButton);
      
      var plusButton = document.createElement("input");
      plusButton.setAttribute("type", "button"); 
      plusButton.setAttribute("value", "+");
      plusButton.setAttribute("class", "scheduler_plusButton");
      plusButton.disabled = autoAffectation;
      tdAddTime.appendChild(plusButton);
      
      // Auto time affectation column
      var tdAutoTimeAffectation = document.createElement("td");
      tdAutoTimeAffectation.setAttribute("class", "scheduler_autoAffectation");
      trUser.appendChild(tdAutoTimeAffectation);
      
      var autoAffectationButton = document.createElement("input");
      autoAffectationButton.setAttribute("type", "checkbox"); 
      autoAffectationButton.checked = autoAffectation; 
      tdAutoTimeAffectation.appendChild(autoAffectationButton);
      
      addedUsers.find("table tbody").append(trUser);
      
      checkTotalEffort();
      
      // Events
      $(minusButton).on("click", function(){
         
         var timeInput = $(this).parent().parent().find(".scheduler_userTime input");
         var newValue = parseInt(timeInput.val()) - 1;
         newValue = newValue < 0 ? 0 : newValue;
         timeInput.val(newValue);
         $(timeInput).trigger("change");
      });
      
      $(plusButton).on("click", function(){
         
         var timeInput = $(this).parent().parent().find(".scheduler_userTime input");
         timeInput.val(parseInt(timeInput.val()) + 1);
         $(timeInput).trigger("change");
      });
      
      $(timeInput).on("change", function(){
         
         checkTime($(timeInput));
         var newValue = parseFloat($(this).val());
         newValue = newValue < 0 ? 0 : newValue;
         $(this).val(newValue);
         checkTotalEffort();
      });
      
      $(autoAffectationButton).on("click", function(){

         var isChecked = $(this).prop("checked");
         var timeInput = $(this).parent().parent().find(".scheduler_userTime input");
         var addTimeInputs = $(this).parent().parent().find(".scheduler_addTime input");
         
         timeInput.prop( "disabled", isChecked);
         addTimeInputs.prop( "disabled", isChecked);
         
         if(isChecked)
         {
            timeInput.val(null);
         }
         else
         {
            timeInput.val("0");
         }
         
         checkTotalEffort();
      });
      
      if(removable)
      {
         $(removeButton).on("click", function(){

            var trUser = $(this).parent().parent();
            var userId = trUser.attr("data-userId");;
            var userName = trUser.find(".scheduler_userName").text();

            trUser.remove();

            var userOption = document.createElement("option");
            userOption.setAttribute("value", userId);
            userOption.innerHTML = userName;

            // Disable select2
            userList.select2("destroy");
            // Add element to select list
            userList.append(userOption);
            // Enable select2
            userList.select2();

            checkTotalEffort();
         });
      }
   }
   
   
   function checkTotalEffort()
   {
      var userTable = jQuery(".scheduler_addedUsers table tbody");
      var usersTime = userTable.find(".scheduler_userTime input");
      var usersAutoAffect = userTable.find(".scheduler_autoAffectation input");
      var selectedTaskId = jQuery("select.scheduler_taskList option:selected").val();
      // One or more user have auto affected time
      var atLeastOneAutoAffectation = false;
      
      // Add users time
      var totalUserTime = 0;
      for(var i=0 ; i<usersTime.length ; i++)
      {
         var userTime = isNaN(parseFloat(usersTime.eq(i).val())) ? 0 : parseFloat(usersTime.eq(i).val());
         totalUserTime = parseFloat(totalUserTime) + userTime;
         totalUserTime = totalUserTime.toFixed(1);
         if(usersAutoAffect.eq(i).prop("checked"))
         {
            atLeastOneAutoAffectation = true;
         }
         
      }
      console.log(totalUserTime);
      // Write total users time
      jQuery(".scheduler_totalAffectedEffort").text(totalUserTime);
      
      
      var totalAffectedEffortComparison = jQuery(".scheduler_totalAffectedEffortComparison");
      var saveTaskModificationsButton = jQuery(".scheduler_saveTaskModificationsButton");
      
      // Get total estimed effort on task
      var totalEstimedEffort = parseFloat(jQuery(".scheduler_taskEffortEstim").eq(0).text());

      // Check if total users effort is equal to estimed effort or if at least one user time is auto affected
      if((totalEstimedEffort == totalUserTime || atLeastOneAutoAffectation) && "" != selectedTaskId)
      {
         totalAffectedEffortComparison.removeClass("error_font");
         totalAffectedEffortComparison.addClass("success_font");
         saveTaskModificationsButton.prop( "disabled", false );
      }
      else
      {
         totalAffectedEffortComparison.removeClass("success_font");
         totalAffectedEffortComparison.addClass("error_font");
         saveTaskModificationsButton.prop( "disabled", true );
      }
   }
   
   function checkRegexp(o, regexp, n) {
      o.removeClass("ui-state-error");
      if (!(regexp.test(o.val()))) {
         o.addClass("ui-state-error");
         //updateTips(n);
         return false;
      } else {
         return true;
      }
   }
   
   /**
    * Check if time respect imputations standard
    * @param input element
    * @returns {undefined}
    */
   function checkTime(input)
   {
      checkRegexp($(input), /^[0-9]+(\.[0-9][0-9]?5?)?$/i, "format:  '1',  '0.3'  or  '2.55' or '2.125'");
   }
   
   /**
    * Set summary table
    * @param {type} timePerUserPerTask : [taskId => 'users' => [user => time], 
    *                                               'taskId' => taskId]
    * @returns {undefined}
    */
   function setTimePerUsersPerTaskSummaryTable(timePerUserPerTask)
   {
      var timePerUserPerTaskSummaryTable = jQuery(".scheduler_timePerUsersPerTaskSummary table");
      var timePerUserPerTaskSummaryTableBody = timePerUserPerTaskSummaryTable.find("tbody");
      timePerUserPerTaskSummaryTableBody.empty();
      
      // For each task
      for(var task in timePerUserPerTask)
      {
         var taskTr = document.createElement("tr");
         taskTr.setAttribute("data-taskId", task);
         taskTr.setAttribute("class", "scheduler_taskRow");
         timePerUserPerTaskSummaryTableBody.append(taskTr);
         
         var removeTaskTd = document.createElement("td");
         removeTaskTd.setAttribute("class", "ui-state-error-text");
         taskTr.appendChild(removeTaskTd);
         
         var removeButton = document.createElement("a");
         removeButton.setAttribute("class", "ui-icon"); 
         removeTaskTd.appendChild(removeButton);
         
         var taskIdTd = document.createElement("td");
         taskIdTd.innerHTML = task;
         taskTr.appendChild(taskIdTd);
         
         var taskTd = document.createElement("td");
         taskTd.innerHTML = timePerUserPerTask[task]['taskName'];
         taskTr.appendChild(taskTd);
         
         var taskExternalReferenceTd = document.createElement("td");
         taskExternalReferenceTd.innerHTML = timePerUserPerTask[task]['externalReference'];
         taskTr.appendChild(taskExternalReferenceTd);
         
         var usersTd = document.createElement("td");
         usersTd.innerHTML = "";
         taskTr.appendChild(usersTd);
            
         var timePerUser = [];
         // For each user
         for(var user in timePerUserPerTask[task]['users'])
         {
            timePerUser.push(user + " (" + timePerUserPerTask[task]['users'][user] + ")");
         }
         usersTd.innerHTML = timePerUser.join(", ");
         
         // On task row click
         $(taskTd).on("click", function(){
            var taskId = jQuery(this).parent(".scheduler_taskRow").attr("data-taskId");
            var taskList = jQuery("select.scheduler_taskList");

            // Select task
            taskList.val(taskId);
            // Trigger change event on task list to update
            taskList.trigger("change");
         });
         
         // On remove button click
         $(removeButton).on("click", function(){
            var parentRow = jQuery(this).parent("td").parent("tr.scheduler_taskRow");
            var taskId = parentRow.attr("data-taskId");

            jQuery.ajax({ 
               url: 'reports/scheduler_ajax.php',
               async:false,
               data: {
                  action: 'setTaskUserList',
                  taskId: taskId,
                  taskUserList: "",
               },
               type: 'post',
               success: function(data) {
                  data = JSON.parse(data);
                  var messageSaveContainer = jQuery(".scheduler_messageSave");
                  if("SUCCESS" == data["scheduler_status"])
                  {
                  }
                  else
                  {
                  }

                  if(null != data['scheduler_timePerUserPerTaskLibelleList'])
                  {
                     setTimePerUsersPerTaskSummaryTable(data['scheduler_timePerUserPerTaskLibelleList']);
                  }
               },
               error: function(errormsg) {
                  console.log(errormsg);
               }
            });
         });
      }
      
   }
   
   // ++++++++++ Events ++++++++++
   
   // On change in the task list
   jQuery(".scheduler_taskList").on("change", function(){
      
      var selectedTaskId = jQuery("select.scheduler_taskList option:selected").val();
      var usersAffectationsContainer = jQuery(".scheduler_usersAffectations");
      
      if("" != selectedTaskId)
      {
         usersAffectationsContainer.show();
         // Get users and their time from the server
         jQuery.ajax({ 
            url: 'reports/scheduler_ajax.php',
            async:false,
            data: {
               action: 'getTaskUserList',
               taskId: selectedTaskId,
            },
            type: 'post',
            success: function(data) {
               data = JSON.parse(data);

               if(null != data['scheduler_taskEffortEstim'])
               {
                  jQuery(".scheduler_taskEffortEstim").text(data['scheduler_taskEffortEstim']);
               }

               reinitializeTableAndSelects(data['scheduler_unselectedUserList'], data['scheduler_selectedUserList'], data['scheduler_taskUserList'], data['scheduler_taskHandlerId']);
               
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
         });
      }
      else
      {
         usersAffectationsContainer.hide();
      }
      
      
   });
   
   // On add user button click
   jQuery(".scheduler_addUserButton").on("click", function(){
      
      var selectedTaskId = jQuery("select.scheduler_taskList option:selected").val();
      if("" != selectedTaskId)
      {
         var addedUsers = jQuery(".scheduler_addedUsers");
         var userList = jQuery("select.scheduler_userList");

         var userId = userList.find("option:selected").val();
         var userName = userList.find("option:selected").text();

         jQuery(".scheduler_userList option:selected").remove();
         jQuery(".scheduler_userList").select2("val", null);;

         addUser(userId, userName, 0, true);
      }
      
   });
   
   // On save Task Modifications Button click
   jQuery(".scheduler_saveTaskModificationsButton").on("click", function(){
      
      var userTable = jQuery(".scheduler_addedUsers table tbody");
      var selectedTaskId = jQuery(".scheduler_taskList option:selected").val();
      var selectedTaskSummary = jQuery(".scheduler_taskList option:selected").text();
      if(null != selectedTaskId)
      {
         var trUsers = jQuery(".scheduler_addedUsers table tbody").find("tr"); 
         var todoUsers = Array();

         for(var i=0 ; i<trUsers.length ; i++)
         {
            var userId = trUsers.eq(i).attr("data-userId");
            var userTime = trUsers.eq(i).find(".scheduler_userTime input").val();

            var todoUser = {
               userId: userId,
               userTime: userTime
            };

            todoUsers.push(todoUser);
         }


         todoUsers = JSON.stringify(todoUsers);

         jQuery.ajax({ 
            url: 'reports/scheduler_ajax.php',
            async:false,
            data: {
               action: 'setTaskUserList',
               taskId: selectedTaskId,
               taskUserList: todoUsers,
            },
            type: 'post',
            success: function(data) {
               data = JSON.parse(data);
               var messageSaveContainer = jQuery(".scheduler_messageSave");
               if("SUCCESS" == data["scheduler_status"])
               {
                  messageSaveContainer.removeClass("error_font");
                  messageSaveContainer.addClass("success_font");
                  messageSaveContainer.text("{t}Users have been affected to task{/t}: " + selectedTaskSummary);
               }
               else
               {
                  messageSaveContainer.removeClass("success_font");
                  messageSaveContainer.addClass("error_font");
                  messageSaveContainer.text(data["scheduler_status"]);
               }
               
               if(null != data['scheduler_timePerUserPerTaskLibelleList'])
               {
                  setTimePerUsersPerTaskSummaryTable(data['scheduler_timePerUserPerTaskLibelleList']);
               }
               
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
         });
      }
      
   });
   
   
   // On save options Button click
   jQuery("#tabsScheduler_tabOptions .scheduler_saveOptionsButton").on("click", function(){
      
      var taskProviderId = jQuery("#tabsScheduler_tabOptions .scheduler_taskProvider:checked").val();

      
      jQuery.ajax({ 
            url: 'reports/scheduler_ajax.php',
            async:false,
            data: {
               action: 'setOptions',
               taskProvider: taskProviderId,
            },
            type: 'post',
            success: function(data) {
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
         });
   });

}
