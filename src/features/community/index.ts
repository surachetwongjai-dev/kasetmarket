// features/community — ชุมชนพูดคุย (PLAN-PHASE2.md กลุ่ม C)

export { ThreadCard } from "./components/thread-card";
export { ThreadForm, type ThreadFormDefaults } from "./components/thread-form";
export { ReplyForm, ReplyGate } from "./components/reply-form";
export { ReplyList } from "./components/reply-list";
export { CommunityPagination } from "./components/community-pagination";
export { ThreadControls } from "./components/thread-controls";
export { ForumReportButton } from "./components/forum-report-button";
export { CommunityRules } from "./components/community-rules";
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
  getMyThreadForEdit,
  getForumReportsForAdmin,
  getOpenForumReportCount,
  THREADS_PAGE_SIZE,
} from "./queries";
export {
  createThreadAction,
  createReplyAction,
  updateThreadAction,
  type ThreadFormState,
  type ReplyFormState,
} from "./actions";
