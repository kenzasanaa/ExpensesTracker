import { Pool } from 'pg';

// A pool = a set of reusable connections. Opening a connection per request
// would be like reloading the page per click — expensive. The pool recycles them.
export const pool = new Pool(); // reads PG* vars from .env automatically