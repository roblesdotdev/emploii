import { PrismaClient } from '@prisma/client'
import {
  createCategory,
  createContactInfo,
  createLocation,
  createOrg,
  createPassword,
  createTeam,
  createJob,
  createUser,
} from './utils'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  console.time('🧹 Cleaned up the database...')
  await prisma.user.deleteMany({ where: {} })
  await prisma.category.deleteMany({ where: {} })
  await prisma.team.deleteMany({ where: {} })
  await prisma.location.deleteMany({ where: {} })
  await prisma.job.deleteMany({ where: {} })
  console.timeEnd('🧹 Cleaned up the database...')

  console.time('👤 Create remixer user...')
  const userData = createUser('remixer')
  const remixer = await prisma.user.create({
    data: {
      ...userData,
      password: {
        create: createPassword(userData.username),
      },
    },
  })
  await prisma.admin.create({ data: { userId: remixer.id } })
  console.timeEnd('👤 Create remixer user...')

  const numUsers = 10
  console.time(`👤 Create ${numUsers} test users...`)
  const users = await Promise.all(
    Array.from({ length: numUsers }, async () => {
      const userData = createUser()
      return await prisma.user.create({
        data: {
          ...userData,
          password: {
            create: createPassword(userData.username),
          },
        },
      })
    }),
  )
  console.timeEnd(`👤 Create ${numUsers} test users...`)

  const numCategories = 6
  console.time(`📋 Create ${numCategories} test categories...`)
  const categories = await Promise.all(
    Array.from({ length: numCategories }, async () => {
      const categoryData = createCategory()
      return await prisma.category.create({
        data: { ...categoryData },
      })
    }),
  )
  console.timeEnd(`📋 Create ${numCategories} test categories...`)

  const teamsPerCategory = 4
  const numTeams = teamsPerCategory * numCategories
  console.time(`📋 Create ${numTeams} test teams...`)
  const catIds = categories.map(c => c.id)
  const teams = await Promise.all(
    Array.from({ length: teamsPerCategory }, () => {
      return catIds.map(async id => {
        const teamData = createTeam()
        return await prisma.team.create({
          data: {
            ...teamData,
            categoryId: id,
          },
        })
      })
    }).flat(),
  )
  console.timeEnd(`📋 Create ${numTeams} test teams...`)

  const userIds = users.map(u => u.id)
  console.time(`📋 Create ${userIds.length} test organizations...`)
  const orgs = await Promise.all(
    userIds.map(async userId => {
      const orgData = createOrg()
      return await prisma.org.create({
        data: {
          ...orgData,
          userId,
          contactInfo: {
            create: createContactInfo(),
          },
        },
      })
    }),
  )
  console.timeEnd(`📋 Create ${numUsers} test organizations...`)

  const numLocations = 25
  console.time(`📋 Create ${numLocations} test locations...`)
  const locations = await Promise.all(
    Array.from({ length: numLocations }, async () => {
      return await prisma.location.create({
        data: createLocation(),
      })
    }),
  )
  console.timeEnd(`📋 Create ${numLocations} test locations...`)

  const jobsPerOrg = 8
  const orgIds = orgs.map(o => o.slug)
  const locationIds = locations.map(l => l.slug)
  const teamsIds = teams.map(t => t.slug)
  console.time(`📋 Create ${jobsPerOrg * orgs.length} jobs...`)
  await Promise.all(
    orgIds.map(async slug => {
      Array.from({ length: jobsPerOrg }, async () => {
        return await prisma.job.create({
          data: {
            ...createJob(),
            orgSlug: slug,
            locationSlug:
              locationIds[Math.floor(Math.random() * locationIds.length)]!,
            teamSlug: teamsIds[Math.floor(Math.random() * teamsIds.length)]!,
          },
        })
      })
    }),
  )

  console.timeEnd(`📋 Create ${jobsPerOrg * orgs.length} jobs...`)

  console.timeEnd(`🌱 Database has been seeded`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
