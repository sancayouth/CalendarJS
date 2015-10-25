/**
 * jquery.jacalendar.js
 *
 * Licensed under the MIT license.
 */

if (typeof jQuery === 'undefined') {
    throw new Error('JaCalendar\'s requires jQuery')
}
if (typeof _ === 'undefined') {
    throw new Error('JaCalendar\'s requires Underscore.js')
}
if (typeof moment === 'undefined') {
    throw new Error('JaCalendar\'s requires Moment.js')
}


;(function($, window, undefined) {
    'use strict';

    $.jaCal = function(options, element) {
        this.$el = $(element);
        this._init(options);
    };

    $.jaCal.defaults = {
        name: 'jaCal',
        language: 'en',
        view: 'month',
        events_source: '',
        events: [],
        tmpl_path: 'tmpls/',
        templates: {
            month: ''
        }
    };

    $.jaCal.prototype = {
        _init: function(options) {
            this.pluginName = 'JaCal';
            this.options = $.extend(true, {}, $.jaCal.defaults, options);
            this.today = moment().startOf('month');
            this.today.locale(this.options.language);
            this._bindEvents();
            this.render();
            this._loadEvents();

        },
        _loadEvents: function() {
            var self = this;
            var events = [];
            if (self.options.events_source.length) {
                $.ajax({
                    url: self.options.events_source,
                    dataType: 'json',
                    type: 'GET',
                    async: false
                }).done(function(json) {
                    if (json.events) {
                        events = json.events;
                    }
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    throw errorThrown;
                });
                self.options.events = events;
            }
        },
        _loadTemplate: function(name) {
            var self = this;
            if (self.options.templates[name]) {
                return;
            }
            $.ajax({
                url: self.options.tmpl_path + name + '.html',
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(html) {
                    self.options.templates[name] = _.template(html);
                }

            });
        },
        //https://github.com/moment/moment/issues/2433
        _forLocale: function(locale, fn) {
            var temp = moment.locale();
            moment.locale(locale);
            var result = fn();
            moment.locale(temp);
            return result;
        },
        _bindEvents: function() {
            this.$el
                .on('click', '.jacal-prev-button', {
                    ctx: this
                }, this.prev)
                .on('click', '.jacal-next-button', {
                    ctx: this
                }, this.next)
                .on('click', '.jacal-month-button', {
                    ctx: this
                }, this._showMonthsShort)
                .on('click', '.jacal-month', {
                    ctx: this
                }, this._showMonth)
                .on('click', '.event', {
                    ctx: this
                }, this._showEventsPerDay)
				.on('click', '.jacal-close-button', {
                    ctx: this
                }, this._closeEventsPerDay);
        },
        _getMonthToRender: function() {
            this._loadTemplate('month');
            var today = this.today.clone();
            var position = today.startOf('month').day() == 0 ? 7 : today.startOf('month').day();
            var start = today.startOf('month').subtract(position, 'day');
            var array_dates = [];
            for (var i = 0; i < 6; i++) {
                var div = $('<div class="row jacal-week-' + (i + 1) + '"></div>');
                for (var j = 0; j < 7; j++) {
                    var inner_div = $('<div>').addClass('col-1 jacal-day')
                        .attr('data-date', start.format('YYYY-MM-DD'))
                        .append('<div class="jacal-day-number">' + start.format('DD') + '</div>');
                    if (_.findWhere(this.options.events, {'date': start.format('YYYY-MM-DD')}))
                        inner_div.addClass('event');
                    if (!this.today.isSame(start, 'month'))
                        inner_div.addClass('disabled');
                    if (moment().isSame(start, 'day'))
                        inner_div.addClass('today');
                    div.append(inner_div);
                    start.add(1, 'day')
                }
                array_dates.push(div.wrap('<p/>').parent().html());
            }
            var values = {
                top: {
                    month: this.today.format('MMMM'),
                    year: this.today.year()
                },
                weekdays: this._forLocale(this.options.language, moment.weekdays),
                dates: array_dates
            }
            return this.options.templates[this.options.view](values);
        },
        _getMonthsShortToRender: function() {
            this._loadTemplate('months');
            var values = {
                year: this.today.format('GGGG'),
                months: this._forLocale(this.options.language, moment.monthsShort)
            };
            return this.options.templates[this.options.view](values);
        },
        _getEventstoRender: function() {
            this._loadTemplate('events');
			var values = {
                events : _.findWhere(this.options.events, {'date': this.today.format('YYYY-MM-DD')}),
                day: this.today.format('YYYY-MM-DD')
            };			
            return this.options.templates[this.options.view](values);
        },
        _showMonthsShort: function(event) {
            var self = event.data.ctx;
            self.options.view = 'months';
            self.render();
        },
        _showMonth: function(event) {
            var self = event.data.ctx;
            var date_str = $(this).data('date') + '-01';
            self.today = moment(date_str).locale(self.options.language);
            self.options.view = 'month';
            self.render();
        },
        _showEventsPerDay: function(event) {
            var self = event.data.ctx;
            self.today = moment($(this).data('date')).locale(self.options.language);
            self.options.view = 'events';
            self.render();
        },
		_closeEventsPerDay: function(event) {
			var self = event.data.ctx;
			 self.options.view = 'month';
             self.render();
		},
        //public methods
        setDate: function(date) {
            if (moment(date).isValid()) {
                this.today = moment(date).locale(this.options.language);
                this.options.view = 'month';
                this.render();
            } else {
                throw new Error('Invalid Date');
            }
        },
        getYear: function() {
            return this.today.year();
        },
        getMonth: function() {
            return this.today.month() + 1;
        },
        getMonthName: function() {
            return this.today.format('MMMM');
        },
        render: function() {
            this.$el.html('');
            this._loadTemplate(this.options.view);
            var data = null;
            switch (this.options.view) {
                case 'month':
                    data = this._getMonthToRender();
                    break;
                case 'months':
                    data = this._getMonthsShortToRender();
                    break;
                default:
                    data = this._getEventstoRender();
                    break;
            }
            this.$el.append(data);
        },
        prev: function(event) {
            var self = event.data.ctx;
            self.today.subtract(1, self.options.view === 'month' ? 'month' : 'year');
            self.render();
        },
        next: function(event) {
            var self = event.data.ctx;
            self.today.add(1, self.options.view === 'month' ? 'month' : 'year');
            self.render();
        }
    }

    $.fn.jaCal = function(options) {
        var instance = $.data(this, 'jaCal');
        this.each(function() {
            if (instance) {
                instance._init();
            } else {
                instance = $.data(this, 'jaCal', new $.jaCal(options, this));
            }
        });
        return instance;
    };

})(jQuery, window);