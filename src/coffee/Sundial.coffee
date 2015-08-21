class Sundial
  constructor: (el, options = {}) ->
    @settings =
      enableSidebar: true # Render the "current date" sidebar
      enableTimePicker: true # Allow picking time as well as date
      allowEmptyDate: true # Allow date to be cleared
      classPrefix: 'sundial' # Class prefix, for theming and stuff
      wrapperTagName: 'div' # Change the input wrapper tag
      currentMonth: moment() # A `moment` specifying the default month to view when the picker is first opened. Overridden by an existing value in the passed input
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

    # set current month to view
    # TODO override this by actual DOM value, as appropriate
    @currentMonth = @settings.currentMonth.startOf('month')

    # create a container for element references
    @els = {}
    @els.input = el

    # build out all the basic elements
    @_buildPopover()
    @_wrapEl()
    @_bindEvents()

    @_renderCalendar()

  show: =>
    console.log 'should show'

  hide: =>
    console.log 'should hide'

  setCurrentMonth: (year, month) =>
    @currentMonth = moment("#{year}-#{month}", 'YYYY-M')
    @_renderCalendar()

  decrementCurrentMonth: =>
    @currentMonth = @currentMonth.subtract(1, 'month')
    @_renderCalendar()

  incrementCurrentMonth: =>
    @currentMonth = @currentMonth.add(1, 'month')
    @_renderCalendar()

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

    # build the date picker
    @_buildDatePicker()

    # build the time picker if necessary
    @_buildTimePicker() if @settings.enableTimePicker == true

    document.body.appendChild @els.popover

  _buildSidebar: ->
    # create and append the elements for sidebar stuff
    @els.sidebar = @_makeEl 'div', "#{@settings.classPrefix}-sidebar"

    @els.sidebarYear = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-year"
    @els.sidebar.appendChild @els.sidebarYear

    @els.sidebarDate = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-date"
    @els.sidebar.appendChild @els.sidebarDate

    if @settings.enableTimePicker == true
      @els.sidebarTime = @_makeEl 'p', "#{@settings.classPrefix}-sidebar-time"
      @els.sidebar.appendChild @els.sidebarTime

    @els.popover.appendChild @els.sidebar

  _buildDatePicker: ->
    @els.datePicker = @_makeEl 'div', "#{@settings.classPrefix}-date-picker"
    @els.datePickerHeader = @_makeEl 'header', "#{@settings.classPrefix}-date-picker-header"
    @els.datePickerDecrementMonth = @_makeEl 'button', "#{@settings.classPrefix}-date-picker-decrement-month", 'Previous Month'
    @els.datePickerHeaderText = @_makeEl 'p', "#{@settings.classPrefix}-date-picker-header-text"
    @els.datePickerIncrementMonth = @_makeEl 'button', "#{@settings.classPrefix}-date-picker-increment-month", 'Next Month'

    @els.datePickerHeader.appendChild @els.datePickerDecrementMonth
    @els.datePickerHeader.appendChild @els.datePickerHeaderText
    @els.datePickerHeader.appendChild @els.datePickerIncrementMonth

    @els.calendarContainer = @_makeEl 'div', "#{@settings.classPrefix}-calendar-container"

    @els.datePicker.appendChild @els.datePickerHeader
    @els.datePicker.appendChild @els.calendarContainer

    @els.pickerContainer.appendChild @els.datePicker

  _buildTimePicker: ->
    # create elements for time picker
    @els.timePicker = @_makeEl 'div', "#{@settings.classPrefix}-time-picker"
    @els.timePickerHour = @_makeEl 'select', "#{@settings.classPrefix}-time-picker-hour"
    @els.timePickerMinute = @_makeEl 'select', "#{@settings.classPrefix}-time-picker-minute"
    @els.timePickerDescription = @_makeEl 'p', "#{@settings.classPrefix}-time-picker-description", @settings.timePickerDescription

    # generate hour options
    for h in [0..23]
      hourEl = @_makeEl 'option', null, ('0' + h).slice(-2) # poor man's `rjust`
      @els.timePickerHour.appendChild hourEl

    # generate minute options
    for m in [0..59]
      minuteEl = @_makeEl 'option', null, ('0' + m).slice(-2) # poor man's `rjust`
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
    @els.datePickerDecrementMonth.addEventListener 'click', @decrementCurrentMonth, true
    @els.datePickerIncrementMonth.addEventListener 'click', @incrementCurrentMonth, true

  _renderCalendar: ->
    daysInMonth = @currentMonth.daysInMonth()
    calendarHtml = ''

    @els.datePickerHeaderText.innerText = "#{@currentMonth.format('MMMM')} #{@currentMonth.format('YYYY')}"
    @els.calendarContainer.innerHTML = calendarHtml



window.Sundial = Sundial