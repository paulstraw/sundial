(function() {
  var Sundial, addClass, hasClass, makeEl, removeClass,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  makeEl = function(tagName, className, innerText) {
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

  hasClass = function(el, className) {
    return indexOf.call(el.className.split(' '), className) >= 0;
  };

  addClass = function(el, className) {
    if (hasClass(el, className)) {
      return;
    }
    return el.className = el.className === '' ? className : el.className + " " + className;
  };

  removeClass = function(el, className) {
    return el.className = el.className.replace(className, '').trim();
  };

  Sundial = (function() {
    function Sundial(el, options) {
      var key, prefilledDate, val;
      if (options == null) {
        options = {};
      }
      this._handleCalendarDayClick = bind(this._handleCalendarDayClick, this);
      this._handlePopoverClick = bind(this._handlePopoverClick, this);
      this._handleInputBlur = bind(this._handleInputBlur, this);
      this.setSelectedMinute = bind(this.setSelectedMinute, this);
      this.setSelectedHour = bind(this.setSelectedHour, this);
      this.setSelectedDate = bind(this.setSelectedDate, this);
      this.incrementcurrentDisplayMonth = bind(this.incrementcurrentDisplayMonth, this);
      this.decrementcurrentDisplayMonth = bind(this.decrementcurrentDisplayMonth, this);
      this.setcurrentDisplayMonth = bind(this.setcurrentDisplayMonth, this);
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this._deferredShow = bind(this._deferredShow, this);
      this.settings = {
        enableSidebar: true,
        enableTimePicker: true,
        allowEmptyDate: true,
        classPrefix: 'sundial',
        wrapperTagName: 'div',
        defaultDisplayMonth: moment().startOf('month'),
        minDate: null,
        maxDate: null,
        enableDate: null,
        weekStart: 0,
        timePickerMinuteStep: 1,
        timePickerSeparator: ':',
        timePickerDescription: 'Format: 24hr',
        inputFormat: moment.defaultFormat,
        maskFormat: 'dddd MMMM Do, YYYY h:mmA',
        dayOfWeekFormat: 'dd',
        sidebarYearFormat: 'YYYY',
        sidebarDateFormat: 'ddd, MMM D',
        sidebarTimeFormat: 'h:mmA',
        dayButtonDateFormat: 'YYYY-MM-DD',
        verticalPopoverOffset: 0,
        horizontalPopoverOffset: 0
      };
      this._popoverShowing = false;
      for (key in options) {
        val = options[key];
        this.settings[key] = val;
      }
      this.els = {};
      this.els.input = el;
      this._setUpInput();
      prefilledDate = moment(this.els.input.value, this.settings.inputFormat);
      if (!prefilledDate.isValid()) {
        prefilledDate = null;
      }
      this.currentDisplayMonth = prefilledDate ? prefilledDate.clone().startOf('month') : this.settings.defaultDisplayMonth;
      this._buildPopover();
      this._wrapEl();
      this._bindEvents();
      this._buildCalendar();
      this.setSelectedDate(prefilledDate || moment(), true);
    }

    Sundial.prototype._deferredShow = function() {
      return setTimeout(this.show, 0);
    };

    Sundial.prototype.show = function() {
      if (this._popoverShowing) {
        return;
      }
      this._popoverShowing = true;
      this.els.input.focus();
      addClass(this.els.popover, 'visible');
      return this._positionPopover();
    };

    Sundial.prototype.hide = function() {
      this._popoverShowing = false;
      return removeClass(this.els.popover, 'visible');
    };

    Sundial.prototype.setcurrentDisplayMonth = function(year, month) {
      this.currentDisplayMonth = moment(year + "-" + month, 'YYYY-M').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype.decrementcurrentDisplayMonth = function() {
      this.currentDisplayMonth.subtract(1, 'month').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype.incrementcurrentDisplayMonth = function() {
      this.currentDisplayMonth.add(1, 'month').startOf('month');
      return this._buildCalendar();
    };

    Sundial.prototype.setSelectedDate = function(date, setTime) {
      var previouslySelectedHour, previouslySelectedMinute;
      if (setTime == null) {
        setTime = false;
      }
      previouslySelectedHour = this.selectedDate ? this.selectedDate.hour() : 0;
      previouslySelectedMinute = this.selectedDate ? this.selectedDate.minute() : 0;
      this.selectedDate = date;
      if (!setTime) {
        this.setSelectedHour(previouslySelectedHour, false);
        this.setSelectedMinute(previouslySelectedMinute, false);
      }
      this._renderSelectedDateTime();
      return this._buildCalendar();
    };

    Sundial.prototype.setSelectedHour = function(hour, render) {
      if (render == null) {
        render = true;
      }
      this.selectedDate.hours(hour);
      if (render) {
        return this._renderSelectedDateTime();
      }
    };

    Sundial.prototype.setSelectedMinute = function(minute, render) {
      if (render == null) {
        render = true;
      }
      this.selectedDate.minutes(minute);
      if (render) {
        return this._renderSelectedDateTime();
      }
    };

    Sundial.prototype._positionPopover = function() {
      var left, popoverStyle, top;
      popoverStyle = this.els.popover.style;
      top = this.els.wrapper.offsetHeight + this.els.wrapper.offsetTop + this.settings.verticalPopoverOffset;
      left = this.els.wrapper.offsetLeft + this.settings.horizontalPopoverOffset;
      popoverStyle.top = top + "px";
      return popoverStyle.left = left + "px";
    };

    Sundial.prototype._setUpInput = function() {
      return this.els.input.setAttribute('readonly', 'true');
    };

    Sundial.prototype._buildPopover = function() {
      var popoverStyle;
      this.els.popover = makeEl('div', this.settings.classPrefix + "-popover");
      popoverStyle = this.els.popover.style;
      popoverStyle.position = 'absolute';
      if (this.settings.enableSidebar === true) {
        this._buildSidebar();
      }
      this.els.pickerContainer = makeEl('div', this.settings.classPrefix + "-picker-container");
      this.els.popover.appendChild(this.els.pickerContainer);
      this._buildDatePicker();
      if (this.settings.enableTimePicker === true) {
        this._buildTimePicker();
      }
      return this.els.input.offsetParent.appendChild(this.els.popover);
    };

    Sundial.prototype._buildSidebar = function() {
      this.els.sidebar = makeEl('div', this.settings.classPrefix + "-sidebar");
      this.els.sidebarYear = makeEl('p', this.settings.classPrefix + "-sidebar-year");
      this.els.sidebar.appendChild(this.els.sidebarYear);
      this.els.sidebarDate = makeEl('p', this.settings.classPrefix + "-sidebar-date");
      this.els.sidebar.appendChild(this.els.sidebarDate);
      if (this.settings.enableTimePicker === true) {
        this.els.sidebarTime = makeEl('p', this.settings.classPrefix + "-sidebar-time");
        this.els.sidebar.appendChild(this.els.sidebarTime);
      }
      return this.els.popover.appendChild(this.els.sidebar);
    };

    Sundial.prototype._buildDatePicker = function() {
      this.els.datePicker = makeEl('div', this.settings.classPrefix + "-date-picker");
      this.els.datePickerHeader = makeEl('header', this.settings.classPrefix + "-date-picker-header");
      this.els.datePickerDecrementMonth = makeEl('button', this.settings.classPrefix + "-date-picker-decrement-month", 'Previous Month');
      this.els.datePickerHeaderText = makeEl('p', this.settings.classPrefix + "-date-picker-header-text");
      this.els.datePickerIncrementMonth = makeEl('button', this.settings.classPrefix + "-date-picker-increment-month", 'Next Month');
      this.els.datePickerHeader.appendChild(this.els.datePickerDecrementMonth);
      this.els.datePickerHeader.appendChild(this.els.datePickerHeaderText);
      this.els.datePickerHeader.appendChild(this.els.datePickerIncrementMonth);
      this.els.calendarContainer = makeEl('div', this.settings.classPrefix + "-calendar-container");
      this.els.datePicker.appendChild(this.els.datePickerHeader);
      this.els.datePicker.appendChild(this.els.calendarContainer);
      return this.els.pickerContainer.appendChild(this.els.datePicker);
    };

    Sundial.prototype._buildTimePicker = function() {
      var h, hourEl, j, k, m, minuteEl, ref;
      this.els.timePicker = makeEl('div', this.settings.classPrefix + "-time-picker");
      this.els.timePickerHour = makeEl('select', this.settings.classPrefix + "-time-picker-hour");
      this.els.timePickerSeparator = makeEl('span', this.settings.classPrefix + "-time-picker-separator", this.settings.timePickerSeparator);
      this.els.timePickerMinute = makeEl('select', this.settings.classPrefix + "-time-picker-minute");
      this.els.timePickerDescription = makeEl('p', this.settings.classPrefix + "-time-picker-description", this.settings.timePickerDescription);
      for (h = j = 0; j <= 23; h = ++j) {
        hourEl = makeEl('option', null, ('0' + h).slice(-2));
        this.els.timePickerHour.appendChild(hourEl);
      }
      for (m = k = 0, ref = this.settings.timePickerMinuteStep; k <= 59; m = k += ref) {
        minuteEl = makeEl('option', null, ('0' + m).slice(-2));
        this.els.timePickerMinute.appendChild(minuteEl);
      }
      this.els.timePicker.appendChild(this.els.timePickerHour);
      this.els.timePicker.appendChild(this.els.timePickerSeparator);
      this.els.timePicker.appendChild(this.els.timePickerMinute);
      this.els.timePicker.appendChild(this.els.timePickerDescription);
      return this.els.pickerContainer.appendChild(this.els.timePicker);
    };

    Sundial.prototype._wrapEl = function() {
      var nextSibling, parent;
      this.els.wrapper = makeEl(this.settings.wrapperTagName, this.settings.classPrefix + "-wrapper");
      parent = this.els.input.parentNode;
      nextSibling = this.els.input.nextSibling;
      this.els.wrapper.appendChild(this.els.input);
      this.els.inputMask = makeEl('div', this.settings.classPrefix + "-input-mask");
      this.els.wrapper.appendChild(this.els.inputMask);
      if (nextSibling) {
        return parent.insertBefore(this.els.wrapper, nextSibling);
      } else {
        return parent.appendChild(this.els.wrapper);
      }
    };

    Sundial.prototype._bindEvents = function() {
      this.els.input.addEventListener('focus', this.show, false);
      this.els.inputMask.addEventListener('mousedown', this._deferredShow, false);
      this.els.inputMask.addEventListener('touchstart', this._deferredShow, false);
      this.els.popover.addEventListener('mousedown', this._handlePopoverClick, false);
      this.els.popover.addEventListener('touchstart', this._handlePopoverClick, false);
      this.els.input.addEventListener('blur', this._handleInputBlur, false);
      this.els.datePickerDecrementMonth.addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.decrementcurrentDisplayMonth();
        };
      })(this), false);
      this.els.datePickerIncrementMonth.addEventListener('click', (function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.incrementcurrentDisplayMonth();
        };
      })(this), false);
      this.els.calendarContainer.addEventListener('click', this._handleCalendarDayClick, false);
      if (this.settings.enableTimePicker) {
        this.els.timePickerHour.addEventListener('change', (function(_this) {
          return function() {
            return _this.setSelectedHour(_this.els.timePickerHour.value);
          };
        })(this), false);
        return this.els.timePickerMinute.addEventListener('change', (function(_this) {
          return function() {
            return _this.setSelectedMinute(_this.els.timePickerMinute.value);
          };
        })(this), false);
      }
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
      if (dayInfo.selected) {
        dayClasses.push(this.settings.classPrefix + "-day-selected");
      }
      return "<td class=\"" + this.settings.classPrefix + "-day " + (dayClasses.join(' ')) + "\">\n  <button data-date=\"" + dayInfo.dateString + "\" class=\"" + this.settings.classPrefix + "-day-button\">\n    " + dayInfo.dayOfMonth + "\n  </button>\n</td>";
    };

    Sundial.prototype._buildCalendar = function() {
      var calendarMatrix, cellCount, day, dayInfo, daysAfterMonthEnd, daysBeforeMonthStart, daysInMonth, i, j, ref, rowLength;
      this.els.datePickerHeaderText.innerText = (this.currentDisplayMonth.format('MMMM')) + " " + (this.currentDisplayMonth.format('YYYY'));
      calendarMatrix = [];
      calendarMatrix.push(this._buildCalendarHeader());
      daysInMonth = this.currentDisplayMonth.daysInMonth();
      daysBeforeMonthStart = this.currentDisplayMonth.day();
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
      rowLength = 0;
      for (i = j = 0, ref = cellCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (rowLength === 0) {
          calendarMatrix.push(['<tr>']);
        }
        day = this.currentDisplayMonth.clone().date(1 + (i - daysBeforeMonthStart));
        dayInfo = {
          empty: i < daysBeforeMonthStart || i >= (daysInMonth + daysBeforeMonthStart),
          today: day.isSame(moment(), 'day'),
          dateString: day.format(this.settings.dayButtonDateFormat),
          dayOfMonth: day.date(),
          selected: this.selectedDate ? day.isSame(this.selectedDate, 'day') : false
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

    Sundial.prototype._renderSelectedDateTime = function() {
      this.els.input.value = this.selectedDate.format(this.settings.inputFormat);
      this.els.inputMask.innerText = this.selectedDate.format(this.settings.maskFormat);
      if (this.settings.enableSidebar === true) {
        this.els.sidebarYear.innerText = this.selectedDate.format(this.settings.sidebarYearFormat);
        this.els.sidebarDate.innerText = this.selectedDate.format(this.settings.sidebarDateFormat);
        if (this.settings.enableTimePicker) {
          this.els.sidebarTime.innerText = this.selectedDate.format(this.settings.sidebarTimeFormat);
        }
      }
      if (this.settings.enableTimePicker) {
        this.els.timePickerHour.value = ('0' + this.selectedDate.hour()).slice(-2);
        return this.els.timePickerMinute.value = ('0' + this.selectedDate.minute()).slice(-2);
      }
    };

    Sundial.prototype._handleInputBlur = function(e) {
      if (this._clickedPopover) {
        this._clickedPopover = false;
        this.els.input.focus();
        return;
      }
      return this.hide();
    };

    Sundial.prototype._handlePopoverClick = function(e) {
      return this._clickedPopover = true;
    };

    Sundial.prototype._handleCalendarDayClick = function(e) {
      var clicked;
      clicked = e.target;
      if (!hasClass(clicked, 'sundial-day-button')) {
        return true;
      }
      return this.setSelectedDate(moment(clicked.dataset.date, this.settings.dayButtonDateFormat));
    };

    return Sundial;

  })();

  window.Sundial = Sundial;

}).call(this);
