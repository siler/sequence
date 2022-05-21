
// every parsing function will have this signature
type Parser<T> = (ctx: Context) => Result<T>;

// to track progress through our input string.
interface Context {
    readonly text: string;
    readonly index: number;
};

// our result types
type Result<T> = Success<T> | Failure;

// on success we'll return a value of type T, and a new Ctx
// (position in the string) to continue parsing from
interface Success<T> {
    readonly success: true;
    readonly value: T;
    // the context after the success
    readonly ctx: Context;
};

// when we fail we want to know where and why
interface Failure {
    readonly success: false;
    readonly description: string;
    readonly ctx: Context;
    readonly cause: Failure | null,
};

// some convenience methods to build `Result`s for us
function success<T>(ctx: Context, value: T): Success<T> {
    return { success: true, value, ctx };
}

function failure(ctx: Context, description: string, cause: Failure | null = null): Failure {
    return { success: false, description, ctx, cause: null };
}

// parse an exact string
export const str = (match: string): Parser<string> => {
    return ctx => {
        const endIdx = ctx.index + match.length;
        if (endIdx >= ctx.text.length) {
            return failure(ctx, match);
        }

        if (ctx.text.substring(ctx.index, endIdx) === match) {
            return success({ ...ctx, index: endIdx }, match);
        }

        return failure(ctx, match);
    };
}

// parse a regex match
export const regex = (re: RegExp, expected: string): Parser<string> => {
    return ctx => {
        re.lastIndex = ctx.index;

        const res = re.exec(ctx.text);
        if (res && res.index === ctx.index) {
            return success({ ...ctx, index: ctx.index + res[0].length }, res[0]);
        }

        return failure(ctx, expected);
    };
}

export const eof = (): Parser<null> => {
    return ctx => {
        if (ctx.index >= ctx.text.length) {
            return success(ctx, null);
        }

        return failure(ctx, 'eof');
    }
}

export const discard = <T>(parser: Parser<T>): Parser<null> => {
    return ctx => {
        const res = parser(ctx);
        if (res.success) {
            return success(res.ctx, null);
        } else {
            return failure(res.ctx, 'discard', res);
        }
    }
}

// one of parsers (in order)
export const any = <T>(parsers: Parser<T>[]): Parser<T> => {
    return ctx => {
        let furthestRes: Failure | null = null;

        for (const parser of parsers) {
            const res = parser(ctx);
            if (res.success) {
                return res;
            }

            if (!furthestRes || furthestRes.ctx.index < res.ctx.index) {
                furthestRes = res;
            }
        }

        return failure(furthestRes!.ctx, 'any', furthestRes!);
    };
}

// zero or once of parser
export const optional = <T>(parser: Parser<T>): Parser<T | null> => {
    return any([parser, ctx => success(ctx, null)]);
}

// zero or more of parser, returns empty array if none
export const many = <T>(parser: Parser<T>): Parser<T[]> => {
    return ctx => {
        let values: T[] = [];
        let nextCtx = ctx;
        while (true) {
            const res = parser(nextCtx);
            if (!res.success) {
                break;
            }

            values.push(res.value);
            nextCtx = res.ctx;
        }

        return success(nextCtx, values);
    };
}

type Pair<A, B> = Readonly<{
    first: A,
    second: B,
}>;

// executes both parsers returning the result as a Pair
export const pair = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<Pair<A, B>> => {
    return ctx => {
        const resA = parserA(ctx);
        if (!resA.success) {
            return failure(resA.ctx, 'pair', resA);
        }

        const resB = parserB(resA.ctx);
        if (!resB.success) {
            return failure(resB.ctx, 'pair', resB);
        }

        return success(resB.ctx, { first: resA.value, second: resB.value });
    }
}

// executes both parsers, discarding the second value
export const terminated = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A> => {
    return ctx => {
        const resA = parserA(ctx);
        if (!resA.success) {
            return failure(resA.ctx, 'terminated', resA);
        }

        const resB = parserB(resA.ctx);
        if (!resB.success) {
            return failure(resB.ctx, 'terminated', resB);
        }

        return success(resB.ctx, resA.value);
    }
}

// executes all parsers in order
export const sequence = <T>(parsers: Parser<T>[]): Parser<T[]> => {
    return ctx => {
        let values: T[] = [];
        let nextCtx = ctx;

        for (const parser of parsers) {
            const res = parser(nextCtx);
            if (!res.success) {
                return failure(res.ctx, 'sequence', res);
            }

            values.push(res.value);
            nextCtx = res.ctx;
        }

        return success(nextCtx, values);
    };
}

// returns items which match the provided fn
function filter<T>(parser: Parser<T[]>, fn: (val: T) => boolean): Parser<T[]> {
    return ctx => {
        let values: T[] = [];

        let res = parser(ctx);
        if (!res.success) {
            return failure(res.ctx, 'filter', res);
        }

        for (const value of res.value) {
            if (fn(value)) {
                values.push(value);
            }
        }

        return success(res.ctx, values);
    }
}

// removes all nulls from the results of a list of parsers
export const filter_nulls = <T>(parser: Parser<(T | null)[]>): Parser<T[]> => {
    return ctx => {
        let values: T[] = [];
        let res = parser(ctx);

        if (!res.success) {
            return failure(res.ctx, 'filter_nulls', res);
        }

        for (const value of res.value) {
            if (value !== null) {
                values.push(value);
            }
        }

        return success(res.ctx, values);
    }
}

// maps the result of a successful parser over fn
export const map = <A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> => {
    return ctx => {
        const res = parser(ctx);
        if (res.success) {
            return success(res.ctx, fn(res.value));
        } else {
            return failure(res.ctx, 'map', res);
        }
    };
}