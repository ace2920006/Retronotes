import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RetroNotes / InkVerse database...');

  // Clean existing data in reverse order of relations
  await prisma.notification.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.readingList.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.tagFollow.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.folder.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const luna = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Luna Writer',
      password: hashedPassword,
      image: '🌙',
      bio: 'Poet, dreamer, and digital archivist of transient thoughts.',
      banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
      streak: 7,
      lastWriteDate: new Date(),
    },
  });

  const aether = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      name: 'Aether Scribe',
      password: hashedPassword,
      image: '⭐',
      bio: 'Exploring the boundary between code, philosophy, and classical verse.',
      banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop',
      streak: 3,
      lastWriteDate: new Date(),
    },
  });

  const solomon = await prisma.user.create({
    data: {
      email: 'test3@example.com',
      name: 'Solomon Poet',
      password: hashedPassword,
      image: '🦉',
      bio: 'InkVerse elder. Studying ancient meters and modern hypertexts.',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
      streak: 0,
    },
  });

  console.log(`Created users: ${luna.name}, ${aether.name}, ${solomon.name}`);

  // Create follow relationships
  await prisma.follow.create({ data: { followerId: luna.id, followingId: aether.id } });
  await prisma.follow.create({ data: { followerId: aether.id, followingId: luna.id } });
  await prisma.follow.create({ data: { followerId: solomon.id, followingId: luna.id } });
  await prisma.follow.create({ data: { followerId: solomon.id, followingId: aether.id } });

  console.log('Created follow relations.');

  // Create tag follows
  await prisma.tagFollow.create({ data: { tagName: 'Poetry', userId: luna.id } });
  await prisma.tagFollow.create({ data: { tagName: 'Coding', userId: luna.id } });
  await prisma.tagFollow.create({ data: { tagName: 'Philosophy', userId: aether.id } });

  // Create folders for Luna
  const personalFolder = await prisma.folder.create({
    data: { name: '📁 Personal', color: '#3b82f6', userId: luna.id },
  });
  const collegeFolder = await prisma.folder.create({
    data: { name: '📁 College', color: '#10b981', userId: luna.id },
  });
  const workFolder = await prisma.folder.create({
    data: { name: '📁 Work', color: '#f59e0b', userId: luna.id },
  });
  const ideasFolder = await prisma.folder.create({
    data: { name: '📁 Ideas', color: '#ec4899', userId: luna.id },
  });

  // Create tags for Luna
  const tagCollege = await prisma.tag.create({ data: { name: 'College', userId: luna.id } });
  const tagIdeas = await prisma.tag.create({ data: { name: 'Ideas', userId: luna.id } });
  const tagCoding = await prisma.tag.create({ data: { name: 'Coding', userId: luna.id } });
  const tagProjects = await prisma.tag.create({ data: { name: 'Projects', userId: luna.id } });

  // Create notes for Luna
  const note1 = await prisma.note.create({
    data: {
      title: 'College Lecture Notes',
      content: '# Physics II: Antigravity\n\nToday we discussed the principles of quantum locking and gravity waves.\n\n## Key concepts:\n- Gravity is a curvature in spacetime.\n- Active shielding might allow *antigravity* effects.\n\n```js\nconsole.log("Antigravity engine active!");\n```',
      isPinned: true,
      folderId: collegeFolder.id,
      userId: luna.id,
      collection: 'Programming',
      tags: { connect: [{ id: tagCollege.id }, { id: tagCoding.id }] },
      viewsCount: 15,
      uniqueReadersCount: 8,
      mood: '💭 Reflective',
      summary: 'Detailed physics notes covering quantum locking, gravity waves, and theoretical active shielding concepts.',
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'RetroNotes Project Outline',
      content: '# RetroNotes: Rebuilding the Past\n\nA modern note-taking application styled as a retro terminal.\n\n### Features to include:\n- [x] CRT scanline filters\n- [ ] Floppy disk save indicator\n- [ ] Amber, Green, and Cyberpunk monitor themes\n- [ ] Gemini AI integration for note analysis\n- [ ] Markdown editor\n\n#Projects #Ideas',
      isFavorite: true,
      folderId: ideasFolder.id,
      userId: luna.id,
      collection: 'Articles',
      tags: { connect: [{ id: tagIdeas.id }, { id: tagProjects.id }] },
      viewsCount: 45,
      uniqueReadersCount: 30,
      mood: '🔍 Powerful',
      summary: 'Project outline for RetroNotes detailing completed CRT scanline features, planned floppy saves, color themes, and Gemini AI assistant integrations.',
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: 'Groceries List',
      content: '## Daily Essentials\n- Bread (Sourdough)\n- Oat Milk\n- Butter\n- Fresh Basil\n- Cherry Tomatoes\n\n*Remember to check if we need olive oil!*',
      folderId: personalFolder.id,
      userId: luna.id,
      collection: 'Personal Journal',
      viewsCount: 1,
      uniqueReadersCount: 1,
    },
  });

  // Create public poetry notes for Aether
  const note4 = await prisma.note.create({
    data: {
      title: 'Midnight Echoes',
      content: 'The stars write scripts in dark compile,\nA binary code on cosmic screen.\nWe debug errors for a while,\nIn search of loops that compile clean.\n\nTime escapes in standard flow,\nNo catch block can its path delay;\nYet in this terminal below,\nWe write our soul in green array.',
      userId: aether.id,
      collection: 'Poetry',
      viewsCount: 120,
      uniqueReadersCount: 95,
      mood: '😊 Happy',
      summary: 'A reflective poem exploring the metaphors linking coding constructs like compile, binary code, errors, loops, and catch blocks with the stars and time.',
    },
  });

  const note5 = await prisma.note.create({
    data: {
      title: 'The Cyber Scribe',
      content: 'We are but whispers in the wire,\nA keyboard click, a phosphor glow.\nFeeding the generative fire,\nOf algorithms we barely know.',
      userId: aether.id,
      collection: 'Quotes',
      viewsCount: 88,
      uniqueReadersCount: 60,
      mood: 'Reflective',
    },
  });

  console.log('Created notes.');

  // Create reactions
  await prisma.reaction.create({ data: { noteId: note1.id, userId: aether.id, type: 'FIRE' } });
  await prisma.reaction.create({ data: { noteId: note1.id, userId: aether.id, type: 'LOVE' } });
  await prisma.reaction.create({ data: { noteId: note1.id, userId: solomon.id, type: 'INSIGHTFUL' } });
  await prisma.reaction.create({ data: { noteId: note4.id, userId: luna.id, type: 'LOVE' } });
  await prisma.reaction.create({ data: { noteId: note4.id, userId: solomon.id, type: 'CLAP' } });

  console.log('Created reactions.');

  // Create threaded comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This physics overview is fascinating. Does quantum locking hold up at room temperature in this model?',
      noteId: note1.id,
      authorId: aether.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Under current SQLite assumptions, yes! But we might need PostgreSQL shielding in production.',
      noteId: note1.id,
      authorId: luna.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Indeed. The static scanlines here represent the lock fields.',
      noteId: note1.id,
      authorId: solomon.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Beautifully written. The catch block line captures the tragedy of time perfectly.',
      noteId: note4.id,
      authorId: luna.id,
    },
  });

  console.log('Created threaded comments.');

  // Create user achievements
  await prisma.userAchievement.create({ data: { badgeId: 'FIRST_NOTE', userId: luna.id } });
  await prisma.userAchievement.create({ data: { badgeId: 'SEVEN_DAY_STREAK', userId: luna.id } });
  await prisma.userAchievement.create({ data: { badgeId: 'FIRST_NOTE', userId: aether.id } });

  console.log('Created achievements.');

  // Create notifications
  await prisma.notification.create({
    data: {
      type: 'REACTION',
      userId: luna.id,
      senderId: aether.id,
      senderName: aether.name,
      senderImage: aether.image,
      noteId: note1.id,
      content: 'reacted with 🔥 Fire to your note "College Lecture Notes"',
    },
  });

  await prisma.notification.create({
    data: {
      type: 'COMMENT',
      userId: luna.id,
      senderId: aether.id,
      senderName: aether.name,
      senderImage: aether.image,
      noteId: note1.id,
      content: 'commented: "This physics overview is fascinating..."',
    },
  });

  await prisma.notification.create({
    data: {
      type: 'FOLLOW',
      userId: luna.id,
      senderId: solomon.id,
      senderName: solomon.name,
      senderImage: solomon.image,
      content: 'started following you',
    },
  });

  console.log('Created initial notifications.');
  console.log('Database seeding successfully finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
