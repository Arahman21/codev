
/**
 * 
 * @param {boolean} redirect : true if user is redirect to planning tab
 * @returns {undefined}
 */
function createSchedulerTable(redirect) {
   if(null == redirect) {
      redirect = false;
   }
   if(redirect) {
      // Redirect to planning tab
      window.location.hash = '#tabsScheduler';
   }
   
   
   $( "#backlogTableBody" ).empty();
   scheduler.clearAll();
   
   $('#loading').show();  // show loading indicator

   var jsonConfigData;
   var jsonTimetrackData;
   var jsonProjectionData;

   var jsonConfigDataPromise = $.ajax({ url: 'scheduler/scheduler_ajax.php',
            data: {action: 'getSchedulerConfig'},
            type: 'post',
            dataType:"json",
            success: function(data) {
               jsonConfigData = data;
               //console.log("jsonConfigData", jsonConfigData);
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
   });
   
   var jsonTimetrackDataPromise = $.ajax({ url: 'scheduler/scheduler_ajax.php',
            data: {action: 'getExistingTimetracks'},
            type: 'post',
            dataType:"json",
            success: function(data) {
               jsonTimetrackData = data;
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
   });
   
    var jsonProjectionDataPromise = $.ajax({ url: 'scheduler/scheduler_ajax.php',
            data: {action: 'getProjection'},
            type: 'post',
            dataType:"json",
            success: function(data) {
               jsonProjectionData = data;
            },
            error: function(errormsg) {
               console.log(errormsg);
            }
   });
   
  
   $.when(jsonConfigDataPromise).done(function(){
      scheduler.createTimelineView({
         name:	"mTimeline",
         x_unit:	"day",
         x_date: "%j %M",
         x_step: 1,
         x_size: jsonConfigData.nbDaysToDisplay,
         x_start: 0,
         x_length: jsonConfigData.nbDaysToDisplay,
         event_dy : 'full',
         y_unit: jsonConfigData.userData,
         y_property:"user_id", 
         dx: 80,   // sets width of resource column
         render:"bar",
      });

      var windowStartDate = new Date(jsonConfigData.windowStartDate); // 'YYYY-MM-DD'

      scheduler.init('scheduler_here', windowStartDate, "mTimeline");
   });
   
   $.when(jsonConfigDataPromise, jsonTimetrackDataPromise).done(function(){
      scheduler.parse(jsonTimetrackData,"json");
   });
   
   $.when(jsonConfigDataPromise, jsonTimetrackDataPromise, jsonProjectionDataPromise).done(function(){
      scheduler.parse(jsonProjectionData["activity"],"json");
      
      if(undefined !== jsonProjectionData["backlog"]){
         $.each(jsonProjectionData["backlog"], function(userName, taskArray){
            var i = 0;
            $.each(taskArray, function(taskid, backlog){
               var trObject = $("#backlogTableBody").append("<tr></tr>");
               if(0 === i){
                  var tdUserObject = trObject.append("<td>"+userName+"</td>");
               }
               else{
                  var tdUserObject = trObject.append("<td></td>");
               }
               i++;
               var tdTaskObject = trObject.append('<td><a href="reports/issue_info.php?bugid='+taskid+'">'+taskid+'</a></td>');
               var tdBacklogObject = trObject.append("<td>"+backlog+"</td>");
            });              
         });
      }
      $('#loading').hide();  // hide loading indicator
   });
}


