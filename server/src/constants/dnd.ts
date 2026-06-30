/**
 * Server-side re-export of shared D&D domain constants.
 *
 * Source of truth lives in `/shared/dnd.ts` — see that file for the actual values.
 * This thin re-export exists so server code can import via a stable internal path
 * (`../constants/dnd`) without caring about the shared layout.
 */
export * from "../../../shared/constants/dnd";
export * from "../../../shared/types/dnd";
