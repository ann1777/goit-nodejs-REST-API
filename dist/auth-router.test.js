"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
Register controller testing examples.

Given email in format email and password is 6 numbers long.
Return json data format with token, status: "success",
    code: HttpCode.CREATED, user data object containing
    2 fields: email and subscription *in the String data format.
If user with the same email is already present throw error with `Email ${email} is already in use` message
If given invalid data throw `Помилка від Joi або іншої бібліотеки валідації` error.



Test data:
1. {"Bogdan", "bogdan@gmail.com","1234567"}; => {
      id: newUser.id,
      email: "bogdan@gmail.com",
      subscription: "starter",
    }
2. { bogdan@gmail.com, 7894561, pro } => {
      id: newUser.id,
      email: "bogdan@gmail.com",
      subscription: "pro",
    }
3. { bogdan@gmail, 1234567 } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
4. { bogdangmail.com, 1234567 } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
5. { bogdangmail.com, 1 } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
6. { 124589@gmail.com, 1234567 } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
7. { , 1234567 } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
8. { ,  } => throw new Error(
      HttpCode.BAD_REQUEST,
      `Помилка від Joi або іншої бібліотеки валідації`
    );
9. Second time register the same user { Bogdan, bogdan@gmail.com, 1234567 } => {
    throw new Error(HttpCode.CONFLICT, `Email ${email} is already in use`);
*/
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const supertest_1 = __importDefault(require("supertest"));
const http_1 = __importDefault(require("http"));
const user_1 = __importDefault(require("../../models/user"));
const { PORT, DB_HOST_TEST } = process.env;
const userInstance = new user_1.default();
describe('test register', () => {
    let server = http_1.default.Server;
    beforeAll(async () => {
        if (DB_HOST_TEST)
            await mongoose_1.default.connect(DB_HOST_TEST);
        const app = (0, express_1.default)();
        app.listen({ PORT });
    });
    afterAll(async () => {
        await mongoose_1.default.connection.close();
        server.close();
    });
    afterEach(async () => {
        await userInstance.deleteMany({});
    });
    // Test_case1: {"Bogdan", "bogdan@gmail.com","1234567"}; => {
    //     id: newUser.id,
    //     name: Bogdan,
    //     email: "bogdan@gmail.com"
    // }
    test('test register with correct data', async () => {
        const requestData = {
            name: 'Bogdan',
            email: 'bogdan@gmail.com',
            password: '1234567',
        };
        const { statusCode, body } = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
        expect(statusCode).toBe(201);
        expect(body.token).toBeDefined();
        expect(body.user).toBeDefined();
        expect(typeof body.user.email).toBe('string');
        expect(typeof body.user.subscription).toBe('string');
        expect(body.user.email).toBe(requestData.email);
        expect(body.user.subscription).toBe('starter');
        const user = await userInstance.findOne({ email: requestData.email });
        expect(user?.name).toBe(requestData.name);
    });
    // Test_case2: { bogdan@gmail.com, 7894561, pro } => {
    //     id: newUser.id,
    //     email: "bogdan@gmail.com",
    //     subscription: "pro",
    // }
    test("test register with correct data and subscription:'pro'} ", async () => {
        const requestData = {
            name: 'Bogdan',
            email: 'bogdan@gmail.com',
            password: '7894561',
            subscription: 'pro',
        };
        const { statusCode, body } = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
        expect(statusCode).toBe(201);
        expect(body.token).toBeDefined();
        expect(body.user).toBeDefined();
        expect(typeof body.user.email).toBe('string');
        expect(typeof body.user.subscription).toBe('string');
        expect(body.user.email).toBe(requestData.email);
        expect(body.user.subscription).toBe(requestData.subscription);
        const user = await userInstance.findOne({ email: requestData.email });
        expect(user?.name).toBe(requestData.name);
        expect(user?.subscription).toBe(requestData.subscription);
    });
    // Test_case3: { bogdan@gmail, 1234567 } => throw new Error(
    //     HttpCode.BAD_REQUEST,
    //     `Помилка від Joi або іншої бібліотеки валідації`);
    // );
    test('test register with correct data', async () => {
        const requestData = {
            name: 'Bogdan',
            email: 'bogdan@gmail.com',
            password: '1234567',
        };
        const response = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
    });
    test('test register with bad email format', async () => {
        const requestData = {
            email: 'bogdan@gmail',
            password: '1234567',
        };
        const { statusCode, body } = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
        expect(statusCode).toBe(400);
        expect(body.token).toBeUndefined();
        expect(body.user).toBeUndefined();
        if (typeof body.error === 'string') {
            expect(body.error).toBe('Помилка від Joi або іншої бібліотеки валідації');
        }
        else if (body.error && 'message' in body.error) {
            expect(body.error.message).toBe('Помилка від Joi або іншої бібліотеки валідації');
        }
        const userCount = await userInstance.countDocuments();
        expect(userCount).toBe(0);
    });
    // Test_case4: { , 1234567 } => throw new Error(
    //     HttpCode.BAD_REQUEST,
    //     `Помилка від Joi або іншої бібліотеки валідації`
    // );
    test('test register missing email input', async () => {
        const requestData = {
            password: '1234567',
        };
        const { statusCode, body, error } = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
        expect(statusCode).toBe(400);
        expect(body.token).toBeUndefined();
        expect(body.user).toBeUndefined();
        expect(error.valueOf).toBe('Помилка від Joi або іншої бібліотеки валідації');
        const userCount = await userInstance.countDocuments();
        expect(userCount).toBe(0);
    });
    // Test_case5: { bogdan@gmail.com, } => throw new Error(
    //     HttpCode.BAD_REQUEST,
    //     `Помилка від Joi або іншої бібліотеки валідації`
    // );
    test('test register missing password input', async () => {
        const requestData = {
            email: 'bogdan@gmail.com',
        };
        const { statusCode, body, error } = await (0, supertest_1.default)(app)
            .post('/api/auth/register')
            .send(requestData);
        expect(statusCode).toBe(400);
        expect(body.token).toBeUndefined();
        expect(body.user).toBeUndefined();
        expect(error.valueOf).toBe('Помилка від Joi або іншої бібліотеки валідації');
        const userCount = await userInstance.countDocuments();
        expect(userCount).toBe(0);
    });
    // Test_case6: Second time register the same user { name: "Bogdan", email: "bogdan@gmail.com", password: "1234567" }
    test('test register existing user', async () => {
        const requestData = {
            name: 'Bogdan',
            email: 'bogdan@gmail.com',
            password: '1234567',
        };
        await (0, supertest_1.default)(app).post('/api/auth/register').send(requestData);
        try {
            const { statusCode, body, error } = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(requestData);
            expect(statusCode).toBe(409);
            expect(error.valueOf).toBe(`Email ${requestData.email} is already in use`);
        }
        catch (error) {
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(409);
            expect(error.message).toBe(`Email ${requestData.email} is already in use`);
        }
    });
});
