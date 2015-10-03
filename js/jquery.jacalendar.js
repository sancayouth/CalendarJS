;(function($, window, undefined) {
    'use strict';

    $.jaCal = function(options, element) {
        this.$el = $(element);
        this._init(options);
    };

    $.jaCal.defaults = {
        name: 'jaCal',
        language: 'en',
        tmpl_path: 'tmpls/',
        template: ''
    };

    $.jaCal.prototype = {
        _init: function(options) {
            this.settings = $.extend(true, {}, $.jaCal.defaults, options);
            this.today = moment();
            this.today.locale(this.settings.language);
            this._bindEvents();
            this.render();

        },
        _loadTemplate: function() {
            var self = this;
            if (self.settings.template) {
                return;
            }
            $.ajax({
                url: self.settings.tmpl_path + 'month.html',
                type: 'get',
                async: false,
                success: function(html) {
                    self.settings.template = _.template(html);
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
        _getData: function() {
            var start = this.today.clone().startOf('month').subtract(this.today.startOf('month').day(), 'day');
            var array_dates = [];
            for (var i = 0; i < 6; i++) {
                var div = $('<div>').addClass('row week-' + (i + 1));
                for (var j = 0; j < 7; j++) {
                    var inner_div = $('<div>').addClass('col-1').attr('data-date', start.format('YYYY-MM-DD')).html(parseInt(start.format('DD')));
                    div.append(inner_div);
                    start.add(1, 'day')
                }
                array_dates.push(div.wrap('<p/>').parent().html());
            }
            var month = this.today.format('MMMM');
            var year = this.today.format('GGGG');
            return {
                top: {
                    month, year
                },
                weekdays: this._forLocale(this.settings.language, moment.weekdays),
                dates: array_dates
            };
        },
        _bindEvents: function() {
            this.$el
                .on('click', '.jacal-prev-button', {
                    ctx: this
                }, this.prevMonth)
                .on('click', '.jacal-next-button', {
                    ctx: this
                }, this.nextMonth)
        },
        //public methods
        render: function() {
            this.$el.html('');
            this._loadTemplate();
            this.$el.append(this.settings.template(this._getData()));
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