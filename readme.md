# Sundial

A pretty nice datetime picker. Hopefully pretty accessible, definitely pretty usable. No DOM library required, just add [Moment.js](http://momentjs.com/) and you're good to go.

Minimal styling [required](https://github.com/paulstraw/sundial/blob/master/src/scss/sundial.scss), lots of styling [possible](https://github.com/paulstraw/sundial/blob/master/src/scss/sundial-theme-wizard-club.scss).

Love,  
[Paul Straw](https://twitter.com/paulstraw)


## Usage

``` html
<input type="text" id="dingus">
```

``` javascript
var someDingus = document.getElementById('dingus');
new Sundial(someDingus, {options: goHere});
```


## Options / Defaults

``` coffeescript
defaults =
  enableSidebar: true # Render the "current date" sidebar
  enableTimePicker: true # Allow picking time as well as date
  allowEmptyDate: true # Allow date to be cleared
  classPrefix: 'sundial' # Class prefix, for theming and stuff
  wrapperTagName: 'div' # Change the input wrapper tag
  defaultDisplayMonth: moment().startOf('month') # A `moment` specifying the default month to view when the picker is first opened. Overridden by an existing value in the passed input
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
```


## Special Thanks

A lot of the calendar rendering code is adapted from the venerable [Pikaday](https://github.com/dbushell/Pikaday). It's well worth checking out, if Sundial isn't for you for whatever reason!


## Meta Stuff

Sundial was created by [Paul Straw](https://twitter.com/paulstraw). It's MIT-licensed (see the [license file](https://github.com/paulstraw/sundial/blob/master/license.md) for more info). Any contribution is absolutely welcome, but please review the [contribution guidelines](https://github.com/paulstraw/sundial/blob/master/contributing.md) before getting started.
