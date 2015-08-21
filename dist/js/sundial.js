(function() {
  var Sundial,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Sundial = (function() {
    function Sundial(el, options) {
      var key, val;
      if (options == null) {
        options = {};
      }
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this.settings = {
        enableSidebar: true,
        enableTimePicker: true,
        allowEmptyDate: true,
        classPrefix: 'sundial',
        wrapperTagName: 'div',
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
      this.els = {};
      this.els.input = el;
      this._buildPopover();
      this._wrapEl();
      this._bindEvents();
    }

    Sundial.prototype.show = function() {
      return console.log('should show');
    };

    Sundial.prototype.hide = function() {
      return console.log('should hide');
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
      if (this.settings.enableTimePicker === true) {
        this._buildTimePicker();
      }
      return document.body.appendChild(this.els.popover);
    };

    Sundial.prototype._buildSidebar = function() {
      this.els.sidebar = this._makeEl('div', this.settings.classPrefix + "-sidebar");
      this.els.sidebarYear = this._makeEl('p', this.settings.classPrefix + "-sidebar-year");
      this.els.sidebarDate = this._makeEl('p', this.settings.classPrefix + "-sidebar-date");
      this.els.sidebarTime = this._makeEl('p', this.settings.classPrefix + "-sidebar-time");
      this.els.sidebar.appendChild(this.els.sidebarYear);
      this.els.sidebar.appendChild(this.els.sidebarDate);
      this.els.sidebar.appendChild(this.els.sidebarTime);
      return this.els.popover.appendChild(this.els.sidebar);
    };

    Sundial.prototype._buildTimePicker = function() {
      var h, hourEl, i, j, m, minuteEl;
      this.els.timePicker = this._makeEl('div', this.settings.classPrefix + "-time-picker");
      this.els.timePickerHour = this._makeEl('select', this.settings.classPrefix + "-time-picker-hour");
      this.els.timePickerMinute = this._makeEl('select', this.settings.classPrefix + "-time-picker-minute");
      this.els.timePickerDescription = this._makeEl('p', this.settings.classPrefix + "-time-picker-description", this.settings.timePickerDescription);
      for (h = i = 0; i <= 23; h = ++i) {
        hourEl = this._makeEl('option', null, h);
        this.els.timePickerHour.appendChild(hourEl);
      }
      for (m = j = 0; j <= 59; m = ++j) {
        minuteEl = this._makeEl('option', null, m);
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
      return this.els.input.addEventListener('focus', this.show, true);
    };

    Sundial.prototype._renderCalendar = function(year, month) {
      var daysInMonth;
      return daysInMonth = moment(year + "-" + month).daysInMonth();
    };

    return Sundial;

  })();

  window.Sundial = Sundial;

}).call(this);
