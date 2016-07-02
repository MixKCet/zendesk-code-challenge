jest.unmock('../models/TicketManager');

describe('TicketManager', () => {
	beforeEach( () => {
		const TicketManager = require('../models/TicketManager');
		var mock_tickets = [];
		for (var i = 0; i < 25; i++)
		{
			mock_tickets.push({id: i, updated_at: 1, created_at: 1});
		}

		TicketManager.data.storage = {};
		TicketManager.data.index = [];

		mock_tickets.forEach((ticket) => {
			TicketManager.addTicket(ticket, function () {});
		});
	});

	it('can handle malformed tickets', () => {
		const TicketManager = require('../models/TicketManager');
		var err_func = function(err) {
			if (err) return true;
			return false;
		};

		expect(TicketManager.addTicket({'blah': 'boop?'}, err_func)).toBe(true);
		expect(TicketManager.addTicket({}, err_func)).toBe(true);
		expect(TicketManager.addTicket([], err_func)).toBe(true);
		expect(TicketManager.addTicket([1,2,3], err_func)).toBe(true);
		expect(TicketManager.addTicket("string!", err_func)).toBe(true);
		expect(TicketManager.addTicket(null, err_func)).toBe(true);
		expect(TicketManager.addTicket(false, err_func)).toBe(true);
		expect(TicketManager.addTicket({'id' : '1'}, err_func)).toBe(false);
	});

	it('can detect duplicate tickets', () => {
		const TicketManager = require('../models/TicketManager');
		var err_func = function(err) {
			if (err) return true;
			return false;
		};

		expect(TicketManager.addTicket({'id' : '1', 'created_at': 1, 'updated_at': 1, }, err_func)).toBe(true);
		expect(TicketManager.addTicket({'id' : '1', 'created_at': 1, 'updated_at': 2, }, err_func)).toBe(false);
	});

	it('correctly index tickets', () => {
		const TicketManager = require('../models/TicketManager');
		expect(TicketManager.getIndex(0)).toBe(0);
		expect(TicketManager.getIndex(5)).toBe(5);
		expect(TicketManager.getIndex(24)).toBe(24);	
	});

	it('correctly store ticket data', () => {
		const TicketManager = require('../models/TicketManager');
		expect(TicketManager.data.storage[0].id).toBe(0);
		expect(TicketManager.data.storage[5].id).toBe(5);
		expect(TicketManager.data.storage[24].id).toBe(24);
	});

	it('can handle ticket deletion', () => {
		const TicketManager = require('../models/TicketManager');
		expect(TicketManager.removeTicket('25', function (err) {
			if (err) return true;
			return false;
		})).toBe(true);
		expect(TicketManager.removeTicket('4', function (err) {
			if (!err) return true;
			return false;
		})).toBe(true);
		expect(TicketManager.getIndex(24)).toBe(23);
		expect(TicketManager.getIndex(4)).toBe(-1);
		expect(typeof TicketManager.data.storage['4']).toBe('undefined');
	});

	it('can handle ticket duplication', () => {
		const TicketManager = require('../models/TicketManager');
		var new_ticket = { 'id': 4 };
		expect(TicketManager.addTicket(new_ticket, function (err) {
			if (!err) return true;
			return false;
		})).toBe(true);
		expect(TicketManager.getIndex(4)).toBe(24);
		expect(TicketManager.data.index.length).toBe(25);
	});

	it('can server more requests', () => {
		const TicketManager = require('../models/TicketManager');
		var pageSize = 25;
		expect(TicketManager.loadMore(-1, pageSize, (err, tickets) => {
			if (!err) return true;
			return false;
		})).toBe(true);

		expect(TicketManager.loadMore(-1, pageSize, (err, tickets) => {
			return tickets.length;
		})).toBe(25);

		expect(TicketManager.loadMore(-1, pageSize, (err, tickets) => {
			return tickets[0].id;
		})).toBe(24);

		expect(TicketManager.loadMore(5, pageSize, (err, tickets) => {
			return tickets[0].id;
		})).toBe(4);

		expect(TicketManager.loadMore(0, pageSize, (err, tickets) => {
			if (err) return true;
			return false;
		})).toBe(true);

		TicketManager.removeTicket('4', function () {});

		expect(TicketManager.loadMore(4, pageSize, (err, tickets) => {
			if (err) return true;
			return false;
		})).toBe(true);
	});
});