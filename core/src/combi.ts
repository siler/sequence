// This file uses type shenanigans to map tuples through
// parser combinators for better destructuring. These
// shenanigans require tuples to be cast as any[] in some
// cases.

export type Parser<T> = (ctx: Context) => Result<T>;

export interface Context {
   readonly input: string;
   readonly index: number;
}

export const withIndex = (context: Context, index: number): Context => {
   return {
      input: context.input,
      index,
   };
};

export type Result<T> = Success<T> | Error | Failure;

/**
 * indicates a successful parse, and contains the resulting value
 */
export interface Success<T> {
   type: 'success';
   ctx: Context;
   value: T;
}

export const newSuccess = <T>(ctx: Context, value: T): Success<T> => {
   return {
      type: 'success',
      ctx,
      value,
   };
};

/**
 * helper to associate a successful context with a refined value
 */
export const withValue = <T, TN>(
   success: Success<T>,
   value: TN
): Success<TN> => {
   return {
      type: 'success',
      ctx: success.ctx,
      value,
   };
};

export interface ErrorContent {
   readonly ctx: Context;
   readonly description: string;
}

/**
 * indicates a non-fatal parsing error
 */
export interface Error extends ErrorContent {
   readonly type: 'error';
   readonly cause?: Error;
}

export const newError = (
   ctx: Context,
   description: string,
   cause?: Error
): Error => {
   return {
      type: 'error',
      ctx,
      description,
      cause,
   };
};

/**
 * helper to turn an error into a failure
 */
export const fail = (error: Error, message?: string): Failure => {
   return newFailure(error.ctx, message ? message : error.description, error);
};

/**
 * indicates a failed parse attempt, terminating the parser
 */
export interface Failure extends ErrorContent {
   readonly type: 'failure';
   readonly cause?: Error | Failure;
}

export const newFailure = (
   ctx: Context,
   description: string,
   cause?: Error | Failure
): Failure => {
   return {
      type: 'failure',
      ctx,
      description,
      cause,
   };
};

/**
 * helper to wrap an error with additional descriptive information
 */
export const withContext = (
   res: Error | Failure,
   description: string
): Error | Failure => {
   if (res.type === 'error') {
      return {
         type: 'error',
         ctx: res.ctx,
         description,
         cause: res,
      };
   } else {
      return {
         type: 'failure',
         ctx: res.ctx,
         description,
         cause: res,
      };
   }
};

export const context = <T>(parser: Parser<T>, context: string): Parser<T> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'success') {
         return res;
      }

      return withContext(res, context);
   };
};

/**
 * causes any errors produced by the passed parser to be turned into failures
 */
export const expect = <T>(
   parser: Parser<T>,
   expectation: string
): Parser<T> => {
   return (ctx) => {
      const res = parser(ctx);

      if (res.type === 'error') {
         return fail(res, 'expected ' + expectation);
      }

      return res;
   };
};

/**
 * parse an exact string
 */
export const str = (match: string): Parser<string> => {
   return (ctx) => {
      const end = ctx.index + match.length;
      if (end > ctx.input.length) {
         return newError(ctx, `failure to match "${match}", too short`);
      }

      if (ctx.input.substring(ctx.index, end) === match) {
         return newSuccess(withIndex(ctx, end), match);
      }

      return newError(ctx, `failure to match "${match}"`);
   };
};

/**
 * parse a regex match
 *
 * the passed regex must have the `g` flag
 */
export const regex = (re: RegExp, expected: string): Parser<string> => {
   return (ctx) => {
      re.lastIndex = ctx.index;

      const res = re.exec(ctx.input);
      if (res && res.index === ctx.index) {
         return newSuccess(withIndex(ctx, ctx.index + res[0].length), res[0]);
      }

      return newError(ctx, `failure to match ${expected}`);
   };
};

/**
 * matches the end of the input
 */
export const eof = (): Parser<null> => {
   return (ctx) => {
      if (ctx.index >= ctx.input.length) {
         return newSuccess(ctx, null);
      }

      return newError(ctx, 'failure to match eof');
   };
};

/**
 * requires parser, then discards the result
 */
export const discard = <T>(parser: Parser<T>): Parser<null> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'success') {
         return withValue(res, null);
      }

      return res;
   };
};

/**
 * one of parsers (in order)
 */
export const any = <T>(parsers: Parser<T>[]): Parser<T> => {
   return (ctx) => {
      let furthestRes: Error | null = null;

      // guarantees at least one parser will be evaluated
      if (parsers.length === 0) {
         return newFailure(ctx, 'failure to pass at least one parser to any');
      }

      for (const parser of parsers) {
         const res = parser(ctx);
         switch (res.type) {
            case 'success':
               return res;
            case 'failure':
               return res;
         }

         if (!furthestRes || furthestRes.ctx.index < res.ctx.index) {
            furthestRes = res;
         }
      }

      // guaranteed to be non-null since one parser was processed
      // and this code was reached, therefore an Error occurred
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return furthestRes!;
   };
};

/**
 * zero or once of parser
 */
export const optional = <T>(parser: Parser<T>): Parser<T | undefined> => {
   return (ctx) => {
      const res = parser(ctx);

      if (res.type === 'success' || res.type === 'failure') {
         return res;
      }

      return newSuccess(ctx, undefined);
   };
};

/**
 * applies a parser zero or one times. if zero, returns a default value
 */
export const optionalDefault = <T>(parser: Parser<T>, value: T): Parser<T> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'error') {
         return newSuccess(res.ctx, value);
      }

      return res;
   };
};

/**
 * zero or more of parser, returns empty array if none
 *
 * note: this parser is infallible unless a subparser runs
 * and returns a failure
 */
export const manyZero = <T>(parser: Parser<T>): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      let nextCtx = ctx;

      // eslint-disable-next-line no-constant-condition
      while (true) {
         const res = parser(nextCtx);
         if (res.type === 'error') {
            break;
         } else if (res.type === 'failure') {
            return res;
         }

         nextCtx = res.ctx;
         values.push(res.value);
      }

      return newSuccess(nextCtx, values);
   };
};

/**
 * one or more of parser
 */
export const many = <T>(parser: Parser<T>): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      let nextCtx = ctx;

      // eslint-disable-next-line no-constant-condition
      while (true) {
         const res = parser(nextCtx);
         if (res.type === 'error') {
            break;
         } else if (res.type === 'failure') {
            return res;
         }

         nextCtx = res.ctx;
         values.push(res.value);
      }

      if (values.length === 0) {
         return newError(nextCtx, 'failure to match at least one');
      }

      return newSuccess(nextCtx, values);
   };
};

/**
 * executes both parsers, discarding the first value
 */
export const preceded = <F, R>(
   first: Parser<F>,
   parser: Parser<R>
): Parser<R> => {
   return (ctx) => {
      const firstResult = first(ctx);
      if (firstResult.type !== 'success') {
         return firstResult;
      }

      const parserResult = parser(firstResult.ctx);
      if (parserResult.type !== 'success') {
         return parserResult;
      }

      return withValue(parserResult, parserResult.value);
   };
};

/**
 * executes both parsers, discarding the second value
 */
export const terminated = <R, T>(
   parser: Parser<R>,
   terminator: Parser<T>
): Parser<R> => {
   return (ctx) => {
      const parserRes = parser(ctx);
      if (parserRes.type !== 'success') {
         return parserRes;
      }

      const terminatorRes = terminator(parserRes.ctx);
      if (terminatorRes.type !== 'success') {
         return terminatorRes;
      }

      return withValue(terminatorRes, parserRes.value);
   };
};

/**
 * executes all three parsers, discarding the delimiters
 */
export const delimited = <O, R, C>(
   open: Parser<O>,
   inner: Parser<R>,
   close: Parser<C>
): Parser<R> => {
   return (ctx) => {
      const openRes = open(ctx);
      if (openRes.type !== 'success') {
         return openRes;
      }

      const innerRes = inner(openRes.ctx);
      if (innerRes.type !== 'success') {
         return innerRes;
      }

      const closeRes = close(innerRes.ctx);
      if (closeRes.type !== 'success') {
         return closeRes;
      }

      return withValue(closeRes, innerRes.value);
   };
};

/**
 * Makes sure the array is interpreted as a tuple
 */
type ParsersTuple = readonly [Parser<unknown>] | readonly Parser<unknown>[];

/**
 * https://stackoverflow.com/questions/53439657/typescript-variadic-args-with-return-array-of-those-types
 *
 * maps a tuple of parsers into a tuple of their results
 */
type ParserReturns<T extends Record<number, Parser<unknown>>> = {
   -readonly [P in keyof T]: T[P] extends Parser<infer R> ? R : never;
};

/**
 * executes all parsers of the same type in order
 *
 * maps a tuple of parsers into a parser returning a tuple of their results
 */
export const sequence = <T extends ParsersTuple>(
   parsers: T
): Parser<ParserReturns<T>> => {
   return (ctx) => {
      const values = [];
      let nextCtx = ctx;

      for (const parser of parsers) {
         const res = parser(nextCtx);
         if (res.type !== 'success') {
            return res;
         }

         values.push(res.value);
         nextCtx = res.ctx;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return newSuccess(nextCtx, values as any);
   };
};

/**
 * returns items which match the provided fn
 */
export const filter = <T>(
   parser: Parser<T[]>,
   fn: (val: T) => boolean
): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];

      const res = parser(ctx);
      if (res.type !== 'success') {
         return res;
      }

      for (const value of res.value) {
         if (fn(value)) {
            values.push(value);
         }
      }

      return withValue(res, values);
   };
};

/**
 * https://stackoverflow.com/questions/58984164/typescript-filter-tuple-type-by-an-arbitrary-type
 *
 * Recursively rebuilds the list of types
 */
type ExcludeFromTuple<T extends readonly unknown[], E> = T extends [
   infer F,
   ...infer R
]
   ? [F] extends [E]
      ? ExcludeFromTuple<R, E>
      : [F, ...ExcludeFromTuple<R, E>]
   : [];

/**
 * removes all nulls from the results of a list of parsers
 */
export const filterNull = <T extends readonly unknown[]>(
   parser: Parser<T>
): Parser<ExcludeFromTuple<T, null>> => {
   return (ctx) => {
      const values = [];
      const res = parser(ctx);

      if (res.type !== 'success') {
         return res;
      }

      for (const value of res.value) {
         if (value !== null) {
            values.push(value);
         }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return withValue(res, values as any);
   };
};

/**
 * removes all undefineds and nulls from the results of a list of parsers
 */
export const clean = <T extends readonly unknown[]>(
   parser: Parser<T>
): Parser<ExcludeFromTuple<T, null | undefined>> => {
   return (ctx) => {
      const values = [];
      const res = parser(ctx);

      if (res.type !== 'success') {
         return res;
      }

      for (const value of res.value) {
         if (value !== null && value !== undefined) {
            values.push(value);
         }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return withValue(res, values as any);
   };
};

/**
 * maps the result of a successful parser over fn
 */
export const map = <A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'success') {
         return withValue(res, fn(res.value));
      }

      return res;
   };
};

export const debug = <T>(parser: Parser<T>, context: string) => {
   return (ctx: Context) => {
      const res = parser(ctx);
      console.log(context, res);
      console.log({
         buffer: res.ctx.input.slice(res.ctx.index, res.ctx.index + 20),
      });
      return res;
   };
};
