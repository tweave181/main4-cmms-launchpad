
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Network } from 'lucide-react';
import Mermaid from '@/components/ui/mermaid';

const cmmsRelationshipChart = `flowchart LR
  %% ===== Nodes =====
  ServiceContract["Service Contract"]:::orange
  AssetRegister["Asset register"]:::lime
  AssetGroup["Asset Group"]:::blue
  Department["Department or section"]:::blue
  AddressBook["Address Book"]:::lime
  CompanyDetails["Company Details"]:::blue
  Contact["Contact"]:::grey
  WorkOrder["Work Order"]:::grey
  ScheduleDetail["Schedule Detail"]:::grey
  ScheduleLine["Schedule line"]:::light
  Notes["Notes"]:::grey
  UserDetails["User details"]:::yellow

  %% ===== Relationships (with labels) =====
  CompanyDetails --> AddressBook
  Contact --> AddressBook
  AddressBook -->|Contractor| ServiceContract
  ServiceContract --> AssetRegister
  AddressBook -->|Manufacturer / Supplier| WorkOrder

  AssetGroup --> AssetRegister
  Department --> AssetRegister

  WorkOrder -->|Service / Breakdown / Small Works| AssetRegister
  WorkOrder --> ScheduleDetail
  ScheduleDetail --> ScheduleLine

  WorkOrder --> Notes
  Department -->|General Health & Safety| Notes
  Notes --> UserDetails

  %% ===== Styles =====
  classDef blue fill:#71c2ff,stroke:#2c7fb8,color:#0b3a5b,stroke-width:1.5px;
  classDef lime fill:#caff85,stroke:#7fbf00,color:#1b3b00,stroke-width:1.5px;
  classDef orange fill:#ffcc66,stroke:#cc8b00,color:#5a3d00,stroke-width:1.5px;
  classDef grey fill:#cfcfcf,stroke:#8d8d8d,color:#222,stroke-width:1.5px;
  classDef yellow fill:#fff46a,stroke:#e0bf00,color:#5a4d00,stroke-width:1.5px;
  classDef light fill:#e9e9e9,stroke:#bdbdbd,color:#333,stroke-width:1.5px;`;

const Reports: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-2xl shadow-sm border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <BarChart className="h-6 w-6 text-primary" />
            <span>Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction.</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center space-x-3">
            <Network className="h-5 w-5 text-primary" />
            <span>CMMS Main4 Relationship Diagram</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background rounded-lg p-4 overflow-auto">
            <Mermaid 
              chart={cmmsRelationshipChart} 
              id="cmms-main4-diagram"
              className="w-full flex justify-center"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
