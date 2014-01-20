###
	Copyright (c) 2014, RKE
###

class codiad.ToDo
	
	
	###
		basic plugin environment initialization
	###
	constructor: (global, jQuery) ->
		@codiad = global.codiad
		@amplify = global.amplify
		@jQuery = jQuery
		
		@scripts = document.getElementsByTagName('script')
		@path = @scripts[@scripts.length - 1].src.split('?')[0]
		@curpath = @path.split('/').slice(0, -1).join('/') + '/'
		
		# wait until dom is loaded
		@jQuery =>
			@init()
	
		
	###
		main plugin initialization
	###
	init: =>
		@initToDoListContainer()
	
	
	###
		init button and menu on bottom menu
		and append handler
	###
	initToDoListContainer: =>
		todoButton = '''
			<div class="divider"></div>
			<a id="todoButton">
				<span class="icon-check"></span>TODO
			</a>
		'''
		todoMenu = '<ul id="todoMenu" class="options-menu"></ul>'
		@jQuery('#editor-bottom-bar').append(todoButton)
		@$todoButton = @jQuery('#todoButton')
		@$todoMenu = @jQuery(todoMenu)
		@codiad.editor.initMenuHandler @$todoButton, @$todoMenu
		
		@$todoMenu.on 'click', 'li a', (element) =>
			line = @jQuery(element.currentTarget).data 'line'
			if line
				@codiad.active.gotoLine line
				@codiad.active.focus()
		
		@amplify.subscribe 'active.onFocus', =>
			@updateToDo()
		@updateInterval = null
		@amplify.subscribe 'active.onOpen', =>
			@updateToDo()
			@codiad.editor.getActive().getSession().on 'change', (e) =>
				clearTimeout @updateInterval
				@updateInterval = setTimeout @updateToDo, 1000
		@amplify.subscribe 'active.onClose', =>
			@disableToDo()
	
	
	###
		update todo button and menu
	###
	updateToDo: =>
		content = @codiad.editor.getContent()
		loc = content.split(/\r?\n/)
		matches = []
		editorToDo = []
		for line, index in loc
			if line.indexOf("TODO") > -1 and line.match(/TODO\s*:(.*)/)
				matches.push (
					'<li><a data-line="' + (index + 1) + '">' +
					line.match(/TODO\s*:(.*)/)[1] +
					'</a></li>'
				)
				editorToDo.push(
					row:    index
					column: 1
					text:   line.match(/(TODO\s*:.*)/)[1]
					type:   "info"
				)
		if matches.length > 0
			@$todoMenu.empty().append $(matches.join "")
			editor = @codiad.editor.getActive().getSession()
			editor.setAnnotations(editorToDo.concat editor.getAnnotations())
			@$todoButton.find('span').
				removeClass('icon-check').
				addClass('icon-clipboard')
		else
			@disableToDo()
	
			
	###
		disable ToDoList
	###
	disableToDo: =>
		@$todoMenu.empty().append "<li><a>Nothing to do</a></li>"
		@$todoButton.find('span').
			removeClass('icon-clipboard').
			addClass('icon-check')


new codiad.ToDo(this, jQuery)