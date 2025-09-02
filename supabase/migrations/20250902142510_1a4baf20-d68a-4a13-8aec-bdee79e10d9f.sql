-- Add company_id column to addresses table to link addresses to companies
ALTER TABLE addresses 
ADD COLUMN company_id uuid NULL;

-- Create index for performance on company lookups
CREATE INDEX idx_addresses_company_id ON addresses(company_id);

-- Add foreign key constraint to link to company_details table
ALTER TABLE addresses 
ADD CONSTRAINT fk_addresses_company 
FOREIGN KEY (company_id) REFERENCES company_details(id) 
ON UPDATE CASCADE ON DELETE SET NULL;