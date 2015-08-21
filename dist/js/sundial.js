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
        firstDay: 1,
        timePickerDescription: 'Format: 24hr',
        inputFormat: 'YYYY, dddd MMM Do, h:mmA Z',
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
      this._renderCalendar();
    }

    Sundial.prototype.show = function() {
      return console.log('should show');
    };

    Sundial.prototype.hide = function() {
      return console.log('should hide');
    };

    Sundial.prototype.setCurrentMonth = function(year, month) {
      this.currentMonth = moment(year + "-" + month, 'YYYY-M');
      return this._renderCalendar();
    };

    Sundial.prototype.decrementCurrentMonth = function() {
      this.currentMonth = this.currentMonth.subtract(1, 'month');
      return this._renderCalendar();
    };

    Sundial.prototype.incrementCurrentMonth = function() {
      this.currentMonth = this.currentMonth.add(1, 'month');
      return this._renderCalendar();
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
      var h, hourEl, i, j, m, minuteEl;
      this.els.timePicker = this._makeEl('div', this.settings.classPrefix + "-time-picker");
      this.els.timePickerHour = this._makeEl('select', this.settings.classPrefix + "-time-picker-hour");
      this.els.timePickerMinute = this._makeEl('select', this.settings.classPrefix + "-time-picker-minute");
      this.els.timePickerDescription = this._makeEl('p', this.settings.classPrefix + "-time-picker-description", this.settings.timePickerDescription);
      for (h = i = 0; i <= 23; h = ++i) {
        hourEl = this._makeEl('option', null, ('0' + h).slice(-2));
        this.els.timePickerHour.appendChild(hourEl);
      }
      for (m = j = 0; j <= 59; m = ++j) {
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

    Sundial.prototype._renderCalendar = function() {
      var calendarHtml, daysInMonth;
      daysInMonth = this.currentMonth.daysInMonth();
      calendarHtml = '';
      this.els.datePickerHeaderText.innerText = (this.currentMonth.format('MMMM')) + " " + (this.currentMonth.format('YYYY'));
      return this.els.calendarContainer.innerHTML = calendarHtml;
    };

    return Sundial;

  })();

  window.Sundial = Sundial;

}).call(this);
