import { vi, beforeEach } from 'vitest';

// Mock toast function
export const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  console.error = vi.fn() as any;
  console.warn = vi.fn() as any;
});
