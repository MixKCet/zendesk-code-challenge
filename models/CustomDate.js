function CustomDate() {

};

var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

CustomDate.daysBetween = function( date1, date2 ) {
	var one_day= 1000*60*60*24;

	var date1_ms = date1.getTime();
	var date2_ms = date2.getTime();

	var difference_ms =  Math.sqrt(Math.pow(date2_ms - date1_ms, 2));

	return Math.round(difference_ms/one_day); 
};

CustomDate.minsBetween = function( date1, date2 ) {
	var one_minute = 1000*60;

	var date1_ms = date1.getTime();
	var date2_ms = date2.getTime();

	var difference_ms = Math.sqrt(Math.pow(date2_ms - date1_ms, 2));

	return Math.round(difference_ms / one_minute); 
};

CustomDate.getDateString = function(date) {
	var day = date.getDate();
	if (day < 10)
	{
		day = "0" + day;
	}
	var month = date.getMonth() + 1;
	if (month < 10)
	{
		month = "0" + month;
	}
	var year = date.getFullYear();
	return day + "/" + month + "/" + year;
};

CustomDate.getTimeString = function(date) {
	var hour = date.getHours();
	if (hour < 10)
	{
		hour = "0" + hour;
	}
	var minutes = date.getMinutes();
	if (minutes < 10)
	{
		minutes = "0" + minutes;
	}

	return hour + ":" + minutes;
};

CustomDate.getPrettyString = function(date, now) {
	date = new Date(date);
	var now = (now) ? new Date(now) : new Date();

	var min_difference = CustomDate.minsBetween(date, now);
	if (min_difference < 1)
	{
		return "less than a minute ago";
	}

	if (min_difference < 59)
	{
		return min_difference + " minutes ago";
	}

	var day_difference = CustomDate.daysBetween(date, now);
	var day = "";
	if (day_difference == 0)
	{
		day = "Today";
	}
	else if (day_difference < 7)
	{
		day = DOW[date.getDay()];
	}
	else
	{
		day = CustomDate.getDateString(date);
	}
	return day + " " + CustomDate.getTimeString(date);
};

module.exports = CustomDate;