For backend, kindly follow the guide below

1. Define the payload in backend/src/types/payloads.ts
For example StallPayload, UpdateStallPayload, etc.

2. Add any specific validations as <name>.validation.ts under backend/src/validations

3. Add middleware in backend/src/types/validation.ts

4. Add services under  backend/src/services/<name>.service.ts
reuse SuccessCodes/ErrorCodes.

5. Add controller under backend/src/controllers/<name>.controller.ts. call the validation helpers, and pass everything straight to the service.

6. Expose routes in backend/src/routes/<name>.routes.ts. Import your controller + middleware.

e.g. router.post('/', createStallValidation, runValidation, StallController.create);

7. Mount the router in backend/src/index.ts using app.use('/api/<name>/<endpoint>);