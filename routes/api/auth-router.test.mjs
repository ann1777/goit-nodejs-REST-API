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
import mongoose from 'mongoose';
import { Server } from 'http';
import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import app from '../../app.js';
import UserModel from '../../models/user.js';
import { describe, beforeAll, afterAll, afterEach, test } from 'jest';
const userInstance = new UserModel();
const { PORT, DB_HOST_TEST } = process.env;

describe('insert', () => {
  let connection;
  let server: Server | null = null;
  let db;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    server = app.listen(PORT);
    const userInstance = new UserModel();
  });

  afterAll(async () => {
    await connection.close();
  });

  test('should insert a doc into collection', async () => {
    const users = db.collection('users');

    const mockUser = { _id: 'user-id', name: 'John' };
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({ _id: 'user-id' });
    expect(insertedUser).toEqual(mockUser);
  });
});

describe('test register', () => {
  let server = null;
  let app;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  afterEach(async () => {
    await userInstance.deleteMany({});
  });

  // Test_case1: {"Bogdan", "bogdan@gmail.com","1234567"}; => {
  //     name: 'Bogdan',
  //     email: 'bogdan@gmail.com',
  //     password: '1234567',
  // }
  test('test register with correct data', async () => {
    const requestData = {
      name: 'Bogdan',
      email: 'bogdan@gmail.com',
      password: '1234567',
    };
    let user = await userInstance.create(requestData);
    const { statusCode, body } = await request(app)
      .post('/api/auth/register')
      .send(requestData);

    expect(statusCode).toBe(201);
    expect(body.token).toBeDefined();
    expect(body.user).toBeDefined();
    expect(body.user.email.typeof).toBe('string');
    expect(body.user.subscription.typeof).toBe('string');
    expect(body.user.email).toBe(requestData.email);
    expect(body.user.subscription).toBe('starter');

    let user = await userInstance.findOne({ email: requestData.email });
    expect(user?.name).toBe(requestData.name);
  });

  // Test_case2: { bogdan@gmail.com, 7894561, pro } => {
  //     name: 'Bogdan',
  //     email: 'bogdan@gmail.com',
  //     password: '1234567',
  //     subscription: "pro",
  // }
  test("test register with correct data and subscription:'pro'} ", async () => {
    const requestData = {
      name: 'Bogdan',
      email: 'bogdan@gmail.com',
      password: '7894561',
      subscription: 'pro',
    };
    let user = await userInstance.create(requestData);
    const { statusCode, body } = await request(app)
      .post('/api/auth/register')
      .send(requestData);
    expect(statusCode).toBe(201);
    expect(body.token).toBeDefined();
    expect(body.user).toBeDefined();
    expect(typeof body.user.email).toBe('string');
    expect(typeof body.user.subscription).toBe('string');
    expect(body.user.email).toBe(requestData.email);
    expect(body.user.subscription).toBe(requestData.subscription);

    let user1 = await userInstance.findOne({ email: requestData.email });
    expect(user1?.name).toBe(requestData.name);
    expect(user1?.subscription).toBe(requestData.subscription);
  });

  // Test_case3: { bogdan@gmail, 1234567 } => throw new Error(
  //     HttpCode.BAD_REQUEST,
  //     `Помилка від Joi або іншої бібліотеки валідації`);
  // );
  test('test register with bad email format', async () => {
    const requestData = {
      email: 'bogdan@gmail',
      password: '1234567',
    };
    let user = await userInstance.create(requestData);
    const { statusCode, body, error } = await request(app)
      .post('/api/auth/register')
      .send(requestData);

    expect(statusCode).toBe(400);
    expect(body.token).toBeUndefined();
    expect(body.user).toBeUndefined();
    expect(error.message).toBe(
      'Помилка від Joi або іншої бібліотеки валідації'
    );

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
    let user = await userInstance.create(requestData);
    const { statusCode, body, error } = await request(app)
      .post('/api/auth/register')
      .send(requestData);

    expect(statusCode).toBe(400);
    expect(body.token).toBeUndefined();
    expect(body.user).toBeUndefined();
    expect(error.message).toBe(
      'Помилка від Joi або іншої бібліотеки валідації'
    );

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
    let user = await userInstance.create(requestData);
    const { statusCode, body, error } = await request(app)
      .post('/api/auth/register')
      .send(requestData);

    expect(statusCode).toBe(400);
    expect(body.token).toBeUndefined();
    expect(body.user).toBeUndefined();
    expect(error.message).toBe(
      'Помилка від Joi або іншої бібліотеки валідації'
    );

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
    let user = await userInstance.create(requestData);
    await request(app).post('/api/auth/register').send(requestData);
    await request(app).post('/api/auth/register').send(requestData);
    try {
      const { statusCode, body, error } = await request(app)
        .post('/api/auth/register')
        .send(requestData);
      expect(statusCode).toBe(409);
      expect(error.message).toBe(
        `Email ${requestData.email} is already in use`
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe(
        `Email ${requestData.email} is already in use`
      );
    }
  });
});
