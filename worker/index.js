// Serves the static demo and sends visitors from the retired address to the current one.
const CURRENT_HOST = "clubanalytics.denizci.dev";
const RETIRED_HOSTS = new Set(["pcfc.denizci.dev"]);

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (RETIRED_HOSTS.has(url.hostname)) {
      url.protocol = "https:";
      url.hostname = CURRENT_HOST;
      return Response.redirect(url.href, 301);
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
