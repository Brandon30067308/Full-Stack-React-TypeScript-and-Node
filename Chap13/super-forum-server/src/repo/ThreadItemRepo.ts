import { isThreadBodyValid } from "../common/validators/ThreadValidators";
import { QueryArrayResult, QueryOneResult } from "./QueryArrayResult";
import { ThreadItem } from "./ThreadItem";
import { User } from "./User";
import { Thread } from "./Thread";

export const createThreadItem = async (
  userId: string | undefined | null,
  threadId: string,
  body: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  // users must be logged in to post
  if (!userId) {
    return {
      messages: ["User not logged in."],
    };
  }
  const user = await User.findOne({
    id: userId,
  });

  const thread = await Thread.findOne({
    id: threadId,
  });
  if (!thread) {
    return {
      messages: ["Thread not found."],
    };
  }
  const threadItem = await ThreadItem.create({
    body,
    user,
    thread,
  }).save();
  if (!threadItem) {
    return {
      messages: ["Failed to create ThreadItem."],
    };
  }

  return {
    messages: ["ThreadItem created successfully."],
  };
};

export const getThreadItemById = async (
  id: string
): Promise<QueryOneResult<ThreadItem>> => {
  const threadItem = await ThreadItem.findOne({ id });
  if (!threadItem) {
    return {
      messages: ["ThreadItem not found."],
    };
  }

  return {
    entity: threadItem,
  };
};

export const getThreadItemsByThreadId = async (
  threadId: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const threadItems = await ThreadItem.createQueryBuilder("threadItems")
    .where(`threadItems."threadId" = :threadId`, { threadId })
    .leftJoinAndSelect("threadItems.thread", "thread")
    .orderBy("threadItems.createdOn", "DESC")
    .getMany();

  if (!threadItems) {
    return {
      messages: ["ThreadItems of thread not found."],
    };
  }
  console.log(threadItems);
  return {
    entities: threadItems,
  };
};