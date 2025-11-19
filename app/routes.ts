import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/search-actors", "routes/api.search-actors.ts"),
  route("api/find-movies", "routes/api.find-movies.ts"),
  route("api/popular-actors", "routes/api.popular-actors.ts"),
  route("api/actor-recommendations", "routes/api.actor-recommendations.ts"),
] satisfies RouteConfig;
