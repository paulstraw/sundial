makeEl = (tagName, className, innerText) ->
  el = document.createElement tagName
  el.className = className if className?
  el.innerText = innerText if innerText?

  return el

hasClass = (el, className) ->
  className in el.className.split(' ')

addClass = (el, className) ->
  return if hasClass(el, className)

  el.className = if (el.className == '') then className else "#{el.className} #{className}"

removeClass = (el, className) ->
  el.className = el.className.replace(className, '').trim()


class Sundial
  constructor: (el, options = {}) ->
    @settings =
      enableSidebar: true # Render the "current date" sidebar
      enableTimePicker: true # Allow picking time as well as date
      allowEmptyDate: true # Allow date to be cleared
      classPrefix: 'sundial' # Class prefix, for theming and stuff
      wrapperTagName: 'div' # Change the input wrapper tag
      defaultDisplayMonth: moment().startOf('month') # A `moment` specifying the default month to view when the picker is first opened. Overridden by an existing value in the passed input
      minDate: null # A `moment` specifying the earliest date that can be selected
      maxDate: null # A `moment` specifying the latest date that can be selected
      enableDate: null # A function that receives a `moment` and returns a boolean. Returning `true` enables the date for selection, `false` disables it
      weekStart: 0 # First day of the week (0 is Sunday)
      timePickerMinuteStep: 1 # Limit which minutes that can be selected. Sixty (60) should generally be divisible by this number
      timePickerSeparator: ':' # Symbol between the hour and minute selectors
      timePickerDescription: 'Format: 24hr' # Descriptive text below time picker
      inputFormat: moment.defaultFormat # Format for input (what's actually sent to the server, defaults to ISO 8601 [YYYY-MM-DDTHH:mm:ssZ])
      maskFormat: 'dddd MMMM Do, YYYY h:mmA' # Display format for input mask
      dayOfWeekFormat: 'dd' # Display format for calendar header
      sidebarYearFormat: 'YYYY' # Display format for sidebar year
      sidebarDateFormat: 'ddd, MMM D' # Display format for sidebar date
      sidebarTimeFormat: 'h:mmA' # Display format for sidebar time
      dayButtonDateFormat: 'YYYY-MM-DD' # Internal-ish. Sets the data attribute format on calendar day buttons
      verticalPopoverOffset: 0 # Added to the popover's vertical position during placement
      horizontalPopoverOffset: 0 # Added to the popover's horizontal position during placement

    @_popoverShowing = false

    # override defaults with passed options
    @settings[key] = val for key, val of options

    # create a container for element references
    @els = {}

    @els.input = el
    @_setUpInput()


    # set current month to view
    prefilledDate = moment(@els.input.value, @settings.inputFormat)
    prefilledDate = null unless prefilledDate.isValid()

    @currentDisplayMonth = if prefilledDate then prefilledDate.clone().startOf('month') else @settings.defaultDisplayMonth

    # build out all the basic elements
    @_buildPopover()
    @_wrapEl()
    @_bindEvents()

    @_buildCalendar()

    # set currently selected dateTime
    @setSelectedDate(prefilledDate || moment(), true)

  _deferredShow: =>
    setTimeout @show, 0

  show: =>
    return if @_popoverShowing
    @_popoverShowing = true

    @els.input.focus()
    addClass @els.popover, 'visible'
    @_positionPopover()

  hide: =>
    @_popoverShowing = false
    removeClass @els.popover, 'visible'

  setcurrentDisplayMonth: (year, month) =>
    @currentDisplayMonth = moment("#{year}-#{month}", 'YYYY-M').startOf('month')
    @_buildCalendar()

  decrementcurrentDisplayMonth: =>
    @currentDisplayMonth.subtract(1, 'month').startOf('month')
    @_buildCalendar()

  incrementcurrentDisplayMonth: =>
    @currentDisplayMonth.add(1, 'month').startOf('month')
    @_buildCalendar()

  setSelectedDate: (date, setTime = false) =>
    previouslySelectedHour = if @selectedDate then @selectedDate.hour() else 0
    previouslySelectedMinute = if @selectedDate then @selectedDate.minute() else 0

    @selectedDate = date

    # by default, revert the time to its previous value
    unless setTime
      @setSelectedHour(previouslySelectedHour, false)
      @setSelectedMinute(previouslySelectedMinute, false)

    @_renderSelectedDateTime()
    @_buildCalendar()

  setSelectedHour: (hour, render = true) =>
    @selectedDate.hours(hour)

    @_renderSelectedDateTime() if render

  setSelectedMinute: (minute, render = true) =>
    @selectedDate.minutes(minute)

    @_renderSelectedDateTime() if render

  _positionPopover: ->
    popoverStyle = @els.popover.style
    top = @els.wrapper.offsetHeight + @els.wrapper.offsetTop + @settings.verticalPopoverOffset
    left = @els.wrapper.offsetLeft + @settings.horizontalPopoverOffset

    popoverStyle.top = "#{top}px"
    popoverStyle.left = "#{left}px"

  _setUpInput: ->
    @els.input.setAttribute 'readonly', 'true'

  _buildPopover: ->
    # build the popover container
    @els.popover = makeEl 'div', "#{@settings.classPrefix}-popover"

    popoverStyle = @els.popover.style
    popoverStyle.position = 'absolute'

    # build the sidebar if necessary
    @_buildSidebar() if @settings.enableSidebar == true

    # create the div that holds the date (and optionally time) pickers themselves
    @els.pickerContainer = makeEl 'div', "#{@settings.classPrefix}-picker-container"
    @els.popover.appendChild @els.pickerContainer

    # build the date picker
    @_buildDatePicker()

    # build the time picker if necessary
    @_buildTimePicker() if @settings.enableTimePicker == true

    # document.body.appendChild @els.popover
    @els.input.parentNode.appendChild @els.popover

  _buildSidebar: ->
    # create and append the elements for sidebar stuff
    @els.sidebar = makeEl 'div', "#{@settings.classPrefix}-sidebar"

    @els.sidebarYear = makeEl 'p', "#{@settings.classPrefix}-sidebar-year"
    @els.sidebar.appendChild @els.sidebarYear

    @els.sidebarDate = makeEl 'p', "#{@settings.classPrefix}-sidebar-date"
    @els.sidebar.appendChild @els.sidebarDate

    if @settings.enableTimePicker == true
      @els.sidebarTime = makeEl 'p', "#{@settings.classPrefix}-sidebar-time"
      @els.sidebar.appendChild @els.sidebarTime

    @els.popover.appendChild @els.sidebar

  _buildDatePicker: ->
    @els.datePicker = makeEl 'div', "#{@settings.classPrefix}-date-picker"
    @els.datePickerHeader = makeEl 'header', "#{@settings.classPrefix}-date-picker-header"
    @els.datePickerDecrementMonth = makeEl 'button', "#{@settings.classPrefix}-date-picker-decrement-month", 'Previous Month'
    @els.datePickerHeaderText = makeEl 'p', "#{@settings.classPrefix}-date-picker-header-text"
    @els.datePickerIncrementMonth = makeEl 'button', "#{@settings.classPrefix}-date-picker-increment-month", 'Next Month'

    @els.datePickerHeader.appendChild @els.datePickerDecrementMonth
    @els.datePickerHeader.appendChild @els.datePickerHeaderText
    @els.datePickerHeader.appendChild @els.datePickerIncrementMonth

    @els.calendarContainer = makeEl 'div', "#{@settings.classPrefix}-calendar-container"

    @els.datePicker.appendChild @els.datePickerHeader
    @els.datePicker.appendChild @els.calendarContainer

    @els.pickerContainer.appendChild @els.datePicker

  _buildTimePicker: ->
    # create elements for time picker
    @els.timePicker = makeEl 'div', "#{@settings.classPrefix}-time-picker"
    @els.timePickerHour = makeEl 'select', "#{@settings.classPrefix}-time-picker-hour"
    @els.timePickerSeparator = makeEl 'span', "#{@settings.classPrefix}-time-picker-separator", @settings.timePickerSeparator
    @els.timePickerMinute = makeEl 'select', "#{@settings.classPrefix}-time-picker-minute"
    @els.timePickerDescription = makeEl 'p', "#{@settings.classPrefix}-time-picker-description", @settings.timePickerDescription

    # generate hour options
    for h in [0..23]
      hourEl = makeEl 'option', null, ('0' + h).slice(-2) # poor man's `rjust`
      @els.timePickerHour.appendChild hourEl

    # generate minute options
    for m in [0..59] by @settings.timePickerMinuteStep
      minuteEl = makeEl 'option', null, ('0' + m).slice(-2) # poor man's `rjust`
      @els.timePickerMinute.appendChild minuteEl

    # append elements in the right spots
    @els.timePicker.appendChild @els.timePickerHour
    @els.timePicker.appendChild @els.timePickerSeparator
    @els.timePicker.appendChild @els.timePickerMinute
    @els.timePicker.appendChild @els.timePickerDescription

    @els.pickerContainer.appendChild @els.timePicker

  _wrapEl: ->
    @els.wrapper = makeEl @settings.wrapperTagName, "#{@settings.classPrefix}-wrapper"

    parent = @els.input.parentNode
    nextSibling = @els.input.nextSibling

    @els.wrapper.appendChild @els.input

    @els.inputMask = makeEl 'div', "#{@settings.classPrefix}-input-mask"
    @els.wrapper.appendChild @els.inputMask

    if nextSibling
      parent.insertBefore @els.wrapper, nextSibling
    else
      parent.appendChild @els.wrapper

  _bindEvents: ->
    @els.input.addEventListener 'focus', @show, false
    @els.inputMask.addEventListener 'mousedown', @_deferredShow, false
    @els.inputMask.addEventListener 'touchstart', @_deferredShow, false

    @els.popover.addEventListener 'mousedown', @_handlePopoverClick, false
    @els.popover.addEventListener 'touchstart', @_handlePopoverClick, false

    @els.input.addEventListener 'blur', @_handleInputBlur, false
    @els.datePickerDecrementMonth.addEventListener 'click', (e) =>
      e.preventDefault()
      @decrementcurrentDisplayMonth()
    , false
    @els.datePickerIncrementMonth.addEventListener 'click', (e) =>
      e.preventDefault()
      @incrementcurrentDisplayMonth()
    , false

    @els.calendarContainer.addEventListener 'click', @_handleCalendarDayClick, false

    if @settings.enableTimePicker
      @els.timePickerHour.addEventListener 'change', =>
        @setSelectedHour(@els.timePickerHour.value)
      , false
      @els.timePickerMinute.addEventListener 'change', =>
        @setSelectedMinute(@els.timePickerMinute.value)
      , false

  _buildCalendarHeader: ->
    days = ['<tr>']

    for i in [0...7]
      days.push "<th>#{moment().set('day', i + @settings.weekStart).format(@settings.dayOfWeekFormat)}</th>"

    days.push '</tr>'

    return days

  _buildCalendarDay: (dayInfo) ->
    if dayInfo.empty
      return """<td class="#{@settings.classPrefix}-day-empty"></td>"""

    dayClasses = []

    # dayClasses.push "#{@settings.classPrefix}-day-disabled" if dayInfo.disabled
    dayClasses.push "#{@settings.classPrefix}-day-today" if dayInfo.today
    dayClasses.push "#{@settings.classPrefix}-day-selected" if dayInfo.selected
    # dayClasses.push "#{@settings.classPrefix}-day-in-range" if dayInfo.inRange
    # dayClasses.push "#{@settings.classPrefix}-day-is-start-range" if dayInfo.isStartRange
    # dayClasses.push "#{@settings.classPrefix}-day-is-end-range" if dayInfo.isEndRange

    return """
      <td class="#{@settings.classPrefix}-day #{dayClasses.join(' ')}">
        <button data-date="#{dayInfo.dateString}" class="#{@settings.classPrefix}-day-button">
          #{dayInfo.dayOfMonth}
        </button>
      </td>
    """

  _buildCalendar: ->
    # update the header to display the correct month and year
    @els.datePickerHeaderText.innerText = "#{@currentDisplayMonth.format('MMMM')} #{@currentDisplayMonth.format('YYYY')}"

    # actually render out the calendar-y bits
    calendarMatrix = []
    calendarMatrix.push @_buildCalendarHeader()
    daysInMonth = @currentDisplayMonth.daysInMonth()
    daysBeforeMonthStart = @currentDisplayMonth.day()

    if @settings.weekStart > 0
      daysBeforeMonthStart -= @settings.weekStart
      daysBeforeMonthStart += 7 if daysBeforeMonthStart < 0

    cellCount = daysInMonth + daysBeforeMonthStart
    daysAfterMonthEnd = cellCount

    daysAfterMonthEnd -= 7 while daysAfterMonthEnd > 7

    cellCount += 7 - daysAfterMonthEnd

    rowLength = 0

    for i in [0...cellCount]
      calendarMatrix.push(['<tr>']) if rowLength == 0
      day = @currentDisplayMonth.clone().date(1 + (i - daysBeforeMonthStart))

      dayInfo =
        empty: i < daysBeforeMonthStart || i >= (daysInMonth + daysBeforeMonthStart)
        # disabled:
        today: day.isSame(moment(), 'day')
        dateString: day.format(@settings.dayButtonDateFormat)
        dayOfMonth: day.date()
        selected: if @selectedDate then day.isSame(@selectedDate, 'day') else false
        # inRange:
        # isStartRange:
        # isEndRange:

      # add `td` to the current matrix row
      calendarMatrix[calendarMatrix.length - 1].push @_buildCalendarDay(dayInfo)

      if ++rowLength == 7
        # advance to next row
        calendarMatrix[calendarMatrix.length - 1].push('</tr>')
        rowLength = 0

    @_renderCalendar(calendarMatrix)

  _renderCalendar: (calendarMatrix) ->
    calendarHtml = '<table><tbody>'

    for row in calendarMatrix
      for col in row
        calendarHtml += col

    calendarHtml += '</tbody></table>'

    @els.calendarContainer.innerHTML = calendarHtml

  _renderSelectedDateTime: ->
    @els.input.value = @selectedDate.format(@settings.inputFormat)
    @els.inputMask.innerText = @selectedDate.format(@settings.maskFormat)

    if @settings.enableSidebar == true
      @els.sidebarYear.innerText = @selectedDate.format(@settings.sidebarYearFormat)
      @els.sidebarDate.innerText = @selectedDate.format(@settings.sidebarDateFormat)

      if @settings.enableTimePicker
        @els.sidebarTime.innerText = @selectedDate.format(@settings.sidebarTimeFormat)

    if @settings.enableTimePicker
      @els.timePickerHour.value = ('0' + @selectedDate.hour()).slice(-2) # poor man's `rjust`
      @els.timePickerMinute.value = ('0' + @selectedDate.minute()).slice(-2) # poor man's `rjust`

  _handleInputBlur: (e) =>
    if @_clickedPopover
      @_clickedPopover = false
      @els.input.focus()
      return

    @hide()

  _handlePopoverClick: (e) =>
    @_clickedPopover = true

  _handleCalendarDayClick: (e) =>
    # from here on out, we're only looking at calendar _day_ clicks
    clicked = e.target
    return true unless hasClass(clicked, 'sundial-day-button')

    @setSelectedDate moment(clicked.dataset.date, @settings.dayButtonDateFormat)

window.Sundial = Sundial
