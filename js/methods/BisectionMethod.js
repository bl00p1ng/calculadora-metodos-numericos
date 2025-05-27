import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación del método de Bisección
 * Encuentra raíces de funciones continuas en un intervalo
 */
class BisectionMethod extends NumericalMethod {
    /**
     * Constructor del método de Bisección
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Bisección', logger);
    }

    /**
     * Valida los parámetros específicos del método de bisección
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.function || params.function.trim() === '') {
            throw new Error('La función no puede estar vacía');
        }
        
        if (isNaN(params.a) || isNaN(params.b)) {
            throw new Error('Los límites del intervalo deben ser números válidos');
        }
        
        if (params.a >= params.b) {
            throw new Error('El límite inferior debe ser menor que el superior');
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
     * Ejecuta el método de bisección
     * @param {Object} params - Parámetros del cálculo
     * @param {string} params.function - Función a evaluar
     * @param {number} params.a - Límite inferior del intervalo
     * @param {number} params.b - Límite superior del intervalo
     * @param {number} params.tolerance - Tolerancia del error
     * @param {number} params.maxIterations - Máximo número de iteraciones
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo por método de Bisección');
        this.validateParams(params);
        
        const { function: func, a, b, tolerance, maxIterations } = params;
        
        let aVal = parseFloat(a);
        let bVal = parseFloat(b);
        let iter = 0;
        
        // Verifica que f(a) y f(b) tengan signos opuestos
        const fa = this.evaluateFunction(func, aVal);
        const fb = this.evaluateFunction(func, bVal);
        
        this.logger.info(`f(${aVal}) = ${fa}, f(${bVal}) = ${fb}`);
        
        if (fa * fb > 0) {
            throw new Error('f(a) y f(b) deben tener signos opuestos');
        }
        
        this.iterations = [];
        this.result = null;
        
        while (iter < maxIterations) {
            const c = (aVal + bVal) / 2;
            const fc = this.evaluateFunction(func, c);
            const error = Math.abs(bVal - aVal) / 2;
            
            this.iterations.push({
                iteration: iter + 1,
                a: aVal,
                b: bVal,
                c: c,
                fc: fc,
                error: error
            });
            
            this.logger.info(`Iteración ${iter + 1}: c = ${c}, f(c) = ${fc}, error = ${error}`);
            
            if (Math.abs(fc) < tolerance || error < tolerance) {
                this.result = c;
                this.logger.success(`Convergencia alcanzada en ${iter + 1} iteraciones`);
                this.logger.success(`Raíz encontrada: ${c}`);
                break;
            }
            
            // Determina el nuevo intervalo
            if (fa * fc < 0) {
                bVal = c;
                fb = fc;
            } else {
                aVal = c;
                fa = fc;
            }
            
            iter++;
        }
        
        if (!this.result) {
            this.logger.warning('Máximo de iteraciones alcanzado sin convergencia');
            this.result = (aVal + bVal) / 2;
        }
    }
}

export default BisectionMethod;