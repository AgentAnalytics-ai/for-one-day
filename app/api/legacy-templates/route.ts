/**
 * 📝 Legacy Note Templates API
 * Provides comprehensive templates for different life moments and family situations
 */

import { NextRequest, NextResponse } from 'next/server'

// Comprehensive legacy note templates
const LEGACY_TEMPLATES = {
  milestones: [
    {
      id: 'wedding-day',
      title: 'Wedding Day Letter',
      description: 'A letter for your daughter or son on their wedding day',
      template: `My Dearest [Name],

On this, your wedding day, my heart is full of joy and pride. I remember the day you were born, and now I watch as you begin this beautiful new chapter of your life.

Marriage is one of God's greatest gifts. It's not always easy, but it's always worth it. Here's what I want you to remember:

1. Love is a choice you make every day, not just a feeling
2. Put God at the center of your marriage
3. Never stop dating your spouse
4. Learn to forgive quickly and completely
5. Laugh together often

I pray that your marriage will be a reflection of God's love for His people. May you grow together in faith, love, and wisdom.

With all my love,
Dad

P.S. Remember the family values we've talked about - they will guide you through any storm.`,
      category: 'milestones',
      tags: ['wedding', 'marriage', 'family', 'love']
    },
    {
      id: 'first-child',
      title: 'Becoming a Parent',
      description: 'Advice for when your child becomes a parent',
      template: `Dear [Name],

Congratulations on becoming a parent! This is one of life's greatest adventures and responsibilities.

I remember the day you were born - the overwhelming love, the fear of not being good enough, the joy of holding you for the first time. You're about to experience all of that and more.

Here's what I learned about being a father:

1. You'll make mistakes - that's okay, just learn from them
2. Your child will teach you as much as you teach them
3. Time goes by faster than you think - cherish every moment
4. Pray for your child every day
5. Lead by example - they're always watching

The most important thing is to love them unconditionally, just as God loves us. Show them Jesus through your actions, not just your words.

I'm so proud of the person you've become, and I know you'll be an amazing parent.

With love and pride,
Dad`,
      category: 'milestones',
      tags: ['parenting', 'advice', 'family', 'children']
    },
    {
      id: 'graduation',
      title: 'Graduation Day',
      description: 'A letter for graduation day',
      template: `Dear [Name],

Today marks the end of one chapter and the beginning of another. I'm so proud of all you've accomplished.

Education is important, but character is everything. As you move into this next phase of life, remember:

1. Your integrity is your most valuable asset
2. Work hard, but don't forget to rest
3. Surround yourself with people who make you better
4. Never stop learning
5. Trust God with your future

I believe in you and the person you're becoming. The world needs people like you - people of character, faith, and compassion.

Go make a difference in the world, but never forget where you came from and who you belong to.

With love and pride,
Dad`,
      category: 'milestones',
      tags: ['graduation', 'education', 'future', 'character']
    }
  ],
  wisdom: [
    {
      id: 'life-lessons',
      title: 'Life Lessons I Want You to Know',
      description: 'Important life lessons and wisdom to pass down',
      template: `My Dear [Name],

As I reflect on my life, there are some lessons I've learned that I want to share with you:

**On Faith:**
- God is always with you, even in the darkest times
- Prayer changes things, but it also changes you
- Read your Bible daily - it's your roadmap for life

**On Character:**
- Your word is your bond - keep your promises
- Treat everyone with respect, regardless of their position
- Admit when you're wrong and apologize quickly

**On Relationships:**
- Choose your friends wisely - they influence who you become
- Love your family fiercely - they're your greatest treasure
- Forgive others as you want to be forgiven

**On Work:**
- Do your best work, even when no one is watching
- Be honest in all your dealings
- Use your talents to serve others

**On Money:**
- Save for the future, but don't hoard
- Give generously - you can't outgive God
- Don't let money control your decisions

Remember, these aren't just my words - they're principles that have stood the test of time. Live by them, and you'll have a life well-lived.

With love,
Dad`,
      category: 'wisdom',
      tags: ['life lessons', 'wisdom', 'character', 'faith']
    },
    {
      id: 'overcoming-failure',
      title: 'When You Face Failure',
      description: 'Encouragement for when life gets tough',
      template: `Dear [Name],

I know you're going through a difficult time right now. I want you to know that failure is not the end - it's often the beginning of something better.

Here's what I've learned about failure:

1. **Everyone fails** - even the most successful people
2. **Failure teaches us** - it shows us what doesn't work
3. **Failure builds character** - it makes us stronger
4. **Failure is temporary** - this too shall pass
5. **God uses failure** - He can turn any situation around

Remember these verses that have helped me:
- "And we know that in all things God works for the good of those who love him" (Romans 8:28)
- "I can do all this through him who gives me strength" (Philippians 4:13)

Don't give up. Don't lose hope. This is just one chapter in your story, not the whole book.

I believe in you, and more importantly, God believes in you. He has a plan for your life, even when you can't see it.

With love and prayers,
Dad`,
      category: 'wisdom',
      tags: ['failure', 'encouragement', 'hope', 'perseverance']
    }
  ],
  family: [
    {
      id: 'family-values',
      title: 'Our Family Values',
      description: 'The values that define our family',
      template: `Dear [Name],

I want to make sure you know what our family stands for. These are the values that have guided us and should guide you:

**Faith First**
- God is the foundation of everything we do
- We pray together and read the Bible together
- We trust God with our future

**Love Unconditionally**
- We love each other no matter what
- We forgive quickly and completely
- We support each other through thick and thin

**Work Hard**
- We give our best effort in everything we do
- We don't give up when things get tough
- We take pride in our work

**Be Honest**
- We tell the truth, even when it's hard
- We admit our mistakes
- We keep our promises

**Serve Others**
- We help those in need
- We put others before ourselves
- We use our gifts to make the world better

**Have Fun**
- We laugh together often
- We make time for each other
- We create memories that last a lifetime

These values have made our family strong. Pass them on to your children, and they will make your family strong too.

With love,
Dad`,
      category: 'family',
      tags: ['family values', 'tradition', 'heritage', 'legacy']
    },
    {
      id: 'family-stories',
      title: 'Family Stories and Memories',
      description: 'Share important family stories and memories',
      template: `Dear [Name],

I want to share some of our family stories with you - the good, the funny, and the meaningful ones that have shaped who we are.

**The Story of How I Met Your Mother:**
[Share the story of how you met your spouse]

**The Day You Were Born:**
[Share the story of their birth]

**Our Family Traditions:**
[Share about family traditions, holidays, etc.]

**Funny Family Moments:**
[Share funny stories and memories]

**Times We Overcame Challenges:**
[Share stories of resilience and faith]

**Lessons from Your Grandparents:**
[Share wisdom from previous generations]

These stories are part of who you are. They connect you to your past and give you strength for your future. Share them with your children so they know where they come from.

Remember, every family has a story. Ours is one of faith, love, and perseverance. I'm proud to be part of it, and I'm proud that you're part of it too.

With love,
Dad`,
      category: 'family',
      tags: ['family stories', 'memories', 'traditions', 'heritage']
    }
  ],
  practical: [
    {
      id: 'financial-wisdom',
      title: 'Financial Wisdom',
      description: 'Practical advice about money and finances',
      template: `Dear [Name],

I want to share some financial wisdom that I've learned over the years. Money isn't everything, but it's important to handle it wisely.

**Basic Principles:**
1. **Live below your means** - Don't spend everything you earn
2. **Save first** - Pay yourself before you pay others
3. **Avoid debt** - Especially consumer debt like credit cards
4. **Invest for the future** - Start early and be consistent
5. **Give generously** - You can't outgive God

**Practical Tips:**
- Create a budget and stick to it
- Build an emergency fund (3-6 months of expenses)
- Save for retirement from your first paycheck
- Buy used cars and drive them until they die
- Cook at home more than you eat out
- Don't try to keep up with the Joneses

**What Money Can't Buy:**
- Peace of mind
- True friendships
- Family relationships
- Character
- Eternal life

Remember, money is a tool, not a goal. Use it to provide for your family, help others, and advance God's kingdom.

The best investment you can make is in your relationship with God and your family.

With love,
Dad`,
      category: 'practical',
      tags: ['money', 'finances', 'budgeting', 'investing']
    },
    {
      id: 'career-advice',
      title: 'Career and Work Advice',
      description: 'Guidance for career and work decisions',
      template: `Dear [Name],

As you navigate your career, I want to share some advice that has served me well:

**Finding Your Calling:**
- Pray about your career decisions
- Use your God-given talents and gifts
- Consider how your work can serve others
- Don't just chase money - chase purpose

**Work Ethic:**
- Show up on time and prepared
- Do more than what's expected
- Be honest in all your dealings
- Treat everyone with respect
- Take responsibility for your mistakes

**Building Relationships:**
- Network with integrity
- Be a team player
- Help others succeed
- Don't burn bridges
- Keep your word

**Dealing with Challenges:**
- Don't give up too easily
- Learn from failures
- Ask for help when you need it
- Stay positive and professional
- Trust God with your career

**Work-Life Balance:**
- Don't let work consume your life
- Make time for family and faith
- Take care of your health
- Remember what's truly important

Your career is important, but it's not everything. Don't sacrifice your family, your faith, or your character for success.

With love and support,
Dad`,
      category: 'practical',
      tags: ['career', 'work', 'calling', 'success']
    }
  ],
  spiritual: [
    {
      id: 'faith-journey',
      title: 'My Faith Journey',
      description: 'Share your personal faith story',
      template: `Dear [Name],

I want to share my faith journey with you - the ups and downs, the doubts and certainties, the moments when God felt close and the times when He seemed far away.

**How I Came to Faith:**
[Share your conversion story or how you came to know God]

**Key Moments in My Faith:**
[Share significant spiritual milestones]

**Times I Struggled with Doubt:**
[Share honest struggles and how you worked through them]

**How God Has Provided:**
[Share stories of God's provision and faithfulness]

**What I've Learned About Prayer:**
[Share insights about prayer and relationship with God]

**Scriptures That Have Shaped Me:**
[Share key Bible verses and how they've impacted you]

**My Hope for Your Faith:**
- That you would know God personally, not just know about Him
- That you would experience His love and grace
- That you would find peace in His presence
- That you would trust Him with your life

Faith is a journey, not a destination. There will be times of doubt and struggle, but God is faithful. He will never leave you or forsake you.

Keep seeking Him, keep praying, keep reading His Word. He will meet you where you are.

With love and prayers,
Dad`,
      category: 'spiritual',
      tags: ['faith', 'spiritual journey', 'testimony', 'God']
    },
    {
      id: 'prayer-guide',
      title: 'How to Pray',
      description: 'A guide to developing a prayer life',
      template: `Dear [Name],

Prayer is one of the most important things I can teach you. It's how we communicate with God, and it's how He transforms our lives.

**Why Pray?**
- God wants to hear from you
- Prayer changes things
- Prayer changes you
- It's how we grow closer to God

**How to Pray:**
1. **Start with praise** - Thank God for who He is
2. **Confess your sins** - Ask for forgiveness
3. **Thank Him** - Count your blessings
4. **Ask for help** - Bring your needs to Him
5. **Listen** - Take time to hear from God

**What to Pray For:**
- Your family and friends
- Your church and community
- Your country and leaders
- Your own spiritual growth
- God's will to be done

**When to Pray:**
- Start your day with prayer
- Pray before meals
- Pray before important decisions
- Pray when you're worried or afraid
- Pray before bed

**Prayer Promises:**
- "Ask and it will be given to you" (Matthew 7:7)
- "The prayer of a righteous person is powerful and effective" (James 5:16)
- "If we ask anything according to his will, he hears us" (1 John 5:14)

Remember, prayer is not about getting what you want - it's about aligning your heart with God's heart.

Keep praying, even when you don't feel like it. God is listening.

With love,
Dad`,
      category: 'spiritual',
      tags: ['prayer', 'spiritual growth', 'relationship with God']
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const id = searchParams.get('id')

    if (id) {
      // Return specific template
      for (const templates of Object.values(LEGACY_TEMPLATES)) {
        const template = templates.find(t => t.id === id)
        if (template) {
          return NextResponse.json({
            success: true,
            template
          })
        }
      }
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (category) {
      // Return templates for specific category
      const templates = LEGACY_TEMPLATES[category as keyof typeof LEGACY_TEMPLATES] || []
      return NextResponse.json({
        success: true,
        templates
      })
    }

    // Return all templates organized by category
    return NextResponse.json({
      success: true,
      templates: LEGACY_TEMPLATES
    })

  } catch (error) {
    console.error('Error fetching legacy templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}