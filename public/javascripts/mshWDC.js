// Processes an individual item in the itemizations section adding in 
// more fields to the rowData variable and rturning a collection of tableau rows
// function processItem(item, rowData) {
// 	var rows = [];
// 
// 	// clone the passed in rowData object
// 	var r = jQuery.extend(true, {}, rowData);
// 
// 	r["Item Name"] = item['name'];
// 	r["Item Id"] = item['item_detail']['item_id'];
// 	r["Item Variation Name"] = item['item_variation_name'];
// 	r["Item Variation Id"] = item['item_detail']['item_variation_id'];
// 	r["Item Quantity"] = parseFloat(item['quantity']);
// 	var cat = item['item_detail']["category_name"];
// 	if (cat.length === 0) {
// 		cat = "(Uncategorized)";
// 	}
// 
// 	r["Item Category"] = cat;
// 	r["Total Item Money"] = item['total_money']['amount'] / 100;
// 	r["Single Item Money"] = item['single_quantity_money']['amount'] / 100;
// 
// 	rows.push(r);
// 
// 	return rows;
// }
// 
// function processPayment(payment) {
// 	var r = {
// 		"Payment Id" : payment['id'],
// 		"Transaction Date" : payment['created_at'],
// 		"Payment Device Id" : payment['device']['id'],
// 		"Payment Device Name" : payment['device']['name'],
// 		"Payment Url" : payment['payment_url'],
// 		"Receipt Url" : payment['receipt_url'],
// 		"Payment Type" : payment['tender'][0]['name']
// 	};
// 
// 	var splitRows = [];
// 	for(var i in payment.itemizations) {
// 		var itemization = payment.itemizations[i];
// 		var itemData = processItem(itemization, r);
// 		splitRows = splitRows.concat(itemData);
// 	}
// 
// 	return splitRows;
// }
// 
// function processResponse(json) {
// 	var allRows = [];
// 
// 	// Passed back an array of payment items
// 	for(var i in json) {
// 		var payment = json[i];
// 		var newRows = processPayment(payment);
// 		allRows = allRows.concat(newRows);
// 	}
// 
// 	return allRows;
// }

function requestMSHProfileByUrl(url) {
	console.log('about to get our data...');
	
	$.getJSON(url, function(json, status, xhr) {
		// Lets start making some rows
		//var rows = processResponse(json);				// todo for more complex data
		
		console.log('our json: ' + JSON.stringify(json));
		
		// We have to have default values or else any missing data in our return json will screw us up
		// TODO -> make sure our datetimes are formatted as Tableau expects
		var rows = {
			'firstName': json.firstName || "",
			'middleName': json.middleName || "",
			'lastName': json.lastName || "",
			'lastUpdateTime': MSHDateToTableauDate(json.lastUpdateTime) || "",
			'birthdate': MSHDateToTableauDate(json.birthdate) || "",
			'postalCode': json.postalCode || "",
			'gender': json.gender || "",
			'height': json.height || "",
			'weight': json.weight || ""
		};

		var stringRep = JSON.stringify(rows);
		console.log('stringRep: ' + stringRep);

		var pagingLink = xhr.getResponseHeader("Link");
		var token = "";
		if (pagingLink) {
			stringRep = pagingLink.toString();
			if (stringRep.length > 0) {
				// we get something like <https://connect.squareup.com/v1/me/payments?limit=2&batch_token=QXZxWjgybEx…in_time=2014-07-31T23%3A52%3A35.489Z&end_time=2015-07-31T23%3A52%3A35.489Z>;rel='next'
				// back from the api. parse our just the link (I'm sure there's a better way)
				token = stringRep.substring(1, stringRep.indexOf(">;rel='next'"));
			}
		}

		console.log('about to tableau.dataCallback: ' + JSON.stringify(rows));
  		tableau.dataCallback(rows, token, token.length > 0);
	}); 
}

function requestMSHProfile(accessToken) {
	console.log('in requestMSHProfile');
    $.ajaxSetup({
  		headers : {'Authorization': 'bearer ' + accessToken}
	});

    var url = 'https://api.microsofthealth.net/v1/me/Activities/';

    requestMSHProfileByUrl(url);
}

// Use Moment to convert dates to acceptible format for Tableau
function MSHDateToTableauDate(dateToConvert) {
	// Use moment
	var moDate = moment(dateToConvert).format("YYYY-MM-DD HH:mm:ss.SSS");
	
	return moDate;
}

$(document).ready(function() {
	var accessToken = Cookies.get("accessToken");
	
	$("#getDataButton").click(function() {
		console.log('getDataButton clicked!');
		tableau.connectionName = "MS Health Data";
		tableau.submit();
	});

	var hasAuth = accessToken && accessToken.length > 0;

	if (hasAuth) {
		$("#notsignedin").css('display', 'none');
		$("#signedin").css('display', 'inline');
		$("#getDataButton").prop("disabled",false);
	} else {
		$("#notsignedin").css('display', 'inline');
		$("#signedin").css('display', 'none');
		$("#getDataButton").prop("disabled",true);
	}
});

// -------------------------------------------------- //
// WDC-specific things
// -------------------------------------------------- //
var myConnector = tableau.makeConnector();

myConnector.init = function() {
	console.log('init');
	var accessToken = Cookies.get("accessToken");

	var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;

	if (hasAuth) {
		$("#notsignedin").css('display', 'none');
		$("#signedin").css('display', 'inline');
		$("#getDataButton").prop("disabled",false);
	} else {
		$("#notsignedin").css('display', 'inline');
		$("#signedin").css('display', 'none');
		$("#getDataButton").prop("disabled",true);
	}

	if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
		if (hasAuth) {
			tableau.initCallback();
			tableau.password = accessToken;

			return;
		}
	} else {
		if (!hasAuth) {
			tableau.abortWithError("Don't have an access token. Giving up");
		}
	}

	tableau.initCallback();
};


myConnector.getColumnHeaders = function() {
	console.log('getColumHeaders');
	
	var fieldNames = ['firstName', 'middleName', 'lastName', 'lastUpdateTime', 'birthdate', 'postalCode', 'gender', 'height', 'weight'];
    var fieldTypes = ['string', 'string', 'string', 'datetime', 'datetime', 'string', 'string', 'int', 'int'];

  tableau.headersCallback(fieldNames, fieldTypes);
};


myConnector.getTableData = function(lastRecordToken) {
	console.log('in getTableData');
	
	if (lastRecordToken && lastRecordToken.length > 0) {
		requestMSHProfileByUrl(lastRecordToken);
	} else {
	    var accessToken = tableau.password;
	    requestMSHProfile(accessToken);	
	}
};


tableau.registerConnector(myConnector);