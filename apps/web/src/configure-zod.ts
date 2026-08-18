import { z } from "zod";

// Strict CSP forbids Zod's object-schema JIT path because it uses Function.
z.config({ jitless: true });
