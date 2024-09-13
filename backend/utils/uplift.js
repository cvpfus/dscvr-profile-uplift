import { ACTOR } from "../config/index.js";
import { UPLIFT_PROMPT } from "../constants/index.js";
import { akashGenerateContent, groqGenerateContent } from "./llm.js";

const getReadableDateFormat = (timestamp) => {
  let milliseconds = Number(timestamp / 1000000n);
  let date = new Date(milliseconds);

  return date.toISOString(); // Or you can use other formatting methods
};

export const generateUplift = async (username) => {
  const searchResult = await ACTOR.search_users({
    sort_by: [
      {
        FollowingCount: null,
      },
    ],
    page_size: 20,
    page: 0,
    query: username,
    chain_filter: [],
    sort_direction: [{ Descending: null }],
  });

  const userData = searchResult.result[0].items.find(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );

  const userContent = await ACTOR.get_user_content(username, {
    page_size: 30,
    lang: "en",
    page: 0,
    query: [],
    sort: { New: null },
    filter: "",
    max_age: [],
    chain_filter: [],
  });

  const userPosts = userContent.result[0].contents;

  const upliftData = {
    date_now: new Date().toISOString(),
    user_data: {
      username: userData.username,
      created_at: getReadableDateFormat(userData.created_at),
      bio: userData.bio,
      followers: userData.followers,
      following: userData.following,
      active_streak: userData.active_streak,
      num_posts: userData.num_posts,
      posts: await Promise.all(
        userPosts.map(async (post) => {
          const childrenContent = await ACTOR.get_content_children({
            content_id: BigInt(post.id),
            max_grand_children_per_level: [],
            sort: {
              New: null,
            },
            thread_start: 0,
            since: [],
            thread_size: 15,
            max_grand_child_depth: [],
          });

          return {
            created_at: getReadableDateFormat(post.created_at),
            content_type: post.content_type,
            content: post.body,
            comments: childrenContent.map((comment) => comment.body),
            upvotes: post.upvotes,
            downvotes: post.downvotes,
          };
        }),
      ),
    },
  };

  const prompt = `
  ${UPLIFT_PROMPT}
  
  ${JSON.stringify(upliftData)}
  `;

  try {
    const akashResult = await akashGenerateContent(prompt);

    let groqResult;

    if (akashResult instanceof Error) {
      console.log(akashResult.message);
      groqResult = await groqGenerateContent(prompt);
    } else {
      return akashResult;
    }

    if (groqResult instanceof Error) {
      console.log(groqResult.message);
      throw new Error(groqResult);
    } else {
      return groqResult;
    }
  } catch (error) {
    throw new Error(error);
  }
};
