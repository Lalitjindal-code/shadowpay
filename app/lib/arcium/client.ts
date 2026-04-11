// TODO: verify against latest @arcium-hq/arcium-js docs
export async function getArciumClient() {
  if (!process.env.NEXT_PUBLIC_ARCIUM_CLUSTER_URL) {
    console.warn("NEXT_PUBLIC_ARCIUM_CLUSTER_URL not set. Running in fallback mode.");
  }
  
  // Dummy return for now since @arcium-hq/arcium-js installation is skipped
  return {
    isFallback: true,
  };
}
