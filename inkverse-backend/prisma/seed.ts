import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding InkVerse database...');

  // Clean existing data
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const luna = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Luna Writer',
      password: hashedPassword,
      bio: 'Weaving dreams into words. Lover of haikus, rain, and midnight thoughts.',
      image: '🌙',
    },
  });

  console.log(`Created user: ${luna.name} (${luna.email})`);

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Winter Nights',
      type: 'Haiku',
      content: 'Silent winter night\nA single star guides me home\nPeace within my soul',
      authorId: luna.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Remembering Rain',
      type: 'Poetry',
      content: 'The rain\nforgot my umbrella\nbut remembered\nmy heart.',
      authorId: luna.id,
    },
  });

  console.log(`Created posts: "${post1.title}", "${post2.title}"`);

  // Create a comment
  await prisma.comment.create({
    data: {
      content: 'So deep and beautiful!',
      postId: post2.id,
      authorId: luna.id,
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
