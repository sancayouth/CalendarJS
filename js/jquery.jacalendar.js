;(function($, window, undefined){ 
  'use strict';

  $.jaCal = function(options, element){
    this.$el = $(element);
    this._init(options);  
  };
  
  $.jaCal.defaults = {
    name : "jaCal",
    language : "en",
    rows : 5,
    startIn : 0
  };
  
  $.jaCal.prototype = {
    _init : function (options) {
      this.settings = $.extend(true, {}, $.jaCal.defaults, options);      
      this.today = moment();    
    },    
    //public methods
    render: function(){
    }
  }
  
  $.fn.jaCal = function (options) {      
      var instance = $.data(this, 'jaCal');
      this.each(function () {
          if (instance) {
              instance._init();
          } else {
              instance = $.data(this, 'jaCal', new $.jaCal(options, this));
          }
      });
      return instance;
  };

})(jQuery, window);