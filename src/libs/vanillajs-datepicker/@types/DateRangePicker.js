"use strict";
exports.__esModule = true;
var event_js_1 = require("./lib/event.js");
var date_format_js_1 = require("./lib/date-format.js");
var Datepicker_js_1 = require("./Datepicker.js");
// filter out the config options inapproprite to pass to Datepicker
function filterOptions(options) {
    var newOpts = Object.assign({}, options);
    delete newOpts.inputs;
    delete newOpts.allowOneSidedRange;
    delete newOpts.maxNumberOfDates; // to ensure each datepicker handles a single date
    return newOpts;
}
function setupDatepicker(rangepicker, changeDateListener, el, options) {
    event_js_1.registerListeners(rangepicker, [
        [el, 'changeDate', changeDateListener],
    ]);
    return new Datepicker_js_1["default"](el, options, rangepicker);
}
function onChangeDate(rangepicker, ev) {
    // to prevent both datepickers trigger the other side's update each other
    if (rangepicker.updating) {
        return;
    }
    rangepicker.updating = true;
    var target = ev.target;
    if (target.datepicker === undefined) {
        return;
    }
    var datepickers = rangepicker.datepickers;
    var setDateOptions = { render: false };
    var changedSide = rangepicker.inputs.indexOf(target);
    var otherSide = changedSide === 0 ? 1 : 0;
    var changedDate = datepickers[changedSide].dates[0];
    var otherDate = datepickers[otherSide].dates[0];
    if (changedDate !== undefined && otherDate !== undefined) {
        // if the start of the range > the end, swap them
        if (changedSide === 0 && changedDate > otherDate) {
            datepickers[0].setDate(otherDate, setDateOptions);
            datepickers[1].setDate(changedDate, setDateOptions);
        }
        else if (changedSide === 1 && changedDate < otherDate) {
            datepickers[0].setDate(changedDate, setDateOptions);
            datepickers[1].setDate(otherDate, setDateOptions);
        }
    }
    else if (!rangepicker.allowOneSidedRange) {
        // to prevent the range from becoming one-sided, copy changed side's
        // selection (no matter if it's empty) to the other side
        if (changedDate !== undefined || otherDate !== undefined) {
            setDateOptions.clear = true;
            datepickers[otherSide].setDate(datepickers[changedSide].dates, setDateOptions);
        }
    }
    datepickers[0].picker.update().render();
    datepickers[1].picker.update().render();
    delete rangepicker.updating;
}
/**
 * Class representing a date range picker
 */
var DateRangePicker = /** @class */ (function () {
    /**
     * Create a date range picker
     * @param  {Element} element - element to bind a date range picker
     * @param  {Object} [options] - config options
     */
    function DateRangePicker(element, options) {
        if (options === void 0) { options = {}; }
        var inputs = Array.isArray(options.inputs)
            ? options.inputs
            : Array.from(element.querySelectorAll('input'));
        if (inputs.length < 2) {
            return;
        }
        element.rangepicker = this;
        this.element = element;
        this.inputs = inputs.slice(0, 2);
        this.allowOneSidedRange = !!options.allowOneSidedRange;
        var changeDateListener = onChangeDate.bind(null, this);
        var cleanOptions = filterOptions(options);
        this.datepickers = [
            setupDatepicker(this, changeDateListener, this.inputs[0], cleanOptions),
            setupDatepicker(this, changeDateListener, this.inputs[1], cleanOptions),
        ];
        // normalize the range if inital dates are given
        if (this.dates[0] !== undefined) {
            onChangeDate(this, { target: this.inputs[0] });
        }
        else if (this.dates[1] !== undefined) {
            onChangeDate(this, { target: this.inputs[1] });
        }
    }
    Object.defineProperty(DateRangePicker.prototype, "dates", {
        /**
         * @type {Array} - selected date of the linked date pickers
         */
        get: function () {
            if (this.datepickers) {
                return [
                    this.datepickers[0].dates[0],
                    this.datepickers[1].dates[0],
                ];
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set new values to the config options
     * @param {Object} options - config options to update
     */
    DateRangePicker.prototype.setOptions = function (options) {
        this.allowOneSidedRange = !!options.allowOneSidedRange;
        var cleanOptions = filterOptions(options);
        this.datepickers[0].setOptions(cleanOptions);
        this.datepickers[1].setOptions(cleanOptions);
    };
    /**
     * Destroy the DateRangePicker instance
     * @return {DateRangePicker} - the instance destroyed
     */
    DateRangePicker.prototype.destroy = function () {
        this.datepickers[0].destroy();
        this.datepickers[1].destroy();
        event_js_1.unregisterListeners(this);
        delete this.element.rangepicker;
    };
    /**
     * Get the start and end dates of the date range
     *
     * The method returns Date objects by default. If format string is passed,
     * it returns date strings formatted in given format.
     * The result array always contains 2 items (start date/end date) and
     * undifined is used for unselected side. (e.g. If none is selected,
     * the result will be [undifined, undifined]. If only the end date is set
     * when allowOneSidedRange config option is true, [undifined, endDate] will
     * be returned.)
     *
     * @param  {String} [format] - Format string to stringify the dates
     * @return {Array} - Start and end dates
     */
    DateRangePicker.prototype.getDates = function (format) {
        var _this = this;
        if (format === void 0) { format = undefined; }
        var callback = format
            ? function (date) { return date_format_js_1.formatDate(date, format, _this.datepickers[0].config.locale); }
            : function (date) { return new Date(date); };
        return this.dates.map(function (date) { return date === undefined ? date : callback(date); });
    };
    return DateRangePicker;
}());
exports["default"] = DateRangePicker;
