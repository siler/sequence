type Parser<T> = (ctx: Context) => Result<T>;

export class Context {
   constructor(
      public readonly input: string,
      public readonly index: number = 0
   ) {}

   rest(): string {
      return this.input.slice(this.index);
   }

   with(index: number): Context {
      return new Context(this.input, index);
   }
}

export type Result<T> = Success<T> | Error | Failure;

/**
 * indicates a successful parse, and contains the resulting value
 */
export class Success<T> {
   readonly type = 'success';

   constructor(public readonly ctx: Context, public readonly value: T) {}

   /**
    * helper to associate a successful context with a refined value
    */
   with<TN>(value: TN): Success<TN> {
      return new Success(this.ctx, value);
   }
}

/**
 * indicates a failed parse attempt
 */
export class Error {
   readonly type = 'error';

   constructor(
      public readonly ctx: Context,
      public readonly description: string,
      public readonly cause: Error | null = null
   ) {}

   /**
    * helper to wrap an error with additional descriptive information
    */
   context(description: string): Error {
      return new Error(this.ctx, description, this);
   }

   /**
    * helper to turn an error into a failure
    */
   fail(): Failure {
      return new Failure(this.ctx, 'fail', this.cause);
   }
}

/**
 * indicates a failed parse attempt
 */
export class Failure {
   readonly type = 'failure';

   constructor(
      public readonly ctx: Context,
      public readonly description: string,
      public readonly cause: Error | Failure | null = null
   ) {}

   /**
    * helper to wrap a failure with additional descriptive information
    */
   context(description: string): Failure {
      return new Failure(this.ctx, description, this);
   }
}

/**
 * causes any errors produced by the passed parser to be turned into failures
 */
export const must = <T>(parser: Parser<T>): Parser<T> => {
   return (ctx) => {
      const res = parser(ctx);

      if (res.type === 'error') {
         return res.fail();
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
         return new Error(ctx, `matching "${match}"`);
      }

      if (ctx.input.substring(ctx.index, index) === match) {
         return new Success(ctx.with(index), match);
      }

      return new Error(ctx, `matching "${match}"`);
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
         return new Success(ctx.with(ctx.index + res[0].length), res[0]);
      }

      return new Error(ctx, `matching ${expected}`);
   };
};

/**
 * matches the end of the input
 */
export const eof = (): Parser<null> => {
   return (ctx) => {
      if (ctx.index >= ctx.input.length) {
         return new Success(ctx, null);
      }

      return new Error(ctx, 'matching eof');
   };
};

/**
 * requires parser, then discards the result
 */
export const discard = <T>(parser: Parser<T>): Parser<null> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'success') {
         return res.with(null);
      } else {
         return res.context('discard');
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
         return new Error(ctx, 'any');
      }

      for (const parser of parsers) {
         const res = parser(ctx);
         switch (res.type) {
            case 'success':
               return res;
            case 'failure':
               return res.context('any');
         }

         if (!furthestRes || furthestRes.ctx.index < res.ctx.index) {
            furthestRes = res;
         }
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return furthestRes!.context('any');
   };
};

/**
 * zero or once of parser
 */
export const optional = <T>(parser: Parser<T>): Parser<T | undefined> => {
   return (ctx) => {
      const res = parser(ctx);

      switch (res.type) {
         case 'success':
            return res;
         case 'failure':
            return res.context('optional');
      }

      return new Success(ctx, undefined);
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
            return res.context('many');
         }

         nextCtx = res.ctx;
         values.push(res.value);
      }

      return new Success(nextCtx, values);
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
            return res.context('many');
         }

         nextCtx = res.ctx;
         values.push(res.value);
      }

      if (values.length === 0) {
         return new Error(nextCtx, 'manyOne');
      }

      return new Success(nextCtx, values);
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
         return resA.context('pair first');
      }

      const resB = parserB(resA.ctx);
      if (resB.type !== 'success') {
         return resB.context('pair second');
      }

      return resB.with({ first: resA.value, second: resB.value });
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
         return resA.context('terminated first');
      }

      const resB = parserB(resA.ctx);
      if (resB.type !== 'success') {
         return resB.context('terminated second');
      }

      return resB.with(resA.value);
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
            return res.context('sequence');
         }

         values.push(res.value);
         nextCtx = res.ctx;
      }

      return new Success(nextCtx, values);
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
         return res.context('filter');
      }

      for (const value of res.value) {
         if (fn(value)) {
            values.push(value);
         }
      }

      return res.with(values);
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
         return res.context('filterNull');
      }

      for (const value of res.value) {
         if (value !== null) {
            values.push(value);
         }
      }

      return res.with(values);
   };
};

/**
 * removes all undefineds from the results of a list of parsers
 */
export const filterUndefined = <T>(
   parser: Parser<(T | undefined)[]>
): Parser<T[]> => {
   return (ctx) => {
      const values: T[] = [];
      const res = parser(ctx);

      if (res.type !== 'success') {
         return res.context('filterNull');
      }

      for (const value of res.value) {
         if (value !== undefined) {
            values.push(value);
         }
      }

      return res.with(values);
   };
};

/**
 * maps the result of a successful parser over fn
 */
export const map = <A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> => {
   return (ctx) => {
      const res = parser(ctx);
      if (res.type === 'success') {
         return res.with(fn(res.value));
      }

      return res.context('map');
   };
};
