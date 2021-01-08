import { Application } from 'https://deno.land/x/oak/mod.ts';
import router from './routes.ts';

const app: Application = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

export default app;