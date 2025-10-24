/* k6-reporter 2.4.0 */ 
(function(exports, node_require) {
"use strict";
var require=node_require||(function(){for(var i=0;i<arguments.length;i++){if(arguments[i].length==1){return arguments[i][0]}}return require})([function(exports, module) {
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  htmlReport: function() { return /* reexport */ htmlReport; }
});

// EXTERNAL MODULE: external "k6"
var external_k6_ = __webpack_require__(1);
// EXTERNAL MODULE: external "k6/metrics"
var external_k6_metrics_ = __webpack_require__(2);
;// CONCATENATED MODULE: ./lib/config.js
/**
 * @typedef {Object} Config
 * @property {boolean} darkTheme
 * @property {string} title
 * @property {string} debug
 */

/**
 * @type {Config}
 */
const config = {
    darkTheme: false,
    title: 'k6 Report',
    debug: '',
};

const urlParams = new URLSearchParams(globalThis.location.search);

/**
 * Set the configuration for the report.
 * @param {Partial<Config>} newConfig
 */
function setConfig(newConfig) {
    if (newConfig.darkTheme !== undefined) {
        config.darkTheme = newConfig.darkTheme;
    }
    if (newConfig.title !== undefined) {
        config.title = newConfig.title;
    }
    if (newConfig.debug !== undefined) {
        config.debug = newConfig.debug;
    }
}

// Try to set config from URL params
if (urlParams.get('darkTheme') !== null) {
    config.darkTheme = true;
}
if (urlParams.get('title') !== null) {
    config.title = urlParams.get('title');
}
if (urlParams.get('debug') !== null) {
    config.debug = urlParams.get('debug');
}

;// CONCATENATED MODULE: ./lib/data/extract.js
/**
 * @typedef {import('k6/metrics').Metric} Metric
 * @typedef {import('k6').Trend} Trend
 * @typedef {import('k6').Rate} Rate
 * @typedef {import('k6').Gauge} Gauge
 * @typedef {import('k6').Counter} Counter
 * @typedef {import('k6').SharedArray} SharedArray
 * @typedef {import('k6').Options} Options
 *
 * @typedef {Object} Times
 * @property {number} start
 * @property {number} end
 * @property {number} duration
 *
 * @typedef {Object} Data
 * @property {Object} metrics
 * @property {Object} options
 * @property {Times} times
 * @property {Object} errors
 *
 * @typedef {Object} ThresholdData
 * @property {string} abbr
 * @property {number | string} expected
 * @property {number} actual
 * @property {boolean} ok
 * @property {string} color
 * @property {string} type
 * @property {string} info
 *
 * @typedef {Object} MetricThreshold
 * @property {string} metric
 * @property {string} type
 * @property {ThresholdData[]} thresholds
 *
 * @typedef {Object} FormattedMetric
 * @property {string} name
 * @property {string} type
 * @property {string} abbr
 * @property {string} info
 * @property {number} count
 * @property {number | undefined} max
 * @property {number | undefined} min
 * @property {number | undefined} avg
 * @property {number | undefined} med
 * @property {number | undefined} p90
 * @property {number | undefined} p95
 * @property {number | undefined} p99
 * @property {number | undefined} rate
 * @property {number | undefined} value
 * @property {boolean | undefined} time
 * @property {boolean | undefined} percentage
 * @property {MetricThreshold} thresholds
 */

/**
 * A regex to split camelCase metrics.
 * @type {RegExp}
 */
const SPLIT_METRICS_REGEX = /(?=[A-Z])/;

/**
 * A map of metric names to display names.
 * @type {Map<string, string>}
 */
const METRIC_DISPLAY_NAMES = new Map([
    ['checks', 'Checks'],
    ['vus', 'Active VUs'],
    ['vusMax', 'Max VUs'],
    ['iterations', 'Iterations'],
    ['iterationDuration', 'Iteration Duration'],
    ['dataReceived', 'Data Received'],
    ['dataSent', 'Data Sent'],
    ['httpReqs', 'HTTP Requests'],
    ['httpReqDuration', 'HTTP Request Duration'],
    ['httpReqFailed', 'HTTP Request Failed'],
]);

/**
 * A map of threshold types to display properties.
 * @type {Map<string, { abbr: string, color: string, info: string }>}
 */
const THRESHOLD_TYPES = new Map([
    ['max', { abbr: 'Max', color: 'bg-red-500', info: 'Maximum value' }],
    ['min', { abbr: 'Min', color: 'bg-blue-500', info: 'Minimum value' }],
    ['avg', { abbr: 'Avg', color: 'bg-green-500', info: 'Average value' }],
    ['med', { abbr: 'Med', color: 'bg-yellow-500', info: 'Median value' }],
    ['p90', { abbr: 'p(90)', color: 'bg-purple-500', info: '90th percentile' }],
    ['p95', { abbr: 'p(95)', color: 'bg-pink-500', info: '95th percentile' }],
    ['p99', { abbr: 'p(99)', color: 'bg-indigo-500', info: '99th percentile' }],
    ['rate', { abbr: 'Rate', color: 'bg-teal-500', info: 'Rate of successful iterations' }],
    ['count', { abbr: 'Count', color: 'bg-orange-500', info: 'Number of successful iterations' }],
    ['value', { abbr: 'Value', color: 'bg-lime-500', info: 'Value' }],
    ['rate', { abbr: 'Rate', color: 'bg-cyan-500', info: 'Rate of successful checks' }],
]);

/**
 * A list of metric types that are time values.
 * @type {string[]}
 */
const TIME_METRICS = [
    'iteration_duration',
    'http_req_duration',
    'http_req_receiving',
    'http_req_sending',
    'http_req_tls_handshaking',
    'http_req_connecting',
    'http_req_blocked',
    'http_req_waiting',
    'group_duration',
    'ws_connecting',
    'ws_messaging',
    'ws_session_duration',
];

/**
 * A list of metric types that are percentages.
 * @type {string[]}
 */
const PERCENTAGE_METRICS = [
    'checks',
    'http_req_failed',
];

/**
 * A list of metric types that should be hidden.
 * @type {string[]}
 */
const HIDDEN_METRICS = [
    'data_received',
    'data_sent',
    'http_reqs',
    'http_req_duration',
    'iterations',
    'vus',
    'vus_max',
];

/**
 * Get the display name for a metric.
 * @param {string} name
 * @returns {string}
 */
function getMetricDisplayName(name) {
    if (METRIC_DISPLAY_NAMES.has(name)) {
        return METRIC_DISPLAY_NAMES.get(name);
    }
    const metricName = name.replace(/_/g, ' ').split(SPLIT_METRICS_REGEX).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return metricName;
}

/**
 * Format a k6 metric into a custom format.
 * @param {string} name
 * @param {Metric} metric
 * @param {Options} options
 * @returns {FormattedMetric}
 */
function formatMetric(name, metric, options) {
    const time = TIME_METRICS.includes(name);
    const percentage = PERCENTAGE_METRICS.includes(name);
    const formattedMetric = {
        name: getMetricDisplayName(name),
        type: metric.type,
        abbr: external_k6_metrics_.Metric.options.get(metric.type)?.abbr || '',
        info: external_k6_metrics_.Metric.options.get(metric.type)?.info || '',
        count: metric.values.count || 0,
        max: metric.values.max,
        min: metric.values.min,
        avg: metric.values.avg,
        med: metric.values.med,
        p90: metric.values.p(0.9),
        p95: metric.values.p(0.95),
        p99: metric.values.p(0.99),
        rate: metric.values.rate,
        value: metric.values.value,
        time,
        percentage,
        thresholds: {
            metric: name,
            type: metric.type,
            thresholds: [],
        },
    };
    if (options.thresholds && options.thresholds[name]) {
        formattedMetric.thresholds.thresholds = Object.keys(options.thresholds[name]).map((threshold) => {
            const thresholdValue = options.thresholds[name][threshold];
            const thresholdType = THRESHOLD_TYPES.get(threshold);
            const value = formattedMetric[threshold] || formattedMetric.rate || formattedMetric.value || formattedMetric.count;
            const ok = metric.thresholds.get(threshold)?.ok;
            const expected = metric.thresholds.get(threshold)?.expected;
            return {
                abbr: thresholdType?.abbr || threshold,
                expected: expected || thresholdValue,
                actual: value,
                ok: ok !== undefined ? ok : false,
                color: thresholdType?.color || 'bg-gray-500',
                type: threshold,
                info: thresholdType?.info || 'Custom threshold',
            };
        });
    }
    return formattedMetric;
}

/**
 * Extract data from the k6 summary.
 * @param {Object} summary
 * @returns {Data}
 */
function extractData(summary) {
    /** @type {Data} */
    const data = {
        metrics: {},
        options: summary.options,
        times: {
            start: new Date(summary.time.start).getTime(),
            end: new Date(summary.time.end).getTime(),
            duration: new Date(summary.time.end).getTime() - new Date(summary.time.start).getTime(),
        },
        errors: summary.state.test.errors || {},
    };

    // Format metrics
    Object.keys(summary.metrics).forEach((name) => {
        const metric = summary.metrics[name];
        data.metrics[name] = formatMetric(name, metric, summary.options);
    });

    // Remove hidden metrics
    HIDDEN_METRICS.forEach((name) => {
        delete data.metrics[name];
    });

    return data;
}

;// CONCATENATED MODULE: ./lib/data/format.js
/**
 * @typedef {import('./extract').FormattedMetric} FormattedMetric
 */

/**
 * Format a duration in milliseconds to a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms.toFixed(3)}ms`;
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(3)}s`;
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
        return `${minutes.toFixed(3)}m`;
    }
    const hours = minutes / 60;
    return `${hours.toFixed(3)}h`;
}

/**
 * Format a number to a human-readable string.
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    if (num === null || num === undefined) {
        return '';
    }
    return num.toLocaleString();
}

/**
 * Format a number to a time or percentage string.
 * @param {number} num
 * @param {boolean | undefined} time
 * @param {boolean | undefined} percentage
 * @returns {string}
 */
function formatValue(num, time, percentage) {
    if (num === null || num === undefined) {
        return '';
    }
    if (time) {
        return formatDuration(num);
    }
    if (percentage) {
        return `${(num * 100).toFixed(2)}%`;
    }
    return formatNumber(num);
}

/**
 * Format a metric value.
 * @param {FormattedMetric} metric
 * @param {'max' | 'min' | 'avg' | 'med' | 'p90' | 'p95' | 'p99' | 'rate' | 'value' | 'count'} property
 * @returns {string}
 */
function formatMetricValue(metric, property) {
    const num = metric[property];
    if (num === null || num === undefined) {
        return '';
    }
    return formatValue(num, metric.time, metric.percentage);
}

/**
 * Format bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format a date to a human-readable string.
 * @param {number} timestamp
 * @returns {string}
 */
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
    const date = new Date(ms);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

;// CONCATENATED MODULE: ./lib/ui/style.js
// Custom styling for the report

const commonClasses = {
    // Layout and spacing
    'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    'card': 'bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6',
    'flex-center': 'flex items-center justify-center',

    // Text and Typography
    'text-primary': 'text-gray-900 dark:text-white',
    'text-secondary': 'text-gray-600 dark:text-gray-400',
    'text-lg-bold': 'text-lg font-semibold',
    'text-xl-extrabold': 'text-xl font-extrabold',

    // Status Colors
    'status-ok': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'status-fail': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'status-warn': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'status-info': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'icon-ok': 'text-green-500',
    'icon-fail': 'text-red-500',

    // Buttons
    'button-primary': 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',

    // Tables
    'table-header': 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
    'table-cell': 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
    'table-row-hover': 'hover:bg-gray-50 dark:hover:bg-gray-700',
};

/**
 * The CSS styles for the report.
 * @returns {string}
 */
function getStyles() {
    // Tailwind CSS classes are included directly in the HTML elements
    // We only need the base Tailwind setup and custom classes if necessary.
    // For this example, we'll embed minimal necessary styles.
    return `
        /* Base styles */
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            transition: background-color 0.3s;
        }

        /* Dark Mode support */
        .dark body {
            background-color: #1f2937; /* Gray-800 */
        }
        .dark .card {
            background-color: #111827; /* Gray-900 */
        }

        /* Custom scrollbar for better visibility */
        .dark ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .dark ::-webkit-scrollbar-track {
            background: #374151; /* Gray-700 */
            border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb {
            background: #4b5563; /* Gray-600 */
            border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
            background: #6b7280; /* Gray-500 */
        }
    `;
}

;// CONCATENATED MODULE: ./lib/ui/icons.js
// SVG Icons for the report

/**
 * A checkmark icon.
 * @returns {string}
 */
function checkIcon() {
    return `<svg class="w-5 h-5 ${commonClasses['icon-ok']}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
    </svg>`;
}

/**
 * A cross icon.
 * @returns {string}
 */
function crossIcon() {
    return `<svg class="w-5 h-5 ${commonClasses['icon-fail']}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
    </svg>`;
}

/**
 * A sun icon for light mode.
 * @returns {string}
 */
function sunIcon() {
    return `<svg class="w-6 h-6 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.717l-1.59 1.59M21 12h-2.25m-.717 6.364l-1.59-1.59M12 18v2.25m-6.364-.717l1.59-1.59M3 12h2.25m.717-6.364l1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
    </svg>`;
}

/**
 * A moon icon for dark mode.
 * @returns {string}
 */
function moonIcon() {
    return `<svg class="w-6 h-6 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.75 9.75 0 0118 15.75c-1.07 0-2.09-.234-3.033-.674a9.771 9.771 0 01-2.793-2.793c-.44-.943-.674-1.963-.674-3.033A9.75 9.75 0 017.5 4.5c1.07 0 2.09.234 3.033.674a9.771 9.771 0 012.793 2.793c.44.943.674 1.963.674 3.033A9.75 9.75 0 0121.752 15.002z" />
    </svg>`;
}

/**
 * A clock icon.
 * @returns {string}
 */
function clockIcon() {
    return `<svg class="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`;
}

/**
 * An information circle icon.
 * @returns {string}
 */
function infoIcon() {
    return `<svg class="w-4 h-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041.02a.75.75 0 00.916-.916l-.02-.041m-2.102 4.197L15 12m-2.25-4.5H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`;
}

/**
 * A chart bar icon.
 * @returns {string}
 */
function chartBarIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.5l5.25-5.25m-3.9 8.25L12 3.75l7.5 10.5m-6.75 6.75l-5.25-5.25" />
    </svg>`;
}

/**
 * A user group icon.
 * @returns {string}
 */
function userGroupIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.75c0-.987-.497-1.78-.96-2.036-.53-.284-1.054-.576-1.574-.866A12 12 0 0112 15c-1.25 0-2.482-.09-3.722-.382-.52-.29-.983-.582-1.46-.866A2.25 2.25 0 005.25 16.5V18a2.25 2.25 0 002.25 2.25H16.5A2.25 2.25 0 0018 18.75zM12 12A4.5 4.5 0 1012 3a4.5 4.5 0 000 9z" />
    </svg>`;
}

/**
 * A clipboard document icon.
 * @returns {string}
 */
function clipboardDocumentIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375H12M4.5 19.5h6.75a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 4.5v10.5a2.25 2.25 0 002.25 2.25h6.75zm0 0H12" />
    </svg>`;
}

/**
 * A cube icon.
 * @returns {string}
 */
function cubeIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.75l-7.5-7.5-7.5 7.5 7.5 7.5 7.5-7.5zM12 12v12m-7.5-7.5l7.5 7.5 7.5-7.5" />
    </svg>`;
}

/**
 * A check circle icon.
 * @returns {string}
 */
function checkCircleIcon() {
    return `<svg class="w-4 h-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a.5.5 0 00-.707 0l-3 3a.5.5 0 00.707.707L10 8.707l2.146 2.147a.5.5 0 00.707-.707l-2.5-2.5a.5.5 0 00-.707 0z" clip-rule="evenodd" />
    </svg>`;
}

/**
 * An exclamation circle icon.
 * @returns {string}
 */
function exclamationCircleIcon() {
    return `<svg class="w-4 h-4 mr-1 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm1.5 3.75a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>`;
}

/**
 * An exclamation triangle icon.
 * @returns {string}
 */
function exclamationTriangleIcon() {
    return `<svg class="w-4 h-4 mr-1 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M18.425 15.54a1 1 0 00-1.748-.962L10 4.417 3.323 14.578a1 1 0 001.748.962L10 6.583l5.207 8.957a1 1 0 00.835.485.996.996 0 00.912-.767z" clip-rule="evenodd" />
    </svg>`;
}

/**
 * A document text icon.
 * @returns {string}
 */
function documentTextIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375H12M4.5 19.5h6.75a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 4.5v10.5a2.25 2.25 0 002.25 2.25h6.75zm0 0H12" />
    </svg>`;
}

/**
 * A wifi icon.
 * @returns {string}
 */
function wifiIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
    </svg>`;
}

/**
 * A user icon.
 * @returns {string}
 */
function userIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a.75.75 0 01-.75-.75V19.5a3.75 3.75 0 017.5 0v.75a.75.75 0 01-.75.75h-6zM15 16.5a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-.75a3.75 3.75 0 017.5 0z" />
    </svg>`;
}

/**
 * A gauge icon.
 * @returns {string}
 */
function gaugeIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v2.25M3 12h2.25m-2.25 6.75h2.25M12 3v2.25m0 16.5v-2.25M21 3v2.25M21 12h-2.25m2.25 6.75h-2.25M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
    </svg>`;
}

/**
 * A arrow path icon.
 * @returns {string}
 */
function arrowPathIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l7.5-7.5m1.5 1.5l7.5 7.5" />
    </svg>`;
}

/**
 * A beaker icon.
 * @returns {string}
 */
function beakerIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12V3m-2.25 14.25a.75.75 0 00-.75-.75h-10.5a.75.75 0 00-.75.75v.75c0 1.559 1.397 2.25 3.12 2.25h5.26c1.723 0 3.12-.691 3.12-2.25v-.75zm-1.5-5.25v2.25h-9v-2.25m9 0a1.5 1.5 0 00-1.5-1.5h-6a1.5 1.5 0 00-1.5 1.5m9 0h2.25a.75.75 0 00.75-.75V11m-3 0v-2.25a1.5 1.5 0 00-1.5-1.5H7.5a1.5 1.5 0 00-1.5 1.5V11m3 0a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75" />
    </svg>`;
}

/**
 * A arrow top right icon.
 * @returns {string}
 */
function arrowTopRightIcon() {
    return `<svg class="w-4 h-4 ml-1.5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>`;
}

/**
 * A link icon.
 * @returns {string}
 */
function linkIcon() {
    return `<svg class="w-4 h-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5h.008v.008h-.008v-.008zm.008 4.5h-.008v.008h.008V15zm.008 4.5h-.008v.008h.008v-.008zM12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>`;
}

/**
 * A server stack icon.
 * @returns {string}
 */
function serverStackIcon() {
    return `<svg class="w-4 h-4 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v2.25M3 12h2.25m-2.25 6.75h2.25M12 3v2.25m0 16.5v-2.25M21 3v2.25M21 12h-2.25m2.25 6.75h-2.25M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
    </svg>`;
}

;// CONCATENATED MODULE: ./lib/ui/components.js


/**
 * @typedef {import('../data/extract').Data} Data
 * @typedef {import('../data/extract').FormattedMetric} FormattedMetric
 * @typedef {import('../data/extract').MetricThreshold} MetricThreshold
 * @typedef {import('../data/extract').ThresholdData} ThresholdData
 * @typedef {import('../data/extract').Times} Times
 */

/**
 * Create a simple card component.
 * @param {string} content
 * @param {string} [title]
 * @param {string} [icon]
 * @returns {string}
 */
function card(content, title, icon) {
    let titleHtml = '';
    if (title) {
        titleHtml = `<h2 class="text-xl font-bold mb-4 flex items-center ${commonClasses['text-primary']}">
            ${icon || ''}
            ${title}
        </h2>`;
    }
    return `
        <div class="${commonClasses['card']}">
            ${titleHtml}
            ${content}
        </div>
    `;
}

/**
 * Create a summary item component.
 * @param {string} title
 * @param {string} value
 * @param {string} [icon]
 * @returns {string}
 */
function summaryItem(title, value, icon) {
    return `
        <div class="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-sm font-medium ${commonClasses['text-secondary']} mb-1 flex items-center">
                ${icon || ''}
                ${title}
            </div>
            <div class="text-2xl font-extrabold ${commonClasses['text-primary']}">
                ${value}
            </div>
        </div>
    `;
}

/**
 * Create the header section.
 * @param {string} title
 * @returns {string}
 */
function header(title) {
    return `
        <header class="py-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="${commonClasses['container']} flex justify-between items-center">
                <h1 class="text-3xl font-extrabold tracking-tight ${commonClasses['text-primary']}">
                    ${title}
                </h1>
                <div id="theme-toggle" class="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    ${sunIcon()}
                </div>
            </div>
        </header>
    `;
}

/**
 * Create the overall test summary section.
 * @param {Data} data
 * @returns {string}
 */
function overallSummary(data) {
    const { times, metrics } = data;
    const duration = formatTime(times.duration);
    const start = formatDate(times.start);
    const end = formatDate(times.end);

    const vusMax = metrics.vus_max ? formatMetricValue(metrics.vus_max, 'value') : 'N/A';
    const httpReqs = metrics.http_reqs ? formatMetricValue(metrics.http_reqs, 'count') : 'N/A';
    const iterations = metrics.iterations ? formatMetricValue(metrics.iterations, 'count') : 'N/A';
    const dataReceived = metrics.data_received ? formatBytes(metrics.data_received.count) : 'N/A';
    const dataSent = metrics.data_sent ? formatBytes(metrics.data_sent.count) : 'N/A';

    const items = [
        summaryItem('Duração', duration, clockIcon()),
        summaryItem('VUs Máximos', vusMax, userGroupIcon()),
        summaryItem('Requisições HTTP', httpReqs, chartBarIcon()),
        summaryItem('Iterações', iterations, arrowPathIcon()),
        summaryItem('Dados Recebidos', dataReceived, cubeIcon()),
        summaryItem('Dados Enviados', dataSent, cubeIcon()),
    ].join('');

    return card(`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            ${items}
        </div>
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm ${commonClasses['text-secondary']}">
            Início: ${start} | Fim: ${end}
        </div>
    `, 'Resumo Geral', clipboardDocumentIcon());
}

/**
 * Create the threshold badge.
 * @param {ThresholdData} threshold
 * @returns {string}
 */
function thresholdBadge(threshold) {
    const statusClass = threshold.ok ? commonClasses['status-ok'] : commonClasses['status-fail'];
    const icon = threshold.ok ? checkCircleIcon() : exclamationCircleIcon();
    
    // Format expected value for display
    let expectedValue = threshold.expected;
    if (typeof expectedValue === 'string' && expectedValue.startsWith('p(')) {
        expectedValue = `${(parseFloat(expectedValue.slice(2, -1)) * 100).toFixed(0)}th`;
    }

    return `
        <span title="${threshold.info} - Esperado: ${expectedValue}" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${statusClass}">
            ${icon}
            ${threshold.abbr}: ${threshold.ok ? 'PASS' : 'FAIL'}
        </span>
    `;
}

/**
 * Create the thresholds section.
 * @param {Data} data
 * @returns {string}
 */
function thresholdsSection(data) {
    const { metrics } = data;
    let thresholdsExist = false;
    let overallStatus = true;

    const thresholdMetrics = Object.keys(metrics)
        .filter(name => metrics[name].thresholds.thresholds.length > 0)
        .map(name => {
            thresholdsExist = true;
            const metric = metrics[name];
            const isOk = metric.thresholds.thresholds.every(t => t.ok);
            if (!isOk) {
                overallStatus = false;
            }
            const statusClass = isOk ? commonClasses['status-ok'] : commonClasses['status-fail'];

            return `
                <div class="p-4 rounded-lg flex flex-col ${statusClass}">
                    <h4 class="text-base font-semibold mb-2 flex items-center justify-between">
                        <span class="${isOk ? commonClasses['icon-ok'] : commonClasses['icon-fail']} flex items-center">
                            ${isOk ? checkCircleIcon() : exclamationCircleIcon()}
                            ${metric.name}
                        </span>
                        <span class="text-xs font-normal">
                            (${metric.type.toUpperCase()})
                        </span>
                    </h4>
                    <div class="flex flex-wrap">
                        ${metric.thresholds.thresholds.map(thresholdBadge).join('')}
                    </div>
                </div>
            `;
        }).join('');

    if (!thresholdsExist) {
        return card(`
            <p class="${commonClasses['text-secondary']}">Nenhum limite (threshold) foi definido para este teste.</p>
        `, 'Limites de Desempenho (Thresholds)', gaugeIcon());
    }

    const overallStatusHtml = overallStatus
        ? `<span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${commonClasses['status-ok']}">
            ${checkCircleIcon()} PASSOU (TODOS OS LIMITES ATENDIDOS)
        </span>`
        : `<span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${commonClasses['status-fail']}">
            ${exclamationCircleIcon()} FALHOU (ALGUNS LIMITES VIOLADOS)
        </span>`;

    return card(`
        <div class="mb-4">
            ${overallStatusHtml}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${thresholdMetrics}
        </div>
    `, 'Limites de Desempenho (Thresholds)', gaugeIcon());
}

/**
 * Create the metrics table row.
 * @param {FormattedMetric} metric
 * @returns {string}
 */
function metricsTableRow(metric) {
    return `
        <tr class="${commonClasses['table-row-hover']}">
            <td class="${commonClasses['table-cell']} font-medium">
                ${metric.name}
                <span title="${metric.info}" class="ml-1 text-xs ${commonClasses['text-secondary']} cursor-help">
                    ${infoIcon()}
                </span>
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'count')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'min')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'med')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'avg')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'p90')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'p95')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${formatMetricValue(metric, 'max')}
            </td>
            <td class="${commonClasses['table-cell']} text-right">
                ${metric.rate ? formatNumber(metric.rate) + '/s' : ''}
                ${metric.value ? formatMetricValue(metric, 'value') : ''}
            </td>
            <td class="${commonClasses['table-cell']} text-center">
                <span class="text-xs font-semibold px-2 py-0.5 rounded ${commonClasses['status-info']}">
                    ${metric.type.toUpperCase()}
                </span>
            </td>
        </tr>
    `;
}

/**
 * Create the metrics table.
 * @param {Data} data
 * @returns {string}
 */
function metricsTable(data) {
    const { metrics } = data;
    const metricRows = Object.keys(metrics)
        .filter(name => metrics[name].count > 0 || metrics[name].value !== undefined || metrics[name].rate !== undefined)
        .sort()
        .map(name => metricsTableRow(metrics[name]))
        .join('');

    return card(`
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" class="${commonClasses['table-header']}">Métrica</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Contagem</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Mínimo</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Mediana</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Média</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">p(90)</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">p(95)</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Máximo</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Valor/Taxa</th>
                        <th scope="col" class="${commonClasses['table-header']} text-center">Tipo</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    ${metricRows}
                </tbody>
            </table>
        </div>
    `, 'Métricas Detalhadas', beakerIcon());
}

/**
 * Create the error table row.
 * @param {string} message
 * @param {number} count
 * @returns {string}
 */
function errorTableRow(message, count) {
    return `
        <tr class="${commonClasses['table-row-hover']}">
            <td class="${commonClasses['table-cell']} flex items-center">
                ${exclamationTriangleIcon()}
                <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600 dark:text-red-400 text-sm overflow-x-auto max-w-full block">${message}</code>
            </td>
            <td class="${commonClasses['table-cell']} text-right font-bold">
                ${formatNumber(count)}
            </td>
        </tr>
    `;
}

/**
 * Create the errors section.
 * @param {Data} data
 * @returns {string}
 */
function errorsSection(data) {
    const { errors } = data;
    const errorMessages = Object.keys(errors);

    if (errorMessages.length === 0) {
        return card(`
            <p class="${commonClasses['text-secondary']}">Nenhum erro de tempo de execução foi registrado durante o teste.</p>
        `, 'Erros de Tempo de Execução', checkCircleIcon());
    }

    const errorRows = errorMessages
        .map(message => errorTableRow(message, errors[message].count))
        .join('');

    return card(`
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" class="${commonClasses['table-header']}">Mensagem de Erro</th>
                        <th scope="col" class="${commonClasses['table-header']} text-right">Contagem</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    ${errorRows}
                </tbody>
            </table>
        </div>
    `, 'Erros de Tempo de Execução', exclamationCircleIcon());
}

/**
 * Create the options (test configuration) section.
 * @param {Data} data
 * @returns {string}
 */
function optionsSection(data) {
    const { options } = data;
    const optionsHtml = Object.keys(options)
        .filter(key => key !== 'systemTags') // Hide systemTags as they are complex
        .sort()
        .map(key => {
            const value = JSON.stringify(options[key], null, 2);
            return `
                <div class="border-b border-gray-200 dark:border-gray-700 py-3">
                    <h4 class="${commonClasses['text-lg-bold']} mb-1 ${commonClasses['text-primary']}">
                        ${key}
                    </h4>
                    <pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto ${commonClasses['text-secondary']}">${value}</pre>
                </div>
            `;
        }).join('');

    return card(`
        <div class="space-y-4">
            ${optionsHtml}
        </div>
    `, 'Configuração do Teste (Options)', documentTextIcon());
}

/**
 * Create the footer section.
 * @returns {string}
 */
function footer() {
    return `
        <footer class="py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
            <div class="${commonClasses['container']} text-center text-sm ${commonClasses['text-secondary']}">
                <p>Relatório gerado por k6-reporter | Visite o
                    <a href="https://github.com/benc-uk/k6-reporter" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition">
                        repositório GitHub
                        ${arrowTopRightIcon()}
                    </a>
                </p>
            </div>
        </footer>
    `;
}

/**
 * Create the main content wrapper.
 * @param {string} content
 * @returns {string}
 */
function mainContent(content) {
    return `<main class="py-10"><div class="${commonClasses['container']} space-y-8">${content}</div></main>`;
}

/**
 * Create the script for theme toggling.
 * @returns {string}
 */
function getScript() {
    return `
        <script>
            // Theme script
            const toggle = document.getElementById('theme-toggle');
            const body = document.body;

            // Function to set theme
            function setTheme(isDark) {
                if (isDark) {
                    body.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    toggle.innerHTML = \`${moonIcon()}\`;
                } else {
                    body.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    toggle.innerHTML = \`${sunIcon()}\`;
                }
            }

            // Initial theme setup (based on local storage or system preference)
            let initialTheme = localStorage.getItem('theme');
            if (!initialTheme) {
                initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            setTheme(initialTheme === 'dark');

            // Toggle listener
            toggle.addEventListener('click', () => {
                const currentTheme = localStorage.getItem('theme') || 'light';
                setTheme(currentTheme === 'light');
            });
        </script>
    `;
}

;// CONCATENATED MODULE: ./lib/ui/template.js



/**
 * @typedef {import('../data/extract').Data} Data
 */

/**
 * Create the full HTML report template.
 * @param {Data} data
 * @returns {string}
 */
function template(data) {
    const mainContentHtml = mainContent(
        overallSummary(data) +
        thresholdsSection(data) +
        metricsTable(data) +
        errorsSection(data) +
        optionsSection(data)
    );

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.options.title || config.title}</title>
            <!-- Embed Tailwind CSS from CDN for styling -->
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                ${getStyles()}
            </style>
        </head>
        <body class="bg-gray-50 dark:bg-gray-800 min-h-screen transition-colors duration-300">
            ${header(data.options.title || config.title)}
            ${mainContentHtml}
            ${footer()}
            ${getScript()}
        </body>
        </html>
    `;
}

;// CONCATENATED MODULE: ./lib/html.js
/**
 * @typedef {import('k6').Summary} Summary
 */

/**
 * Generate a full HTML report from the k6 summary.
 * @param {Summary} summary
 * @returns {string}
 */
function htmlReport(summary) {
    const data = extractData(summary);
    return template(data);
}


// Try to set config from URL params
if (urlParams.get('darkTheme') !== null) {
    config.darkTheme = true;
}
if (urlParams.get('title') !== null) {
    config.title = urlParams.get('title');
}
if (urlParams.get('debug') !== null) {
    config.debug = urlParams.get('debug');
}

__webpack_exports__.default = (__webpack_exports__);
}
,function(exports, module) {
module.exports = __webpack_require__(1)
}
,function(exports, module) {
module.exports = __webpack_require__(2)
}
]);
})
// k6-reporter 2.4.0
// Source: https://cdn.jsdelivr.net/npm/k6-reporter@2.4.0/dist/bundle.js