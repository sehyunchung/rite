import { handle as authHandle } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = authHandle;