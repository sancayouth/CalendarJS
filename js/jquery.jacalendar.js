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
        // Simple JavaScript Templating
        // John Resig ‐ http://ejohn.org/ ‐ MIT Licensed
        _template: function tmpl(str, data) {
            var fn = !/\W/.test(str) ?
                cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                "with(obj){p.push('" +
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");
            return data ? fn(data) : fn;
        },
        _loadTemplate: function() { 
            var self = this;
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