import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API Documentation',
            version: '1.0.0',
            description: 'API documentation for the E-Commerce Node.js API',
        },
        servers: [
            {
                url: '/',
                description: 'Default server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Setup to easily append APIs via JSDoc in routes or controllers
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
