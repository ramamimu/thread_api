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

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should response 200 with status success", async () => {
      const threadId = "thread-comment-123";
      const commentId = "comment-123";
      const userId = "user-comment-123";

      await CommentsTableHelper.addComments({
        id: commentId,
        ownerId: userId,
        threadId: threadId,
      });

      const server = await createServer(container);
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        auth: {
          strategy: "jwt",
          credentials: {
            id: userId,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJSON.status).toStrictEqual("success");
    });
    it("should response 403 when the deleter is not owner", async () => {
      const threadId = "thread-comment-123";
      const commentId = "comment-123";
      const userId = "user-comment-123";

      // user 1 (owner)
      await CommentsTableHelper.addComments({
        id: commentId,
        ownerId: "another-owner",
        threadId: threadId,
      });

      // user 2 (not owner and the deleter)
      await UsersTableTestHelper.addUser({
        id: userId,
        username: "another-uname",
      });

      const server = await createServer(container);
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        auth: {
          strategy: "jwt",
          credentials: {
            id: userId,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(403);
      expect(responseJSON.status).toStrictEqual("fail");
      expect(responseJSON.message).toBeDefined();
    });
    it("should response 404 when thread or comment not valid", async () => {
      const threadId = "thread-comment-123";
      const commentId = "comment-123";
      const userId = "user-comment-123";

      await UsersTableTestHelper.addUser({
        id: userId,
        username: "another-uname",
      });

      const server = await createServer(container);
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        auth: {
          strategy: "jwt",
          credentials: {
            id: userId,
          },
        },
      });

      const responseJSON = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJSON.status).toStrictEqual("fail");
      expect(responseJSON.message).toBeDefined();
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should response status code 200", async () => {
      // arrange
      const userPayload = {
        id: "user-integration-test",
        username: "username-int",
      };

      const threadPayload = {
        id: "thread-integration-test",
        ownerId: userPayload.id,
        isAddUser: false,
      };

      const commentsPayload = [
        {
          id: "comment-int-1",
          threadId: threadPayload.id,
          ownerId: userPayload.id,
          isAddThread: false,
        },
        {
          id: "comment-int-2",
          threadId: threadPayload.id,
          ownerId: userPayload.id,
          isAddThread: false,
        },
        {
          id: "comment-int-3",
          threadId: threadPayload.id,
          ownerId: userPayload.id,
          isAddThread: false,
        },
      ];

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadTableTestHelper.addThread(threadPayload);
      await CommentsTableHelper.addComments(commentsPayload[0]);
      await CommentsTableHelper.addComments(commentsPayload[1]);
      await CommentsTableHelper.addComments(commentsPayload[2]);

      // action
      const server = await createServer(container);
      const responseNoDeletedComments = await server.inject({
        method: "GET",
        url: `/threads/${threadPayload.id}`,
      });

      const responseJson = JSON.parse(responseNoDeletedComments.payload);

      expect(responseNoDeletedComments.statusCode).toEqual(200);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadPayload.id);
      expect(responseJson.data.thread.username).toEqual(userPayload.username);
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments.length).toEqual(3);
      expect(responseJson.data.thread.comments[0].content).not.toEqual(
        "**komentar telah dihapus**"
      );
    });
    it("should response status code 200 with deleted comments", async () => {
      // arrange
      const userPayload = {
        id: "user-integration-test",
        username: "username-int",
      };

      const threadPayload = {
        id: "thread-integration-test",
        ownerId: userPayload.id,
        isAddUser: false,
      };

      const commentsPayload = [
        {
          id: "comment-int-4",
          threadId: threadPayload.id,
          ownerId: userPayload.id,
          isDelete: true,
          isAddThread: false,
        },
        {
          id: "comment-int-5",
          threadId: threadPayload.id,
          ownerId: userPayload.id,
          isDelete: true,
          isAddThread: false,
        },
      ];

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadTableTestHelper.addThread(threadPayload);
      await CommentsTableHelper.addComments(commentsPayload[0]);
      await CommentsTableHelper.addComments(commentsPayload[1]);

      // action
      const server = await createServer(container);
      const responseNoDeletedComments = await server.inject({
        method: "GET",
        url: `/threads/${threadPayload.id}`,
      });

      const responseJson = JSON.parse(responseNoDeletedComments.payload);

      expect(responseNoDeletedComments.statusCode).toEqual(200);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadPayload.id);
      expect(responseJson.data.thread.username).toEqual(userPayload.username);
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments.length).toEqual(2);
      expect(responseJson.data.thread.comments[0].content).toEqual(
        "**komentar telah dihapus**"
      );
    });
    it("should response status code 404 when thread is not available", async () => {});
  });
});
