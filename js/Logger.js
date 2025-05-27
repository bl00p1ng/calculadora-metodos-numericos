/**
 * Logger centralizado para depuración
 * Implementa un sistema robusto de logs con diferentes niveles
 */
class Logger {
    /**
     * Constructor del logger
     * Inicializa el contenedor de logs
     */
    constructor() {
        this.logs = [];
        this.logContainer = null;
    }

    /**
     * Establece el contenedor HTML para mostrar los logs
     * @param {HTMLElement} container - Elemento DOM donde se mostrarán los logs
     */
    setContainer(container) {
        this.logContainer = container;
    }

    /**
     * Registra un mensaje con nivel de información
     * @param {string} message - Mensaje a registrar
     */
    info(message) {
        this._log('info', message);
    }

    /**
     * Registra un mensaje de éxito
     * @param {string} message - Mensaje a registrar
     */
    success(message) {
        this._log('success', message);
    }

    /**
     * Registra un mensaje de advertencia
     * @param {string} message - Mensaje a registrar
     */
    warning(message) {
        this._log('warning', message);
    }

    /**
     * Registra un mensaje de error
     * @param {string} message - Mensaje a registrar
     */
    error(message) {
        this._log('error', message);
    }

    /**
     * Método interno para registrar logs
     * @param {string} level - Nivel del log (info, success, warning, error)
     * @param {string} message - Mensaje a registrar
     * @private
     */
    _log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            level,
            message
        };
        
        this.logs.push(logEntry);
        console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`);
        
        if (this.logContainer) {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${level}`;
            logElement.textContent = `[${timestamp}] ${message}`;
            this.logContainer.appendChild(logElement);
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        }
    }

    /**
     * Limpia todos los logs
     */
    clear() {
        this.logs = [];
        if (this.logContainer) {
            this.logContainer.innerHTML = '';
        }
    }
}

export default Logger;