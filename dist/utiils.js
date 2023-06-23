"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.customMap = void 0;
const zod_1 = require("zod");
const customMap = (issue, ctx) => {
    if (issue.code === zod_1.z.ZodIssueCode.too_big) {
        return { message: `${issue.path[0]} can only be ${issue.maximum} characters long` };
    }
    if (issue.code == zod_1.z.ZodIssueCode.invalid_type) {
        return { message: `${issue.path[0]} can only be a ${issue.expected}` };
    }
    return { message: ctx.defaultError };
};
exports.customMap = customMap;
const validate = async (schema, user) => {
    try {
        const value = await schema.parseAsync(user);
        return value;
    }
    catch (error) {
        throw error;
    }
};
exports.validate = validate;
