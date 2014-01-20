/*
	Copyright (c) 2014, RKE
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  codiad.ToDo = (function() {
    /*
    		basic plugin environment initialization
    */

    function ToDo(global, jQuery) {
      this.disableToDo = __bind(this.disableToDo, this);
      this.updateToDo = __bind(this.updateToDo, this);
      this.initToDoListContainer = __bind(this.initToDoListContainer, this);
      this.init = __bind(this.init, this);
      var _this = this;
      this.codiad = global.codiad;
      this.amplify = global.amplify;
      this.jQuery = jQuery;
      this.scripts = document.getElementsByTagName('script');
      this.path = this.scripts[this.scripts.length - 1].src.split('?')[0];
      this.curpath = this.path.split('/').slice(0, -1).join('/') + '/';
      this.jQuery(function() {
        return _this.init();
      });
    }

    /*
    		main plugin initialization
    */


    ToDo.prototype.init = function() {
      return this.initToDoListContainer();
    };

    /*
    		init button and menu on bottom menu
    		and append handler
    */


    ToDo.prototype.initToDoListContainer = function() {
      var todoButton, todoMenu,
        _this = this;
      todoButton = '<div class="divider"></div>\n<a id="todoButton">\n	<span class="icon-check"></span>TODO\n</a>';
      todoMenu = '<ul id="todoMenu" class="options-menu"></ul>';
      this.jQuery('#editor-bottom-bar').append(todoButton);
      this.$todoButton = this.jQuery('#todoButton');
      this.$todoMenu = this.jQuery(todoMenu);
      this.codiad.editor.initMenuHandler(this.$todoButton, this.$todoMenu);
      this.$todoMenu.on('click', 'li a', function(element) {
        var line;
        line = _this.jQuery(element.currentTarget).data('line');
        if (line) {
          _this.codiad.active.gotoLine(line);
          return _this.codiad.active.focus();
        }
      });
      this.amplify.subscribe('active.onFocus', function() {
        return _this.updateToDo();
      });
      this.updateInterval = null;
      this.amplify.subscribe('active.onOpen', function() {
        _this.updateToDo();
        return _this.codiad.editor.getActive().getSession().on('change', function(e) {
          clearTimeout(_this.updateInterval);
          return _this.updateInterval = setTimeout(_this.updateToDo, 1000);
        });
      });
      return this.amplify.subscribe('active.onClose', function() {
        return _this.disableToDo();
      });
    };

    /*
    		update todo button and menu
    */


    ToDo.prototype.updateToDo = function() {
      var content, editor, editorToDo, index, line, loc, matches, _i, _len;
      content = this.codiad.editor.getContent();
      loc = content.split(/\r?\n/);
      matches = [];
      editorToDo = [];
      for (index = _i = 0, _len = loc.length; _i < _len; index = ++_i) {
        line = loc[index];
        if (line.indexOf("TODO") > -1 && line.match(/TODO\s*:(.*)/)) {
          matches.push('<li><a data-line="' + (index + 1) + '">' + line.match(/TODO\s*:(.*)/)[1] + '</a></li>');
          editorToDo.push({
            row: index,
            column: 1,
            text: line.match(/(TODO\s*:.*)/)[1],
            type: "info"
          });
        }
      }
      if (matches.length > 0) {
        this.$todoMenu.empty().append($(matches.join("")));
        editor = this.codiad.editor.getActive().getSession();
        editor.setAnnotations(editorToDo.concat(editor.getAnnotations()));
        return this.$todoButton.find('span').removeClass('icon-check').addClass('icon-clipboard');
      } else {
        return this.disableToDo();
      }
    };

    /*
    		disable ToDoList
    */


    ToDo.prototype.disableToDo = function() {
      this.$todoMenu.empty().append("<li><a>Nothing to do</a></li>");
      return this.$todoButton.find('span').removeClass('icon-clipboard').addClass('icon-check');
    };

    return ToDo;

  })();

  new codiad.ToDo(this, jQuery);

}).call(this);
