// jest.setup.ts - E2E test setup
import { jest } from '@jest/globals';

// Mock LangChain dependencies
jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: jest.fn(),
    embedDocuments: jest.fn(),
  })),
}));

// Mock Meilisearch
jest.mock('meilisearch', () => ({
  Meilisearch: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      addDocuments: jest.fn(),
      updateDocuments: jest.fn(),
      deleteDocument: jest.fn(),
      search: jest.fn(),
      getTask: jest.fn(),
    }),
  })),
}));

// Mock other problematic dependencies if needed
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    // Add other methods as needed
  })),
}));
