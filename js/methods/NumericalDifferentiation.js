import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación de Diferenciación Numérica
 * Aproxima derivadas usando diferencias finitas
 */
class NumericalDifferentiation extends NumericalMethod {
    /**
     * Constructor de Diferenciación Numérica
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Diferenciación Numérica', logger);
    }

    /**
     * Valida los parámetros específicos de la diferenciación numérica
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.function || params.function.trim() === '') {
            throw new Error('La función no puede estar vacía');
        }
        
        if (isNaN(params.x)) {
            throw new Error('El punto x debe ser un número válido');
        }
        
        if (isNaN(params.h) || params.h <= 0) {
            throw new Error('El tamaño del paso h debe ser un número positivo');
        }
        
        if (params.h > 1) {
            this.logger.warning('El tamaño del paso h es muy grande, los resultados pueden ser imprecisos');
        }
        
        if (params.h < 1e-10) {
            this.logger.warning('El tamaño del paso h es muy pequeño, pueden ocurrir errores de redondeo');
        }
        
        const validMethods = ['forward', 'backward', 'central'];
        if (!validMethods.includes(params.method)) {
            throw new Error('El método debe ser: forward, backward o central');
        }
        
        return true;
    }

    /**
     * Calcula la derivada usando diferencias hacia adelante
     * @param {string} func - Función a derivar
     * @param {number} x - Punto donde calcular la derivada
     * @param {number} h - Tamaño del paso
     * @returns {Object} - Resultado y detalles del cálculo
     */
    forwardDifference(func, x, h) {
        const fx = this.evaluateFunction(func, x);
        const fxh = this.evaluateFunction(func, x + h);
        const derivative = (fxh - fx) / h;
        
        // Calcula derivada de segundo orden para estimar el error
        const fx2h = this.evaluateFunction(func, x + 2 * h);
        const secondDerivative = (fx2h - 2 * fxh + fx) / (h * h);
        const errorEstimate = Math.abs(h * secondDerivative / 2);
        
        return {
            method: 'Diferencias hacia adelante',
            formula: "f'(x) ≈ [f(x+h) - f(x)] / h",
            x: x,
            'f(x)': fx,
            'x+h': x + h,
            'f(x+h)': fxh,
            h: h,
            derivative: derivative,
            errorEstimate: errorEstimate
        };
    }

    /**
     * Calcula la derivada usando diferencias hacia atrás
     * @param {string} func - Función a derivar
     * @param {number} x - Punto donde calcular la derivada
     * @param {number} h - Tamaño del paso
     * @returns {Object} - Resultado y detalles del cálculo
     */
    backwardDifference(func, x, h) {
        const fx = this.evaluateFunction(func, x);
        const fxh = this.evaluateFunction(func, x - h);
        const derivative = (fx - fxh) / h;
        
        // Calcula derivada de segundo orden para estimar el error
        const fx2h = this.evaluateFunction(func, x - 2 * h);
        const secondDerivative = (fx - 2 * fxh + fx2h) / (h * h);
        const errorEstimate = Math.abs(h * secondDerivative / 2);
        
        return {
            method: 'Diferencias hacia atrás',
            formula: "f'(x) ≈ [f(x) - f(x-h)] / h",
            x: x,
            'f(x)': fx,
            'x-h': x - h,
            'f(x-h)': fxh,
            h: h,
            derivative: derivative,
            errorEstimate: errorEstimate
        };
    }

    /**
     * Calcula la derivada usando diferencias centrales
     * @param {string} func - Función a derivar
     * @param {number} x - Punto donde calcular la derivada
     * @param {number} h - Tamaño del paso
     * @returns {Object} - Resultado y detalles del cálculo
     */
    centralDifference(func, x, h) {
        const fxh_plus = this.evaluateFunction(func, x + h);
        const fxh_minus = this.evaluateFunction(func, x - h);
        const fx = this.evaluateFunction(func, x);
        const derivative = (fxh_plus - fxh_minus) / (2 * h);
        
        // Calcula derivada de orden superior para estimar el error
        const fx2h_plus = this.evaluateFunction(func, x + 2 * h);
        const fx2h_minus = this.evaluateFunction(func, x - 2 * h);
        const fourthDerivative = (fx2h_plus - 4 * fxh_plus + 6 * fx - 4 * fxh_minus + fx2h_minus) / (h * h * h * h);
        const errorEstimate = Math.abs(h * h * fourthDerivative / 6);
        
        return {
            method: 'Diferencias centrales',
            formula: "f'(x) ≈ [f(x+h) - f(x-h)] / (2h)",
            x: x,
            'f(x)': fx,
            'x-h': x - h,
            'f(x-h)': fxh_minus,
            'x+h': x + h,
            'f(x+h)': fxh_plus,
            h: h,
            derivative: derivative,
            errorEstimate: errorEstimate
        };
    }

    /**
     * Ejecuta la diferenciación numérica
     * @param {Object} params - Parámetros del cálculo
     * @param {string} params.function - Función a derivar
     * @param {number} params.x - Punto donde calcular la derivada
     * @param {number} params.h - Tamaño del paso
     * @param {string} params.method - Método a usar (forward, backward, central)
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo de diferenciación numérica');
        this.validateParams(params);
        
        const { function: func, x, h, method } = params;
        
        const xVal = parseFloat(x);
        const hVal = parseFloat(h);
        
        this.logger.info(`Función: ${func}`);
        this.logger.info(`Punto x: ${xVal}`);
        this.logger.info(`Tamaño del paso h: ${hVal}`);
        this.logger.info(`Método: ${method}`);
        
        this.iterations = [];
        let result;
        
        try {
            switch (method) {
                case 'forward':
                    result = this.forwardDifference(func, xVal, hVal);
                    break;
                    
                case 'backward':
                    result = this.backwardDifference(func, xVal, hVal);
                    break;
                    
                case 'central':
                    result = this.centralDifference(func, xVal, hVal);
                    break;
            }
            
            this.iterations.push(result);
            this.result = result.derivative;
            
            // Calcula derivadas con diferentes valores de h para análisis de convergencia
            this.logger.info('Análisis de convergencia con diferentes valores de h:');
            const hValues = [hVal * 10, hVal * 5, hVal * 2, hVal, hVal / 2, hVal / 5, hVal / 10];
            
            for (const h_test of hValues) {
                let testResult;
                switch (method) {
                    case 'forward':
                        testResult = this.forwardDifference(func, xVal, h_test);
                        break;
                    case 'backward':
                        testResult = this.backwardDifference(func, xVal, h_test);
                        break;
                    case 'central':
                        testResult = this.centralDifference(func, xVal, h_test);
                        break;
                }
                
                this.logger.info(`  h = ${h_test.toExponential(2)}: f'(x) ≈ ${testResult.derivative.toFixed(8)}, error estimado ≈ ${testResult.errorEstimate.toExponential(2)}`);
            }
            
            this.logger.success(`Derivada calculada: ${this.result}`);
            this.logger.success(`f'(${xVal}) ≈ ${this.result.toFixed(8)}`);
            this.logger.info(`Error estimado: ${result.errorEstimate.toExponential(2)}`);
            
        } catch (error) {
            this.logger.error(`Error en el cálculo: ${error.message}`);
            throw error;
        }
    }
}

export default NumericalDifferentiation;