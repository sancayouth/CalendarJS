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
        tmpl_path: 'tmpls/',
        templates: {
            month: ''
        }
    };

    $.jaCal.prototype = {
        _init: function(options) {
            this.settings = $.extend(true, {}, $.jaCal.defaults, options);
            this.today = moment();
            this.today.locale(this.settings.language);
            this._bindEvents();
            this.render();

        },
        _loadTemplate: function(name) {
            var self = this;
            if (self.settings.templates[name]) {
                return;
            }
            $.ajax({
                url: self.settings.tmpl_path + name + '.html',
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(html) {
                    self.settings.templates[name] = _.template(html);
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
                }, this.prevMonth)
                .on('click', '.jacal-next-button', {
                    ctx: this
                }, this.nextMonth)
                .on('click', '.jacal-month-button', {
                    ctx: this
                }, this.showMonths);
        },
        _month: function() {
            this._loadTemplate('month');
            var today = this.today.clone();
            var position = today.startOf('month').day() == 0 ? 7 : today.startOf('month').day();
            var start = today.startOf('month').subtract(position, 'day');
            var array_dates = [];
            for (var i = 0; i < 6; i++) {
                var div = $('<div>').addClass('row jacal-week-' + (i + 1));
                for (var j = 0; j < 7; j++) {
                    var inner_div = $('<div>').addClass('col-1 jacal-day')
                        .attr('data-date', start.format('YYYY-MM-DD'))
                        .html(parseInt(start.format('DD')));
                    if (!this.today.isSame(start, 'month'))
                        inner_div.addClass('disabled');
                    if (moment().isSame(start, 'day'))
                        inner_div.addClass('today');
                    div.append(inner_div);
                    start.add(1, 'day')
                }
                array_dates.push(div.wrap('<p/>').parent().html());
            }

            var month = this.today.format('MMMM');
            var year = this.today.format('GGGG');
            var values = {
                top: {
                    month, year
                },
                weekdays: this._forLocale(this.settings.language, moment.weekdays),
                dates: array_dates
            }
            return this.settings.templates[this.settings.view](values);
        },
        _months: function() {
            this._loadTemplate('months');
            var values = {
                year: this.today.format('GGGG'),
                months: this._forLocale(this.settings.language, moment.monthsShort)
            };
            return this.settings.templates['months'](values);
        },
        //public methods
        render: function() {
            this.$el.html('');
            this._loadTemplate(this.settings.view);
            var data = {}
            switch (this.settings.view) {
                case 'month':
                    data = this._month();
                    break;
                case 'months':
                    data = this._months();
                    break;
            };
            this.$el.append(data);
        },
        prevMonth: function(event) {
            var self = event.data.ctx;
            self.today.subtract(1, 'month');
            self.render();
        },
        nextMonth: function(event) {
            var self = event.data.ctx;
            self.today.add(1, 'month');
            self.render();
        },
        showMonths: function(event) {
            var self = event.data.ctx;
            self.settings.view = 'months';
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