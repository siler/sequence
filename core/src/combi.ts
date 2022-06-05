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
 * indicates a failed parse attempt
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
 * indicates a failed parse attempt
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

/**
 * causes any errors produced by the passed parser to be turned into failures
 */
export const must = <T>(parser: Parser<T>, message: string): Parser<T> => {
   return (ctx) => {
      const res = parser(ctx);

      if (res.type === 'error') {
         return fail(res, message);
      }

      return res;
   };
};

/**
 * parse an exact string
 */
export const str = (match: string): Parser<string> => {
   return (ctx) => {
      const index = ctx.index + match.length;
      if (index >= ctx.input.length) {
         return newError(ctx, `failure to match str "${match}"`);
      }

      if (ctx.input.substring(ctx.index, index) === match) {
         return newSuccess(withIndex(ctx, index), match);
      }

      return newError(ctx, `failed to match str "${match}"`);
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

      return newError(ctx, `failure to match regex ${expected}`);
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
      } else {
         return res;
      }
   };
};

/**
 * one of parsers (in order)
 */
export const any = <T>(parsers: Parser<T>[]): Parser<T> => {
   return (ctx) => {
      let furthestRes: Error | null = null;

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
 * zero or more of parser, returns empty array if none
 *
 * note: failure of parser is considered success
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
         return newError(nextCtx, 'failure to match at least one in manyOne');
      }

      return newSuccess(nextCtx, values);
   };
};

type Pair<A, B> = Readonly<{
   first: A;
   second: B;
}>;

/**
 * executes both parsers returning the result as a Pair
 */
export const pair = <A, B>(
   parserA: Parser<A>,
   parserB: Parser<B>
): Parser<Pair<A, B>> => {
   return (ctx) => {
      const resA = parserA(ctx);
      if (resA.type !== 'success') {
         return resA;
      }

      const resB = parserB(resA.ctx);
      if (resB.type !== 'success') {
         return resB;
      }

      return withValue(resB, { first: resA.value, second: resB.value });
   };
};

/**
 * executes both parsers, discarding the first value
 */
export const preceded = <A, B>(
   parserA: Parser<A>,
   parserB: Parser<B>
): Parser<B> => {
   return (ctx) => {
      const resA = parserA(ctx);
      if (resA.type !== 'success') {
         return resA;
      }

      const resB = parserB(resA.ctx);
      if (resB.type !== 'success') {
         return resB;
      }

      return withValue(resB, resB.value);
   };
};

/**
 * executes both parsers, discarding the second value
 */
export const terminated = <A, B>(
   parserA: Parser<A>,
   parserB: Parser<B>
): Parser<A> => {
   return (ctx) => {
      const resA = parserA(ctx);
      if (resA.type !== 'success') {
         return resA;
      }

      const resB = parserB(resA.ctx);
      if (resB.type !== 'success') {
         return resB;
      }

      return withValue(resB, resA.value);
   };
};

/**
 * executes all parsers of the same type in order
 */
export const sequence = <T>(parsers: Parser<T>[]): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      let nextCtx = ctx;

      for (const parser of parsers) {
         const res = parser(nextCtx);
         if (res.type !== 'success') {
            return res;
         }

         values.push(res.value);
         nextCtx = res.ctx;
      }

      return newSuccess(nextCtx, values);
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
 * removes all nulls from the results of a list of parsers
 */
export const filterNull = <T>(parser: Parser<(T | null)[]>): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      const res = parser(ctx);

      if (res.type !== 'success') {
         return res;
      }

      for (const value of res.value) {
         if (value !== null) {
            values.push(value);
         }
      }

      return withValue(res, values);
   };
};

/**
 * removes all undefineds and nulls from the results of a list of parsers
 */
export const clean = <T>(
   parser: Parser<(T | null | undefined)[]>
): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      const res = parser(ctx);

      if (res.type !== 'success') {
         return res;
      }

      for (const value of res.value) {
         if (value !== null && value !== undefined) {
            values.push(value);
         }
      }

      return withValue(res, values);
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
