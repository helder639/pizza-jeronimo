/* k6-summary 0.0.1 */ 
(function(exports, node_require) {
"use strict";
var require=node_require||(function(){for(var i=0;i<arguments.length;i++){if(arguments[i].length==1){return arguments[i][0]}}return require})([function(exports, module) {
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  textSummary: function() { return /* reexport */ textSummary; }
});

// EXTERNAL MODULE: external "k6"
var external_k6_ = __webpack_require__(1);
// EXTERNAL MODULE: external "k6/metrics"
var external_k6_metrics_ = __webpack_require__(2);
;// CONCATENATED MODULE: ./index.js
/**
 * @typedef {import('k6').Summary} Summary
 * @typedef {import('k6').Trend} Trend
 * @typedef {import('k6').Rate} Rate
 * @typedef {import('k6').Gauge} Gauge
 * @typedef {import('k6').Counter} Counter
 * @typedef {import('k6').SharedArray} SharedArray
 * @typedef {import('k6').Options} Options
 */

/**
 * @typedef {Object} TextSummaryOptions
 * @property {string} [indent='  '] - String to use for indentation.
 * @property {boolean} [enableColors=true] - Whether to use ANSI colors in the output.
 */

const metricMap = {
  trend: 'p(95)',
  rate: 'rate',
  counter: 'count',
  gauge: 'value',
};

const colors = {
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  white: '37',
  reset: '0',
};

/**
 * Colorize a string for ANSI output.
 * @param {string} str
 * @param {string} color
 * @param {boolean} enableColors
 * @returns {string}
 */
const colorize = (str, color, enableColors) =>
  enableColors ? `\u001b[${color}m${str}\u001b[${colors.reset}m` : str;

/**
 * Get the threshold status color.
 * @param {boolean} ok
 * @param {boolean} enableColors
 * @returns {string}
 */
const getThresholdColor = (ok, enableColors) =>
  colorize(ok ? 'PASS' : 'FAIL', ok ? colors.green : colors.red, enableColors);

/**
 * Get the threshold status color for boolean metrics.
 * @param {number} value
 * @param {boolean} enableColors
 * @returns {string}
 */
const getBoolThresholdColor = (value, enableColors) =>
  colorize(value > 0 ? 'FAIL' : 'PASS', value > 0 ? colors.red : colors.green, enableColors);

/**
 * Format a duration in milliseconds to a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
const formatDuration = (ms) => {
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
};

/**
 * Format bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
const formatBytes = (bytes) => {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Get the formatted value for a metric.
 * @param {string} name
 * @param {Metric} metric
 * @returns {string}
 */
const getFormattedValue = (name, metric) => {
  const isTime = name.endsWith('_duration') || name.endsWith('_time');
  const isBytes = name.startsWith('data_');
  const type = metric.type;
  const value = metric.values[metricMap[type] || 'value'] || metric.values.value;

  if (isTime) {
    return formatDuration(value);
  }
  if (isBytes) {
    return formatBytes(value);
  }
  if (type === 'rate') {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (type === 'trend') {
    return formatDuration(value);
  }

  return value !== undefined ? value.toString() : 'N/A';
};

/**
 * Generate a concise text summary of the k6 summary data.
 * @param {Summary} data - The k6 summary data object.
 * @param {TextSummaryOptions} [options={}] - Options for the text summary.
 * @returns {string} - The generated text summary.
 */
function textSummary(data, options = {}) {
  const { indent = '  ', enableColors = true } = options;
  let output = '';

  const summary = {
    'start time': new Date(data.time.start).toISOString(),
    'end time': new Date(data.time.end).toISOString(),
    'duration': formatDuration(new Date(data.time.end).getTime() - new Date(data.time.start).getTime()),
    'vus max': data.metrics.vus_max ? data.metrics.vus_max.values.value : 'N/A',
    'iterations': data.metrics.iterations ? data.metrics.iterations.values.count : 'N/A',
    'http reqs': data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 'N/A',
  };

  output += colorize('Test Summary', colors.cyan, enableColors) + '\n';
  for (const [key, value] of Object.entries(summary)) {
    output += `${indent}${key}: ${value}\n`;
  }
  output += '\n';

  output += colorize('Metrics', colors.cyan, enableColors) + '\n';
  const metrics = Object.keys(data.metrics).sort();
  for (const name of metrics) {
    const metric = data.metrics[name];
    output += `${indent}${name}: ${getFormattedValue(name, metric)} (${metric.type.toUpperCase()})\n`;
  }
  output += '\n';

  // Thresholds
  const thresholds = Object.keys(data.options.thresholds || {});
  if (thresholds.length > 0) {
    output += colorize('Thresholds', colors.cyan, enableColors) + '\n';
    for (const name of thresholds) {
      const metric = data.metrics[name];
      if (!metric || !metric.thresholds) continue;

      const thresholdResults = Object.keys(metric.thresholds).map(key => {
        const threshold = metric.thresholds[key];
        const status = metric.type === 'rate' && name.endsWith('failed')
          ? getBoolThresholdColor(metric.values.rate, enableColors)
          : getThresholdColor(threshold.ok, enableColors);
        return `${key}: ${status}`;
      }).join(', ');

      output += `${indent}${name}: ${thresholdResults}\n`;
    }
  }

  // Errors
  const errors = Object.keys(data.state.test.errors || {});
  if (errors.length > 0) {
    output += colorize('\nErrors', colors.red, enableColors) + '\n';
    for (const message of errors) {
      output += `${indent}${message}: ${data.state.test.errors[message].count}\n`;
    }
  }

  return output;
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
// k6-summary 0.0.1
// Source: https://jslib.k6.io/k6-summary/0.0.1/index.js