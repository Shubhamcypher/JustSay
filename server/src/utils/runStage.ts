export async function runStage<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = Date.now();
    console.log(`🚀 [${name}] START`);
  
    try {
      const result = await fn();
  
      const duration = Date.now() - start;
      console.log(`✅ [${name}] DONE in ${duration}ms`);
  
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`❌ [${name}] FAILED in ${duration}ms`);
      console.error(err);
      throw err;
    }
  }