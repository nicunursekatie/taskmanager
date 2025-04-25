// process.d.ts
declare global {
    interface Window {
      process: {
        env: Record<string, string | undefined>;
      }
    }
  }
  
  // Export an empty object to make TypeScript treat this as a module
  export {}