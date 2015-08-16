# tableau-wdc-mshealth
Tableau Web Data Connector for the Microsoft Health API.  Allows importing data to Tableau for visualization and analysis.
=======


Getting Started
---------------
* Register your app with the Microsoft Account Developer Center.  Details for this are in the [MS Health API Docs](http://developer.microsoftband.com/Content/docs/MS%20Health%20API%20Getting%20Started.pdf#page=3&zoom=auto,69,540)
* Create a file named config.js at the project root.  It will contain config info for your app including client ID and secret you'll get in step 1.  Config.js needs to look like the following:
 

```
module.exports = {
 'HOSTPATH': 'http://localhost',
 'PORT': 8080, 
 'MSHEALTH_CLIENT_ID': 'your_client_id', 
 'MSHEALTH_CLIENT_SECRET': 'your_client_secret', 
 'MSHEALTH_REDIRECT_URL': 'http://localhost:8080/redirect'
};
```

You can change host, port, and redirect URL.  If you change these make sure you also change them in app.js.
 
* Make sure you have Node.js installed
* npm install
* npm start
* You can now use the WDC.  Note: you'll only get data if you use the WDC's [Simulator](http://onlinehelp.tableau.com/current/api/wdc/en-us/help.htm#WDC/wdc_simulator.htm%3FTocPath%3DWeb%2520Data%2520Connector%2520SDK|_____1) or Tableau Desktop

Current Limitations
---------------
Currently this WDC is only pulling some of the data from the MS Health API.  See below for what's currently supported.

MS Health Object     | Supported?
-------- | ---
User Profile | No
Device    | No
Activity     | Partial
Summary |No


**Activity Support**
Currently this WDC is pulling in the following data for Run, Bike, and FreePlay activities:

Property      |   Supported?
--------  | ---
ID    | Yes
Calories Burned | Yes
Total Distance | Yes
Duration | Yes
Start Time | Yes
End Time | Yes
Heart Rate - Average | Yes
Heart Rate - Peak | Yes
Heart Rate - Lowest | Yes
Heart Rate - Ending | Yes