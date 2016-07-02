jest.unmock('../models/CustomDate');

describe('CustomDate', () => {
	it('can calculate the days between dates', () => {
		const CustomDate = require('../models/CustomDate');

		var date1 = new Date("2016-01-01");
		var date2 = new Date("2016-01-02");

		expect(CustomDate.daysBetween(date1, date2)).toBe(1);
		expect(CustomDate.daysBetween(date2, date1)).toBe(1);

		date1 = new Date("2016-01-02");
		date2 = new Date("2015-12-31");

		expect(CustomDate.daysBetween(date1, date2)).toBe(2);
		expect(CustomDate.daysBetween(date2, date1)).toBe(2);

		date1 = new Date("2016-01-02");
		date2 = new Date("2016-12-31");

		expect(CustomDate.daysBetween(date1, date2)).toBe(364);
		expect(CustomDate.daysBetween(date2, date1)).toBe(364);
	});

	it('can calculate the minutes between dates', () => {
		const CustomDate = require('../models/CustomDate');

		var date1 = new Date("2016-01-01T00:00");
		var date2 = new Date("2016-01-01T01:00");
		expect(CustomDate.minsBetween(date1, date2)).toBe(60);
		expect(CustomDate.minsBetween(date2, date1)).toBe(60);

		date1 = new Date("2016-01-01T01:00");
		date2 = new Date("2016-01-01T02:20");

		expect(CustomDate.minsBetween(date1, date2)).toBe(80);

		date1 = new Date("2016-01-01T01:00");
		date2 = new Date("2016-01-01T01:20");

		expect(CustomDate.minsBetween(date1, date2)).toBe(20);

		date1 = new Date("2016-01-01T01:00");
		date2 = new Date("2016-01-02T01:20");

		expect(CustomDate.minsBetween(date1, date2)).toBe((24 * 60) + 20);
	});
});