/*
  # Commission Automation System

  1. Functions
    - Auto-calculate commission when project amount changes
    - Auto-create commission records when quote is accepted
    - Update business provider stats

  2. Triggers
    - On project update: recalculate commissions
    - On quote acceptance: create commission records
*/

-- Function to calculate TEMI commission (12% TTC)
CREATE OR REPLACE FUNCTION calculate_temi_commission(project_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN project_amount * 0.12;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate provider commission (10% of TEMI commission)
CREATE OR REPLACE FUNCTION calculate_provider_commission(temi_commission NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN temi_commission * 0.10;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate mandatary commission based on tier
CREATE OR REPLACE FUNCTION calculate_mandatary_commission(
  temi_commission NUMERIC,
  annual_production NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  rate NUMERIC;
BEGIN
  -- Tiers: 25% (0-50k), 30% (50k-100k), 35% (100k-200k), 40% (200k-400k), 50% (400k+)
  IF annual_production < 50000 THEN
    rate := 0.25;
  ELSIF annual_production < 100000 THEN
    rate := 0.30;
  ELSIF annual_production < 200000 THEN
    rate := 0.35;
  ELSIF annual_production < 400000 THEN
    rate := 0.40;
  ELSE
    rate := 0.50;
  END IF;
  
  RETURN temi_commission * rate;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create commission when project is completed and paid
CREATE OR REPLACE FUNCTION auto_create_commissions()
RETURNS TRIGGER AS $$
DECLARE
  temi_commission NUMERIC;
  provider_commission NUMERIC;
BEGIN
  -- Only trigger when project billing status changes to 'paid'
  IF NEW.billing_status = 'paid' AND OLD.billing_status != 'paid' THEN
    
    -- Calculate TEMI commission
    temi_commission := calculate_temi_commission(NEW.amount);
    
    -- Create commission for business provider if exists
    IF NEW.business_provider_id IS NOT NULL THEN
      provider_commission := calculate_provider_commission(temi_commission);
      
      INSERT INTO commissions (
        project_id,
        provider_id,
        amount,
        rate,
        status
      ) VALUES (
        NEW.id,
        NEW.business_provider_id,
        provider_commission,
        10.0,
        'validated'
      )
      ON CONFLICT DO NOTHING;
      
      -- Update provider stats
      UPDATE business_providers
      SET 
        total_commissions = total_commissions + provider_commission,
        pending_commissions = pending_commissions + provider_commission,
        projects_count = projects_count + 1
      WHERE id = NEW.business_provider_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_create_commissions ON projects;

-- Create trigger on projects
CREATE TRIGGER trigger_auto_create_commissions
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_commissions();

-- Function to update commission status
CREATE OR REPLACE FUNCTION update_commission_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- When commission is marked as paid, update provider stats
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE business_providers
    SET 
      pending_commissions = pending_commissions - NEW.amount
    WHERE id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_commission_payment ON commissions;

-- Create trigger on commissions
CREATE TRIGGER trigger_update_commission_payment
  AFTER UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_on_payment();