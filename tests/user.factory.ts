// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export function createTestUser(overrides = {}) {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, memorable: true }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    country: faker.location.countryCode('alpha-2'),
    preferredCurrency: 'EUR',
    ...overrides,
  };
}

export function createRegistrationData(step = 1, overrides = {}) {
  const base = createTestUser(overrides);
  
  switch (step) {
  case 1:
    return { email: base.email, password: base.password };
  case 2:
    return { 
      firstName: base.firstName, 
      lastName: base.lastName, 
    };
  case 3:
    return { 
      phone: base.phone, 
      country: base.country, 
    };
  case 4:
    return { 
      preferredCurrency: base.preferredCurrency,
      acceptTerms: true, 
    };
  default:
    return base;
  }
}