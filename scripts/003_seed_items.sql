-- Seed sample items for browsing (using a service role approach)
-- These will be visible to all users but not owned by anyone with RLS
-- We'll insert them with owner_id as a placeholder; in production, real users list items.

-- First, let's create a helper to get category IDs
do $$
declare
  cat_calculators uuid;
  cat_party uuid;
  cat_costumes uuid;
  cat_textbooks uuid;
  cat_electronics uuid;
  cat_sports uuid;
  cat_kitchen uuid;
  cat_furniture uuid;
begin
  select id into cat_calculators from public.categories where slug = 'calculators';
  select id into cat_party from public.categories where slug = 'party-decorations';
  select id into cat_costumes from public.categories where slug = 'halloween-costumes';
  select id into cat_textbooks from public.categories where slug = 'textbooks';
  select id into cat_electronics from public.categories where slug = 'electronics';
  select id into cat_sports from public.categories where slug = 'sports-equipment';
  select id into cat_kitchen from public.categories where slug = 'kitchen-appliances';
  select id into cat_furniture from public.categories where slug = 'furniture';

  -- Create a demo user in auth.users for seeding
  -- (This is safe for development; in production, users sign up normally)
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  values (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo@campusrent.com',
    crypt('demopassword123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Campus Demo"}'
  )
  on conflict (id) do nothing;

  -- Ensure profile exists
  insert into public.profiles (id, display_name, university)
  values ('a0000000-0000-0000-0000-000000000001', 'Campus Demo', 'State University')
  on conflict (id) do nothing;

  -- Seed items
  insert into public.items (owner_id, category_id, title, description, price_per_day, location, condition, is_available) values
    ('a0000000-0000-0000-0000-000000000001', cat_calculators, 'TI-84 Plus CE', 'Graphing calculator in great condition. Perfect for calculus and statistics classes.', 2.50, 'North Campus Dorms', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_calculators, 'Casio FX-991EX', 'Scientific calculator, great for engineering courses.', 1.00, 'Engineering Building', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_party, 'LED String Lights (100ft)', 'Warm white LED string lights, perfect for dorm parties or events.', 3.00, 'South Campus', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_party, 'Disco Ball + Speaker Set', 'Mirror disco ball with Bluetooth speaker combo. Party starter kit.', 5.00, 'Greek Row', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_party, 'Balloon Arch Kit', 'Complete balloon arch decoration kit with pump. Multiple colors included.', 4.00, 'Student Center', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_costumes, 'Inflatable T-Rex Costume', 'Full-body inflatable dinosaur costume. Battery-powered fan included.', 8.00, 'West Campus', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_costumes, 'Vampire Cape & Accessories', 'Full vampire costume set with cape, teeth, and makeup kit.', 5.00, 'East Dorms', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_costumes, 'Retro 80s Outfit Set', 'Neon leg warmers, headband, sunglasses, and more. Fits most sizes.', 4.00, 'South Campus', 'fair', true),
    ('a0000000-0000-0000-0000-000000000001', cat_textbooks, 'Organic Chemistry (McMurry 9th Ed)', 'Standard organic chemistry textbook. Some highlighting inside.', 1.50, 'Library', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_textbooks, 'Introduction to Algorithms (CLRS)', 'Classic CS algorithms textbook. Hardcover, no markings.', 2.00, 'CS Building', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_electronics, 'iPad Air (10th Gen) with Pencil', 'iPad Air with Apple Pencil. Great for note-taking in lectures.', 10.00, 'North Campus', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_electronics, 'Portable Projector', 'Mini projector with HDMI. Perfect for movie nights or presentations.', 7.00, 'Student Center', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_sports, 'Yoga Mat & Block Set', 'Non-slip yoga mat with 2 foam blocks. Clean and barely used.', 1.50, 'Rec Center', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_sports, 'Basketball (Official Size)', 'Spalding indoor/outdoor basketball. Good grip, holds air well.', 1.00, 'Gym', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_kitchen, 'Instant Pot (6qt)', 'Electric pressure cooker. Comes with recipe booklet.', 3.00, 'East Dorms', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_kitchen, 'Blender (NutriBullet)', 'Personal blender for smoothies. Comes with 2 cups.', 2.00, 'West Campus', 'like-new', true),
    ('a0000000-0000-0000-0000-000000000001', cat_furniture, 'Foldable Study Desk', 'Compact desk that folds flat. Perfect for small dorm rooms.', 3.00, 'North Campus Dorms', 'good', true),
    ('a0000000-0000-0000-0000-000000000001', cat_furniture, 'Bean Bag Chair (Large)', 'Comfortable bean bag, great for lounging. Washable cover.', 2.50, 'South Campus', 'fair', true)
  on conflict do nothing;

  -- Seed some reviews
  insert into public.reviews (item_id, reviewer_id, rating, comment)
  select i.id, 'a0000000-0000-0000-0000-000000000001', 
    case 
      when random() < 0.3 then 5
      when random() < 0.6 then 4
      else 3
    end,
    case 
      when random() < 0.33 then 'Great item, exactly as described!'
      when random() < 0.66 then 'Good condition, would rent again.'
      else 'Worked perfectly for what I needed.'
    end
  from public.items i
  limit 10;

end;
$$;
