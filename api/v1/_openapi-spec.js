// OpenAPI 3.0 Specification for Carta de Invitación México API

export function buildOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Carta de Invitación México API',
      version: '1.0.0',
      description: 'Read-only API for querying document types, field definitions, and pricing for Mexican invitation letter (carta de invitación) generation. This API provides structured access to the service catalog and health status.',
      contact: {
        name: 'Carta de Invitación México',
        url: 'https://cartadeinvitacionmexico.com',
      },
    },
    servers: [
      {
        url: 'https://cartadeinvitacionmexico.com',
        description: 'Production',
      },
    ],
    paths: {
      '/api/v1/health': {
        get: {
          operationId: 'getHealth',
          summary: 'Health check',
          description: 'Returns the current health status, API version, and server timestamp.',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Service is healthy',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse',
                  },
                  example: {
                    status: 'ok',
                    version: '1.0.0',
                    timestamp: '2026-03-27T12:00:00.000Z',
                  },
                },
              },
            },
            '405': {
              description: 'Method not allowed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/document-types': {
        get: {
          operationId: 'listDocumentTypes',
          summary: 'List all document types',
          description: 'Returns all available document types with their field definitions, descriptions, and pricing.',
          tags: ['Document Types'],
          responses: {
            '200': {
              description: 'List of document types',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      document_types: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DocumentType' },
                      },
                    },
                    required: ['document_types'],
                  },
                },
              },
            },
            '405': {
              description: 'Method not allowed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/document-types/{type}': {
        get: {
          operationId: 'getDocumentType',
          summary: 'Get a single document type',
          description: 'Returns a single document type by ID with full field definitions and pricing.',
          tags: ['Document Types'],
          parameters: [
            {
              name: 'type',
              in: 'path',
              required: true,
              description: 'Document type identifier',
              schema: {
                type: 'string',
                enum: ['esencial', 'completo'],
              },
            },
          ],
          responses: {
            '200': {
              description: 'Document type details',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DocumentType' },
                },
              },
            },
            '404': {
              description: 'Document type not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    error: {
                      code: 'NOT_FOUND',
                      message: 'Document type "unknown" not found. Valid types: esencial, completo',
                      field: 'type',
                    },
                  },
                },
              },
            },
            '405': {
              description: 'Method not allowed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/documents': {
        post: {
          operationId: 'createDocument',
          summary: 'Create a new invitation letter',
          description: 'Validates the provided data and creates a new document record. Returns a Stripe Checkout URL for payment. The PDF is generated automatically after payment is completed.',
          tags: ['Documents'],
          security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: false,
              description: 'Unique key to prevent duplicate document creation. Responses are cached for 24 hours.',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateDocumentRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Document created, pending payment',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateDocumentResponse' },
                  example: {
                    document_id: '550e8400-e29b-41d4-a716-446655440000',
                    status: 'pending_payment',
                    plan: 'esencial',
                    checkout_url: 'https://checkout.stripe.com/c/pay/cs_test_...',
                    expires_at: '2026-03-27T13:00:00.000Z',
                    created_at: '2026-03-27T12:30:00.000Z',
                  },
                },
              },
            },
            '400': {
              description: 'Validation errors',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized — missing or invalid API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/documents/{id}': {
        get: {
          operationId: 'getDocument',
          summary: 'Get document status',
          description: 'Returns the current status of a document. When completed, includes a download URL for the generated PDF.',
          tags: ['Documents'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Document UUID',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Document status',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DocumentStatus' },
                },
              },
            },
            '404': {
              description: 'Document not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks': {
        post: {
          operationId: 'createWebhook',
          summary: 'Register a webhook',
          description: 'Registers a callback URL to receive notifications when document events occur (e.g., document.completed, document.failed). Webhook registrations are stored in-memory and will not persist across Vercel cold starts.',
          tags: ['Webhooks'],
          security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateWebhookRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Webhook registered',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WebhookResponse' },
                  example: {
                    webhook_id: 'wh_550e8400e29b41d4a716446655440000',
                    url: 'https://agent.example.com/callback',
                    events: ['document.completed', 'document.failed'],
                    created_at: '2026-03-27T12:30:00.000Z',
                  },
                },
              },
            },
            '400': {
              description: 'Validation errors',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized — missing or invalid API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          operationId: 'listWebhooks',
          summary: 'List registered webhooks',
          description: 'Returns all webhooks registered by the authenticated API key.',
          tags: ['Webhooks'],
          security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of webhooks',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      webhooks: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/WebhookResponse' },
                      },
                    },
                    required: ['webhooks'],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized — missing or invalid API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks/{id}': {
        delete: {
          operationId: 'deleteWebhook',
          summary: 'Delete a webhook',
          description: 'Deletes a registered webhook. Only the API key that created the webhook can delete it.',
          tags: ['Webhooks'],
          security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Webhook identifier (wh_ prefix)',
              schema: { type: 'string', pattern: '^wh_[0-9a-f]{32}$' },
            },
          ],
          responses: {
            '200': {
              description: 'Webhook deleted',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      deleted: { type: 'boolean', enum: [true] },
                      webhook_id: { type: 'string', description: 'ID of the deleted webhook' },
                    },
                    required: ['deleted', 'webhook_id'],
                  },
                  example: {
                    deleted: true,
                    webhook_id: 'wh_550e8400e29b41d4a716446655440000',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized — missing or invalid API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Webhook not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              headers: {
                ...rateLimitHeaders(),
                'Retry-After': {
                  description: 'Seconds until the rate limit window resets',
                  schema: { type: 'integer' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/openapi.json': {
        get: {
          operationId: 'getOpenApiSpec',
          summary: 'OpenAPI specification',
          description: 'Returns this OpenAPI 3.0 specification as JSON.',
          tags: ['System'],
          responses: {
            '200': {
              description: 'OpenAPI specification',
              headers: rateLimitHeaders(),
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    description: 'OpenAPI 3.0 specification document',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok'],
              description: 'Service status',
            },
            version: {
              type: 'string',
              description: 'API version',
              example: '1.0.0',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current server timestamp in ISO 8601 format',
            },
          },
          required: ['status', 'version', 'timestamp'],
        },
        DocumentType: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the document type',
              example: 'esencial',
            },
            name: {
              type: 'string',
              description: 'Human-readable name',
              example: 'Plan Esencial — Carta de Invitación',
            },
            description: {
              type: 'string',
              description: 'Detailed description of what the document type includes',
            },
            price_usd: {
              type: 'number',
              format: 'float',
              description: 'Price in US dollars',
              example: 5.00,
            },
            required_fields: {
              type: 'array',
              items: { $ref: '#/components/schemas/FieldDefinition' },
              description: 'Fields that must be provided when creating this document type',
            },
            optional_fields: {
              type: 'array',
              items: { $ref: '#/components/schemas/FieldDefinition' },
              description: 'Fields that may optionally be provided',
            },
          },
          required: ['id', 'name', 'description', 'price_usd', 'required_fields', 'optional_fields'],
        },
        FieldDefinition: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Field identifier (used as the key in form submissions)',
              example: 'a_nombre',
            },
            type: {
              type: 'string',
              enum: ['string', 'email', 'date', 'integer', 'enum', 'array'],
              description: 'Data type of the field',
            },
            description: {
              type: 'string',
              description: 'Human-readable description of the field',
            },
            required: {
              type: 'boolean',
              description: 'Whether this field is required',
            },
            enum_values: {
              type: 'array',
              items: { type: 'string' },
              description: 'Valid values when type is "enum"',
            },
            items: {
              type: 'object',
              description: 'Schema for array items when type is "array"',
              properties: {
                type: { type: 'string' },
                enum_values: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            min_items: {
              type: 'integer',
              description: 'Minimum number of items when type is "array"',
            },
          },
          required: ['name', 'type', 'description', 'required'],
        },
        CreateDocumentRequest: {
          type: 'object',
          required: ['type', 'inviter', 'traveler'],
          properties: {
            type: {
              type: 'string',
              enum: ['carta_invitacion_turismo'],
              description: 'Document type identifier',
            },
            inviter: {
              type: 'object',
              required: ['full_name', 'address', 'id_type', 'phone', 'email'],
              properties: {
                full_name: { type: 'string', description: 'Full legal name of the host/inviter' },
                gender: { type: 'string', enum: ['masculino', 'femenino'], description: 'Gender (for grammatical agreement in Spanish)' },
                nationality: { type: 'string', description: 'Nationality (e.g., "mexicana")' },
                birth_date: { type: 'string', format: 'date', description: 'Birth date (YYYY-MM-DD)' },
                address: { type: 'string', description: 'Full street address in Mexico' },
                city: { type: 'string', description: 'City' },
                state: { type: 'string', description: 'State (e.g., "Ciudad de México")' },
                zip: { type: 'string', description: 'Postal code' },
                id_type: { type: 'string', enum: ['ine', 'pasaporte', 'tarjeta_residente'], description: 'Type of official identification' },
                id_number: { type: 'string', description: 'Identification document number' },
                phone: { type: 'string', description: 'Phone number with country code' },
                email: { type: 'string', format: 'email', description: 'Email address' },
                occupation: { type: 'string', description: 'Occupation/profession' },
                company: { type: 'string', description: 'Employer name (optional)' },
                relationship_type: { type: 'string', enum: ['familiar', 'pareja', 'amigo', 'conocido'], description: 'Relationship to the traveler' },
                relationship_description: { type: 'string', description: 'Free-text description of the relationship' },
                hosts_traveler: { type: 'boolean', description: 'Whether the traveler stays at the inviter address', default: true },
              },
            },
            traveler: {
              type: 'object',
              required: ['full_name', 'nationality', 'passport_number', 'travel_dates', 'purpose'],
              properties: {
                full_name: { type: 'string', description: 'Full legal name as on passport' },
                gender: { type: 'string', enum: ['masculino', 'femenino'] },
                nationality: { type: 'string', description: 'Nationality (e.g., "colombiana")' },
                birth_date: { type: 'string', format: 'date' },
                passport_number: { type: 'string', description: 'Passport number' },
                occupation: { type: 'string' },
                country_of_residence: { type: 'string' },
                email: { type: 'string', format: 'email' },
                address: { type: 'string', description: 'Full address in country of residence' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' },
                travel_dates: {
                  type: 'object',
                  required: ['arrival', 'departure'],
                  properties: {
                    arrival: { type: 'string', format: 'date', description: 'Arrival date (YYYY-MM-DD)' },
                    departure: { type: 'string', format: 'date', description: 'Departure date (YYYY-MM-DD)' },
                  },
                },
                purpose: { type: 'string', description: 'Purpose of visit (e.g., "turismo", "negocios")' },
                activities: { type: 'string', description: 'Description of planned activities' },
                entry_type: { type: 'string', enum: ['aereo', 'terrestre', 'maritimo'] },
                entry_airport: { type: 'string' },
                entry_airline: { type: 'string' },
                entry_flight: { type: 'string' },
                exit_type: { type: 'string', enum: ['aereo', 'terrestre', 'maritimo'] },
                exit_airport: { type: 'string' },
                exit_airline: { type: 'string' },
                exit_flight: { type: 'string' },
              },
            },
            companions: {
              type: 'array',
              description: 'Additional travelers (triggers Plan Completo pricing)',
              items: {
                type: 'object',
                required: ['full_name', 'nationality', 'passport_number'],
                properties: {
                  full_name: { type: 'string' },
                  gender: { type: 'string', enum: ['masculino', 'femenino'] },
                  nationality: { type: 'string' },
                  birth_date: { type: 'string', format: 'date' },
                  passport_number: { type: 'string' },
                  occupation: { type: 'string' },
                  relationship_type: { type: 'string' },
                  relationship_description: { type: 'string' },
                },
              },
            },
            accommodation: {
              type: 'object',
              description: 'Accommodation details (when traveler does NOT stay with inviter)',
              properties: {
                name: { type: 'string', description: 'Hotel or accommodation name' },
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' },
              },
            },
            expenses: {
              type: 'object',
              properties: {
                host_covers: { type: 'boolean', description: 'Whether the host covers any expenses' },
                categories: {
                  type: 'array',
                  items: { type: 'string', enum: ['alojamiento', 'alimentos', 'transporte', 'actividades', 'medicos', 'otro'] },
                },
                other_description: { type: 'string' },
              },
            },
            transport_in_mexico: {
              type: 'array',
              items: { type: 'string', enum: ['avion', 'autobus_foraneo', 'auto_rentado', 'anfitrion', 'transporte_publico'] },
            },
            itinerary: {
              type: 'array',
              description: 'Multi-destination itinerary (Plan Completo)',
              items: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  date_from: { type: 'string', format: 'date' },
                  date_to: { type: 'string', format: 'date' },
                  activities: { type: 'string' },
                  host_accommodation: { type: 'boolean' },
                  accommodation_name: { type: 'string' },
                  accommodation_street: { type: 'string' },
                  accommodation_city: { type: 'string' },
                  accommodation_state: { type: 'string' },
                  accommodation_zip: { type: 'string' },
                },
              },
            },
          },
        },
        CreateDocumentResponse: {
          type: 'object',
          properties: {
            document_id: { type: 'string', format: 'uuid', description: 'Unique document identifier' },
            status: { type: 'string', enum: ['pending_payment'], description: 'Document status' },
            plan: { type: 'string', enum: ['esencial', 'completo'], description: 'Selected plan' },
            checkout_url: { type: 'string', format: 'uri', description: 'Stripe Checkout URL to complete payment' },
            expires_at: { type: 'string', format: 'date-time', description: 'When the checkout session expires' },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['document_id', 'status', 'plan', 'checkout_url', 'expires_at', 'created_at'],
        },
        DocumentStatus: {
          type: 'object',
          properties: {
            document_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending_payment', 'processing', 'completed', 'failed'] },
            plan: { type: 'string', enum: ['esencial', 'completo'] },
            email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' },
            paid_at: { type: 'string', format: 'date-time' },
            completed_at: { type: 'string', format: 'date-time' },
            download_url: { type: 'string', format: 'uri', description: 'PDF download URL (only when status is completed)' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
              description: 'Error details (only when status is failed)',
            },
          },
          required: ['document_id', 'status', 'plan', 'email', 'created_at'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Machine-readable error code',
                  enum: ['METHOD_NOT_ALLOWED', 'NOT_FOUND', 'RATE_LIMITED', 'INTERNAL_ERROR', 'UNAUTHORIZED', 'INVALID_FIELD', 'MISSING_FIELD', 'DATABASE_ERROR'],
                },
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                },
                field: {
                  type: 'string',
                  description: 'The field that caused the error (when applicable)',
                },
              },
              required: ['code', 'message'],
            },
          },
          required: ['error'],
        },
        CreateWebhookRequest: {
          type: 'object',
          required: ['url', 'events'],
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              description: 'HTTPS callback URL that will receive webhook events',
              example: 'https://agent.example.com/callback',
            },
            events: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['document.completed', 'document.failed'],
              },
              description: 'Event types to subscribe to',
              minItems: 1,
            },
            secret: {
              type: 'string',
              description: 'Optional signing secret. When provided, each webhook delivery includes an X-Webhook-Signature header with an HMAC-SHA256 hex digest of the payload.',
            },
          },
        },
        WebhookResponse: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'string',
              description: 'Unique webhook identifier (wh_ prefix)',
              example: 'wh_550e8400e29b41d4a716446655440000',
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Registered callback URL',
            },
            events: {
              type: 'array',
              items: { type: 'string', enum: ['document.completed', 'document.failed'] },
              description: 'Subscribed event types',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the webhook was registered',
            },
          },
          required: ['webhook_id', 'url', 'events', 'created_at'],
        },
        WebhookEventPayload: {
          type: 'object',
          description: 'Payload delivered to the registered webhook URL via HTTP POST',
          properties: {
            event: {
              type: 'string',
              enum: ['document.completed', 'document.failed'],
              description: 'Event type',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the event occurred',
            },
            data: {
              type: 'object',
              properties: {
                document_id: { type: 'string', format: 'uuid' },
                status: { type: 'string', enum: ['completed', 'failed'] },
                plan: { type: 'string', enum: ['esencial', 'completo'] },
                download_url: {
                  type: 'string',
                  format: 'uri',
                  description: 'PDF download URL (only for document.completed events)',
                },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    message: { type: 'string' },
                  },
                  description: 'Error details (only for document.failed events)',
                },
              },
              required: ['document_id', 'status', 'plan'],
            },
          },
          required: ['event', 'timestamp', 'data'],
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  field: { type: 'string' },
                },
                required: ['code', 'message'],
              },
            },
          },
          required: ['errors'],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'API key passed as Bearer token in the Authorization header',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'API key passed in the X-Api-Key header',
        },
      },
    },
    tags: [
      {
        name: 'System',
        description: 'Health checks and API metadata',
      },
      {
        name: 'Document Types',
        description: 'Query available document types, field definitions, and pricing',
      },
      {
        name: 'Documents',
        description: 'Create invitation letters and check their status',
      },
      {
        name: 'Webhooks',
        description: 'Register callback URLs to receive notifications when document events occur. Note: Webhook registrations are stored in-memory and do not persist across Vercel serverless cold starts.',
      },
    ],
  };
}

function rateLimitHeaders() {
  return {
    'X-RateLimit-Limit': {
      description: 'Maximum number of requests allowed in the current window',
      schema: { type: 'integer', example: 60 },
    },
    'X-RateLimit-Remaining': {
      description: 'Number of requests remaining in the current window',
      schema: { type: 'integer', example: 59 },
    },
    'X-RateLimit-Reset': {
      description: 'Unix timestamp (seconds) when the rate limit window resets',
      schema: { type: 'integer' },
    },
  };
}
