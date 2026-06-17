import { PrismaClient, UserRole, PostType, CommunityType, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';

const AVATAR_BASE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';
const COVER_BASE = 'https://images.unsplash.com/photo-';
const THUMB_BASE = 'https://images.unsplash.com/photo-';
const VIDEO_BASE = 'https://test-videos.co.uk/vids/';
const WORKING_VIDEOS = [
  'bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
];

const USERS = [
  { username: 'superadmin', email: 'superadmin@kida.dev', displayName: 'Kida System', bio: 'Platform administrator and creator of KIDA. Building the future of social conversations.', role: UserRole.SUPER_ADMIN, verified: true, avatar: 'superadmin', cover: '1618005182384-a83a8bd57fbe', location: 'San Francisco, CA', website: 'https://kida.app' },
  { username: 'admin', email: 'admin@kida.dev', displayName: 'Alex Rivera', bio: 'Community manager at KIDA. Helping creators grow and communities thrive.', role: UserRole.ADMIN, verified: true, avatar: 'admin', cover: '1497366216548-37526070297c', location: 'New York, NY', website: 'https://kida.app/community' },
  { username: 'moderator1', email: 'moderator@kida.dev', displayName: 'Sarah Chen', bio: 'Keeping KIDA safe and welcoming. Content moderator with a passion for healthy discussions.', role: UserRole.MODERATOR, verified: true, avatar: 'mod1', cover: '1504384308090-c5e6bae2acc8', location: 'Toronto, Canada', website: null },
  { username: 'moderator2', email: 'moderator2@kida.dev', displayName: 'James Wilson', bio: 'Tech moderator and open source enthusiast. Let us build better communities together.', role: UserRole.MODERATOR, verified: true, avatar: 'mod2', cover: '1519389950473-47ba0277781c', location: 'London, UK', website: 'https://jameswilson.dev' },
  { username: 'creator1', email: 'creator1@kida.dev', displayName: 'Luna Martinez', bio: 'Digital artist & storyteller. Creating visual narratives that inspire. KIDA Creator Program member.', role: UserRole.CREATOR, verified: true, avatar: 'luna', cover: '1557672177-2987970f4f4e', location: 'Los Angeles, CA', website: 'https://lunamartinez.art' },
  { username: 'creator2', email: 'creator2@kida.dev', displayName: 'Marcus Johnson', bio: 'Tech reviewer and gaming content creator. Breaking down the latest in tech and entertainment.', role: UserRole.CREATOR, verified: true, avatar: 'marcus', cover: '1558618666-fcd25c85f82e', location: 'Austin, TX', website: 'https://marcusj.tech' },
  { username: 'creator3', email: 'creator3@kida.dev', displayName: 'Priya Patel', bio: 'Education content creator. Making complex topics simple through short-form videos and threads.', role: UserRole.CREATOR, verified: true, avatar: 'priya', cover: '1522202176988-66273c2e55e4', location: 'Mumbai, India', website: 'https://priyapatel.dev' },
  { username: 'creator4', email: 'creator4@kida.dev', displayName: 'Zack Thompson', bio: 'Gaming streamer and esports commentator. Catch me live on KIDA Video!', role: UserRole.CREATOR, verified: true, avatar: 'zack', cover: '1492691527719-9f2c8462c4c7', location: 'Seattle, WA', website: null },
  { username: 'creator5', email: 'creator5@kida.dev', displayName: 'Maya Williams', bio: 'Film critic and entertainment journalist. Reviews, analyses, and hot takes on the latest movies.', role: UserRole.CREATOR, verified: true, avatar: 'maya', cover: '1518026011104-acc5e37d210c', location: 'Chicago, IL', website: 'https://mayawrites.com' },
  { username: 'creator6', email: 'creator6@kida.dev', displayName: 'Kenji Tanaka', bio: 'Anime culture explorer. Manga artist and community builder. Join the KIDA Anime community!', role: UserRole.CREATOR, verified: true, avatar: 'kenji', cover: '1549490349-8643362247b7', location: 'Tokyo, Japan', website: 'https://kenjitanaka.jp' },
  { username: 'user1', email: 'user1@kida.dev', displayName: 'Emily Clark', bio: 'Software engineer by day, reader by night. Love discovering new creators on KIDA.', role: UserRole.USER, verified: false, avatar: 'emily', cover: '1497366811353-6870744d04b2', location: 'Portland, OR', website: null },
  { username: 'user2', email: 'user2@kida.dev', displayName: 'David Park', bio: 'Photography enthusiast and travel blogger. Capturing moments around the world.', role: UserRole.USER, verified: false, avatar: 'david', cover: '1506744038136-46273834b3fb', location: 'Seoul, South Korea', website: 'https://davidpark.photos' },
  { username: 'user3', email: 'user3@kida.dev', displayName: 'Olivia Brown', bio: 'Music producer and sound designer. Always exploring new genres and sounds.', role: UserRole.USER, verified: false, avatar: 'olivia', cover: '1493225457124-1507b0d0170b', location: 'Nashville, TN', website: null },
  { username: 'user4', email: 'user4@kida.dev', displayName: 'Ethan Foster', bio: 'Fitness coach and nutrition enthusiast. Sharing workout tips and healthy recipes.', role: UserRole.USER, verified: false, avatar: 'ethan', cover: '1534251369789-5067c8b8602a', location: 'Denver, CO', website: 'https://ethanfoster.fit' },
  { username: 'user5', email: 'user5@kida.dev', displayName: 'Sophia Lee', bio: 'Fashion and lifestyle blogger. Exploring the intersection of style and sustainability.', role: UserRole.USER, verified: false, avatar: 'sophia', cover: '1515886657613-9f1cbf0c3f3e', location: 'Paris, France', website: null },
  { username: 'user6', email: 'user6@kida.dev', displayName: 'Ryan Mitchell', bio: 'Casual gamer and tech enthusiast. Here for the communities and discussions.', role: UserRole.USER, verified: false, avatar: 'ryan', cover: '1558618666-fcd25c85f82e', location: 'Boston, MA', website: null },
  { username: 'user7', email: 'user7@kida.dev', displayName: 'Aisha Patel', bio: 'Medical student with a love for science communication. Making health topics accessible.', role: UserRole.USER, verified: false, avatar: 'aisha', cover: '1576091160550-2173dba999ef', location: 'Atlanta, GA', website: null },
  { username: 'user8', email: 'user8@kida.dev', displayName: 'Noah Garcia', bio: 'Startup founder and product designer. Building the next big thing in edtech.', role: UserRole.USER, verified: false, avatar: 'noah', cover: '1512753267274-f7a70f7b3c18', location: 'San Diego, CA', website: 'https://noahgarcia.io' },
  { username: 'user9', email: 'user9@kida.dev', displayName: 'Isabella Santos', bio: 'Chef and food content creator. Sharing recipes from my kitchen to yours.', role: UserRole.USER, verified: false, avatar: 'isabella', cover: '1555396274-76e7b1e4f6d4', location: 'Barcelona, Spain', website: null },
  { username: 'user10', email: 'user10@kida.dev', displayName: 'Liam O\'Brien', bio: 'Student and part-time writer. Love reading threads and discovering new perspectives.', role: UserRole.USER, verified: false, avatar: 'liam', cover: '1504700618610-192f8f8c5f7a', location: 'Dublin, Ireland', website: null },
];

const POST_CONTENT = [
  { text: 'Just launched our new Creator Program at KIDA! 🚀 We are investing $10M to support the next generation of digital storytellers. Applications open now. #KIDA #CreatorEconomy', authorIdx: 0 },
  { text: 'The future of social platforms is about meaningful conversations, not just endless scrolling. That is why we built KIDA the way we did. #Knowledge #Interaction #KIDA', authorIdx: 0 },
  { text: 'We have reached 100K active users! Thank you to every creator and community member who made this possible. This is just the beginning. 🌟 #KIDA #Milestone', authorIdx: 1 },
  { text: 'Hot take: Twitter threads are great but adding video responses takes them to another level. That is what makes KIDA special. What do you think?', authorIdx: 2 },
  { text: 'Just finished my latest digital art piece inspired by retro-futurism. Spent 40 hours on this. Hope you all like it! 🎨 #DigitalArt #RetroFuturism', authorIdx: 4 },
  { text: 'Unboxing the new VR headset today! Full review coming tomorrow. Spoiler: it is incredible for the price point. #Tech #VR #Review', authorIdx: 5 },
  { text: 'New thread: Understanding Quantum Computing in 10 minutes. I break down qubits, superposition, and entanglement with simple analogies. 🧵 #QuantumComputing #Education', authorIdx: 6 },
  { text: 'Just hit Grandmaster in ranked! 🏆 500 hours of grind, countless strategizing, and it all paid off. Stream highlights coming soon. #Gaming #Esports', authorIdx: 7 },
  { text: 'My top 10 films of 2025 so far. Oppenheimer still holds the top spot but Dune 2 came very close. What are your favorites? 🎬 #Movies #FilmTwitter', authorIdx: 8 },
  { text: 'New manga chapter analysis: The hidden symbolism in the latest arc is absolutely brilliant. Breaking it all down in this thread. 🧵 #Anime #Manga', authorIdx: 9 },
  { text: 'Created a new series called "Code in 60" where I explain programming concepts in 60 seconds. First episode: What is an API? 🎥 #Programming #TechEducation', authorIdx: 4 },
  { text: 'Reviewing the new MacBook Pro M4 after two weeks of daily use. Performance is insane but let me talk about battery life... 🧵 #Apple #Tech', authorIdx: 5 },
  { text: 'The best study techniques I have found after 10 years of teaching: 1. Active recall 2. Spaced repetition 3. Teaching others. Thread below has detailed explanations. #Education #StudyTips', authorIdx: 6 },
  { text: 'Valorant tournament this weekend! Team KIDA is competing. Wish us luck! 🔥 #Valorant #Gaming', authorIdx: 7 },
  { text: 'Just watched the new Nolan film. No spoilers but it is his most ambitious work yet. The sound design alone deserves an Oscar. #Movies #Nolan', authorIdx: 8 },
  { text: 'Anime of the season rankings: 1. Solo Leveling 2. Demon Slayer 3. Oshi no Ko. What is your top 3? #Anime #SeasonRanking', authorIdx: 9 },
  { text: 'KIDA now supports 4K video uploads for verified creators! Upload your content in stunning quality. #KIDA #VideoUpdate', authorIdx: 1 },
  { text: 'The creator economy is projected to reach $500B by 2027. Here is why platforms like KIDA are essential for creator success. 🧵 #CreatorEconomy', authorIdx: 2 },
  { text: 'My workflow for digital art: iPad Pro + Procreate + 4 hours of focus music. The results speak for themselves. What is your creative process? 🎨', authorIdx: 4 },
  { text: 'The new Ryzen chips are absolutely demolishing Intel in multi-core performance. Here are the benchmarks... 🧵 #AMD #Tech', authorIdx: 5 },
  { text: 'Why do we sleep? Thread on the fascinating science of sleep, dreaming, and why your brain needs 8 hours. 🧵 #Science #Health', authorIdx: 6 },
  { text: 'The fighting game community is growing like crazy. Street Fighter 6 tournaments have been incredible to watch. Who is your main? 🎮 #FGC #Gaming', authorIdx: 7 },
  { text: 'Inception is still Christopher Nolan best film and I will die on this hill. The ending is perfect because it does not matter if the top falls. #Movies #HotTake', authorIdx: 8 },
  { text: 'The art style in the new Ghibli film is breathtaking. Hand-drawn animation will never die as long as studios like this exist. #Ghibli #Anime', authorIdx: 9 },
  { text: 'Community feature update: You can now schedule posts in your communities! Plan your content calendar in advance. 📅 #KIDA #CommunityUpdate', authorIdx: 1 },
  { text: 'If you are new to KIDA, here is a starter guide: Follow creators you love, join communities you care about, and start conversations that matter. Welcome! 🌟', authorIdx: 3 },
  { text: 'The psychology of color in branding is fascinating. Blue builds trust, red creates urgency, green represents growth. Here is how top brands use it... 🧵 #Design #Branding', authorIdx: 4 },
  { text: 'Building my first custom PC! Wish me luck. RTX 5090, 128GB RAM, custom water cooling. Going all out. 🖥️ #PCBuild #Tech', authorIdx: 5 },
  { text: 'The math behind machine learning is not as scary as it seems. Let me break down gradient descent in plain English. 🧵 #AI #MachineLearning', authorIdx: 6 },
  { text: 'Evo 2025 was insane! The grand finals sets were some of the best I have ever seen. Here are my highlights... 🎮 #Evo2025 #Gaming', authorIdx: 7 },
  { text: 'The rise of anime in mainstream Western media is incredible to witness. From niche to dominating Netflix charts. #Anime #Mainstream', authorIdx: 9 },
  { text: 'KIDA is open sourcing our recommendation algorithm! We believe in transparency. Check out the repo. 🔓 #OpenSource #KIDA', authorIdx: 0 },
  { text: 'Best productivity tools I use daily as a creator: Notion for planning, KIDA for engagement, Canva for thumbnails. What are your essentials? 🛠️', authorIdx: 4 },
  { text: 'The Steam Summer Sale is dangerous for my wallet. Already bought 15 games I will probably never play. Send help. 🎮 #SteamSale #Gaming', authorIdx: 7 },
  { text: 'K-Dramas are taking over the world and I am here for it. Just finished Extraordinary Attorney Woo and it is a masterpiece. #KDrama #Entertainment', authorIdx: 8 },
  { text: 'Just discovered this amazing indie artist on KIDA. The algorithm actually recommended something good for once! Check them out. 🔥 #Discovery #Music', authorIdx: 10 },
  { text: 'Staying up late to watch the SpaceX launch. The fact that we can watch rockets land themselves is still mind-blowing. 🚀 #Space #Tech', authorIdx: 11 },
  { text: 'Started learning Japanese last month. Any good resources for beginners? So far Duolingo is fun but I need more structured lessons. #Learning #Japanese', authorIdx: 12 },
  { text: 'My fitness journey: 6 months ago I could not run a mile. Today I finished my first 10K. Consistency > perfection. 💪 #Fitness #Motivation', authorIdx: 13 },
  { text: 'The sustainable fashion movement is gaining momentum. Here are 5 brands doing it right. 🧵 #Fashion #Sustainability', authorIdx: 14 },
];

const VIDEO_DATA = [
  { title: 'Getting Started with KIDA in 2025', description: 'Complete walkthrough of KIDA platform features for new users. From creating your first post to building a community.', tags: ['kida', 'tutorial', 'beginners'], duration: 245, views: 15200, likes: 892, creatorIdx: 4 },
  { title: 'I Built a PC for Under $800', description: 'Budget gaming PC build that actually performs. Full parts list and benchmarks included.', tags: ['tech', 'pcbuild', 'budget'], duration: 620, views: 45300, likes: 2100, creatorIdx: 5 },
  { title: 'Quantum Computing Explained in 5 Minutes', description: 'The simplest explanation of quantum computing you will ever find. No math required.', tags: ['science', 'education', 'quantum'], duration: 310, views: 28700, likes: 1560, creatorIdx: 6 },
  { title: 'Top 10 Gaming Moments of the Month', description: 'Craziest plays, funniest fails, and most epic gaming moments curated just for you.', tags: ['gaming', 'highlights', 'funny'], duration: 480, views: 62100, likes: 3200, creatorIdx: 7 },
  { title: 'Why Dune 2 is a Masterpiece', description: 'Deep dive into the cinematography, sound design, and storytelling of Denis Villeneuve masterpiece.', tags: ['movies', 'review', 'dune'], duration: 900, views: 34100, likes: 1800, creatorIdx: 8 },
  { title: 'Top 10 Anime You Need to Watch', description: 'From hidden gems to absolute classics. This list has something for every anime fan.', tags: ['anime', 'recommendations', 'top10'], duration: 560, views: 52300, likes: 2700, creatorIdx: 9 },
  { title: 'Digital Art Speed Paint - Cyberpunk City', description: 'Watch me create a cyberpunk cityscape from scratch in Procreate. 4 hours compressed into 5 minutes.', tags: ['art', 'speedpaint', 'cyberpunk'], duration: 310, views: 18900, likes: 1100, creatorIdx: 4 },
  { title: 'iPhone 16 Pro vs Samsung S25 Ultra', description: 'The ultimate smartphone comparison after 30 days of using both as daily drivers.', tags: ['tech', 'comparison', 'smartphone'], duration: 780, views: 87600, likes: 3400, creatorIdx: 5 },
  { title: 'How Memory Actually Works', description: 'The fascinating neuroscience of how your brain stores and retrieves memories. Backed by latest research.', tags: ['science', 'brain', 'memory'], duration: 420, views: 23400, likes: 1340, creatorIdx: 6 },
  { title: 'Pro Valorant Tips That Actually Work', description: 'These five tips took me from Gold to Diamond rank. Game sense training included.', tags: ['gaming', 'valorant', 'tips'], duration: 540, views: 39800, likes: 2100, creatorIdx: 7 },
  { title: 'Every Christopher Nolan Movie Ranked', description: 'From Following to Oppenheimer. Ranking all 12 feature films with detailed analysis.', tags: ['movies', 'nolan', 'ranking'], duration: 1200, views: 41200, likes: 1900, creatorIdx: 8 },
  { title: 'How to Draw Anime Faces', description: 'Step by step tutorial for beginners. Master the basics of anime art style.', tags: ['anime', 'art', 'tutorial'], duration: 680, views: 34500, likes: 1900, creatorIdx: 9 },
  { title: 'Day in the Life of a Creator', description: 'Behind the scenes of what it is really like to create content full-time on KIDA.', tags: ['creator', 'lifestyle', 'behindthescenes'], duration: 900, views: 27800, likes: 1560, creatorIdx: 4 },
  { title: 'The State of AI in 2025', description: 'Comprehensive overview of where AI stands today and where it is heading. Featuring latest models and applications.', tags: ['ai', 'technology', 'future'], duration: 1100, views: 65400, likes: 3200, creatorIdx: 5 },
  { title: 'Studio Ghibli Soundtrack Analysis', description: 'Why Joe Hisaishi music is inseparable from the magic of Ghibli films. Musical breakdown.', tags: ['anime', 'music', 'ghibli'], duration: 480, views: 19800, likes: 1200, creatorIdx: 9 },
];

const COMMENT_TEXTS = [
  'This is absolutely incredible! 🔥', 'Great perspective, thanks for sharing!', 'Could not agree more with this take.',
  'I have been saying this for years!', 'Finally someone said it 👏', 'This deserves way more attention.',
  'Love the way you explained this!', 'Bookmarking this for later reference.', 'The effort you put into this shows!',
  'Interesting point, but have you considered...', 'Not sure I agree, but respect the take.', 'This changed my perspective completely.',
  'Can you make a follow-up on this?', 'Sharing this with my team!', 'Underrated post right here.',
  'The production quality is insane!', 'How long did this take to make?', 'More content like this please!',
  'This is why I love KIDA. Quality content.', 'Straight to the point. Love it.', 'Adding my two cents: I think...',
  'This blew my mind 🤯', 'Saving this for later!', 'You make it look so easy!',
  'Finally some quality content on my feed.', 'The details in this are amazing.', 'Would love to collaborate sometime!',
];

const GROUP_CHATS = [
  {
    name: 'KIDA Creators',
    members: [0, 4, 5, 6, 7, 8, 9, 1],
    messages: [
      'Hey everyone! Welcome to the KIDA Creators group! 🎉', 'Thanks for having me! Excited to be here.',
      'Just posted my new video, would love some feedback!', 'Just watched it - the editing is top notch!',
      'Anyone going to Creator Summit next month?', 'I will be there! Flying in from Tokyo.',
      'Same here! We should do a meetup.', 'Great idea! Let us plan something.',
      'Has anyone tried the new analytics dashboard?', 'Yes! The engagement metrics are much better now.',
      'The new scheduling feature is a game changer.', 'Agreed. Been using it for my community posts.',
      'We should do a cross-collaboration video.', 'I am in! Let me know what you are thinking.',
    ],
  },
  {
    name: 'Gaming Hub',
    members: [0, 5, 7, 10, 11, 12],
    messages: [
      'Anyone playing the new Elden Ring DLC?', 'Yes! The final boss is insane.',
      'Still stuck on the second phase. Any tips?', 'Use the new spirit ash summon, it helps a lot.',
      'Can we talk about how good the soundtrack is?', 'FromSoftware never misses with music.',
      'Valorant tournament this weekend, who is in?', 'I am down! What rank?',
      'Diamond 2 here. We need one more if you know someone.', 'I will ask around.',
      'The new map is actually really balanced.', 'Finally a map that is not attacker-sided.',
      'GGs last night everyone! We dominated.', 'That comeback on round 12 was crazy!',
    ],
  },
  {
    name: 'Tech Talk',
    members: [0, 5, 6, 8, 13, 14],
    messages: [
      'Has anyone tried the new React 19 features yet?', 'The new compiler is actually mind-blowing.',
      'Server Components finally make sense to me.', 'Took me a while too but once it clicks...',
      'What is everyone working on right now?', 'Building a new app with Next.js 15 and KIDA API.',
      'Nice! Using our API I assume? 😄', 'Of course! The WebSocket integration is smooth.',
      'Anyone going to React Conf this year?', 'I will be there! Presenting a talk on real-time apps.',
      'The new AI features in VS Code are insane.', 'Copilot has saved me so much time.',
      'Rust or Go for a new backend service?', 'Depends on the use case. Rust for performance, Go for speed of development.',
    ],
  },
];

const DM_PAIRS = [
  { from: 4, to: 5, msgs: ['Hey! Love your latest tech review!', 'Thank you! Your art is incredible too.', 'We should collab on something.', 'I would love that! Maybe a tech-art fusion piece?', 'That sounds amazing! Let me sketch some ideas.', 'Perfect! I will start researching concepts.'] },
  { from: 4, to: 8, msgs: ['Your film reviews are always on point!', 'Thanks Luna! Love your art series.', 'Would you ever review animated films?', 'Actually planning to do a Studio Ghibli deep dive soon!', 'I would love to contribute some artwork for that!', 'That would be amazing! Let me know your rates.'] },
  { from: 5, to: 7, msgs: ['Great gaming stream last night!', 'Thanks man! The new setup is working great.', 'What capture card are you using?', 'Elgato 4K60 Pro. Worth every penny.', 'Nice! I am thinking of upgrading mine.', 'Do it! Makes a huge difference for streaming.'] },
  { from: 6, to: 4, msgs: ['Love how you explain complex topics visually!', 'Thank you! Your teaching style is inspiring.', 'We should create educational content together.', 'That would be amazing! Combining art and education.', 'Yes! Make learning beautiful and accessible.', 'Love that mission. Let us plan it!'] },
  { from: 9, to: 6, msgs: ['Your quantum computing thread was incredible!', 'Thanks Kenji! Love your anime analysis too.', 'The science in anime is fascinating.', 'Totally! So much inspiration from real physics.', 'Have you seen Steins;Gate?', 'One of my favorites! The time travel mechanics are brilliant.'] },
  { from: 7, to: 8, msgs: ['That movie review was fire!', 'Thanks! Your gaming content is next level.', 'We should do a gaming movie crossover review.', 'Like a review of a game adaptation?', 'Exactly! The Last of Us series maybe?', 'Perfect! Let us plan it for next week.'] },
  { from: 10, to: 4, msgs: ['I am a huge fan of your art!', 'Thank you so much! That means a lot.', 'How did you get started with digital art?', 'Started on a cheap tablet 5 years ago. Just kept practicing!', 'That is so inspiring! I want to start too.', 'You should! The KIDA art community is very supportive.'] },
  { from: 11, to: 5, msgs: ['Your PC build video was super helpful!', 'Glad it helped! Building my next one soon.', 'What GPU would you recommend for video editing?', 'RTX 5090 if budget allows, otherwise 5080 is great.', 'Thanks! I will look into the 5080.', 'Good choice! Let me know if you need a parts list.'] },
  { from: 12, to: 6, msgs: ['I started learning Japanese too!', 'Awesome! How is it going so far?', 'Hiragana is killing me 😅', 'Stick with it! Took me 3 months to get comfortable.', 'Any tips for memorizing kanji?', 'Use mnemonics and write them daily. Consistency is key!'] },
  { from: 13, to: 7, msgs: ['Love the fitness content!', 'Thanks! Your gaming streams are legendary.', 'Do you ever do fitness gaming? Like VR fitness?', 'Beat Saber is my cardio! Haha', 'Same! It is actually a great workout.', 'We should do a VR fitness stream together!'] },
  { from: 14, to: 4, msgs: ['Your style is so unique!', 'Thank you! Your fashion posts are stunning.', 'Would you ever design a clothing line?', 'That is actually a dream of mine!', 'You totally should. I would buy it!', 'That means so much! Maybe someday soon.'] },
  { from: 10, to: 11, msgs: ['Hey! Saw you are into photography too!', 'Yes! Love capturing landscapes.', 'Any tips for night photography?', 'Use a tripod and long exposure. Start with 30 seconds.', 'Thanks! Will try that this weekend.', 'Share your results! Would love to see them.'] },
  { from: 12, to: 13, msgs: ['Your fitness journey is incredible!', 'Thank you! It has been quite the journey.', 'How do you stay motivated?', 'I focus on consistency over intensity. Showing up is half the battle.', 'That is really wise advice.', 'Start small and build the habit first!'] },
  { from: 14, to: 8, msgs: ['Your movie reviews are my favorite!', 'That means so much! Thank you.', 'Do you review international films too?', 'I should do more of that! Any recommendations?', 'Parasite is obvious but also check out The Handmaiden.', 'Both masterpieces! Adding them to my watchlist.'] },
  { from: 10, to: 6, msgs: ['Your education threads are amazing!', 'Thank you! Love that people find them useful.', 'Do you have any on programming?', 'Actually planning a full series on web development!', 'Would love that! Self-taught dev here.', 'Awesome! The series will be perfect for you then.'] },
  { from: 2, to: 4, msgs: ['Heads up, your latest post was reported by mistake. Already cleared it up!', 'Oh thank you Sarah! Appreciate the quick action.', 'No problem! Just doing my job.', 'KIDA moderation team is the best!', 'We try our best! Keep creating amazing content.', 'Will do! Thanks again.'] },
  { from: 3, to: 5, msgs: ['Love the tech content Marcus!', 'Thanks James! Means a lot coming from you.', 'Have you reviewed the new Framework laptop?', 'Not yet! Its on my list though.', 'Let me know if you need review units.', 'That would be incredible! Will DM you details.'] },
  { from: 7, to: 9, msgs: ['The anime gaming crossover content is genius!', 'Thanks! The communities overlap a lot.', 'We should co-stream an anime game together!', 'Yes! How about the new Naruto game?', 'Perfect! This weekend?', 'Saturday works for me! Lets do it.'] },
  { from: 5, to: 6, msgs: ['Your ML thread was incredibly clear!', 'Thanks! Tried hard to make it accessible.', 'Any tips for someone starting in AI?', 'Start with linear algebra and Python basics.', 'Currently doing Andrew Ng course!', 'Perfect starting point. Keep going!'] },
  { from: 4, to: 9, msgs: ['The art in the anime you recommended is stunning!', 'Right? The animation quality is incredible.', 'It inspired me to try a new style.', 'Would love to see what you create!', 'Sharing it on my profile soon!', 'Can not wait to see it!'] },
  { from: 8, to: 6, msgs: ['Your breakdown of the Nolan films was spot on!', 'The themes of time and memory are so deep.', 'Memento is still my favorite Nolan film.', 'Same! The reverse narrative structure is genius.', 'It inspired my filmmaking style honestly.', 'You can totally see the influence in your reviews!'] },
  { from: 11, to: 14, msgs: ['Your food photography is making me hungry!', 'Haha thank you! That is the goal!', 'Do you share recipes too?', 'Yes! I post threads with full recipes.', 'Following you now. Need to up my cooking game!', 'Welcome to the foodie club! 🍳'] },
  { from: 13, to: 10, msgs: ['Hey! Nice to meet another KIDA user from Boston!', 'Oh nice! There are dozens of us!', 'We should start a Boston KIDA meetup!', 'That would be awesome! Know any good spots?', 'There is a cool cafe in Cambridge.', 'Perfect! Let me know when!'] },
  { from: 12, to: 11, msgs: ['Your travel photos are incredible!', 'Thanks! South Korea is such a beautiful country.', 'Adding it to my bucket list!', 'You should visit during cherry blossom season.', 'That sounds magical. When is that?', 'Early April! Best time to visit.'] },
];

const COMMUNITY_DATA = [
  {
    name: 'Technology', slug: 'technology', description: 'Discuss the latest in tech, programming, AI, gadgets, and software development. From quantum computing to mobile apps, this is where tech enthusiasts gather.', type: CommunityType.PUBLIC, ownerIdx: 5,
    posts: [
      { text: 'Just got my hands on the new Snapdragon chip. The benchmarks are insane! Here are my initial thoughts... 🧵', authorIdx: 5 },
      { text: 'Why I think Rust will replace C++ in the next decade. The safety features alone make it worth the switch.', authorIdx: 6 },
      { text: 'The new Google Pixel camera AI is getting out of hand. Is computational photography ruining the art?', authorIdx: 10 },
      { text: 'OpenAI just dropped a new model. Here is what changed and why it matters for developers.', authorIdx: 11 },
      { text: 'Building a home lab? Here is my complete guide for beginners under $500.', authorIdx: 8 },
    ],
  },
  {
    name: 'Gaming', slug: 'gaming', description: 'Everything gaming! From AAA titles to indie gems, console wars to PC master race. Share your gameplay, reviews, and connect with fellow gamers.', type: CommunityType.PUBLIC, ownerIdx: 7,
    posts: [
      { text: 'Elden Ring Nightreign is the best DLC I have ever played. The new boss designs are FromSoft best work.', authorIdx: 7 },
      { text: 'Hot take: Indie games have been better than AAA titles this year. Here are 5 you need to play.', authorIdx: 5 },
      { text: 'Finally hit Radiant in Valorant! Here is my complete guide to climbing ranked.', authorIdx: 10 },
      { text: 'The new Zelda game physics engine is witchcraft. How did they do this on the Switch?', authorIdx: 12 },
      { text: 'Looking for gaming buddies! Drop your gamertags below. I play on PC and PS5.', authorIdx: 13 },
    ],
  },
  {
    name: 'Movies', slug: 'movies', description: 'Film enthusiasts unite! Reviews, recommendations, theories, and discussions about cinema from Hollywood to Bollywood and everything in between.', type: CommunityType.PUBLIC, ownerIdx: 8,
    posts: [
      { text: 'Best cinematography of 2025: Dune 2, Oppenheimer, and The Brutalist are in a league of their own.', authorIdx: 8 },
      { text: 'Unpopular opinion: Superhero fatigue is real and Marvel needs to take a break.', authorIdx: 14 },
      { text: 'Just watched Parasite for the first time. I understand the hype now. Masterpiece.', authorIdx: 10 },
      { text: 'The scariest horror movies that do not rely on jump scares. A thread 🧵', authorIdx: 11 },
      { text: 'Soundtrack recommendations thread! Drop your favorite movie scores.', authorIdx: 9 },
    ],
  },
  {
    name: 'Anime', slug: 'anime', description: 'The ultimate anime community on KIDA! Discuss seasonal anime, classics, manga, and connect with fellow otaku. Newcomers welcome!', type: CommunityType.PUBLIC, ownerIdx: 9,
    posts: [
      { text: 'This season is stacked! Solo Leveling, Demon Slayer, and Apothecary Diaries all airing simultaneously.', authorIdx: 9 },
      { text: 'What is the best anime to watch as a beginner? My go-to recommendation is always Fullmetal Alchemist Brotherhood.', authorIdx: 12 },
      { text: 'The animation quality in the new MAPPA project is absurd. Every frame is wallpaper worthy.', authorIdx: 10 },
      { text: 'Manga readers: what is your prediction for the next big anime adaptation announcement?', authorIdx: 6 },
      { text: 'Studio Ghibli tier list: Ranking all 23 feature films. Prepare for hot takes. 🧵', authorIdx: 9 },
    ],
  },
  {
    name: 'Content Creators', slug: 'content-creators', description: 'A community for KIDA creators to share tips, collaborate, and grow together. Resources for content strategy, monetization, and creative growth.', type: CommunityType.PUBLIC, ownerIdx: 4,
    posts: [
      { text: 'I grew my following from 0 to 10K in 3 months. Here is exactly what I did. 🧵', authorIdx: 4 },
      { text: 'The best camera for content creation in 2025 under $2000. Full breakdown with sample footage.', authorIdx: 5 },
      { text: 'How to overcome creator burnout: My personal journey and the habits that saved me.', authorIdx: 7 },
      { text: 'Engagement tips: How to actually build a community not just an audience.', authorIdx: 6 },
      { text: 'Collaboration thread! Post what you create and what kind of collab you are looking for.', authorIdx: 8 },
    ],
  },
];

async function hashPassword() {
  return bcrypt.hash(PASSWORD, 12);
}

async function main() {
  console.log('\n🌱 Starting KIDA database seed...\n');

  const existingVideos = await prisma.video.count();
  if (existingVideos > 0) {
    console.log(`   ⏭️  Skipping seed — ${existingVideos} videos already exist`);
    return;
  }

  const hash = await hashPassword();

  // ── USERS ──
  console.log('👤 Creating users...');
  const users: any[] = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username, email: u.email, displayName: u.displayName, bio: u.bio,
        role: u.role, verified: u.verified, passwordHash: hash, emailVerified: true,
        avatar: `${AVATAR_BASE}${u.avatar}`, coverImage: `${COVER_BASE}${u.cover}?w=1200`,
        location: u.location, website: u.website, createdAt: new Date(Date.now() - Math.random() * 180 * 86400000),
      },
    });
    users.push(user);
  }
  console.log(`   ✓ ${users.length} users created`);

  const [sa, ad, m1, m2, c1, c2, c3, c4, c5, c6, u1, u2, u3, u4, u5, u6, u7, u8, u9, u10] = users;

  // ── FOLLOWS ──
  console.log('🔗 Creating follow relationships...');
  const followIndices: [number, number][] = [];
  // Super admin follows everyone
  for (let i = 1; i < 20; i++) followIndices.push([0, i]);
  // Admin follows everyone except self
  for (let i = 0; i < 20; i++) if (i !== 1) followIndices.push([1, i]);
  // Moderators follow most users
  for (const modIdx of [2, 3]) {
    for (let i = 0; i < 20; i++) {
      if (i !== modIdx && i !== 0 && i !== 1) followIndices.push([modIdx, i]);
    }
  }
  // Creators follow each other
  for (let i = 4; i <= 9; i++) {
    for (let j = 4; j <= 9; j++) {
      if (i !== j) followIndices.push([i, j]);
    }
  }
  // Creators followed by many users
  for (const creatorIdx of [4, 5, 6, 7, 8, 9]) {
    for (let ui = 10; ui < 20; ui++) followIndices.push([ui, creatorIdx]);
  }
  // Users follow each other (friends groups)
  const friendGroups = [[10, 11, 12], [13, 14, 15], [16, 17, 18], [18, 19, 10]];
  for (const group of friendGroups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        followIndices.push([group[i], group[j]]);
        followIndices.push([group[j], group[i]]);
      }
    }
  }
  // Users follow some users
  for (let ui = 10; ui < 20; ui++) {
    for (let uj = 10; uj < 20; uj++) {
      if (ui !== uj && Math.random() > 0.5) followIndices.push([ui, uj]);
    }
  }
  // Extra follows for natural density
  for (let ui = 10; ui < 20; ui++) {
    const extraFollowCount = 2 + Math.floor(Math.random() * 4);
    for (let f = 0; f < extraFollowCount; f++) {
      const target = 2 + Math.floor(Math.random() * 8);
      if (target !== ui) followIndices.push([ui, target]);
    }
  }

  let followCount = 0;
  for (const [followerIdx, followingIdx] of followIndices) {
    if (followerIdx === followingIdx) continue;
    try {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: users[followerIdx].id, followingId: users[followingIdx].id } },
        update: {}, create: { followerId: users[followerIdx].id, followingId: users[followingIdx].id },
      });
      followCount++;
    } catch {}
  }
  console.log(`   ✓ ${followCount} follow relationships created`);

  // ── POSTS ──
  console.log('📝 Creating posts...');
  const posts: any[] = [];
  const postOwners: number[] = [0, 1, 2, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 10, 11, 12, 13, 14, 10, 11, 12];

  for (let i = 0; i < POST_CONTENT.length; i++) {
    const pc = POST_CONTENT[i];
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const post = await prisma.post.create({
      data: {
        content: pc.text, authorId: users[postOwners[i]].id, type: PostType.TEXT, visibility: 'PUBLIC',
        createdAt: new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000),
      },
    });
    posts.push(post);

    const hashtags = pc.text.match(/#(\w+)/g);
    if (hashtags) {
      for (const tag of hashtags) {
        const name = tag.slice(1).toLowerCase();
        await prisma.hashtag.upsert({ where: { name }, update: { count: { increment: 1 } }, create: { name, count: 1 } });
        const ht = await prisma.hashtag.findUnique({ where: { name } });
        if (ht) {
          await prisma.postHashtag.upsert({ where: { postId_hashtagId: { postId: post.id, hashtagId: ht.id } }, update: {}, create: { postId: post.id, hashtagId: ht.id } }).catch(() => {});
        }
      }
    }
  }
  console.log(`   ✓ ${posts.length} posts created`);

  // ── REPLIES ──
  console.log('💬 Creating thread replies...');
  const replyTexts = [
    'This is such an important topic! Thanks for starting this conversation.', 'I have been thinking about this for a while. Great thread!',
    'Adding my perspective as someone who works in this field...', 'Could not agree more! The data supports everything you said.',
    'Interesting take! Has anyone else experienced this?', 'The point about community building really resonated with me.',
    'This deserves way more attention. Sharing with my followers!', 'I tried this approach and it worked wonders for my workflow.',
    'Can you elaborate more on the third point?', 'Check out this related resource I found: super relevant to your post!',
    'Honestly this changed how I think about the whole thing.', 'Big fan of your content! Keep these threads coming.',
    'Question for the community: what has been your experience?', 'The numbers speak for themselves. Great analysis!',
    'This is exactly what I needed to read today. Thank you!', 'I respectfully disagree. Here is why...',
    'Building on your point, I would add that timing is crucial.', 'Love how you broke down such a complex topic!',
    'Saving this for reference. So much valuable info here!', 'The real MVP is always in the comments section.',
    'Can we talk about how underrated this perspective is?', 'This thread is gold. Pure gold.',
    'As someone who has been in the industry for 10 years, I can confirm this.', 'The future is looking bright with takes like this!',
    'Counterpoint: I think there is another side to this argument...', 'Both perspectives have merit, but I lean towards the OP take.',
    'Tagging @user1 and @user2 because they need to see this!', 'This is the quality content I come to KIDA for.',
    'The effort that went into this thread is incredible.', 'Let me share my experience with this...',
    'Absolutely brilliant breakdown. Saving this forever.', 'I wish more people understood this nuance.',
    'You articulated what I have been feeling for months.', 'New here, and this is exactly the kind of content I was hoping to find!',
    'The engagement on this thread shows how relevant this is.', 'Great discussion happening here! Everyone be respectful.',
    'This needs to be pinned to the top of the community!', 'Fun fact: this also applies to other domains like education.',
    'Can someone explain this like I am five?', 'Here is a simple analogy that helped me understand...',
    'I have seen this play out in real time. Can confirm.', 'The research backs up every single claim here.',
    'Not all heroes wear capes. Some write incredible threads.', 'This is why I love the KIDA community. So much knowledge!',
    'Would love to see a follow-up post on this!', 'The implications of this are huge for the industry.',
    'I learned something new today. Thank you for this!', 'Okay this is actually mind-blowing when you think about it.',
    'Practical question: how would you implement this?', 'The key insight here is often overlooked.',
    'Brilliantly said. This should be required reading.', 'I have been telling people this for years!',
    'The data visualization in this thread is top notch.', 'This is the kind of deep content that makes KIDA special.',
    'Let me offer a different perspective from my experience...', 'Both sides of this argument have valid points.',
    'Threads like this are why I joined KIDA in the first place.', 'Can we get a part 2? There is so much more to explore!',
    'This hits different when you have lived through it.', 'The comments on this thread are almost as good as the post!',
    'Thank you for being so thorough in your explanation.', 'I am sharing this with my entire network.',
    'The way you think about this is genuinely refreshing.', 'Important discussion that needs to happen more often.',
    'Just when I thought I understood this, you drop this gem.', 'Consistency in creating content like this really pays off!',
    'This deserves a spot in the KIDA spotlight feature!', 'The practical applications of this are endless.',
    'Could you make a video version of this? Would love to watch it!', 'The community feedback on this has been incredible!',
    'I was skeptical at first but you make a compelling case.', 'This is exactly what the industry needs right now.',
    'Every point here is backed by solid reasoning. Respect.', 'The way you connect different ideas is inspiring.',
    'New to this topic but your thread made it so accessible!', 'Bookmarking this immediately. So much value!',
    'The timing of this post is perfect. Relevant as always.', 'Building on what you said, I would also consider...',
    'This thread aged like fine wine. Still relevant months later!', 'The passion you have for this topic really shows.',
  ];

  const replies: any[] = [];
  for (let i = 0; i < 80; i++) {
    const post = posts[i % posts.length];
    const authorIdx = 2 + Math.floor(Math.random() * 18);
    const parentReply = i > 0 && Math.random() > 0.7 ? replies[Math.floor(Math.random() * Math.min(i, replies.length))]?.id : undefined;
    try {
      const reply = await prisma.post.create({
        data: {
          content: replyTexts[i], authorId: users[authorIdx].id, type: PostType.TEXT, visibility: 'PUBLIC',
          parentId: parentReply || post.id, createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
        },
      });
      replies.push(reply);
    } catch {}
  }
  console.log(`   ✓ ${replies.length} replies created`);

  // ── QUOTE POSTS ──
  console.log('📎 Creating quote posts...');
  let quoteCount = 0;
  for (let i = 0; i < 12; i++) {
    const originalPost = posts[Math.floor(Math.random() * posts.length)];
    const authorIdx = 4 + Math.floor(Math.random() * 6);
    try {
      await prisma.post.create({
        data: {
          content: `"${originalPost.content?.slice(0, 100)}..."\n\nMy take: This is a really interesting perspective. ${i % 2 === 0 ? 'I think this highlights something important about how we think about content creation.' : 'The implications here are huge and I think more people need to consider this.'}`,
          authorId: users[authorIdx].id, type: PostType.TEXT, visibility: 'PUBLIC', quoteOfId: originalPost.id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000)),
        },
      });
      quoteCount++;
    } catch {}
  }
  console.log(`   ✓ ${quoteCount} quote posts created`);

  // ── REPOSTS ──
  console.log('🔄 Creating reposts...');
  let repostCount = 0;
  for (let i = 0; i < 20; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const authorIdx = Math.floor(Math.random() * 20);
    try {
      await prisma.repost.upsert({
        where: { userId_postId: { userId: users[authorIdx].id, postId: post.id } },
        update: {}, create: { userId: users[authorIdx].id, postId: post.id },
      });
      repostCount++;
    } catch {}
  }
  console.log(`   ✓ ${repostCount} reposts created`);

  // ── VIDEOS ──
  console.log('🎥 Creating videos...');
  const videoUrls = WORKING_VIDEOS.map((url) =>
    url.startsWith('http') ? url : `${VIDEO_BASE}${url}`
  );
  const thumbIds = ['1611162617474-5b21e879e113', '1557672177-2987970f4f4e', '1517694712202-14dd9538aa97', '1492691527719-9f2c8462c4c7', '1536240477855-5e6a2d751d42', '1504384308090-c5e6bae2acc8', '1519389950473-47ba0277781c', '1558618666-fcd25c85f82e', '1526374965328-7f61d4dc18c5', '1549490349-8643362247b7'];

  let videoCount = 0;
  for (let i = 0; i < VIDEO_DATA.length && i < 15; i++) {
    const vd = VIDEO_DATA[i];
    try {
      await prisma.video.create({
        data: {
          creatorId: users[vd.creatorIdx].id, title: vd.title, description: vd.description,
          videoUrl: videoUrls[i % videoUrls.length],
          thumbnail: `${THUMB_BASE}${thumbIds[i % thumbIds.length]}?w=640`,
          duration: vd.duration, views: vd.views, likes: vd.likes, mimeType: 'video/mp4',
          tags: { create: vd.tags.map((t) => ({ tag: t })) },
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)),
        },
      });
      videoCount++;
    } catch (e: any) {
      console.log(`   ⚠ Video ${i} skipped: ${e.message?.slice(0, 50)}`);
    }
  }
  console.log(`   ✓ ${videoCount} videos created`);

  // ── COMMENTS ──
  console.log('💭 Creating comments...');
  const comments: any[] = [];
  for (let i = 0; i < 120; i++) {
    const postIdx = Math.floor(Math.random() * posts.length);
    const authorIdx = 2 + Math.floor(Math.random() * 18);
    try {
      const c = await prisma.comment.create({
        data: {
          content: COMMENT_TEXTS[i % COMMENT_TEXTS.length], userId: users[authorIdx].id, postId: posts[postIdx].id,
          parentId: i > 30 && Math.random() > 0.7 && comments.length > 0 ? comments[Math.floor(Math.random() * comments.length)].id : undefined,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
        },
      });
      comments.push(c);
    } catch {}
  }
  console.log(`   ✓ ${comments.length} comments created`);

  // ── LIKES ──
  console.log('❤️ Creating likes...');
  let likeCount = 0;
  const allLikeTargets = posts.map((p) => ({ id: p.id, ownerIdx: postOwners[posts.indexOf(p)] }));

  for (let i = 0; i < 500; i++) {
    const target = allLikeTargets[Math.floor(Math.random() * allLikeTargets.length)];
    const authorIdx = Math.floor(Math.random() * 20);
    if (target.ownerIdx === authorIdx) continue;
    try {
      await prisma.like.upsert({ where: { userId_postId: { userId: users[authorIdx].id, postId: target.id } }, update: {}, create: { userId: users[authorIdx].id, postId: target.id } });
      likeCount++;
    } catch {}
  }
  console.log(`   ✓ ${likeCount} likes created`);

  // ── BOOKMARKS ──
  console.log('🔖 Creating bookmarks...');
  let bookmarkCount = 0;
  for (let i = 0; i < 50; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const userIdx = Math.floor(Math.random() * 20);
    try {
      await prisma.bookmark.upsert({ where: { userId_postId: { userId: users[userIdx].id, postId: post.id } }, update: {}, create: { userId: users[userIdx].id, postId: post.id } });
      bookmarkCount++;
    } catch {}
  }
  console.log(`   ✓ ${bookmarkCount} bookmarks created`);

  // ── COMMUNITIES ──
  console.log('🏘️ Creating communities...');
  for (const cd of COMMUNITY_DATA) {
    const community = await prisma.community.upsert({
      where: { slug: cd.slug },
      update: {},
      create: {
        name: cd.name, slug: cd.slug, description: cd.description, type: cd.type, ownerId: users[cd.ownerIdx].id,
        avatar: `${AVATAR_BASE}${cd.slug}`, coverImage: `${COVER_BASE}${['1517694712202-14dd9538aa97', '1492691527719-9f2c8462c4c7', '1536240477855-5e6a2d751d42', '1549490349-8643362247b7', '1504384308090-c5e6bae2acc8'][COMMUNITY_DATA.indexOf(cd)]}?w=1200`,
      },
    });

    // Add members (all users except the last few)
    const memberCount = 10 + Math.floor(Math.random() * 8);
    for (let mi = 0; mi < Math.min(memberCount, 20); mi++) {
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: community.id, userId: users[mi].id } },
        update: {}, create: { communityId: community.id, userId: users[mi].id },
      }).catch(() => {});
    }

    // Add moderators
    for (const modIdx of [2, 3]) {
      await prisma.communityModerator.upsert({
        where: { communityId_userId: { communityId: community.id, userId: users[modIdx].id } },
        update: {}, create: { communityId: community.id, userId: users[modIdx].id },
      }).catch(() => {});
    }

    // Add community posts
    for (const cp of cd.posts) {
      await prisma.post.create({
        data: {
          content: cp.text, authorId: users[cp.authorIdx].id, type: PostType.TEXT, visibility: 'PUBLIC', communityId: community.id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 20 * 86400000)),
        },
      }).catch(() => {});
    }
  }
  console.log(`   ✓ ${COMMUNITY_DATA.length} communities created`);

  // ── DIRECT MESSAGES ──
  console.log('💌 Creating direct messages...');
  let dmCount = 0;
  for (const pair of DM_PAIRS) {
    try {
      const conv = await prisma.conversation.create({
        data: {
          members: { create: [{ userId: users[pair.from].id }, { userId: users[pair.to].id }] },
        },
      });

      for (let mi = 0; mi < pair.msgs.length; mi++) {
        const senderIdx = mi % 2 === 0 ? pair.from : pair.to;
        await prisma.message.create({
          data: {
            conversationId: conv.id, senderId: users[senderIdx].id, content: pair.msgs[mi],
            createdAt: new Date(Date.now() - (pair.msgs.length - mi) * 3600000),
          },
        });
      }
      dmCount++;
    } catch (e: any) {
      console.log(`   ⚠ DM pair skipped: ${e.message?.slice(0, 50)}`);
    }
  }
  console.log(`   ✓ ${dmCount} DM conversations created`);

  // ── GROUP CHATS ──
  console.log('👥 Creating group chats...');
  let gcCount = 0;
  for (const gc of GROUP_CHATS) {
    try {
      const conv = await prisma.conversation.create({
        data: {
          isGroup: true, name: gc.name,
          members: { create: gc.members.map((mi) => ({ userId: users[mi].id })) },
        },
      });

      for (let mi = 0; mi < gc.messages.length; mi++) {
        const senderIdx = gc.members[mi % gc.members.length];
        await prisma.message.create({
          data: {
            conversationId: conv.id, senderId: users[senderIdx].id, content: gc.messages[mi],
            createdAt: new Date(Date.now() - (gc.messages.length - mi) * 1800000),
          },
        });
      }
      gcCount++;
    } catch (e: any) {
      console.log(`   ⚠ Group chat skipped: ${e.message?.slice(0, 50)}`);
    }
  }
  console.log(`   ✓ ${gcCount} group chats created`);

  // ── NOTIFICATIONS ──
  console.log('🔔 Creating notifications...');
  const notificationData: { userId: string; type: NotificationType; title: string; body: string; actorId?: string }[] = [];

  // Like notifications
  for (let i = 0; i < 80; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const actor = users[Math.floor(Math.random() * 20)];
    notificationData.push({
      userId: users[postOwners[posts.indexOf(post)]].id, type: NotificationType.LIKE,
      title: `${actor.displayName || actor.username} liked your post`,
      body: post.content?.slice(0, 100) || '', actorId: actor.id,
    });
  }

  // Comment notifications
  for (let i = 0; i < 60; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const actor = users[Math.floor(Math.random() * 20)];
    notificationData.push({
      userId: users[postOwners[posts.indexOf(post)]].id, type: NotificationType.COMMENT,
      title: `${actor.displayName || actor.username} commented on your post`,
      body: COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)], actorId: actor.id,
    });
  }

  // Follow notifications
  for (let i = 0; i < 60; i++) {
    const actor = users[4 + Math.floor(Math.random() * 16)];
    const target = users[Math.floor(Math.random() * 10)];
    notificationData.push({
      userId: target.id, type: NotificationType.FOLLOW,
      title: `${actor.displayName || actor.username} started following you`,
      body: '', actorId: actor.id,
    });
  }

  // Mention notifications
  for (let i = 0; i < 40; i++) {
    const actor = users[Math.floor(Math.random() * 20)];
    const target = users[Math.floor(Math.random() * 20)];
    if (target.id === actor.id) continue;
    notificationData.push({
      userId: target.id, type: NotificationType.MENTION,
      title: `${actor.displayName || actor.username} mentioned you in a post`,
      body: `Hey @${target.username} check this out!`, actorId: actor.id,
    });
  }

  // Repost notifications
  for (let i = 0; i < 30; i++) {
    const actor = users[Math.floor(Math.random() * 20)];
    const post = posts[Math.floor(Math.random() * posts.length)];
    notificationData.push({
      userId: users[postOwners[posts.indexOf(post)]].id, type: NotificationType.REPOST,
      title: `${actor.displayName || actor.username} reposted your post`,
      body: post.content?.slice(0, 100) || '', actorId: actor.id,
    });
  }

  // Community activity
  for (let i = 0; i < 40; i++) {
    const actor = users[Math.floor(Math.random() * 20)];
    const target = users[Math.floor(Math.random() * 20)];
    notificationData.push({
      userId: target.id, type: NotificationType.COMMUNITY_ACTIVITY,
      title: `New activity in Technology community`,
      body: `${actor.displayName || actor.username} posted in Technology`, actorId: actor.id,
    });
  }

  for (const nd of notificationData) {
    try {
      await prisma.notification.create({
        data: {
          userId: nd.userId, type: nd.type, title: nd.title, body: nd.body, actorId: nd.actorId,
          read: Math.random() > 0.4, createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
        },
      });
    } catch {}
  }
  console.log(`   ✓ ${notificationData.length} notifications created`);

  // ── MODERATION DATA ──
  console.log('🛡️ Creating moderation test data...');

  // Reported posts
  const reportReasons = ['Inappropriate content', 'Harassment', 'Spam', 'Misinformation'];
  for (let i = 0; i < 3; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    await prisma.report.create({
      data: {
        reporterId: users[10 + Math.floor(Math.random() * 10)].id, targetId: post.id, targetType: 'post',
        reason: reportReasons[i], description: `This post appears to violate community guidelines.`,
        status: i === 0 ? 'pending' : i === 1 ? 'resolved' : 'dismissed',
        moderatorId: i === 1 ? users[2].id : undefined,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
      },
    }).catch(() => {});
  }

  // Reported comments
  for (let i = 0; i < 2; i++) {
    const comment = comments[Math.floor(Math.random() * comments.length)];
    await prisma.report.create({
      data: {
        reporterId: users[10 + Math.floor(Math.random() * 10)].id, targetId: comment.id, targetType: 'comment',
        reason: 'Harassment', description: 'This comment contains offensive language.',
        status: 'pending', createdAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 86400000)),
      },
    }).catch(() => {});
  }

  // Suspend a user
  await prisma.user.update({
    where: { id: users[19].id },
    data: { isSuspended: true },
  });

  // Activity logs
  for (let i = 0; i < 20; i++) {
    await prisma.activityLog.create({
      data: {
        userId: users[Math.floor(Math.random() * 20)].id, action: ['login', 'post_create', 'comment_create', 'like', 'follow'][Math.floor(Math.random() * 5)],
        entity: 'user', ip: '192.168.1.1',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
      },
    }).catch(() => {});
  }
  console.log(`   ✓ Moderation test data created`);

  // ── SUMMARY ──
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         Seed Complete! 🎉                ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n📊 Database Summary:`);
  console.log(`   Users:          ${users.length}`);
  console.log(`   Follows:        ${followCount}`);
  console.log(`   Posts:          ${posts.length}`);
  console.log(`   Replies:        ${replies.length}`);
  console.log(`   Quotes:         ${quoteCount}`);
  console.log(`   Reposts:        ${repostCount}`);
  console.log(`   Videos:         ${videoCount}`);
  console.log(`   Comments:       ${comments.length}`);
  console.log(`   Likes:          ${likeCount}`);
  console.log(`   Bookmarks:      ${bookmarkCount}`);
  console.log(`   DMs:            ${dmCount}`);
  console.log(`   Group Chats:    ${gcCount}`);
  console.log(`   Communities:    ${COMMUNITY_DATA.length}`);
  console.log(`   Notifications:  ${notificationData.length}`);
  console.log(`\n📋 Test Accounts (password: ${PASSWORD}):`);
  console.log(`   superadmin@kida.dev  → Super Admin`);
  console.log(`   admin@kida.dev       → Admin`);
  console.log(`   moderator@kida.dev   → Moderator`);
  console.log(`   creator1@kida.dev    → Creator`);
  console.log(`   user1@kida.dev       → User`);
}

main()
  .catch((e) => { console.error('\n❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
