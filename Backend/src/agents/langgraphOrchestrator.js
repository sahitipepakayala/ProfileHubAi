const { Annotation, StateGraph, START, END } = require("@langchain/langgraph");
const { searchCandidates } = require("./searchAgent");
const { matchCandidates } = require("./matchingAgent");
const { rankCandidates } = require("./rankingAgent");

/**
 * LangGraph Orchestrator
 *
 * This replaces the plain sequential function calls that used to live in
 * orchestrator.js with an actual LangGraph StateGraph, matching the pitch's
 * claim that agents are orchestrated with explicit sequence, state, and
 * handoffs (rather than just one function calling the next).
 *
 * The three underlying agents (Search, Match, Rank) are UNCHANGED — only the
 * way they're wired together is different. Each node reads the shared graph
 * state, does its job, and hands off a partial state update to the next node.
 */

// Defines the shape of state that flows through the graph. Each node can read
// any of these fields and return a partial update to them. Fields without a
// custom reducer are simply replaced by whatever a node returns for them.
const PipelineState = Annotation.Root({
  requiredSkills: Annotation(), // input: skills extracted from the job
  limit: Annotation(), // input: how many ranked candidates to return
  candidates: Annotation(), // set by the search node
  scoredCandidates: Annotation(), // set by the match node
  rankedCandidates: Annotation(), // set by the rank node (final output)
});

// Node 1: Candidate Search Agent — casts a wide net over the candidate pool
const searchNode = async (state) => {
  const candidates = await searchCandidates(state.requiredSkills);
  return { candidates };
};

// Node 2: Skill Matching Agent — scores each candidate found by the search node
const matchNode = async (state) => {
  const scoredCandidates = matchCandidates(state.candidates, state.requiredSkills);
  return { scoredCandidates };
};

// Node 3: Ranking Agent — orders scored candidates and trims to the requested limit
const rankNode = async (state) => {
  const rankedCandidates = rankCandidates(state.scoredCandidates, state.limit);
  return { rankedCandidates };
};

// Build the graph: START -> search -> match -> rank -> END
const graph = new StateGraph(PipelineState)
  .addNode("search", searchNode)
  .addNode("match", matchNode)
  .addNode("rank", rankNode)
  .addEdge(START, "search")
  .addEdge("search", "match")
  .addEdge("match", "rank")
  .addEdge("rank", END);

const compiledGraph = graph.compile();

/**
 * Runs the Search -> Match -> Rank pipeline through the compiled LangGraph.
 * Same inputs/outputs as the old manual version, so callers don't need to change.
 */
const runLangGraphMatchingPipeline = async (requiredSkills, limit = 10) => {
  const result = await compiledGraph.invoke({ requiredSkills, limit });
  return result.rankedCandidates;
};

module.exports = { runLangGraphMatchingPipeline };