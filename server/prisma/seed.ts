import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RetroNotes database...');

  // Clean existing data in reverse order of relations
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
    },
  });

  const aether = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      name: 'Aether Scribe',
      password: hashedPassword,
      image: '⭐',
    },
  });

  console.log(`Created users: ${luna.name} (${luna.email}), ${aether.name} (${aether.email})`);

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

  console.log('Created folders for user.');

  // Create tags for Luna
  const tagCollege = await prisma.tag.create({
    data: { name: 'College', userId: luna.id },
  });

  const tagIdeas = await prisma.tag.create({
    data: { name: 'Ideas', userId: luna.id },
  });

  const tagCoding = await prisma.tag.create({
    data: { name: 'Coding', userId: luna.id },
  });

  const tagProjects = await prisma.tag.create({
    data: { name: 'Projects', userId: luna.id },
  });

  console.log('Created tags for user.');

  // Create notes for Luna
  // Pinned & College Note
  await prisma.note.create({
    data: {
      title: 'College Lecture Notes',
      content: '# Physics II: Antigravity\n\nToday we discussed the principles of quantum locking and gravity waves.\n\n## Key concepts:\n- Gravity is a curvature in spacetime.\n- Active shielding might allow *antigravity* effects.\n\n```js\nconsole.log("Antigravity engine active!");\n```',
      isPinned: true,
      folderId: collegeFolder.id,
      userId: luna.id,
      tags: {
        connect: [{ id: tagCollege.id }, { id: tagCoding.id }]
      }
    },
  });

  // Ideas note
  await prisma.note.create({
    data: {
      title: 'RetroNotes Project Outline',
      content: '# RetroNotes: Rebuilding the Past\n\nA modern note-taking application styled as a retro terminal.\n\n### Features to include:\n- [x] CRT scanline filters\n- [ ] Floppy disk save indicator\n- [ ] Amber, Green, and Cyberpunk monitor themes\n- [ ] Gemini AI integration for note analysis\n- [ ] Markdown editor\n\n#Projects #Ideas',
      isFavorite: true,
      folderId: ideasFolder.id,
      userId: luna.id,
      tags: {
        connect: [{ id: tagIdeas.id }, { id: tagProjects.id }]
      }
    },
  });

  // Personal Note
  await prisma.note.create({
    data: {
      title: 'Groceries List',
      content: '## Daily Essentials\n- Bread (Sourdough)\n- Oat Milk\n- Butter\n- Fresh Basil\n- Cherry Tomatoes\n\n*Remember to check if we need olive oil!*',
      folderId: personalFolder.id,
      userId: luna.id,
    },
  });

  // Trashed Note
  await prisma.note.create({
    data: {
      title: 'Old Ideas (To Delete)',
      content: 'This note is outdated and should be deleted.\nMaybe replace it with a retro console emulator concept.',
      isTrashed: true,
      userId: luna.id,
    },
  });

  // Archived Note
  await prisma.note.create({
    data: {
      title: 'Recipe: Retro Pancakes',
      content: '# Perfect Fluffy Pancakes\n\n- 1 cup Flour\n- 2 tbsp Sugar\n- 1 tbsp Baking Powder\n- 1 pinch Salt\n- 1 cup Milk\n- 1 Egg\n\nMix dry, mix wet, combine and cook. Simple!',
      isArchived: true,
      folderId: personalFolder.id,
      userId: luna.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
