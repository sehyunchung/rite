/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as eventStatus from "../eventStatus.js";
import type * as events from "../events.js";
import type * as eventsEffect from "../eventsEffect.js";
import type * as exports from "../exports.js";
import type * as instagram from "../instagram.js";
import type * as migrations_removeDeprecatedFields from "../migrations/removeDeprecatedFields.js";
import type * as notifications from "../notifications.js";
import type * as submissions from "../submissions.js";
import type * as timeslots from "../timeslots.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  eventStatus: typeof eventStatus;
  events: typeof events;
  eventsEffect: typeof eventsEffect;
  exports: typeof exports;
  instagram: typeof instagram;
  "migrations/removeDeprecatedFields": typeof migrations_removeDeprecatedFields;
  notifications: typeof notifications;
  submissions: typeof submissions;
  timeslots: typeof timeslots;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
