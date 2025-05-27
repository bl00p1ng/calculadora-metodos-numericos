import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación de Integración Numérica
 * Calcula integrales definidas usando métodos numéricos
 */
class NumericalIntegration extends NumericalMethod {
    /**
     * Constructor de Integración Numérica
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Integración Numérica', logger);
    }

    /**
     * Valida los parámetros específicos de la integración numérica
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.function || params.function.trim() === '') {
            throw new Error('La función no puede estar vacía');
        }
        
        if (isNaN(params.a) || isNaN(params.b)) {
            throw new Error('Los límites de integración deben ser números válidos');
        }
        
        if (params.a >= params.b) {
            throw new Error('El límite inferior debe ser menor que el superior');
        }
        
        if (!params.n || params.n <= 0) {
            throw new Error('El número de subdivisiones debe ser mayor que cero');
        }
        
        if (!Number.isInteger(params.n)) {
            throw new Error('El número de subdivisiones debe ser un entero');
        }
        
        return true;
    }

    /**
     * Ejecuta la integración numérica usando el método del trapecio compuesto
     * @param {Object} params - Parámetros del cálculo
     * @param {string} params.function - Función a integrar
     * @param {number} params.a - Límite inferior de integración
     * @param {number} params.b - Límite superior de integración
     * @param {number} params.n - Número de subdivisiones
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo de integración numérica');
        this.validateParams(params);
        
        const { function: func, a, b, n } = params;
        
        const aVal = parseFloat(a);
        const bVal = parseFloat(b);
        const nVal = parseInt(n);
        const h = (bVal - aVal) / nVal;
        
        this.logger.info(`Función: ${func}`);
        this.logger.info(`Intervalo: [${aVal}, ${bVal}]`);
        this.logger.info(`Subdivisiones: ${nVal}`);
        this.logger.info(`Tamaño del paso h: ${h}`);
        
        this.iterations = [];
        let sum = 0;
        
        // Calcula la suma usando la regla del trapecio compuesto
        for (let i = 0; i <= nVal; i++) {
            const x = aVal + i * h;
            let fx;
            
            try {
                fx = this.evaluateFunction(func, x);
            } catch (error) {
                this.logger.error(`Error evaluando f(${x}): ${error.message}`);
                throw error;
            }
            
            // Determina el peso según la posición
            let weight = 1;
            if (i === 0 || i === nVal) {
                weight = 0.5;
            }
            
            const contribution = weight * fx * h;
            sum += weight * fx;
            
            this.iterations.push({
                i: i,
                x: x,
                'f(x)': fx,
                weight: weight,
                contribution: contribution,
                sumPartial: sum * h
            });
            
            if (i % Math.max(1, Math.floor(nVal / 10)) === 0) {
                this.logger.info(`Punto ${i}: x = ${x.toFixed(4)}, f(x) = ${fx.toFixed(6)}`);
            }
        }
        
        this.result = sum * h;
        
        // Calcula también usando la regla de Simpson si n es par
        if (nVal % 2 === 0) {
            let simpsonSum = 0;
            
            for (let i = 0; i <= nVal; i++) {
                const x = aVal + i * h;
                const fx = this.evaluateFunction(func, x);
                
                if (i === 0 || i === nVal) {
                    simpsonSum += fx;
                } else if (i % 2 === 1) {
                    simpsonSum += 4 * fx;
                } else {
                    simpsonSum += 2 * fx;
                }
            }
            
            const simpsonResult = (h / 3) * simpsonSum;
            
            this.logger.info(`Resultado por trapecio: ${this.result}`);
            this.logger.info(`Resultado por Simpson: ${simpsonResult}`);
            this.logger.info(`Diferencia: ${Math.abs(this.result - simpsonResult)}`);
        }
        
        this.logger.success(`Integral calculada: ${this.result}`);
        this.logger.success(`∫[${aVal}, ${bVal}] ${func} dx ≈ ${this.result.toFixed(8)}`);
    }
}

export default NumericalIntegration;