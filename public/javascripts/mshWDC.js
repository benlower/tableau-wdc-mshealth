// function requestMSHProfileByUrl(url) {
// 	$.getJSON(url, function(json, status, xhr) {
// 		// TODO:  we've not yet implemented Paging
// // 		var stringRep = JSON.stringify(rows);
// // 
// // 		var pagingLink = xhr.getResponseHeader("Link");
// // 		var token = "";
// // 		if (pagingLink) {
// // 			stringRep = pagingLink.toString();
// // 			if (stringRep.length > 0) {
// // 				// TODO:  this is not implemented yet
// // 				token = stringRep.substring(1, stringRep.indexOf(">;rel='next'"));
// // 			}
// // 		}

//   		tableau.dataCallback(flattenMSHData(json), token, token.length > 0);
// 	}); 
// }

// function requestMSHProfile(accessToken) {
//     $.ajaxSetup({
//   		headers : {'Authorization': 'bearer ' + accessToken}
// 	});

//     var url = 'https://api.microsofthealth.net/v1/me/Activities/';

//     requestMSHProfileByUrl(url);
// }
(function() {
// Use Moment to convert dates to acceptible format for Tableau
function MSHDateToTableauDate(dateToConvert) {
	// Use moment
	var moDate = moment(dateToConvert).format("YYYY-MM-DD HH:mm:ss.SSS");
	
	return moDate;
}

$(document).ready(function() {
	var accessToken = Cookies.get("accessToken");
	var hasAuth = accessToken && accessToken.length > 0;
	updateUIWithAuthState(hasAuth);
	
	$("#mshconnectbutton").click(function() {
		console.log('here');
		doAuthRedirect();
	});
	
	$("#getDataButton").click(function() {
		tableau.connectionName = "MS Health Data";
		tableau.submit();
	});
});

// This will redirect the user to MS Health login
function doAuthRedirect() {
	// TODO:  figure out how to use cookies here
	var clientID = Cookies.get("clientId");
	clientID = "000000004015C284";

	console.log('client id: ' + clientID);
	var urlParams = "?client_id=" + clientID + "&scope=mshealth.ReadProfile%20mshealth.ReadActivityHistory%20mshealth.ReadDevices%20mshealth.ReadActivityLocation&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fredirect";
	// var urlParams = "?client_id=" + clientID + "&scope=mshealth.ReadProfile&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fredirect";
	var url = Cookies.get("authUrl") + urlParams;
	
	url = "https://login.live.com/oauth20_token.srf" + urlParams;
	console.log('redirecting to: ' + url);
	window.location.href = url;
}

function updateUIWithAuthState(hasAuth) {
	if (hasAuth) {
		$("#notsignedin").css('display', 'none');
		$("#signedin").css('display', 'inline');
		$("#getDataButton").prop("disabled",false);
	} else {
		$("#notsignedin").css('display', 'inline');
		$("#signedin").css('display', 'none');
		$("#getDataButton").prop("disabled",true);
	}
}

// Use Moment to convert an ISO 8061 Duration to HH:mm:ss format for Tableau
function durationToString(duration) {
  var momentDuration = moment.duration(duration)          // get a duration from the string we passed in (gets this duration in milliseconds)
  
  return momentDuration.hours() + ":" + momentDuration.minutes() + ":" + momentDuration.seconds();
}

function flattenMSHData(data) {
  var i;
  var ret = [];
  var runData = data["runActivities"];
  var bikeData = data["bikeActivities"];
  var freePlayData = data["freePlayActivities"];
  
  // Run Activities
  if(runData) {
	  for(i=0; i < runData.length; i++) {
	    ret.push(processMSHActivity(runData[i], "Run"));
	  }
  }
  
  // Bike Activities
  if(bikeData) {
	for(i=0; i < bikeData.length; i++) {
		ret.push(processMSHActivity(bikeData[i], "Bike"));
	}
  }

  
  // FreePlay Activities
  if(freePlayData) {
	  for(i=0; i < freePlayData.length; i++) {
	    ret.push(processMSHActivity(freePlayData[i], "FreePlay"));
	  }
  }
  
  return ret;
}

// -------------------------------------------------------------------------------- //
// MS Health Activities
// -------------------------------------------------------------------------------- //

// ---------- Run, Bike, FreePlay Activities ---------- //
function processMSHActivity(activity, activityType) {
	var totalDistance;
	
	// Make sure we have distance summary
	if(activity["distanceSummary"]) {
		totalDistance = activity["distanceSummary"]["totalDistance"];
	} else {
		totalDistance = null;
	}
	
		// We have to have default values or else any missing data in our return json will screw us up
		// Note:  we have to make sure our datetimes are formatted as Tableau expects
		
	var activityRow = {
		"activityType": activityType,
		"activityID": activity["id"],
		"activityCaloriesBurned": activity["caloriesBurnedSummary"]["totalCalories"] || null,
		"activityDistance": totalDistance || null,
		"activityDuration": durationToString(activity["duration"]) || null,
		"activityStart": MSHDateToTableauDate(activity["startTime"]) || null, 
		"activityEnd": MSHDateToTableauDate(activity["endTime"]) || null,
		"activityHRAvg": activity["heartRateSummary"]["averageHeartRate"] || null,
		"activityHRPeak": activity["heartRateSummary"]["peakHeartRate"] || null,
		"activityHRLow": activity["heartRateSummary"]["lowestHeartRate"] || null,
		"activityHREnding": activity["performanceSummary"]["finishHeartRate"] || null
	};
	
	return activityRow;
}

// -------------------------------------------------- //
// WDC-specific things
// -------------------------------------------------- //
var myConnector = tableau.makeConnector();

myConnector.init = function(initCallback) {
	tableau.authType = tableau.authTypeEnum.custom;
	
	// Show UI for auth only if we're in auth phase
	if (tableau.phase == tableau.phaseEnum.authPhase) {
		$("#getDataButton").css('display', 'none');
	}
	
	var accessToken = Cookies.get("accessToken");
	console.log('Access token: ' + accessToken);
	
	var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
	updateUIWithAuthState(hasAuth);
	
	initCallback();
	
	if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
		if (hasAuth) {
			tableau.password = accessToken;
			
			if (tableau.phase == tableau.phaseEnum.authPhase) {
				// auto-submit here if we are in the auth phase
				tableau.submit();
			}

			return;
		}
	} else {
		if (!hasAuth) {
			tableau.abortWithError("Don't have an access token. Giving up");
		}
	}
};

myConnector.getSchema = function(schemaCallback) {
	// Get our schema from a local JSON file
	$.getJSON("./javascripts/mshWDC-Schema.json", function(schemaJson) {
		schemaCallback(schemaJson);
	});
};

myConnector.getData = function(table, doneCallback) {
	console.log('our cookie: ' + Cookies.get("accessToken"));
	
	$.ajaxSetup({
		headers : {'Authorization': 'bearer ' + accessToken}
	});
	console.log('access token: ' + accessToken);

	var url = 'https://api.microsofthealth.net/v1/me/Activities/';
	var activity = '';
	
	switch (table.tableInfo.id) {
		case "bikeActivity":
			activity = "Bike";
			break;
			
		case "runActivity":
			activity = "Run";
			break;
	
		default:
			activity = "FreePlay";
			break;
	};
	
	url += "?activityTypes=" + activity + "&maxPageSize=1000";
	
	$.getJSON(url, function(json, status, xhr) {
		table.appendRows(flattenMSHData(json));
		doneCallback();
		//tableau.dataCallback(flattenMSHData(json), token, token.length > 0);
	});
};

tableau.registerConnector(myConnector);
})();

// MS Health Data Properties (available)

// Run
/*
PerformanceSummary
DistanceSummary
PausedDuration
SplitDistance
Id 
UserId
DeviceId
StartTime
EndTime
DayId
CreatedTime
CreatedBy
Name
Duration
ActivityType
CaloriesBurnedSummary
HeartRateSummary
ActivitySegments
MinuteSummary
MapPoints
*/


// Bike (same as Run)
/*
PerformanceSummary
DistanceSummary
PausedDuration
SplitDistance
Id 
UserId
DeviceId
StartTime
EndTime
DayId
CreatedTime
CreatedBy
Name
Duration
ActivityType
CaloriesBurnedSummary
HeartRateSummary
ActivitySegments
MinuteSummary
MapPoints
*/


// FreePlay (same as Run/Bike but missing two)
/*
PerformanceSummary		xxx not in FreePlay
DistanceSummary			xxx not in FreePlay
PausedDuration
SplitDistance
Id 
UserId
DeviceId
StartTime
EndTime
DayId
CreatedTime
CreatedBy
Name
Duration
ActivityType
CaloriesBurnedSummary
HeartRateSummary
ActivitySegments
MinuteSummary
MapPoints
*/