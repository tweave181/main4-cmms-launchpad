import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Feature Components
import { CompanyTypeBadges } from '@/components/companies/CompanyTypeBadges';
import { UserEmploymentBadge } from '@/components/user-management/UserEmploymentBadge';
import { AddressDisplay } from '@/components/addresses/AddressDisplay';
import { AssetEmptyState } from '@/pages/assets/components/AssetEmptyState';
import { InventoryEmptyState } from '@/pages/inventory/components/InventoryEmptyState';

// Test wrapper for components that need routing
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('UI Component Snapshots', () => {
  describe('Badge', () => {
    it('renders default badge', () => {
      const { container } = render(<Badge>Default</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary badge', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline badge', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders destructive badge', () => {
      const { container } = render(<Badge variant="destructive">Destructive</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Button', () => {
    it('renders default button', () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary button', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline button', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders ghost button', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled button', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Card', () => {
    it('renders basic card', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Separator', () => {
    it('renders horizontal separator', () => {
      const { container } = render(<Separator />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Progress', () => {
    it('renders progress at 0%', () => {
      const { container } = render(<Progress value={0} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders progress at 50%', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders progress at 100%', () => {
      const { container } = render(<Progress value={100} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Skeleton', () => {
    it('renders skeleton loader', () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

describe('Feature Component Snapshots', () => {
  describe('CompanyTypeBadges', () => {
    it('renders with no types', () => {
      const { container } = render(<CompanyTypeBadges types={[]} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with single type', () => {
      const { container } = render(<CompanyTypeBadges types={['Manufacturer']} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with multiple types', () => {
      const { container } = render(
        <CompanyTypeBadges types={['Manufacturer', 'Supplier', 'Contact']} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('UserEmploymentBadge', () => {
    it('renders with no status', () => {
      const { container } = render(<UserEmploymentBadge />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Full Time status', () => {
      const { container } = render(<UserEmploymentBadge employmentStatus="Full Time" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Part Time status', () => {
      const { container } = render(<UserEmploymentBadge employmentStatus="Part Time" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Bank Staff status', () => {
      const { container } = render(<UserEmploymentBadge employmentStatus="Bank Staff" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Contractor status', () => {
      const { container } = render(<UserEmploymentBadge employmentStatus="Contractor" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('AddressDisplay', () => {
    it('renders with no address', () => {
      const { container } = render(<AddressDisplay address={null} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with complete address', () => {
      const mockAddress = {
        id: '1',
        address_line_1: '123 Main Street',
        address_line_2: 'Suite 100',
        address_line_3: null,
        town_or_city: 'London',
        county_or_state: 'Greater London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom',
        company_id: null,
        tenant_id: 'test-tenant',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      const { container } = render(<AddressDisplay address={mockAddress} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with minimal address', () => {
      const mockAddress = {
        id: '2',
        address_line_1: '456 Oak Avenue',
        address_line_2: null,
        address_line_3: null,
        town_or_city: 'Manchester',
        county_or_state: null,
        postcode: 'M1 1AA',
        country: 'United Kingdom',
        company_id: null,
        tenant_id: 'test-tenant',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      const { container } = render(<AddressDisplay address={mockAddress} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('AssetEmptyState', () => {
    it('renders with no search term', () => {
      const { container } = render(
        <AssetEmptyState searchTerm="" onCreateAsset={() => {}} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with search term', () => {
      const { container } = render(
        <AssetEmptyState searchTerm="laptop" onCreateAsset={() => {}} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('InventoryEmptyState', () => {
    it('renders with no search term', () => {
      const { container } = render(
        <InventoryEmptyState searchTerm="" onCreatePart={() => {}} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with search term', () => {
      const { container } = render(
        <InventoryEmptyState searchTerm="bearing" onCreatePart={() => {}} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
