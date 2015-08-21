makeEl = (tagName, className, innerText) ->
  el = document.createElement tagName
  el.className = className if className?
  el.innerText = innerText if innerText?

  return el

hasClass = (el, className) ->
  className in el.className.split(' ')


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
      weekStart: 0 # First day of the week (0 is Sunday)
      timePickerDescription: 'Format: 24hr' # Descriptive text below time picker
      inputFormat: null # Format for input (what's actually sent to the server, defaults to ISO 8601)
      maskFormat: 'YYYY, dddd MMM Do, h:mmA Z' # Display format for input mask
      dayOfWeekFormat: 'ddd' # Display format for calendar header
      sidebarYearFormat: 'YYYY' # Display format for sidebar year
      sidebarDateFormat: 'ddd, MMM D' # Display format for sidebar date
      sidebarTimeFormat: 'h:mmA Z' # Display format for sidebar time
      dayButtonDateFormat: 'YYYY-MM-DD' # Internal-ish. Sets the data attribute format on calendar day buttons

    # override defaults with passed options
    @settings[key] = val for key, val of options

    # set current month to view
    # TODO override this by actual DOM value, as appropriate
    @currentMonth = @settings.currentMonth.startOf('month')

    # create a container for element references
    @els = {}

    @els.input = el
    @_setUpInput()

    # build out all the basic elements
    @_buildPopover()
    @_wrapEl()
    @_bindEvents()

    @_buildCalendar()

    # set currently selected dateTime
    # TODO override this by actual DOM value, as appropriate
    @setSelectedDate moment(), true

  show: =>
    console.log 'should show'

  hide: =>
    console.log 'should hide'

  setCurrentMonth: (year, month) =>
    @currentMonth = moment("#{year}-#{month}", 'YYYY-M').startOf('month')
    @_buildCalendar()

  decrementCurrentMonth: =>
    @currentMonth.subtract(1, 'month').startOf('month')
    @_buildCalendar()

  incrementCurrentMonth: =>
    @currentMonth.add(1, 'month').startOf('month')
    @_buildCalendar()

  setSelectedDate: (date, setTime = false) =>
    currentlySelectedHour = if @selectedDate then @selectedDate.hour() else 0
    currentlySelectedMinute = if @selectedDate then @selectedDate.minute() else 0

    @selectedDate = date

    # by default, don't update the time
    unless setTime
      @setSelectedHour(currentlySelectedHour)
      @setSelectedMinute(currentlySelectedMinute)

    @_renderSelectedDateTime()

  setSelectedHour: (hour) =>

  setSelectedMinute: (minute) =>


  _setUpInput: ->
    @els.input.setAttribute 'readonly', 'true'

  _buildPopover: ->
    # build the popover container
    @els.popover = makeEl 'div', "#{@settings.classPrefix}-popover"

    # build the sidebar if necessary
    @_buildSidebar() if @settings.enableSidebar == true

    # create the div that holds the date (and optionally time) pickers themselves
    @els.pickerContainer = makeEl 'div', "#{@settings.classPrefix}-picker-container"
    @els.popover.appendChild @els.pickerContainer

    # build the date picker
    @_buildDatePicker()

    # build the time picker if necessary
    @_buildTimePicker() if @settings.enableTimePicker == true

    document.body.appendChild @els.popover

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
    @els.timePickerMinute = makeEl 'select', "#{@settings.classPrefix}-time-picker-minute"
    @els.timePickerDescription = makeEl 'p', "#{@settings.classPrefix}-time-picker-description", @settings.timePickerDescription

    # generate hour options
    for h in [0..23]
      hourEl = makeEl 'option', null, ('0' + h).slice(-2) # poor man's `rjust`
      @els.timePickerHour.appendChild hourEl

    # generate minute options
    for m in [0..59]
      minuteEl = makeEl 'option', null, ('0' + m).slice(-2) # poor man's `rjust`
      @els.timePickerMinute.appendChild minuteEl

    # append elements in the right spots
    @els.timePicker.appendChild @els.timePickerHour
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
    @els.input.addEventListener 'focus', @show, true
    # @els.input.addEventListener 'blur', @hide, true
    @els.datePickerDecrementMonth.addEventListener 'click', @decrementCurrentMonth, true
    @els.datePickerIncrementMonth.addEventListener 'click', @incrementCurrentMonth, true

    @els.calendarContainer.addEventListener 'click', @_handleCalendarDayClick, true

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
    # dayClasses.push "#{@settings.classPrefix}-day-selected" if dayInfo.selected
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
    @els.datePickerHeaderText.innerText = "#{@currentMonth.format('MMMM')} #{@currentMonth.format('YYYY')}"

    # actually render out the calendar-y bits
    calendarMatrix = []
    calendarMatrix.push @_buildCalendarHeader()
    daysInMonth = @currentMonth.daysInMonth()
    daysBeforeMonthStart = @currentMonth.day()

    if @settings.weekStart > 0
      daysBeforeMonthStart -= @settings.weekStart
      daysBeforeMonthStart += 7 if daysBeforeMonthStart < 0

    cellCount = daysInMonth + daysBeforeMonthStart
    daysAfterMonthEnd = cellCount

    daysAfterMonthEnd -= 7 while daysAfterMonthEnd > 7

    cellCount += 7 - daysAfterMonthEnd
    console.log 'dbda', daysBeforeMonthStart, daysAfterMonthEnd

    rowLength = 0

    for i in [0...cellCount]
      calendarMatrix.push(['<tr>']) if rowLength == 0
      day = @currentMonth.clone().date(1 + (i - daysBeforeMonthStart))

      dayInfo =
        empty: i < daysBeforeMonthStart || i >= (daysInMonth + daysBeforeMonthStart)
        # disabled:
        today: day.isSame(moment(), 'day')
        dateString: day.format(@settings.dayButtonDateFormat)
        dayOfMonth: day.date()
        # selected:
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
    console.log calendarMatrix
    calendarHtml = '<table><tbody>'

    for row in calendarMatrix
      for col in row
        calendarHtml += col

    calendarHtml += '</tbody></table>'

    @els.calendarContainer.innerHTML = calendarHtml

  _renderSelectedDateTime: ->
    @els.input.value = @selectedDate.format(@settings.inputFormat)
    @els.inputMask.innerText = @selectedDate.format(@settings.maskFormat)

  _handleCalendarDayClick: (e) =>
    clicked = e.target
    return unless hasClass(clicked, 'sundial-day-button')

    @setSelectedDate moment(clicked.dataset.date, @settings.dayButtonDateFormat)

window.Sundial = Sundial