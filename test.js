var moment = require('moment')

var js = {
  "firstName": "Ben",
  "birthdate": "1976-06-01T00:00:00.000+00:00",
  "postalCode": "98103",
  "gender": "Male",
  "height": 1753,
  "weight": 90718,
  "preferredLocale": "en-US",
  "lastUpdateTime": "2015-08-08T16:03:22.154+00:00"
};

console.log("Our date from the API call: " + js.birthdate);
console.log("Our converted date: " + MSHDateToTableauDate(js.birthdate));


console.log("Our date from the API call: " + js.lastUpdateTime);
console.log("Our converted date: " + MSHDateToTableauDate(js.lastUpdateTime));


// Use Moment to convert dates to acceptible format for Tableau
function MSHDateToTableauDate(dateToConvert) {
	// Use moment
	var moDate = moment(dateToConvert).format("YYYY-MM-DD HH:mm:ss.SSS");
	
	return moDate;
}

/*
dd-MM-yyyy
dd-MMM
dd-MMM-yy
dd-MMM-yyyy
dd-MMM-yyyy HH:mm:ss
dd/MM/yyyy
h:mm a
HH.mm
hh.mm a
HH.mm.ss
hh.mm.ss a
hh:mm a
HH:mm:ss
hh:mma
M/d/yyyy HH:mm:ss
MM-dd-yyyy
MM-dd-yyyy HH:mm
MM/dd/yy
MM/dd/yy HH:mm:ss
MM/dd/yyyy
MM/dd/yyyy
MM/dd/yyyy HH:mm:ss
MM/dd/yyyy hh:mm:ss a
MMM yyyy
MMM-yy
MMMM dd yyyy
MMMM dd yyyy hh:mma
MMMM dd, yyyy
MMMM dd, yyyy HH:mm:ss
MMMM dd,yyyy
MMMM dd,yyyy HH:mm:ss
yyyy-MM-dd
yyyy-MM-dd HH:mm
yyyy-MM-dd HH:mm:ss
yyyy-MM-dd HH:mm:ss.SSS
yyyy-MM-dd HH:mm:ss.SSS
yyyy-MM-dd HH:mm:ss.SSS
yyyy/MM/dd
yyyy/MM/dd HH:mm:ss
*/