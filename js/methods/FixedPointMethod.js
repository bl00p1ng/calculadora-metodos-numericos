import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación del método de Punto Fijo
 * Resuelve ecuaciones de la forma x = g(x)
 */
class FixedPointMethod extends NumericalMethod {
    /**
     * Constructor del método de Punto Fijo
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Punto Fijo', logger);
    }

    /**
     * Valida los parámetros específicos del método de punto fijo
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.function || params.function.trim() === '') {
            throw new Error('La función g(x) no puede estar vacía');
        }
        
        if (isNaN(params.x0)) {
            throw new Error('El valor inicial debe ser un número válido');
        }
        
        if (params.tolerance <= 0) {
            throw new Error('La tolerancia debe ser mayor que cero');
        }
        
        if (params.maxIterations <= 0) {
            throw new Error('El número máximo de iteraciones debe ser mayor que cero');
        }
        
        return true;
    }

    /**
     * Ejecuta el método de punto fijo
     * @param {Object} params - Parámetros del cálculo
     * @param {string} params.function - Función g(x) para x = g(x)
     * @param {number} params.x0 - Valor inicial
     * @param {number} params.tolerance - Tolerancia del error
     * @param {number} params.maxIterations - Máximo número de iteraciones
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo por método de Punto Fijo');
        this.validateParams(params);
        
        const { function: func, x0, tolerance, maxIterations } = params;
        
        let x = parseFloat(x0);
        let iter = 0;
        this.iterations = [];
        this.result = null;
        
        this.logger.info(`Valor inicial: x0 = ${x}`);
        this.logger.info(`Función g(x) = ${func}`);
        
        while (iter < maxIterations) {
            let xNext;
            
            try {
                xNext = this.evaluateFunction(func, x);
            } catch (error) {
                this.logger.error(`Error evaluando g(${x}): ${error.message}`);
                throw error;
            }
            
            const error = Math.abs(xNext - x);
            
            this.iterations.push({
                iteration: iter + 1,
                x: x,
                'g(x)': xNext,
                error: error
            });
            
            this.logger.info(`Iteración ${iter + 1}: x = ${x}, g(x) = ${xNext}, error = ${error}`);
            
            if (error < tolerance) {
                this.result = xNext;
                this.logger.success(`Convergencia alcanzada en ${iter + 1} iteraciones`);
                this.logger.success(`Punto fijo encontrado: ${xNext}`);
                break;
            }
            
            // Verifica si la función está divergiendo
            if (Math.abs(xNext) > 1e10) {
                this.logger.error('La función está divergiendo');
                throw new Error('El método diverge con el valor inicial dado');
            }
            
            x = xNext;
            iter++;
        }
        
        if (!this.result) {
            this.logger.warning('Máximo de iteraciones alcanzado sin convergencia');
            this.result = x;
        }
    }
}

export default FixedPointMethod;