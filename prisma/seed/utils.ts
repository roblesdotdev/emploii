import bcrypt from 'bcryptjs'
import type {
  User,
  Password,
  Category,
  Team,
  Org,
  Job,
  Location,
} from '~/types'
import { faker } from '@faker-js/faker'

function slugify(str: string) {
  return str.toLocaleLowerCase().trim().split(' ').filter(Boolean).join('-')
}

export function createUser(username: string): Pick<User, 'email' | 'username'> {
  return {
    username,
    email: `${username}@email.com`,
  }
}

export function createPassword(username: string): Pick<Password, 'hash'> {
  return {
    hash: bcrypt.hashSync(username.toUpperCase(), 10),
  }
}

export function createCategory(): Pick<Category, 'name' | 'slug'> {
  const name = faker.name.jobArea()
  return {
    name,
    slug: slugify(name),
  }
}

export function createTeam(): Pick<Team, 'name' | 'slug'> {
  const name = faker.name.jobType()
  return {
    name,
    slug: slugify(name),
  }
}

export function createOrg(): Pick<Org, 'name' | 'slug'> {
  const name = faker.company.name()
  return {
    name,
    slug: slugify(name),
  }
}

export function createLocation(): Pick<
  Location,
  'slug' | 'city' | 'country' | 'remote'
> {
  const remote = faker.datatype.boolean()
  const country = faker.address.country()
  const city = faker.address.cityName()
  const slug = `${slugify(country)}${slugify(city)}${remote ? `-remote` : ''}`
  return {
    slug,
    country,
    city,
    remote,
  }
}

export function createJob(): Pick<
  Job,
  'bannerUrl' | 'code' | 'title' | 'body' | 'slug'
> {
  const title = faker.name.jobTitle()
  return {
    bannerUrl: faker.image.unsplash.imageUrl(),
    code: faker.random.alpha(6).toUpperCase(),
    title: title,
    slug: slugify(title),
    body: `
## Section 1

${faker.lorem.paragraph()}

## Section 2

${faker.lorem.paragraphs(3, '\n\n\n')}

## Section 3

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
`,
  }
}
