/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as categories from "../categories.js";
import type * as ingredients from "../ingredients.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_orderFlow from "../lib/orderFlow.js";
import type * as lib_validate from "../lib/validate.js";
import type * as lib_validators from "../lib/validators.js";
import type * as orders from "../orders.js";
import type * as pizzas from "../pizzas.js";
import type * as seed from "../seed.js";
import type * as viewer from "../viewer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  ingredients: typeof ingredients;
  "lib/auth": typeof lib_auth;
  "lib/orderFlow": typeof lib_orderFlow;
  "lib/validate": typeof lib_validate;
  "lib/validators": typeof lib_validators;
  orders: typeof orders;
  pizzas: typeof pizzas;
  seed: typeof seed;
  viewer: typeof viewer;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
