(function() {
  var Sundial,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Sundial = (function() {
    function Sundial(el, options) {
      var key, val;
      if (options == null) {
        options = {};
      }
      this.incrementCurrentMonth = bind(this.incrementCurrentMonth, this);
      this.decrementCurrentMonth = bind(this.decrementCurrentMonth, this);
      this.setCurrentMonth = bind(this.setCurrentMonth, this);
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this.settings = {
        enableSidebar: true,
        enableTimePicker: true,
        allowEmptyDate: true,
        classPrefix: 'sundial',
        wrapperTagName: 'div',
        currentMonth: moment(),
        minDate: null,
        maxDate: null,
        enableDate: null,
        weekStart: 0,
        timePickerDescription: 'Format: 24hr',
        inputFormat: 'YYYY, dddd MMM Do, h:mmA Z',
        dayOfWeekFormat: 'ddd',
        sidebarYearFormat: 'YYYY',
        sidebarDateFormat: 'ddd, MMM D',
        sidebarTimeFormat: 'h:mmA Z'
      };
      for (key in options) {
        val = options[key];
        this.settings[key] = val;
      }
      this.currentMonth = this.settings.currentMonth.startOf('month');
      this.els = {};
      this.els.input = el;
      this._buildPopover();
      this._wrapEl();
      this._bindEvents();
      this._buildCalendar();
    }

    Sundial.prototype.show = function() {
      return console.log('should show');
    };

    Sundial.prototype.hide = function() {
      return console.log('should hide');
    };

    Sundial.prototype.setCurrentMonth = function(year, month) {
      this.currentMonth = moment(year + "-" + month, 'YYYY-M').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype.decrementCurrentMonth = function() {
      this.currentMonth.subtract(1, 'month').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype.incrementCurrentMonth = function() {
      this.currentMonth.add(1, 'month').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype._makeEl = function(tagName, className, innerText) {
      var el;
      el = document.createElement(tagName);
      if (className != null) {
        el.className = className;
      }
      if (innerText != null) {
        el.innerText = innerText;
      }
      return el;
    };

    Sundial.prototype._buildPopover = function() {
      this.els.popover = this._makeEl('div', this.settings.classPrefix + "-popover");
      if (this.settings.enableSidebar === true) {
        this._buildSidebar();
      }
      this.els.pickerContainer = this._makeEl('div', this.settings.classPrefix + "-picker-container");
      this.els.popover.appendChild(this.els.pickerContainer);
      this._buildDatePicker();
      if (this.settings.enableTimePicker === true) {
        this._buildTimePicker();
      }
      return document.body.appendChild(this.els.popover);
    };

    Sundial.prototype._buildSidebar = function() {
      this.els.sidebar = this._makeEl('div', this.settings.classPrefix + "-sidebar");
      this.els.sidebarYear = this._makeEl('p', this.settings.classPrefix + "-sidebar-year");
      this.els.sidebar.appendChild(this.els.sidebarYear);
      this.els.sidebarDate = this._makeEl('p', this.settings.classPrefix + "-sidebar-date");
      this.els.sidebar.appendChild(this.els.sidebarDate);
      if (this.settings.enableTimePicker === true) {
        this.els.sidebarTime = this._makeEl('p', this.settings.classPrefix + "-sidebar-time");
        this.els.sidebar.appendChild(this.els.sidebarTime);
      }
      return this.els.popover.appendChild(this.els.sidebar);
    };

    Sundial.prototype._buildDatePicker = function() {
      this.els.datePicker = this._makeEl('div', this.settings.classPrefix + "-date-picker");
      this.els.datePickerHeader = this._makeEl('header', this.settings.classPrefix + "-date-picker-header");
      this.els.datePickerDecrementMonth = this._makeEl('button', this.settings.classPrefix + "-date-picker-decrement-month", 'Previous Month');
      this.els.datePickerHeaderText = this._makeEl('p', this.settings.classPrefix + "-date-picker-header-text");
      this.els.datePickerIncrementMonth = this._makeEl('button', this.settings.classPrefix + "-date-picker-increment-month", 'Next Month');
      this.els.datePickerHeader.appendChild(this.els.datePickerDecrementMonth);
      this.els.datePickerHeader.appendChild(this.els.datePickerHeaderText);
      this.els.datePickerHeader.appendChild(this.els.datePickerIncrementMonth);
      this.els.calendarContainer = this._makeEl('div', this.settings.classPrefix + "-calendar-container");
      this.els.datePicker.appendChild(this.els.datePickerHeader);
      this.els.datePicker.appendChild(this.els.calendarContainer);
      return this.els.pickerContainer.appendChild(this.els.datePicker);
    };

    Sundial.prototype._buildTimePicker = function() {
      var h, hourEl, j, k, m, minuteEl;
      this.els.timePicker = this._makeEl('div', this.settings.classPrefix + "-time-picker");
      this.els.timePickerHour = this._makeEl('select', this.settings.classPrefix + "-time-picker-hour");
      this.els.timePickerMinute = this._makeEl('select', this.settings.classPrefix + "-time-picker-minute");
      this.els.timePickerDescription = this._makeEl('p', this.settings.classPrefix + "-time-picker-description", this.settings.timePickerDescription);
      for (h = j = 0; j <= 23; h = ++j) {
        hourEl = this._makeEl('option', null, ('0' + h).slice(-2));
        this.els.timePickerHour.appendChild(hourEl);
      }
      for (m = k = 0; k <= 59; m = ++k) {
        minuteEl = this._makeEl('option', null, ('0' + m).slice(-2));
        this.els.timePickerMinute.appendChild(minuteEl);
      }
      this.els.timePicker.appendChild(this.els.timePickerHour);
      this.els.timePicker.appendChild(this.els.timePickerMinute);
      this.els.timePicker.appendChild(this.els.timePickerDescription);
      return this.els.pickerContainer.appendChild(this.els.timePicker);
    };

    Sundial.prototype._wrapEl = function() {
      var nextSibling, parent;
      this.els.wrapper = this._makeEl(this.settings.wrapperTagName, this.settings.classPrefix + "-wrapper");
      parent = this.els.input.parentNode;
      nextSibling = this.els.input.nextSibling;
      this.els.wrapper.appendChild(this.els.input);
      if (nextSibling) {
        return parent.insertBefore(this.els.wrapper, nextSibling);
      } else {
        return parent.appendChild(this.els.wrapper);
      }
    };

    Sundial.prototype._bindEvents = function() {
      this.els.input.addEventListener('focus', this.show, true);
      this.els.datePickerDecrementMonth.addEventListener('click', this.decrementCurrentMonth, true);
      return this.els.datePickerIncrementMonth.addEventListener('click', this.incrementCurrentMonth, true);
    };

    Sundial.prototype._buildCalendarHeader = function() {
      var days, i, j;
      days = ['<tr>'];
      for (i = j = 0; j < 7; i = ++j) {
        days.push("<th>" + (moment().set('day', i + this.settings.weekStart).format(this.settings.dayOfWeekFormat)) + "</th>");
      }
      days.push('</tr>');
      return days;
    };

    Sundial.prototype._buildCalendarDay = function(dayInfo) {
      var dayClasses;
      if (dayInfo.empty) {
        return "<td class=\"" + this.settings.classPrefix + "-day-empty\"></td>";
      }
      dayClasses = [];
      if (dayInfo.today) {
        dayClasses.push(this.settings.classPrefix + "-day-today");
      }
      return "<td class=\"" + this.settings.classPrefix + "-day " + (dayClasses.join(' ')) + "\">\n  <button data-date=\"" + dayInfo.dateString + "\" class=\"" + this.settings.classPrefix + "-day-button\">\n    " + dayInfo.dayOfMonth + "\n  </button>\n</td>";
    };

    Sundial.prototype._buildCalendar = function() {
      var calendarMatrix, cellCount, day, dayInfo, daysAfterMonthEnd, daysBeforeMonthStart, daysInMonth, i, j, ref, rowLength;
      this.els.datePickerHeaderText.innerText = (this.currentMonth.format('MMMM')) + " " + (this.currentMonth.format('YYYY'));
      calendarMatrix = [];
      calendarMatrix.push(this._buildCalendarHeader());
      daysInMonth = this.currentMonth.daysInMonth();
      daysBeforeMonthStart = this.currentMonth.day();
      if (this.settings.weekStart > 0) {
        daysBeforeMonthStart -= this.settings.weekStart;
        if (daysBeforeMonthStart < 0) {
          daysBeforeMonthStart += 7;
        }
      }
      cellCount = daysInMonth + daysBeforeMonthStart;
      daysAfterMonthEnd = cellCount;
      while (daysAfterMonthEnd > 7) {
        daysAfterMonthEnd -= 7;
      }
      cellCount += 7 - daysAfterMonthEnd;
      console.log('dbda', daysBeforeMonthStart, daysAfterMonthEnd);
      rowLength = 0;
      for (i = j = 0, ref = cellCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (rowLength === 0) {
          calendarMatrix.push(['<tr>']);
        }
        day = this.currentMonth.clone().date(1 + (i - daysBeforeMonthStart));
        dayInfo = {
          empty: i < daysBeforeMonthStart || i >= (daysInMonth + daysBeforeMonthStart),
          today: day.isSame(moment(), 'day'),
          dateString: day.format('YYYY-MM-DD'),
          dayOfMonth: day.date()
        };
        calendarMatrix[calendarMatrix.length - 1].push(this._buildCalendarDay(dayInfo));
        if (++rowLength === 7) {
          calendarMatrix[calendarMatrix.length - 1].push('</tr>');
          rowLength = 0;
        }
      }
      return this._renderCalendar(calendarMatrix);
    };

    Sundial.prototype._renderCalendar = function(calendarMatrix) {
      var calendarHtml, col, j, k, len, len1, row;
      console.log(calendarMatrix);
      calendarHtml = '<table><tbody>';
      for (j = 0, len = calendarMatrix.length; j < len; j++) {
        row = calendarMatrix[j];
        for (k = 0, len1 = row.length; k < len1; k++) {
          col = row[k];
          calendarHtml += col;
        }
      }
      calendarHtml += '</tbody></table>';
      return this.els.calendarContainer.innerHTML = calendarHtml;
    };

    return Sundial;

  })();

  window.Sundial = Sundial;

}).call(this);
