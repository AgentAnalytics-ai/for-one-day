-- Add executor/trustee fields to profiles table
-- This allows users to designate someone with legal authority to access their legacy notes

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS executor_name text,
ADD COLUMN IF NOT EXISTS executor_email text,
ADD COLUMN IF NOT EXISTS executor_phone text,
ADD COLUMN IF NOT EXISTS executor_relationship text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.executor_name IS 'Name of the designated executor/trustee for legacy notes access';
COMMENT ON COLUMN public.profiles.executor_email IS 'Email address of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_phone IS 'Phone number of the designated executor/trustee';
COMMENT ON COLUMN public.profiles.executor_relationship IS 'Relationship of the executor/trustee (spouse, child, attorney, etc.)';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_executor_email ON public.profiles(executor_email) WHERE executor_email IS NOT NULL;
