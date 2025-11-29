// require("dotenv").config();
// const request = require("supertest");
// const app = require("../app");
// const mongoose = require("mongoose");
// const connectDB = require("../config/db");
// const User = require("../models/User");

// beforeAll(async () => {
//   await connectDB();
//   // Test için benzersiz bir kullanıcı oluşturulacak
//   await User.deleteMany({ email: /testuser/ }); // Temizlik
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe("Auth API", () => {
//   let verificationToken = "";
//   let testUserEmail = "testuser@example.com";
//   let testUserPassword = "Test1234!";
//   let refreshToken = "";
//   let accessToken = "";

//   it("should register a new user", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       name: "Test User",
//       email: testUserEmail,
//       password: testUserPassword,
//       role: "patient",
//     });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.user.email).toBe(testUserEmail);
//     verificationToken = res.body.data.user.verificationToken;
//   });

//   it("should not register with existing email", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       name: "Test User",
//       email: testUserEmail,
//       password: testUserPassword,
//       role: "patient",
//     });
//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

//   it("should verify email", async () => {
//     const res = await request(app).get(`/api/auth/verify/${verificationToken}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//   });

//   it("should not verify with invalid token", async () => {
//     const res = await request(app).get(`/api/auth/verify/invalidtoken`);
//     expect(res.statusCode).toBe(400);
//     expect(res.body.success).toBe(false);
//   });

//   it("should login with correct credentials", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: testUserEmail,
//       password: testUserPassword,
//     });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.tokens.accessToken).toBeDefined();
//     expect(res.body.data.tokens.refreshToken).toBeDefined();
//     refreshToken = res.body.data.tokens.refreshToken;
//     accessToken = res.body.data.tokens.accessToken;
//   });

//   it("should not login with wrong password", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: testUserEmail,
//       password: "WrongPassword",
//     });
//     expect([400, 401]).toContain(res.statusCode);
//     expect(res.body.success).toBe(false);
//   });

//   it("should refresh token", async () => {
//     const res = await request(app)
//       .post("/api/auth/refresh")
//       .send({ refreshToken });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data.accessToken).toBeDefined();
//   });

//   it("should not refresh with invalid token", async () => {
//     const res = await request(app)
//       .post("/api/auth/refresh")
//       .send({ refreshToken: "invalidtoken" });
//     expect([400, 401]).toContain(res.statusCode);
//     expect(res.body.success).toBe(false);
//   });

//   it("should logout", async () => {
//     const res = await request(app)
//       .post("/api/auth/logout")
//       .set("Authorization", `Bearer ${accessToken}`)
//       .send({ refreshToken });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.success).toBe(true);
//   });
// });
