import { PrismaClient } from '@prisma/client';
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

  const aether = await prisma.user.create({
    data: {
      email: 'test2@example.com',
      name: 'Aether Poet',
      password: hashedPassword,
      bio: 'Stargazing scribe. Exploring cosmic whispers and infinite universes.',
      image: '⭐',
    },
  });

  console.log(`Created users: ${luna.name} (${luna.email}), ${aether.name} (${aether.email})`);

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

  const post3 = await prisma.post.create({
    data: {
      title: 'Cosmic Dust',
      type: 'Thought',
      content: 'We are all just cosmic dust floating in search of a soul to call home.',
      authorId: aether.id,
    },
  });

  console.log(`Created posts: "${post1.title}", "${post2.title}", "${post3.title}"`);

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
