/**
 * Global test utilities type declarations
 */

interface TestUtils {
  mockApiResponse: (data: any, status?: number) => void;
  mockApiError: (message: string, status: number) => void;
  createMockEnvironmentalData: () => any;
  createMockUser: () => any;
}

declare global {
  namespace globalThis {
    var testUtils: TestUtils;
  }
}

export {};
