;(function($, window, undefined) {
    'use strict';

    $.jaCal = function(options, element) {    
        this.$el = $(element);
        this._init(options);
    };

    $.jaCal.defaults = {
        name:      'jaCal',
        language:  'en',
        tmpl_path: 'tmpls/',
        rows:      5,
        startIn:   0,
        template : ''
    };

    $.jaCal.prototype = {
        _init: function(options) {
            this.settings = $.extend(true, {}, $.jaCal.defaults, options);
            this.today = moment();                      
            this.render();
          
        },
        _loadTemplate: function() { 
            var self = this;
            if (self.settings.template) {
                return;
            }
            $.ajax({
                url : self.settings.tmpl_path + 'month.html',
                type : 'get',
                async: false,
                success : function(html) {
                    self.settings.template = html;
                }
    
            });
        },
        //public methods
        render: function() {
            this.$el.html('');
            this._loadTemplate();             
            this.$el.html(this.settings.template);
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