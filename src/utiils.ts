import {z} from 'zod';

export const customMap: z.ZodErrorMap = (issue, ctx) => {
     if (issue.code === z.ZodIssueCode.too_big) {
          return {message: `${issue.path[0]} can only be ${issue.maximum} characters long`};
     }

     if (issue.code == z.ZodIssueCode.invalid_type) {
          return {message: `${issue.path[0]} can only be a ${issue.expected}`};
     }

     return {message: ctx.defaultError}
};

export const validate = async <T extends z.ZodTypeAny>(schema: T, user: {}): Promise<z.infer<T>> => {
     try {
          const value = await schema.parseAsync(user);
          return value;
     } catch (error) {
          throw error;
     }
} 

export function customError() {
     return class extends Error {
          constructor(message: string) {
               super(message)
          }
     }
} 