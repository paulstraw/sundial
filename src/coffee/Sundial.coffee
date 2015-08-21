class Sundial
  constructor: (el, options = {}) ->
    @settings =
      enableSidebar: true # Render the "current date" sidebar
      enableTimePicker: true # Allow picking time as well as date
      allowEmptyDate: true # Allow date to be cleared
      classPrefix: 'sundial' # Class prefix, for theming and stuff
      wrapperTagName: 'div' # Change the input wrapper tag
      minDate: null # A `moment` specifying the earliest date that can be selected
      maxDate: null # A `moment` specifying the latest date that can be selected
      enableDate: null # A function that receives a `moment` and returns a boolean. Returning `true` enables the date for selection, `false` disables it
      firstDay: 1 # First day of the week (0 is Sunday)
      timePickerDescription: 'Format: 24hr' # Descriptive text below time picker
      inputFormat: 'YYYY, dddd MMM Do, h:mmA Z' # Display format for input
      sidebarYearFormat: 'YYYY' # Display format for sidebar year
      sidebarDateFormat: 'ddd, MMM D' # Display format for sidebar date
      sidebarTimeFormat: 'h:mmA Z' # Display format for sidebar time

    # override defaults with passed options
    @settings[key] = val for key, val of options

    # create a container for element references
    @els = {}
    @els.input = el

    # build out all the basic elements
    @_buildPopover()
    @_wrapEl()
    @_bindEvents()

  show: =>
    console.log 'should show'

  hide: =>
    console.log 'should hide'

  _makeEl: (tagName, className, innerText) ->
    el = document.createElement tagName
    el.className = className if className?
    el.innerText = innerText if innerText?

    return el

  _buildPopover: ->
    # build the popover container
    @els.popover = @_makeEl 'div', "#{@settings.classPrefix}-popover"

    # build the sidebar if necessary
    @_buildSidebar() if @settings.enableSidebar == true

    # create the div that holds the date (and optionally time) pickers themselves
    @els.pickerContainer = @_makeEl 'div', "#{@settings.classPrefix}-picker-container"
    @els.popover.appendChild @els.pickerContainer

    # build the time picker if necessary
    @_buildTimePicker() if @settings.enableTimePicker == true

    document.body.appendChild @els.popover

  _buildSidebar: ->
    # create the elements for sidebar stuff
    @els.sidebar = @_makeEl 'div', "#{@settings.classPrefix}-sidebar"
    @els.sidebarYear = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-year"
    @els.sidebarDate = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-date"
    @els.sidebarTime = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-time"

    # add the elements to the appropriate places
    @els.sidebar.appendChild @els.sidebarYear
    @els.sidebar.appendChild @els.sidebarDate
    @els.sidebar.appendChild @els.sidebarTime

    @els.popover.appendChild @els.sidebar

  _buildTimePicker: ->
    # create elements for time picker
    @els.timePicker = @_makeEl 'div', "#{@settings.classPrefix}-time-picker"
    @els.timePickerHour = @_makeEl 'select', "#{@settings.classPrefix}-time-picker-hour"
    @els.timePickerMinute = @_makeEl 'select', "#{@settings.classPrefix}-time-picker-minute"
    @els.timePickerDescription = @_makeEl 'p', "#{@settings.classPrefix}-time-picker-description", @settings.timePickerDescription

    # generate hour options
    for h in [0..23]
      hourEl = @_makeEl 'option', null, h
      @els.timePickerHour.appendChild hourEl

    # generate minute options
    for m in [0..59]
      minuteEl = @_makeEl 'option', null, m
      @els.timePickerMinute.appendChild minuteEl

    # append elements in the right spots
    @els.timePicker.appendChild @els.timePickerHour
    @els.timePicker.appendChild @els.timePickerMinute
    @els.timePicker.appendChild @els.timePickerDescription

    @els.pickerContainer.appendChild @els.timePicker

  _wrapEl: ->
    @els.wrapper = @_makeEl @settings.wrapperTagName, "#{@settings.classPrefix}-wrapper"

    parent = @els.input.parentNode
    nextSibling = @els.input.nextSibling

    @els.wrapper.appendChild(@els.input)

    if nextSibling
      parent.insertBefore @els.wrapper, nextSibling
    else
      parent.appendChild @els.wrapper

  _bindEvents: ->
    @els.input.addEventListener 'focus', @show, true
    # @els.input.addEventListener 'blur', @hide, true

  _renderCalendar: (year, month) ->
    daysInMonth = moment("#{year}-#{month}").daysInMonth()

window.Sundial = Sundial