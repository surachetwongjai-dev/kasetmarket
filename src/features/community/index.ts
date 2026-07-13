// features/community — ชุมชนพูดคุย (PLAN-PHASE2.md กลุ่ม C)

export { ThreadCard } from "./components/thread-card";
export { ThreadForm } from "./components/thread-form";
export { ReplyForm, ReplyGate } from "./components/reply-form";
export { ReplyList } from "./components/reply-list";
export { CommunityPagination } from "./components/community-pagination";
export {
  COMMUNITY_BASE,
  threadPath,
  communityBoardPath,
  communityAbsoluteUrl,
  type CommunityBoardParams,
} from "./paths";
export {
  getThreads,
  getThreadCategoryCounts,
  getThreadBySlug,
  getThreadReplies,
  getThreadsForSitemap,
  getLatestThreads,
  THREADS_PAGE_SIZE,
} from "./queries";
export {
  createThreadAction,
  createReplyAction,
  type ThreadFormState,
  type ReplyFormState,
} from "./actions";
