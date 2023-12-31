/**
 * light log system, wrapping console.log methods:
 *  - configurable log level (trace|debug|info|warn|error)
 *  - 5 levels
 *
 * typical use:
 * webpack.config.js:
 *     resolve: {
 *         alias: {
 *             logger$: path.resolve(__dirname, 'tools/consoleLogger.js'),
 *         }
 *     }
 *
 * anywhere.js:
 *     import $log from 'logger'
 *     // ...
 *     $log.info('my message')
 *
 * or, as Vue property:
 * // main.js
 * import logger from 'logger'
 * Vue.prototype.$log = logger
 * // ...
 * new Vue({
 *     created () {
 *         // in any method of instanciated Vue:
 *         this.$log.info('my message')
 *     }
 * })
 */

const logLevelConf = import.meta.env.VITE_LOG_LEVEL

const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error']

const logLevel = LOG_LEVELS.includes(logLevelConf) ? logLevelConf : 'error'

function _log(level: string, ...msg: string[]) {
    if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(logLevel)) {
        switch (level) {
            case 'error':
                console.error(...msg)
                break
            case 'warn':
                console.warn(...msg)
                break
            case 'info':
                console.info(...msg)
                break
            default:
                console.log(...msg)
                break
        }
    }
}

export default {
    trace: (...msg: string[]) => _log('trace', ...msg),
    debug: (...msg: string[]) => _log('debug', ...msg),
    info: (...msg: string[]) => _log('info', ...msg),
    warn: (...msg: string[]) => _log('warn', ...msg),
    error: (...msg: string[]) => _log('error', ...msg),
}
