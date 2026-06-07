-- Premium Legacy Templates System
-- Professional, beautiful templates that justify $10/month

-- Create legacy_templates table
CREATE TABLE IF NOT EXISTS public.legacy_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL, -- 'wedding', 'graduation', 'birthday', 'general', 'estate'
  template_content text NOT NULL, -- The actual template with placeholders
  placeholders jsonb DEFAULT '[]'::jsonb, -- Array of placeholder fields
  is_premium boolean DEFAULT true, -- All templates are premium for now
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_usage table to track which templates users use
CREATE TABLE IF NOT EXISTS public.template_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.legacy_templates(id) ON DELETE CASCADE,
  vault_item_id uuid REFERENCES public.vault_items(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vault_item_id) -- One template per vault item
);

-- Add template_id to vault_items
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.legacy_templates(id);

-- RLS Policies for legacy_templates (public read for active templates)
ALTER TABLE public.legacy_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON public.legacy_templates
  FOR SELECT USING (is_active = true);

-- RLS Policies for template_usage (users can only see their own usage)
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own template usage" ON public.template_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own template usage" ON public.template_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert premium templates
INSERT INTO public.legacy_templates (name, description, category, template_content, placeholders, sort_order) VALUES

-- Wedding Templates
('Wedding Day Letter', 'A heartfelt letter for your daughter''s wedding day', 'wedding', 
'My Dearest [RECIPIENT_NAME],

As I watch you prepare for this beautiful day, my heart overflows with joy and pride. You have grown into such an incredible woman, and seeing you find someone who loves and cherishes you fills me with such happiness.

I remember when you were little, how you would twirl in your princess dresses and dream of your wedding day. Now that day is here, and it''s even more magical than I could have imagined.

[PERSONAL_MEMORY] - This memory always brings a smile to my face and reminds me of the wonderful person you''ve become.

As you begin this new chapter of your life, I want you to know:

• You are loved beyond measure, not just by me, but by everyone whose life you''ve touched
• You have the strength and wisdom to build a beautiful marriage
• Your mother and I will always be here for you, no matter what
• Marriage is a partnership built on love, respect, and laughter
• Never stop being the amazing woman you are

[SPECIAL_ADVICE] - This is something I wish someone had told me when I was your age.

Today, as you walk down the aisle, know that you carry with you all the love, prayers, and hopes of everyone who has watched you grow. You are ready for this beautiful journey.

With all my love and pride,
Dad

P.S. [PERSONAL_NOTE] - This is something I''ve always wanted to tell you but never found the right moment.', 
'["RECIPIENT_NAME", "PERSONAL_MEMORY", "SPECIAL_ADVICE", "PERSONAL_NOTE"]', 1),

('Wedding Wisdom Letter', 'Fatherly wisdom for your son''s wedding day', 'wedding',
'My Son,

Today you become a husband, and I couldn''t be prouder of the man you''ve become. As I watch you take this step, I want to share with you the wisdom I''ve gathered over the years about love, marriage, and being a good husband.

[PERSONAL_MEMORY] - This moment showed me the kind of man you would grow to be.

Marriage is not just about finding the right person; it''s about being the right person. Here''s what I''ve learned:

• Love is a choice you make every day, not just a feeling
• Listen more than you speak, especially when she''s upset
• Date your wife even after you''re married
• Be her biggest supporter and her safe place
• Never go to bed angry - work it out before you sleep
• Laugh together often - it''s the glue that holds everything together

[SPECIAL_ADVICE] - This is the most important lesson I''ve learned about marriage.

Your mother has been my greatest teacher in love. She showed me that true love is patient, kind, and always puts the other person first. I hope you and [SPOUSE_NAME] will have the same kind of love that grows stronger with each passing year.

Remember, being a husband is one of the greatest responsibilities and privileges a man can have. You''re not just gaining a wife; you''re gaining a partner for life''s greatest adventure.

I love you, son, and I''m so proud of the man you''ve become.

Dad

P.S. [PERSONAL_NOTE] - This is something I''ve been wanting to tell you.', 
'["PERSONAL_MEMORY", "SPECIAL_ADVICE", "SPOUSE_NAME", "PERSONAL_NOTE"]', 2),

-- Graduation Templates  
('Graduation Pride Letter', 'Celebrating your child''s graduation', 'graduation',
'My Dearest [RECIPIENT_NAME],

As I watch you in your cap and gown, I am overwhelmed with pride and joy. This moment represents so much more than just completing your education - it represents the incredible person you''ve become.

[PERSONAL_MEMORY] - This memory from your school years always makes me smile.

I remember when you were little, how you would ask endless questions about everything. That curiosity and determination have brought you to this moment, and I know they will take you far in life.

As you step into this new chapter, I want you to know:

• You have already made me so proud - this diploma is just the beginning
• Your hard work and dedication have paid off in ways that go beyond grades
• You have the character and values that will guide you through any challenge
• Never stop learning, growing, and asking questions
• Trust yourself - you know more than you think you do

[SPECIAL_ADVICE] - This is the most important thing I want you to remember as you move forward.

The world is waiting for someone exactly like you - someone with your unique gifts, your kind heart, and your determination. Don''t be afraid to be yourself, to take risks, and to follow your dreams.

[FUTURE_HOPES] - These are my hopes for your future.

No matter where life takes you, remember that you always have a home here, and you always have people who love and believe in you unconditionally.

Congratulations, [RECIPIENT_NAME]. You did it, and I couldn''t be prouder.

With all my love and pride,
Dad

P.S. [PERSONAL_NOTE] - This is something I''ve been wanting to tell you.', 
'["RECIPIENT_NAME", "PERSONAL_MEMORY", "SPECIAL_ADVICE", "FUTURE_HOPES", "PERSONAL_NOTE"]', 3),

-- Birthday Templates
('Milestone Birthday Letter', 'A special letter for a milestone birthday', 'birthday',
'My Dearest [RECIPIENT_NAME],

Happy [AGE]th Birthday! As I think about all the years that have brought us to this moment, I am filled with gratitude for the incredible person you''ve become.

[PERSONAL_MEMORY] - This memory from when you were younger always brings me joy.

Each year of your life has been a gift to me. I''ve watched you grow, learn, stumble, and rise again. I''ve seen your kindness, your strength, your humor, and your heart. You are truly one of the greatest blessings of my life.

At [AGE] years old, you are at such an exciting time in life. You have:

• The wisdom that comes from experience
• The energy and enthusiasm of youth
• The character that will guide you through any challenge
• The love and support of family and friends who believe in you

[SPECIAL_ADVICE] - This is what I want you to know as you celebrate this milestone.

[FUTURE_HOPES] - These are my hopes for your next year and beyond.

Life is a beautiful journey, and you are living it with such grace and purpose. Don''t ever forget how loved you are, how proud I am of you, and how much potential you have to make this world a better place.

Here''s to another year of adventures, growth, and joy. May this new year of life bring you everything your heart desires and more.

Happy Birthday, [RECIPIENT_NAME]. You are loved beyond measure.

With all my love,
Dad

P.S. [PERSONAL_NOTE] - This is something special I want you to know on your birthday.', 
'["RECIPIENT_NAME", "AGE", "PERSONAL_MEMORY", "SPECIAL_ADVICE", "FUTURE_HOPES", "PERSONAL_NOTE"]', 4),

-- General Love Letters
('Love Letter to My Wife', 'A heartfelt letter expressing love and appreciation', 'general',
'My Dearest [RECIPIENT_NAME],

As I sit down to write this letter, I find myself overwhelmed with gratitude for the incredible woman you are and the beautiful life we''ve built together.

[PERSONAL_MEMORY] - This memory always reminds me of why I fell in love with you.

You have been my partner, my best friend, my greatest supporter, and the love of my life. Through all the ups and downs, the laughter and tears, the challenges and celebrations, you have been my constant source of strength and joy.

I want you to know:

• You are more beautiful today than the day I married you
• Your love has made me a better man
• You are an incredible mother to our children
• Your strength and grace inspire me every day
• I am so grateful for every moment we''ve shared

[SPECIAL_ADVICE] - This is what I want you to remember about yourself.

[FUTURE_HOPES] - These are my hopes for our future together.

Thank you for choosing me, for loving me, and for building this beautiful life with me. You are my greatest blessing, and I love you more than words can express.

Forever yours,
[YOUR_NAME]

P.S. [PERSONAL_NOTE] - This is something I''ve been wanting to tell you.', 
'["RECIPIENT_NAME", "PERSONAL_MEMORY", "SPECIAL_ADVICE", "FUTURE_HOPES", "YOUR_NAME", "PERSONAL_NOTE"]', 5),

-- Estate Planning Templates
('Final Love Letter', 'A letter to be read after you''re gone', 'estate',
'My Dearest Family,

If you''re reading this, it means I''ve completed my journey on this earth. While I wish I could be there with you in person, I want you to know that my love for you transcends time and space.

[PERSONAL_MEMORY] - This memory captures everything I want you to remember about our time together.

I want you to know:

• You were the greatest joy and purpose of my life
• I am so proud of the people you''ve become
• My love for you will never end
• I believe in you and your ability to handle whatever comes your way
• You have everything you need within you to live a beautiful life

[SPECIAL_ADVICE] - This is the most important thing I want you to remember.

[FUTURE_HOPES] - These are my hopes for your future.

Please don''t grieve too long. Celebrate the life we shared, the love we had, and the memories we made. Live fully, love deeply, and never forget how much you mean to me.

I will always be with you in your hearts, in your memories, and in the love that connects us all.

With eternal love,
Dad

P.S. [PERSONAL_NOTE] - This is my final message to you.', 
'["PERSONAL_MEMORY", "SPECIAL_ADVICE", "FUTURE_HOPES", "PERSONAL_NOTE"]', 6);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_legacy_templates_category ON public.legacy_templates(category);
CREATE INDEX IF NOT EXISTS idx_legacy_templates_active ON public.legacy_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON public.template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_template_id ON public.vault_items(template_id);
