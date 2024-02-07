const pool = require("../../database/postgres/pool");
const Jwt = require("@hapi/jwt");

const ThreadTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const CommentsTableHelper = require("../../../../tests/CommentsTableHelper");

const container = require("../../container");
const createServer = require("../createServer");
const JwtTokenManager = require("../../security/JwtTokenManager");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and pesisted threads", async () => {
      // arrange
      const requestPayload = {
        title: "post-title",
        body: "post-body",
      };
      const credentialPayload = { id: "user-thread-123" };
      await UsersTableTestHelper.addUser(credentialPayload);

      const tokenManager = new JwtTokenManager(Jwt.token);
      const token = await tokenManager.createAccessToken(credentialPayload);
      await AuthenticationsTableTestHelper.addToken(token);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });
      const responseJson = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });
    it("should response 400 when request payload not contain needed property", async () => {
      // arrange
      const requestPayload = {
        body: "post-body",
      };
      const credentialPayload = { id: "user-thread-123" };
      await UsersTableTestHelper.addUser(credentialPayload);

      const tokenManager = new JwtTokenManager(Jwt.token);
      const token = await tokenManager.createAccessToken(credentialPayload);
      await AuthenticationsTableTestHelper.addToken(token);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });
      const responseJson = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
    it("should response 400 when request payload not meet data type spesification", async () => {
      // arrange
      const requestPayload = {
        title: "post-title",
        body: 213123,
      };
      const credentialPayload = { id: "user-thread-123" };
      await UsersTableTestHelper.addUser(credentialPayload);

      const tokenManager = new JwtTokenManager(Jwt.token);
      const token = await tokenManager.createAccessToken(credentialPayload);
      await AuthenticationsTableTestHelper.addToken(token);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });
      const responseJson = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });
    it("should response 401 when request payload not authorized", async () => {
      // arrange
      const requestPayload = {
        title: "post-title",
        body: "post-body",
      };
      const credentialPayload = { id: "user-thread-123" };
      await UsersTableTestHelper.addUser(credentialPayload);

      const tokenManager = new JwtTokenManager(Jwt.token);
      const token = await tokenManager.createAccessToken(credentialPayload);
      await AuthenticationsTableTestHelper.addToken(token);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
      expect(responseJson.message).toBeDefined();
    });
  });

  describe("when POST /threads/{id}/comments", () => {
    it("should response 201 and persisted threads", async () => {
      // arrange
      const requestPayload = {
        content: "a-content",
      };

      const credentialPayload = { id: "user-comment-123" };
      const threadPayload = { id: "thread-123", ownerId: credentialPayload.id };

      await ThreadTableTestHelper.addThread(threadPayload);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(201);
      expect(responseJSON.status).toEqual("success");
      expect(responseJSON.data.addedComment).toBeDefined();
    });
    it("should response 400 when request payload not contain needed property", async () => {
      // arrange
      const requestPayload = {
        contenting: "a-content",
      };

      const credentialPayload = { id: "user-comment-123" };
      const threadPayload = { id: "thread-123", ownerId: credentialPayload.id };

      await ThreadTableTestHelper.addThread(threadPayload);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(400);
      expect(responseJSON.status).toEqual("fail");
      expect(responseJSON.message).toBeDefined();
    });
    it("should response 400 when request payload not meet data type spesification", async () => {
      // arrange
      const requestPayload = {
        content: 234,
      };

      const credentialPayload = { id: "user-comment-123" };
      const threadPayload = { id: "thread-123", ownerId: credentialPayload.id };

      await ThreadTableTestHelper.addThread(threadPayload);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(400);
      expect(responseJSON.status).toEqual("fail");
      expect(responseJSON.message).toBeDefined();
    });
    it("should response 401 when user request not authorized", async () => {
      // arrange
      const requestPayload = {
        content: "a-content",
      };

      const credentialPayload = { id: "user-comment-123" };
      const threadPayload = { id: "thread-123", ownerId: credentialPayload.id };

      await ThreadTableTestHelper.addThread(threadPayload);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
      });

      const responseJSON = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(401);
      expect(responseJSON.error).toEqual("Unauthorized");
      expect(responseJSON.message).toBeDefined();
    });
    it("should response 404 when thread is nothing or not valid", async () => {
      // arrange
      const requestPayload = {
        content: "a-content",
      };

      const credentialPayload = { id: "user-comment-123" };
      const threadPayload = { id: "thread-123", ownerId: credentialPayload.id };

      // assume that user been exist
      await UsersTableTestHelper.addUser(credentialPayload);

      // action
      const server = await createServer(container);
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadPayload.id}/comments`,
        payload: requestPayload,
        auth: {
          strategy: "jwt",
          credentials: {
            id: credentialPayload.id,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      // assert
      expect(response.statusCode).toEqual(404);
      expect(responseJSON.status).toEqual("fail");
      expect(responseJSON.message).toBeDefined();
    });
  });
});
