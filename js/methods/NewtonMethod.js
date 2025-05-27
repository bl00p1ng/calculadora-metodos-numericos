import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación del método de Newton-Raphson
 * Método de convergencia rápida usando derivadas
 */
class NewtonMethod extends NumericalMethod {
    /**
     * Constructor del método de Newton
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Newton-Raphson', logger);
    }

    /**
     * Valida los parámetros específicos del método de Newton
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.function || params.function.trim() === '') {
            throw new Error('La función f(x) no puede estar vacía');
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
     * Calcula la derivada numérica de una función
     * @param {string} func - Función a derivar
     * @param {number} x - Punto donde calcular la derivada
     * @returns {number} - Valor de la derivada
     */
    calculateDerivative(func, x) {
        const h = 0.0001; // Paso pequeño para la aproximación
        
        try {
            const f1 = this.evaluateFunction(func, x + h);
            const f2 = this.evaluateFunction(func, x - h);
            
            // Derivada por diferencias centrales
            return (f1 - f2) / (2 * h);
        } catch (error) {
            this.logger.error(`Error calculando derivada en x = ${x}: ${error.message}`);
            throw new Error('Error al calcular la derivada');
        }
    }

    /**
     * Ejecuta el método de Newton-Raphson
     * @param {Object} params - Parámetros del cálculo
     * @param {string} params.function - Función f(x)
     * @param {number} params.x0 - Valor inicial
     * @param {number} params.tolerance - Tolerancia del error
     * @param {number} params.maxIterations - Máximo número de iteraciones
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo por método de Newton-Raphson');
        this.validateParams(params);
        
        const { function: func, x0, tolerance, maxIterations } = params;
        
        let x = parseFloat(x0);
        let iter = 0;
        this.iterations = [];
        this.result = null;
        
        this.logger.info(`Valor inicial: x0 = ${x}`);
        this.logger.info(`Función f(x) = ${func}`);
        
        while (iter < maxIterations) {
            let fx, fpx;
            
            try {
                fx = this.evaluateFunction(func, x);
                fpx = this.calculateDerivative(func, x);
            } catch (error) {
                this.logger.error(`Error en iteración ${iter + 1}: ${error.message}`);
                throw error;
            }
            
            // Verifica que la derivada no sea muy pequeña
            if (Math.abs(fpx) < 1e-10) {
                this.logger.error(`Derivada muy pequeña en x = ${x}: f'(x) = ${fpx}`);
                throw new Error('La derivada es muy pequeña, el método puede no converger');
            }
            
            const xNext = x - fx / fpx;
            const error = Math.abs(xNext - x);
            
            this.iterations.push({
                iteration: iter + 1,
                x: x,
                'f(x)': fx,
                "f'(x)": fpx,
                'x_next': xNext,
                error: error
            });
            
            this.logger.info(`Iteración ${iter + 1}: x = ${x}, f(x) = ${fx}, f'(x) = ${fpx}`);
            this.logger.info(`x_next = ${xNext}, error = ${error}`);
            
            if (error < tolerance || Math.abs(fx) < tolerance) {
                this.result = xNext;
                this.logger.success(`Convergencia alcanzada en ${iter + 1} iteraciones`);
                this.logger.success(`Raíz encontrada: ${xNext}`);
                break;
            }
            
            // Verifica si el método está divergiendo
            if (Math.abs(xNext) > 1e10 || isNaN(xNext)) {
                this.logger.error('El método está divergiendo');
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

export default NewtonMethod;