/**
 * Clase base para todos los métodos numéricos
 * Define la interfaz común y funcionalidad compartida
 */
class NumericalMethod {
    /**
     * Constructor de la clase base
     * @param {string} name - Nombre del método numérico
     * @param {Logger} logger - Instancia del logger para depuración
     */
    constructor(name, logger) {
        this.name = name;
        this.logger = logger;
        this.iterations = [];
        this.result = null;
    }

    /**
     * Valida los parámetros de entrada
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si los parámetros son válidos
     */
    validateParams(params) {
        this.logger.info(`Validando parámetros para ${this.name}`);
        return true;
    }

    /**
     * Ejecuta el cálculo del método numérico
     * @param {Object} params - Parámetros del cálculo
     * @throws {Error} - Debe ser implementado por las subclases
     */
    calculate(params) {
        throw new Error('El método calculate debe ser implementado por la subclase');
    }

    /**
     * Obtiene los resultados formateados
     * @returns {Object} - Resultados del cálculo
     */
    getResults() {
        return {
            result: this.result,
            iterations: this.iterations
        };
    }

    /**
     * Evalúa una función matemática dada como string
     * @param {string} func - Función matemática como string
     * @param {number} x - Valor en el que evaluar la función
     * @returns {number} - Resultado de la evaluación
     */
    evaluateFunction(func, x) {
        try {
            // Reemplaza x en la función y evalúa
            // Maneja casos comunes como x^n convirtiéndolos a Math.pow
            let expression = func.replace(/x/g, `(${x})`);
            
            // Convierte x^n a Math.pow(x,n)
            expression = expression.replace(/\(([^)]+)\)\^(\d+)/g, 'Math.pow($1,$2)');
            
            // Maneja funciones matemáticas comunes
            expression = expression.replace(/sin/g, 'Math.sin');
            expression = expression.replace(/cos/g, 'Math.cos');
            expression = expression.replace(/tan/g, 'Math.tan');
            expression = expression.replace(/log/g, 'Math.log');
            expression = expression.replace(/sqrt/g, 'Math.sqrt');
            expression = expression.replace(/exp/g, 'Math.exp');
            
            return Function('"use strict"; return (' + expression + ')')();
        } catch (error) {
            this.logger.error(`Error evaluando función: ${error.message}`);
            throw new Error('Función inválida');
        }
    }
}

export default NumericalMethod;